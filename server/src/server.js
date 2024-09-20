require('dotenv').config()

const express = require("express")
const app = express()
const PORT = 5000;
const bcrypt = require("bcryptjs")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const nodemailer = require('nodemailer');
const { format, parseISO, addHours, addDays, isWithinInterval, isBefore, isAfter, setHours, setMinutes } = require('date-fns');
const { spawn } = require('child_process');
const path = require('path');
const moment = require('moment-timezone');
const localTimezone = 'Europe/Warsaw';

const db = require('./db');
const adminRoutes = require('./routes/adminRoutes')(db);
const adminCalendarRoutes = require('./routes/adminCalendarRoutes')(db);

app.use(cors({origin: '*'}))
app.use(express.json())
app.use(express.urlencoded({ extended: true })) //przesylanie formularzami

const pythonExecutable = path.join('myenv', 'Scripts', 'python.exe');
const NNScript = path.join('.', 'src', 'ai', 'NN_LSTM.py');
const DTScript = path.join('.', 'src', 'ai', 'decisionTree.py');

const pythonProcess = spawn(pythonExecutable, [NNScript]);

pythonProcess.stdout.on('data', (data) => {
  console.log(`${data}`);
});
pythonProcess.stderr.on('data', (data) => {
  console.error(`Python stderr: ${data}`);
});
pythonProcess.on('close', (code) => {
  console.log(`Python process exited with code ${code}`);
});

const secretKey = process.env.ADMIN_ACCESS_TOKEN_SECRET;
const userSecretKey = process.env.USER_ACCESS_TOKEN_SECRET;
const expirationTime = '10m';

const transporter = nodemailer.createTransport({
  service: 'wp.pl',  // Replace with your email service
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

    const isMatch = await bcrypt.compare(password, psychologist.password);
    //const isMatch = (password === psychologist.password);

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

    const accessToken = jwt.sign({ userId: client.id, isAdmin: false }, userSecretKey, { expiresIn: expirationTime });

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

app.get('/get-reservations', async (req, res) => {
  const { psychologistId, date } = req.query;

  try {
    const [reservations] = await db.execute(
      'SELECT * FROM reservations WHERE psychologist_id = ? AND DATE(reservation_date) = ?',
      [psychologistId, date]
    );

    // Convert UTC times to local timezone
    const adjustedReservations = reservations.map(reservation => ({
      ...reservation,
      reservation_date: moment.utc(reservation.reservation_date).tz(localTimezone).format()
    }));

    //console.log(adjustedReservations);
    res.json(adjustedReservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/create-reservation', async (req, res) => {
  const { firstName, lastName, email, psychologistId, date, time, duration } = req.body;

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

    // Check if psychologist has a preferred room
    const [psychologistResult] = await db.execute(
      'SELECT preferred_room_id FROM psychologists WHERE id = ?',
      [psychologistId]
    );

    let roomId = 1; // Default room_id
    if (psychologistResult.length > 0 && psychologistResult[0].preferred_room_id) {
      roomId = psychologistResult[0].preferred_room_id;
    }

    // Check for colliding reservations
    const reservationDate = `${date} ${time}`;
    const proposedStart = parseISO(reservationDate);
    const proposedEnd = addHours(proposedStart, parseInt(duration));

    const [existingReservations] = await db.execute(
      'SELECT reservation_date, duration FROM reservations WHERE psychologist_id = ? AND DATE(reservation_date) = DATE(?)',
      [psychologistId, reservationDate]
    );

    for (const reservation of existingReservations) {
      // Convert the date to a string format that parseISO can handle
      const existingDateString = format(new Date(reservation.reservation_date), "yyyy-MM-dd'T'HH:mm:ss");
      const existingStart = parseISO(existingDateString);
      const existingEnd = addHours(existingStart, reservation.duration);

      if (
        isWithinInterval(proposedStart, { start: existingStart, end: existingEnd }) ||
        isWithinInterval(proposedEnd, { start: existingStart, end: existingEnd }) ||
        isWithinInterval(existingStart, { start: proposedStart, end: proposedEnd })
      ) {
        return res.status(409).json({ message: 'This time slot conflicts with an existing reservation' });
      }
    }

    // Create the reservation
    const [reservationResult] = await db.execute(
      'INSERT INTO reservations (client_id, psychologist_id, room_id, reservation_date, duration, status) VALUES (?, ?, ?, ?, ?, ?)',
      [clientId, psychologistId, roomId, reservationDate, duration, 'Pending']
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


/// secured admin routes
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

app.use('/admin', authenticateToken, adminRoutes);

app.use('/admin-calendar', authenticateToken, adminCalendarRoutes);


/// secured user routes
const authenticateUserToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token from Authorization header

  if (token == null) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, userSecretKey, (err, decodedToken) => {  // decodedToken contains the user info
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Add decoded user info (userId, isAdmin) to request object for later use
    req.user = decodedToken;
    next();
  });
};

app.get('/user-profile', authenticateUserToken, async (req, res) => {
  try {
    const [clients] = await db.execute(
      'SELECT id, email, first_name, last_name FROM clients WHERE id = ?',
      [req.user.userId]
    );

    if (clients.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const client = clients[0];
    res.json({ 
      user: {
        id: client.id,
        email: client.email,
        firstName: client.first_name,
        lastName: client.last_name,
      } 
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/change-password', authenticateUserToken, async (req, res) => {
  const { newPassword } = req.body;

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database using user ID from the JWT
    await db.execute(
      'UPDATE clients SET password = ? WHERE id = ?',
      [hashedPassword, req.user.userId]  // Use userId from JWT (req.user)
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/delete-account', authenticateUserToken, async (req, res) => {
  try {
    // Delete the user from the database using user ID from the JWT
    const [result] = await db.execute('DELETE FROM clients WHERE id = ?', [req.user.userId]);  // Use userId from JWT

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Account successfully deleted' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


function predictNextInterval(sequence) {
  return new Promise((resolve, reject) => {
    pythonProcess.stdin.write(JSON.stringify(sequence) + '\n');
    
    const handleOutput = (data) => {
      const response = JSON.parse(data.toString());
      if (response.error) {
        reject(new Error(response.error));
      } else {
        resolve(response.prediction);
      }
      pythonProcess.stdout.removeListener('data', handleOutput);
    };

    pythonProcess.stdout.on('data', handleOutput);
  });
}

async function getDecisionTreePrediction(reservationHistory, predictedDay) {
  return new Promise((resolve, reject) => {
    const decisionTreeProcess = spawn(pythonExecutable, [DTScript]);
    let outputData = '';

    decisionTreeProcess.stdin.write(JSON.stringify({ reservations: reservationHistory, predicted_day: predictedDay }));
    decisionTreeProcess.stdin.end();

    decisionTreeProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    decisionTreeProcess.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data}`);
    });

    decisionTreeProcess.on('close', (code) => {
      if (code === 0) {
        resolve(JSON.parse(outputData));
      } else {
        reject(new Error(`Python process exited with code ${code}`));
      }
    });
  });
}

async function findAvailableSlot(suggestedDate, suggestedTime, suggestedDuration, psychologistId) {
  // Fetch psychologist's working hours for the suggested day
  const dayOfWeek = suggestedDate.getDay();
  const [workingHours] = await db.execute(
    'SELECT start_time, end_time FROM psychologist_working_hours WHERE psychologist_id = ? AND day_of_week = ?',
    [psychologistId, dayOfWeek]
  );

  if (workingHours.length === 0) {
    // Psychologist doesn't work on this day
    return null;
  }

  const workStart = parseISO(`${format(suggestedDate, 'yyyy-MM-dd')}T${workingHours[0].start_time}`);
  const workEnd = parseISO(`${format(suggestedDate, 'yyyy-MM-dd')}T${workingHours[0].end_time}`);

  // Fetch existing reservations for the suggested date
  const [existingReservations] = await db.execute(
    'SELECT reservation_date, duration FROM reservations WHERE psychologist_id = ? AND DATE(reservation_date) = ?',
    [psychologistId, format(suggestedDate, 'yyyy-MM-dd')]
  );

  // Convert suggested time to Date object
  let suggestedDateTime = parseISO(`${format(suggestedDate, 'yyyy-MM-dd')}T${suggestedTime}`);
  let suggestedEndTime = addHours(suggestedDateTime, parseInt(suggestedDuration));

  // Ensure suggested time is within working hours
  if (isBefore(suggestedDateTime, workStart)) {
    suggestedDateTime = workStart;
    suggestedEndTime = addHours(suggestedDateTime, parseInt(suggestedDuration));
  }

  if (isAfter(suggestedEndTime, workEnd)) {
    return null; // Suggested time is outside working hours
  }

  // Check for collisions
  const collision = existingReservations.some(reservation => {
    const reservationStart = new Date(reservation.reservation_date);
    const reservationEnd = addHours(reservationStart, reservation.duration);
    return isWithinInterval(suggestedDateTime, { start: reservationStart, end: reservationEnd }) ||
           isWithinInterval(suggestedEndTime, { start: reservationStart, end: reservationEnd }) ||
           isWithinInterval(reservationStart, { start: suggestedDateTime, end: suggestedEndTime });
  });

  if (!collision) {
    return { 
      suggestedDate: format(suggestedDateTime, 'yyyy-MM-dd'), 
      suggestedTime: format(suggestedDateTime, 'HH:mm'), 
      suggestedDuration 
    };
  }

  // Find the next available time slot
  let nextAvailableTime = suggestedDateTime;
  let availableDuration = parseInt(suggestedDuration);

  while (isBefore(nextAvailableTime, workEnd)) {
    nextAvailableTime = addHours(nextAvailableTime, 1);
    const nextEndTime = addHours(nextAvailableTime, availableDuration);

    if (isAfter(nextEndTime, workEnd)) {
      // If next end time is after work end, try reducing duration
      availableDuration--;
      if (availableDuration === 0) {
        // No available slot found for this day
        return null;
      }
      continue;
    }

    const isAvailable = !existingReservations.some(reservation => {
      const reservationStart = new Date(reservation.reservation_date);
      const reservationEnd = addHours(reservationStart, reservation.duration);
      return isWithinInterval(nextAvailableTime, { start: reservationStart, end: reservationEnd }) ||
             isWithinInterval(nextEndTime, { start: reservationStart, end: reservationEnd });
    });

    if (isAvailable) {
      return {
        suggestedDate: format(nextAvailableTime, 'yyyy-MM-dd'),
        suggestedTime: format(nextAvailableTime, 'HH:mm'),
        suggestedDuration: `${availableDuration}h`
      };
    }
  }

  // No available slot found for this day
  return null;
}

async function suggestReservation(userId, psychologistId, daysBetween) {
  const pythonOutput = await predictNextInterval(daysBetween);
  const suggestedInterval = parseInt(pythonOutput);
  
  // Fetch the most recent reservation
  const [recentReservations] = await db.execute(
    'SELECT reservation_date FROM reservations WHERE client_id = ? AND psychologist_id = ? ORDER BY reservation_date DESC LIMIT 1',
    [userId, psychologistId]
  );
  
  if (recentReservations.length === 0) {
    throw new Error('No recent reservations found');
  }

  let mostRecentReservation = new Date(recentReservations[0].reservation_date);
  mostRecentReservation.setHours(0, 0, 0, 0);
  let suggestedDate = addDays(mostRecentReservation, suggestedInterval);

  // Fetch reservation history for decision tree
  const [reservations] = await db.execute(
    'SELECT reservation_date, duration FROM reservations WHERE client_id = ? AND psychologist_id = ? ORDER BY reservation_date DESC',
    [userId, psychologistId]
  );

  const reservationHistory = reservations.map(r => ({
    date: format(new Date(r.reservation_date), 'yyyy-MM-dd'),
    time: format(new Date(r.reservation_date), 'HH:mm'),
    duration: `${r.duration}h`
  }));

  let availableSlot = null;
  let attempts = 0;
  const maxAttempts = 7; // Try for a week max

  while (!availableSlot && attempts < maxAttempts) {
    const prediction = await getDecisionTreePrediction(reservationHistory, suggestedDate.getDay());
    availableSlot = await findAvailableSlot(suggestedDate, prediction.predicted_time, prediction.predicted_duration, psychologistId);

    if (!availableSlot) {
      // No available slot found, try the next day
      suggestedDate = addDays(suggestedDate, 1);
      attempts++;
    }
  }

  if (availableSlot) {
    return availableSlot;
  } else {
    // If no slot found after a week, add suggested interval to daysBetween and try again
    daysBetween.push(suggestedInterval);
    return suggestReservation(userId, psychologistId, daysBetween);
  }
}

app.post('/suggest-reservation', authenticateUserToken, async (req, res) => {
  const { userId, psychologistId } = req.body;

  try {
    // Fetch user's reservations
    const [reservations] = await db.execute(
      'SELECT reservation_date FROM reservations WHERE client_id = ? AND psychologist_id = ? ORDER BY reservation_date ASC',
      [userId, psychologistId]
    );

    if (reservations.length < 2) {
      return res.json({ message: 'Not enough past reservations to make a suggestion.' });
    }

    // Calculate days between reservations
    let daysBetween = [];
    for (let i = 1; i < reservations.length; i++) {
      const prevDate = new Date(reservations[i-1].reservation_date);
      const currDate = new Date(reservations[i].reservation_date);
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      daysBetween.push(diffDays);
    }

    const suggestion = await suggestReservation(userId, psychologistId, daysBetween);
    // console.log(daysBetween);

    if (suggestion) {
      res.json(suggestion);
    } else {
      res.json({ message: 'Unable to find a suitable reservation slot.' });
    }
  } catch (error) {
    console.error('Error suggesting reservation:', error);
    res.status(500).json({ message: 'Error suggesting reservation' });
  }
});

// app.post('/suggest-reservation', authenticateToken, async (req, res) => {
//   const { userId, psychologistId } = req.body;

//   try {
//     // Fetch user's reservations
//     const [reservations] = await db.execute(
//       'SELECT reservation_date, duration FROM reservations WHERE client_id = ? AND psychologist_id = ? ORDER BY reservation_date DESC',
//       [userId, psychologistId]
//     );

//     if (reservations.length < 2) {
//       // Not enough data to make a suggestion
//       return res.json({ message: 'Not enough past reservations to make a suggestion.' });
//     }

//     // Calculate days between reservations
//     let daysBetween = [];
//     for (let i = 1; i < reservations.length; i++) {
//       const prevDate = new Date(reservations[i-1].reservation_date);
//       const currDate = new Date(reservations[i].reservation_date);

//       // Reset time to midnight for both dates
//       prevDate.setHours(0, 0, 0, 0);
//       currDate.setHours(0, 0, 0, 0);
      
//       const diffTime = Math.abs(currDate - prevDate);
//       const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
//       daysBetween.push(diffDays);
//     }
//     console.log(daysBetween);

//     const pythonOutput = await predictNextInterval(daysBetween);
    
//     const suggestedInterval = parseInt(pythonOutput);
//     const mostRecentReservation = new Date(reservations[0].reservation_date);
//     mostRecentReservation.setHours(0, 0, 0, 0);
//     const suggestedDate = addDays(mostRecentReservation, suggestedInterval);

//     // Prepare data for decision tree script
//     const reservationHistory = reservations.map(r => ({
//       date: format(new Date(r.reservation_date), 'yyyy-MM-dd'),
//       time: format(new Date(r.reservation_date), 'HH:mm'),
//       duration: `${r.duration}h`
//     }));
//     // console.log(reservationHistory)

//     const inputData = {
//       reservations: reservationHistory,
//       predicted_day: suggestedDate.getDay() // 1 for Sunday, 2 for Monday, etc.
//     };

//     // Run decision tree script
//     const decisionTreeProcess = spawn(pythonExecutable, [DTScript]);
//     let outputData = '';

//     decisionTreeProcess.stdin.write(JSON.stringify(inputData));
//     decisionTreeProcess.stdin.end();

//     decisionTreeProcess.stdout.on('data', (data) => {
//       outputData += data.toString();
//       // console.log(outputData)
//     });

//     decisionTreeProcess.stderr.on('data', (data) => {
//       console.error(`Python stderr: ${data}`);
//     });

//     await new Promise((resolve, reject) => {
//       decisionTreeProcess.on('close', (code) => {
//         if (code === 0) {
//           resolve();
//         } else {
//           reject(new Error(`Python process exited with code ${code}`));
//         }
//       });
//     });

//     const prediction = JSON.parse(outputData);

//     res.json({ 
//       suggestedDate: format(suggestedDate, 'yyyy-MM-dd'),
//       suggestedTime: prediction.predicted_time,
//       suggestedDuration: prediction.predicted_duration
//     });
//   } catch (error) {
//     console.error('Error suggesting reservation:', error);
//     res.status(500).json({ message: 'Error suggesting reservation' });
//   }
// });

///

// async function a() {
//   console.log(await bcrypt.hash("qwerty23", 10))
// }

app.listen(PORT, () => {
  console.log("Server started on port 5000");
  //a();
})

// Handle server shutdown
process.on('SIGINT', () => {
  pythonProcess.kill('SIGINT');
  process.exit();
});