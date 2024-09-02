require('dotenv').config()

const express = require("express")
const app = express()
const PORT = 5000;
const bcrypt = require("bcryptjs")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const nodemailer = require('nodemailer');

const db = require('./db');
const adminRoutes = require('./routes/adminRoutes')(db);
const adminCalendarRoutes = require('./routes/adminCalendarRoutes')(db);

app.use(cors({origin: '*'}))
app.use(express.json())
app.use(express.urlencoded({ extended: true })) //przesylanie formularzami

let secretKey = process.env.ACCESS_TOKEN_SECRET;
let expirationTime = '10m';

const transporter = nodemailer.createTransport({
  service: 'gmail',  // Replace with your email service
  auth: {
      user: process.env.EMAIL_USER,  // Set these in your .env file
      pass: process.env.EMAIL_PASS
  }
});

app.post('/send-confirmation-email', async (req, res) => {
  const { firstName, lastName, email, date, time, duration } = req.body;

  const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reservation Confirmation',
      text: `Dear ${firstName} ${lastName},

Thank you for your reservation. Here are the details:

Date: ${date}
Time: ${time}
Duration: ${duration} hour(s)

Please confirm this reservation by replying to this email.

Best regards,
Your Clinic Team`
  };

  try {
      await transporter.sendMail(mailOptions);
      res.status(200).send('Confirmation email sent');
  } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).send('Error sending confirmation email');
  }
});

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

app.get('/reservation-panel', async (req, res) => {
  try {
    // First, fetch all psychologists
    const [psychologists] = await db.execute(`
      SELECT id, first_name, last_name
      FROM psychologists
    `);

    // Then, fetch working hours for all psychologists
    const [workingHours] = await db.execute(`
      SELECT 
        psychologist_id,
        CASE day_of_week
          WHEN 0 THEN 'Sunday'
          WHEN 1 THEN 'Monday'
          WHEN 2 THEN 'Tuesday'
          WHEN 3 THEN 'Wednesday'
          WHEN 4 THEN 'Thursday'
          WHEN 5 THEN 'Friday'
          WHEN 6 THEN 'Saturday'
          WHEN 7 THEN 'Sunday'
        END AS day_name,
        TIME_FORMAT(start_time, '%H:%i') AS start_time,
        TIME_FORMAT(end_time, '%H:%i') AS end_time
      FROM psychologist_working_hours
    `);

    // Process the data
    const formattedPsychologists = psychologists.map(p => {
      const hours = workingHours
        .filter(wh => wh.psychologist_id === p.id)
        .reduce((acc, wh) => {
          if (!acc[wh.day_name]) {
            acc[wh.day_name] = [];
          }
          acc[wh.day_name].push({
            start: wh.start_time,
            end: wh.end_time
          });
          return acc;
        }, {});

      return {
        id: p.id,
        name: `${p.first_name} ${p.last_name}`,
        workingHours: hours
      };
    });

    res.json(formattedPsychologists);
  } catch (error) {
    console.error('Error fetching psychologists:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/create-reservation', async (req, res) => {
  const { firstName, lastName, email, psychologistId, date, time, duration } = req.body;
  //const duration = 1; // Default 1 hour reservation

  try {
    // Check if client exists
    let [existingClients] = await db.execute('SELECT id FROM clients WHERE email = ?', [email]);
    
    let clientId;
    if (existingClients.length > 0) {
      clientId = existingClients[0].id;
    } else {
      // Create new client
      const [result] = await db.execute(
        'INSERT INTO clients (first_name, last_name, email) VALUES (?, ?, ?)',
        [firstName, lastName, email]
      );
      clientId = result.insertId;
    }

    // Create the reservation
    const reservationDate = `${date} ${time}`;
    const [reservationResult] = await db.execute(
      'INSERT INTO reservations (client_id, psychologist_id, room_id, reservation_date, duration, status) VALUES (?, ?, ?, ?, ?, ?)',
      [clientId, psychologistId, 1, reservationDate, duration, 'Pending'] // Assuming room_id 1 for now
    );

    if (reservationResult.affectedRows > 0) {
      res.status(201).json({ message: 'Reservation created successfully' });
    } else {
      res.status(400).json({ message: 'Failed to create reservation' });
    }
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

///
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

app.post('/refresh', authenticateToken, (req, res) => {
  const accessToken = jwt.sign({ userId: req.user.userId, isAdmin: req.user.isAdmin }, secretKey, { expiresIn: expirationTime });

  res.json({ accessToken });
});

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

app.get('/get-reservations', async (req, res) => {
  const { psychologistId, date } = req.query;

  try {
    const [reservations] = await db.execute(
      'SELECT * FROM reservations WHERE psychologist_id = ? AND DATE(reservation_date) = ?',
      [psychologistId, date]
    );

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

///
app.use('/admin', authenticateToken, adminRoutes);

app.use('/admin-calendar', authenticateToken, adminCalendarRoutes);

app.listen(PORT, () => {
  console.log("Server started on port 5000");
})