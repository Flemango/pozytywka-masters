const express = require('express');
const { format } = require('date-fns'); // Make sure to install and import date-fns
const router = express.Router();
const db = require('../db'); // Adjust the path as necessary

module.exports = (db) => {
  router.get('/reservations', async (req, res) => {
    try {
      const [reservations] = await db.execute(
        'SELECT r.id, r.reservation_date, r.status, r.duration, ' +
        'c.first_name AS client_first_name, c.last_name AS client_last_name, c.email AS client_email, ' +
        'p.first_name AS psychologist_first_name, p.last_name AS psychologist_last_name, ' +
        'ro.room_number ' +
        'FROM reservations r ' +
        'JOIN clients c ON r.client_id = c.id ' +
        'JOIN psychologists p ON r.psychologist_id = p.id ' +
        'JOIN rooms ro ON r.room_id = ro.id'
      );

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
  
  // Updated reservation creation endpoint
    router.post('/confirm-reservation', async (req, res) => {
    const { date, client_id, psychologist_id, room_id, time, duration } = req.body;
    if (!date || !client_id || !psychologist_id || !room_id || !time || !duration) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    try {
      const [result] = await db.execute(
        'INSERT INTO reservations (reservation_date, client_id, psychologist_id, room_id, duration) VALUES (?, ?, ?, ?, ?)',
        [`${date} ${time}`, client_id, psychologist_id, room_id, duration]
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