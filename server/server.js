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
let secretRefresh = process.env.REFRESH_TOKEN_SECRET;

const users = [
  {
    id: "1",
    username: 'Kyle',
    password: 'burrito123',
    isAdmin: true
  },
  {
    id: "2",
    username: 'Jim',
    password: 'haslo',
    isAdmin: false
  }
]

async function setup() {
  for (let user of users) {
    user.password = await bcrypt.hash(user.password, 10);
  }
}

app.post('/admin', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

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

// const generateAccessToken = (user) => {
//   return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, secretKey, {
//     expiresIn: "5s",
//   });
// };

// const generateRefreshToken = (user) => {
//   return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, secretRefresh);
// };

// app.post("/api/login", (req, res) => {
//   const { username, password } = req.body;
//   const user = users.find((u) => {
//     return u.username === username && u.password === password;
//   });
//   if (user) {
//     //Generate an access token
//     const accessToken = generateAccessToken(user);
//     const refreshToken = generateRefreshToken(user);
//     refreshTokens.push(refreshToken);
//     res.json({
//       username: user.username,
//       isAdmin: user.isAdmin,
//       accessToken,
//       refreshToken,
//     });
//   } else {
//     res.status(400).json("Username or password incorrect!");
//   }
// });

// const verify = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (authHeader) {
//     const token = authHeader.split(" ")[1];

//     jwt.verify(token, secretKey, (err, user) => {
//       if (err) {
//         return res.status(403).json("Token is not valid!");
//       }

//       req.user = user;
//       next();
//     });
//   } else {
//     res.status(401).json("You are not authenticated!");
//   }
// };

// app.delete("/api/users/:userId", verify, (req, res) => {
//   if (req.user.id === req.params.userId || req.user.isAdmin) {
//     res.status(200).json("User has been deleted.");
//   } else {
//     res.status(403).json("You are not allowed to delete this user!");
//   }
// });

// app.post("/api/logout", verify, (req, res) => {
//   const refreshToken = req.body.token;
//   refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
//   res.status(200).json("You logged out successfully.");
// });

/////////////////////////////////////////////////

// function getPassword(arr, user) {
//   arr.filter(array => array.username === user).map(array => ({ password: array.password }));
// }

// app.post('/admin', async (req, res) => {
//   try {
//     if (await bcrypt.compare(req.body.password, passwd/*getPassword(users, req.body.username)*/)) 
//     {
//       res.status(200).send()
//       const access_token = jwt.sign(process.env.ACCESS_TOKEN_SECRET)
//       res.json({ AccessToken: access_token })
//     }
//     else
//       res.status(401).send()
//   } catch {
//     res.status(500).send()
//   }
// })

