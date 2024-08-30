const express = require('express');
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

    router.delete('/clients/:id', async (req, res) => {
        const clientId = req.params.id;
    
        try {
          // First, delete all reservations associated with this client
          await db.execute('DELETE FROM reservations WHERE client_id = ?', [clientId]);
    
          // Then, delete the client
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

  return router;
};