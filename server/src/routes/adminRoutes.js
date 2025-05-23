const express = require('express');
const bcrypt = require("bcryptjs")
const router = express.Router();

module.exports = (db) => {
    router.get('/panel', (req, res) => {
        res.json({});
    });
      
    router.get('/welcome', async (req, res) => {
        try {
          // Query the database for the psychologist with the given id
          const [psychologists] = await db.execute(
            'SELECT id, first_name FROM psychologists WHERE id = ?',
            [req.user.userId]
          );
      
          if (psychologists.length === 0) {
            return res.status(404).json({ message: 'User not found' });
          }
      
          const psychologist = psychologists[0];
      
          res.json({ 
            message: 'Welcome to the admin panel', 
            user: { 
              firstName: psychologist.first_name,
            } 
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          res.status(500).json({ message: 'Internal server error' });
        }
    });
      
    router.get('/clients', async (req, res) => {
        try {
          const [clients] = await db.execute(`
            SELECT 
              c.id,
              c.first_name,
              c.last_name,
              c.email,
              c.phone_number,
              last_res.reservation_date AS last_reservation_date,
              last_res.status AS last_reservation_status,
              last_res.room_number AS last_reservation_room,
              last_res.psychologist_first_name AS last_reservation_psychologist_first_name,
              last_res.psychologist_last_name AS last_reservation_psychologist_last_name,
              upcoming_res.reservation_date AS upcoming_reservation_date,
              upcoming_res.status AS upcoming_reservation_status,
              upcoming_res.room_number AS upcoming_reservation_room,
              upcoming_res.psychologist_first_name AS upcoming_reservation_psychologist_first_name,
              upcoming_res.psychologist_last_name AS upcoming_reservation_psychologist_last_name
            FROM clients c
            LEFT JOIN (
              SELECT 
                r.client_id,
                r.reservation_date,
                r.status,
                rm.room_number,
                p.first_name AS psychologist_first_name,
                p.last_name AS psychologist_last_name,
                ROW_NUMBER() OVER (PARTITION BY r.client_id ORDER BY r.reservation_date DESC) AS rn
              FROM reservations r
              LEFT JOIN rooms rm ON r.room_id = rm.id
              LEFT JOIN psychologists p ON r.psychologist_id = p.id
              WHERE r.reservation_date <= NOW()
            ) last_res ON c.id = last_res.client_id AND last_res.rn = 1
            LEFT JOIN (
              SELECT 
                r.client_id,
                r.reservation_date,
                r.status,
                rm.room_number,
                p.first_name AS psychologist_first_name,
                p.last_name AS psychologist_last_name,
                ROW_NUMBER() OVER (PARTITION BY r.client_id ORDER BY r.reservation_date ASC) AS rn
              FROM reservations r
              LEFT JOIN rooms rm ON r.room_id = rm.id
              LEFT JOIN psychologists p ON r.psychologist_id = p.id
              WHERE r.reservation_date > NOW()
            ) upcoming_res ON c.id = upcoming_res.client_id AND upcoming_res.rn = 1
          `);
          res.json(clients);
        } catch (error) {
          console.error('Error fetching clients:', error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
    });

    router.patch('/clients/:id', async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;
  
      try {
        // Validate that only allowed fields are being updated
        const allowedFields = ['first_name', 'last_name', 'email', 'phone_number'];
        const fieldToUpdate = Object.keys(updateData)[0];
  
        if (!allowedFields.includes(fieldToUpdate)) {
          return res.status(400).json({ message: 'Invalid field for update' });
        }
  
        // Construct the SQL query
        const query = `UPDATE clients SET ${fieldToUpdate} = ? WHERE id = ?`;
        const values = [updateData[fieldToUpdate], id];
  
        const [result] = await db.execute(query, values);
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Client not found' });
        }
  
        res.json({ message: 'Client updated successfully' });
      } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });

    router.delete('/clients/:id', async (req, res) => {
        const clientId = req.params.id;
    
        try {
          await db.execute('DELETE FROM reservations WHERE client_id = ?', [clientId]);
    
          const [result] = await db.execute('DELETE FROM clients WHERE id = ?', [clientId]);
    
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Client not found' });
          }
    
          res.status(200).json({ message: 'Client successfully deleted' });
        } catch (error) {
          console.error('Error deleting client:', error);
          res.status(500).json({ message: 'Internal server error' });
        }
    });

    router.get('/psychologists', async (req, res) => {
      try {
        const [psychologists] = await db.execute(`
          SELECT p.*, r.room_number as preferred_room_number
          FROM psychologists p
          LEFT JOIN rooms r ON p.preferred_room_id = r.id
    `);
  
        res.json(psychologists);
      } catch (error) {
        console.error('Error fetching psychologists:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });

    router.patch('/psychologists/:id', async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;
    
      try {
        // Validate that only allowed fields are being updated
        const allowedFields = ['first_name', 'last_name', 'email', 'phone_number', 'specialization', 'preferred_room_id'];
        const fieldToUpdate = Object.keys(updateData)[0];
    
        if (!allowedFields.includes(fieldToUpdate)) {
          return res.status(400).json({ message: 'Invalid field for update' });
        }
    
        // Construct the SQL query
        const query = `UPDATE psychologists SET ${fieldToUpdate} = ? WHERE id = ?`;
        const values = [updateData[fieldToUpdate], id];
    
        const [result] = await db.execute(query, values);
    
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Psychologist not found' });
        }
    
        res.json({ message: 'Psychologist updated successfully' });
      } catch (error) {
        console.error('Error updating psychologist:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
  
    router.delete('/psychologists/:id', async (req, res) => {
      const clientId = req.params.id;
    
      try {
        // First, delete all reservations associated with this client
        //await db.execute('DELETE FROM reservations WHERE client_id = ?', [clientId]);
  
        const [result] = await db.execute('DELETE FROM psychologists WHERE id = ?', [clientId]);
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Psychologist not found' });
        }
  
        res.status(200).json({ message: 'Psychologist successfully deleted' });
      } catch (error) {
        console.error('Error deleting psychologist:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });

    router.get('/psychologists/:id/hours', async (req, res) => {
  try {
    const [hours] = await db.execute(
      'SELECT * FROM psychologist_working_hours WHERE psychologist_id = ?',
      [req.params.id]
    );
    res.json(hours);
  } catch (error) {
    console.error('Error fetching working hours:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
    });

    router.post('/psychologists/:id/hours', async (req, res) => {
      const psychologistId = req.params.id;
      const { hours } = req.body;
    
      if (!Array.isArray(hours)) {
        return res.status(400).json({ message: 'Invalid hours format' });
      }
    
      try {
        // First, delete existing hours for this psychologist
        await db.execute('DELETE FROM psychologist_working_hours WHERE psychologist_id = ?', [psychologistId]);
    
        // Then, insert the new hours
        for (const hour of hours) {
          if (hour.start_time && hour.end_time) {
            await db.execute(
              'INSERT INTO psychologist_working_hours (psychologist_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
              [psychologistId, hour.day_of_week, hour.start_time, hour.end_time]
            );
          }
        }
    
        res.json({ message: 'Working hours updated successfully' });
      } catch (error) {
        console.error('Error saving working hours:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });

    router.post('/add-psychologist', async (req, res) => {
      const { first_name, last_name, email, password, phone_number, specialization } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      try {
        const [result] = await db.execute(
          'INSERT INTO psychologists (first_name, last_name, email, password, phone_number, specialization, preferred_room_id) VALUES (?, ?, ?, ?, ?, ?, NULL)',
          [first_name, last_name, email, hashedPassword, phone_number, specialization]
        );
    
        res.status(201).json({
          message: 'Psychologist created successfully',
          id: result.insertId
        });
      } catch (error) {
        console.error('Error creating psychologist:', error);
        res.status(500).json({ message: 'Error creating psychologist' });
      }
    });

    router.get('/rooms', async (req, res) => {
      try {
        const [rooms] = await db.execute('SELECT * FROM rooms');
        res.json(rooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
  
    // Create a new room
    router.post('/rooms', async (req, res) => {
      const { room_number, capacity } = req.body;
      try {
        const [result] = await db.execute(
          'INSERT INTO rooms (room_number, capacity) VALUES (?, ?)',
          [room_number, capacity]
        );
        res.status(201).json({ id: result.insertId, message: 'Room created successfully' });
      } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
  
    // Update a room
    router.patch('/rooms/:id', async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;
      try {
        const allowedFields = ['room_number', 'capacity'];
        const fieldToUpdate = Object.keys(updateData)[0];
        if (!allowedFields.includes(fieldToUpdate)) {
          return res.status(400).json({ message: 'Invalid field for update' });
        }
        const query = `UPDATE rooms SET ${fieldToUpdate} = ? WHERE id = ?`;
        const [result] = await db.execute(query, [updateData[fieldToUpdate], id]);
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Room not found' });
        }
        res.json({ message: 'Room updated successfully' });
      } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
  
    // Delete a room
    router.delete('/rooms/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const [result] = await db.execute('DELETE FROM rooms WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Room not found' });
        }
        res.json({ message: 'Room deleted successfully' });
      } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });

  return router;
};