const express = require('express');
const { format } = require('date-fns'); // Make sure to install and import date-fns
const router = express.Router();
//const db = require('../db'); // Adjust the path as necessary

module.exports = (db) => {
  router.get('/reservations', async (req, res) => {
    try {
      const { psychologistId } = req.query;
      
      let query = 
        'SELECT r.id, r.reservation_date, r.status, r.duration, ' +
        'c.first_name AS client_first_name, c.last_name AS client_last_name, c.email AS client_email, ' +
        'p.first_name AS psychologist_first_name, p.last_name AS psychologist_last_name, ' +
        'ro.room_number ' +
        'FROM reservations r ' +
        'JOIN clients c ON r.client_id = c.id ' +
        'JOIN psychologists p ON r.psychologist_id = p.id ' +
        'JOIN rooms ro ON r.room_id = ro.id';
  
      const params = [];
      if (psychologistId) {
        query += ' WHERE r.psychologist_id = ?';
        params.push(psychologistId);
      }
  
      const [reservations] = await db.execute(query, params);
  
      const transformedReservations = reservations.map(reservation => {
        const reservationDate = new Date(reservation.reservation_date);
        return {
          id: reservation.id,
          date: format(reservationDate, 'yyyy-MM-dd'),
          time: format(reservationDate, 'HH:mm'),
          formattedDate: format(reservationDate, 'MMMM d, yyyy'),
          status: reservation.status,
          duration: reservation.duration,
          name: `${reservation.client_first_name} ${reservation.client_last_name}`,
          email: reservation.client_email,
          psychologist: `${reservation.psychologist_first_name} ${reservation.psychologist_last_name}`,
          room: reservation.room_number
        };
      });
  
      res.json(transformedReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.put('/move-reservation/:id', async (req, res) => {
    const { id } = req.params;
    const { date, time, client_id, psychologist_id, room_id, duration, status } = req.body;
  
    try {
      let updateQuery = 'UPDATE reservations SET ';
      const updateValues = [];
      const updateFields = [];
  
      if (date) {
        if (time) {
          updateFields.push('reservation_date = ?');
          updateValues.push(`${date} ${time}`);
        } else {
          // If only date is provided, keep the existing time
          updateFields.push('reservation_date = DATE_FORMAT(CONCAT(?, " ", TIME(reservation_date)), "%Y-%m-%d %H:%i:%s")');
          updateValues.push(date);
        }
      }
      // ... other fields ...
  
      if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
      }
  
      updateQuery += updateFields.join(', ') + ' WHERE id = ?';
      updateValues.push(id);
  
      const [result] = await db.execute(updateQuery, updateValues);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Reservation not found' });
      }
  
      // Fetch the updated reservation
      await db.execute(
        `SELECT r.*, c.first_name AS client_first_name, c.last_name AS client_last_name, 
                p.first_name AS psychologist_first_name, p.last_name AS psychologist_last_name,
                rm.room_number
         FROM reservations r
         JOIN clients c ON r.client_id = c.id
         JOIN psychologists p ON r.psychologist_id = p.id
         JOIN rooms rm ON r.room_id = rm.id
         WHERE r.id = ?`,
        [id]
      );
  
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating reservation:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.delete('/del-reservation/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const [result] = await db.execute('DELETE FROM reservations WHERE id = ?', [id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Reservation not found' });
      }
  
      res.json({ message: 'Reservation deleted successfully' });
    } catch (error) {
      console.error('Error deleting reservation:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.put('/move-reservations', async (req, res) => {
    const { reservationIds, direction } = req.body;
    if (!reservationIds || !Array.isArray(reservationIds) || !direction) {
      return res.status(400).json({ message: 'Invalid request body' });
    }
  
    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
  
      //const movedReservations = [];
  
      for (const id of reservationIds) {
        // Fetch the current reservation
        const [reservations] = await connection.execute(
          'SELECT * FROM reservations WHERE id = ?',
          [id]
        );
  
        if (reservations.length === 0) {
          continue; // Skip if reservation not found
        }
  
        const reservation = reservations[0];
        const currentDate = new Date(reservation.reservation_date);

        // Extract the time part
        const hours = currentDate.getHours().toString().padStart(2, '0');
        const minutes = currentDate.getMinutes().toString().padStart(2, '0');
        const seconds = currentDate.getSeconds().toString().padStart(2, '0');
        const timePart = `${hours}:${minutes}:${seconds}`;

        currentDate.setDate(currentDate.getDate() + direction);

        // Format the new date
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDate.getDate().toString().padStart(2, '0');
        const newDate = `${year}-${month}-${day} ${timePart}`;
        
        //const newDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
  
        // Update the reservation
        await connection.execute(
          'UPDATE reservations SET reservation_date = ? WHERE id = ?',
          [newDate, id]
        );
  
        // Fetch the updated reservation
        await connection.execute(
          `SELECT r.*, c.first_name AS client_first_name, c.last_name AS client_last_name, 
                  p.first_name AS psychologist_first_name, p.last_name AS psychologist_last_name,
                  rm.room_number
           FROM reservations r
           JOIN clients c ON r.client_id = c.id
           JOIN psychologists p ON r.psychologist_id = p.id
           JOIN rooms rm ON r.room_id = rm.id
           WHERE r.id = ?`,
          [id]
        );
  
        //movedReservations.push(updatedReservations[0]);
      }
  
      await connection.commit();
      res.json({ success: true });
    } catch (error) {
      console.error('Error moving reservations:', error);
      if (connection) {
        try {
          await connection.rollback();
        } catch (rollbackError) {
          console.error('Error rolling back transaction:', rollbackError);
        }
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  });

  router.delete('/del-reservations', async (req, res) => {
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
  
    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
  
      // Delete reservations within the date range
      const [result] = await connection.execute(
        'DELETE FROM reservations WHERE DATE(reservation_date) >= DATE(?) AND DATE(reservation_date) <= DATE(?)',
        [startDate, endDate]
      );
  
      await connection.commit();
      res.json({ success: true, message: 'Reservations deleted successfully' });
    } catch (error) {
      console.error('Error deleting reservations:', error);
      if (connection) {
        try {
          await connection.rollback();
        } catch (rollbackError) {
          console.error('Error rolling back transaction:', rollbackError);
        }
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  });

  // Endpoint to get all clients for calendar
  router.get('/clients', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT id, first_name, last_name FROM clients');
      res.json(rows);
    } catch (error) {
      console.error('Error fetching clients for calendar:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Endpoint to get all psychologists for calendar
  router.get('/psychologists', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT id, first_name, last_name FROM psychologists');
      res.json(rows);
    } catch (error) {
      console.error('Error fetching psychologists for calendar:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  router.get('/available-hours', async (req, res) => {
    const { date, psychologist_id } = req.query;
    if (!date || !psychologist_id) {
      return res.status(400).json({ message: 'Date and psychologist_id parameters are required' });
    }
  
    try {
      const dayOfWeek = new Date(date).getDay();
  
      // Fetch working hours
      const [workingHours] = await db.execute(
        `SELECT TIME_FORMAT(start_time, '%H:%i') as start_time, 
                TIME_FORMAT(end_time, '%H:%i') as end_time
         FROM psychologist_working_hours
         WHERE psychologist_id = ? AND day_of_week = ?`,
        [psychologist_id, dayOfWeek]
      );
  
      if (workingHours.length === 0) {
        return res.json([]);
      }
  
      const startTime = new Date(`1970-01-01T${workingHours[0].start_time}:00`);
      const endTime = new Date(`1970-01-01T${workingHours[0].end_time}:00`);
      const timeSlots = [];
  
      while (startTime < endTime) {
        timeSlots.push(startTime.toTimeString().slice(0, 5));
        startTime.setHours(startTime.getHours() + 1);
      }
  
      // Fetch existing reservations
      const [reservations] = await db.execute(
        `SELECT TIME_FORMAT(reservation_date, '%H:%i') as start_time, duration
         FROM reservations
         WHERE DATE(reservation_date) = ? AND psychologist_id = ?`,
        [date, psychologist_id]
      );
  
      // Create a set of unavailable hours
      const unavailableHours = new Set();
      reservations.forEach(reservation => {
        const reservationStart = new Date(`1970-01-01T${reservation.start_time}:00`);
        for (let i = 0; i < reservation.duration; i++) {
          unavailableHours.add(reservationStart.toTimeString().slice(0, 5));
          reservationStart.setHours(reservationStart.getHours() + 1);
        }
      });
  
      // Filter out unavailable hours
      const availableHours = timeSlots.filter(slot => !unavailableHours.has(slot));
  
      res.json(availableHours);
    } catch (error) {
      console.error('Error fetching available hours for calendar:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.get('/existing-reservations', async (req, res) => {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required' });
    }
  
    try {
      const [reservations] = await db.execute(
        `SELECT 
          TIME_FORMAT(reservation_date, '%H:%i') as time,
          duration,
          psychologist_id,
          room_id
         FROM reservations
         WHERE DATE(reservation_date) = ?
         ORDER BY reservation_date ASC`,
        [date]
      );
  
      res.json(reservations);
    } catch (error) {
      console.error('Error fetching all reservations:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // New endpoint to get all rooms
  router.get('/rooms', async (req, res) => {
    try {
      const [rooms] = await db.execute('SELECT id, room_number FROM rooms');
      res.json(rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  router.post('/confirm-reservation', async (req, res) => {
    const { date, client_id, psychologist_id, room_id, time, duration } = req.body;
    if (!date || !client_id || !psychologist_id || !room_id || !time || !duration) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    try {
      const [result] = await db.execute(
        'INSERT INTO reservations (reservation_date, client_id, psychologist_id, room_id, duration, status) VALUES (?, ?, ?, ?, ?, ?)',
        [`${date} ${time}`, client_id, psychologist_id, room_id, duration, 'confirmed']
      );
      
      // Fetch the created reservation
      const [newReservation] = await db.execute(
        `SELECT r.*, c.first_name AS client_first_name, c.last_name AS client_last_name, 
                p.first_name AS psychologist_first_name, p.last_name AS psychologist_last_name,
                rm.room_number
         FROM reservations r
         JOIN clients c ON r.client_id = c.id
         JOIN psychologists p ON r.psychologist_id = p.id
         JOIN rooms rm ON r.room_id = rm.id
         WHERE r.id = ?`,
        [result.insertId]
      );
      
      res.status(201).json(newReservation[0]);
    } catch (error) {
      console.error('Error creating reservation:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  return router;
};