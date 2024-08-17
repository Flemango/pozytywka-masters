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

let refreshTokens = []
let secretKey = process.env.ACCESS_TOKEN_SECRET;
let expirationTime = '10m';

const users = [
  {
    id: "1",
    username: 'Kyle',
    password: 'burrito123',
    isAdmin: true,
    firstName: 'Kyle',
    lastName: 'Smith',
    email: 'kyle@example.com'
  },
  {
    id: "2",
    username: 'Jim',
    password: 'haslo',
    isAdmin: false,
    firstName: 'Jim',
    lastName: 'Brown',
    email: 'jim@example.com'
  }
];

async function setup() {
  for (let user of users) {
    user.password = await bcrypt.hash(user.password, 10);
  }
}

app.post('/admin', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.isAdmin);

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  const accessToken = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, secretKey, { expiresIn: expirationTime });

  res.json({ accessToken });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && !u.isAdmin);

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  const accessToken = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, secretKey, { expiresIn: expirationTime });

  res.json({ accessToken, user: {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  } });
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

app.post('/refresh', authenticateToken, (req, res) => {
  const accessToken = jwt.sign({ userId: req.user.userId, isAdmin: req.user.isAdmin }, secretKey, { expiresIn: expirationTime });

  res.json({ accessToken });
});

app.get('/panel', authenticateToken, (req, res) => {
  res.json({});
});

app.get('/welcome', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ message: 'Welcome to the admin panel', user: { firstName: user.firstName } });
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
  console.log("Server started on port 5000")
  setup();
})