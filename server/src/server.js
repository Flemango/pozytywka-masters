require('dotenv').config()

const express = require("express")
const app = express()
const PORT = 5000;
const bcrypt = require("bcryptjs")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const db = require('./db');

app.use(cors({origin: '*'}))
app.use(express.json())
app.use(express.urlencoded({ extended: true })) //przesylanie formularzami

// app.get("/users", (req, res, next) => {
//   res.json({ "users": ["aaa", "bbb", "ccc"]})
// })

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

// const generateAccessToken = (user) => {
//   return jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, secretKey, { expiresIn: expirationTime });
// };

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

//nie ma nic w req dlatego nie działa
app.get('/clients', authenticateToken, async (req, res) => {
  try {
    const [clients] = await db.execute(`
      SELECT 
        c.id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone_number,
        r.reservation_date,
        r.status,
        rm.room_number,
        p.first_name AS psychologist_first_name,
        p.last_name AS psychologist_last_name
      FROM clients c
      LEFT JOIN (
        SELECT 
          r1.client_id,
          r1.reservation_date,
          r1.status,
          r1.room_id,
          r1.psychologist_id
        FROM reservations r1
        WHERE r1.reservation_date = (
          SELECT MAX(r2.reservation_date)
          FROM reservations r2
          WHERE r2.client_id = r1.client_id
          AND r2.reservation_date <= NOW()
        )
        OR r1.reservation_date = (
          SELECT MIN(r2.reservation_date)
          FROM reservations r2
          WHERE r2.client_id = r1.client_id
          AND r2.reservation_date > NOW()
        )
        ORDER BY r1.reservation_date DESC
        LIMIT 1
      ) r ON c.id = r.client_id
      LEFT JOIN rooms rm ON r.room_id = rm.id
      LEFT JOIN psychologists p ON r.psychologist_id = p.id
    `);
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log("Server started on port 5000")
  setup();
})