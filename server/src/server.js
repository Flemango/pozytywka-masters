require('dotenv').config()

const express = require("express")
const app = express()
const PORT = 5000;
const bcrypt = require("bcryptjs")
const cors = require("cors")
const jwt = require("jsonwebtoken")

const db = require('./db');
const adminCalendarRoutes = require('./routes/adminCalendarRoutes')(db);

app.use(cors({origin: '*'}))
app.use(express.json())
app.use(express.urlencoded({ extended: true })) //przesylanie formularzami

let secretKey = process.env.ACCESS_TOKEN_SECRET;
let expirationTime = '10m';

// async function setup() {
//   for (let user of users) {
//     user.password = await bcrypt.hash(user.password, 10);
//   }
// }

app.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query the database for the psychologist with the given email
    const [psychologists] = await db.execute(
      'SELECT id, email, password, first_name, last_name FROM psychologists WHERE email = ?',
      [email]
    );

    if (psychologists.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const psychologist = psychologists[0];

    //const isMatch = await bcrypt.compare(password, psychologist.password);
    const isMatch = (password === psychologist.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const accessToken = jwt.sign({ userId: psychologist.id, isAdmin: true }, secretKey, { expiresIn: expirationTime });

    res.json({ accessToken });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/user-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query the database for the client with the given email
    const [clients] = await db.execute(
      'SELECT id, email, password, first_name, last_name FROM clients WHERE email = ?',
      [email]
    );

    if (clients.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const client = clients[0];

    const isMatch = await bcrypt.compare(password, client.password);
    //const isMatch = (password === client.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const accessToken = jwt.sign({ userId: client.id, isAdmin: false }, secretKey, { expiresIn: expirationTime });

    res.json({ 
      accessToken, 
      user: {
        id: client.id,
        email: client.email,
        firstName: client.first_name,
        lastName: client.last_name
      } 
    });
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/register', async (req, res) => {
  const { email, firstName, lastName, password, phoneNumber } = req.body;

  // Basic validation
  if (!email || !firstName || !lastName || !password || !phoneNumber) {
    return res.sendStatus(400);
  }

  try {
    // Check if user already exists
    const [existingUsers] = await db.execute('SELECT * FROM clients WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.sendStatus(400);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    await db.execute(
      'INSERT INTO clients (email, first_name, last_name, password, phone_number) VALUES (?, ?, ?, ?, ?)',
      [email, firstName, lastName, hashedPassword, phoneNumber]
    );

    res.sendStatus(201);
  } catch (error) {
    console.error('Registration error:', error);
    res.sendStatus(500);
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    req.user = user;
    next();
  });
};

app.post('/change-password', authenticateToken, async (req, res) => {
  const { userId, newPassword } = req.body;

  // Ensure the authenticated user is changing their own password
  if (userId !== req.user.userId) {
    return res.status(403).json({ message: 'You can only change your own password' });
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    await db.execute(
      'UPDATE clients SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/delete-account', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;

    // Ensure the authenticated user is deleting their own account
    if (userId !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own account' });
    }

    // Delete the user from the database
    const [result] = await db.execute('DELETE FROM clients WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Account successfully deleted' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/refresh', authenticateToken, (req, res) => {
  const accessToken = jwt.sign({ userId: req.user.userId, isAdmin: req.user.isAdmin }, secretKey, { expiresIn: expirationTime });

  res.json({ accessToken });
});

app.get('/panel', authenticateToken, (req, res) => {
  res.json({});
});

app.get('/welcome', authenticateToken, async (req, res) => {
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

app.get('/clients', authenticateToken, async (req, res) => {
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

app.use('/admin-calendar', authenticateToken, adminCalendarRoutes);

app.listen(PORT, () => {
  console.log("Server started on port 5000");
})