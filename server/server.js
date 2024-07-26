require('dotenv').config()

const express = require("express")
const app = express()
const PORT = 5000;
const bcrypt = require("bcryptjs")
const cors = require("cors")
const jwt = require("jsonwebtoken")

app.use(cors({origin: '*'}))
app.use(express.json())
app.use(express.urlencoded({ extended: true })) //przesylanie formularzami

app.get("/users", (req, res, next) => {
  res.json({ "users": ["aaa", "bbb", "ccc"]})
})

let refreshTokens = []
let secretKey = process.env.ACCESS_TOKEN_SECRET;


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

  const accessToken = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, secretKey, { expiresIn: '10s' });

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

  const accessToken = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, secretKey, { expiresIn: '10s' });

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
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;
    next();
  });
};

app.post('/refresh', authenticateToken, (req, res) => {
  const accessToken = jwt.sign({ userId: req.user.userId, isAdmin: req.user.isAdmin }, secretKey, { expiresIn: '10s' });

  res.json({ accessToken });
});

app.get('/panel', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome to the admin panel', user: req.user });
});


app.listen(PORT, () => {
  console.log("Server started on port 5000")
  setup();
})