const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const cors = require("cors");
app.use(cors({origin: '*'}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //przesylanie formularzami


// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

app.get("/users", (req, res, next) => {
    res.json({ "users": ["aaa", "bbb", "ccc"]});
})

app.post('/admin', (req, res, next) => {
    
    //try {
      const hashedPassword = bcrypt.hash(req.body.password, 10)
      const user = { password: hashedPassword }
      //user.push(user)
      
      
      res.status(201).send()
    //} catch {
     // res.status(500).send()
    //}
  })

app.listen(5000, () => console.log("Server started on port 5000"));