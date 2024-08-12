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
    const [clients] = await db.execute('SELECT id, first_name, last_name, email FROM Clients');
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