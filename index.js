const http = require('http')
const express = require('express')
const cors = require('cors');

const bodyParser = require('body-parser')
const userRouter = require('./routes/userRoutes')
const vaccineRouter = require('./routes/vaccineRoutes')
const notificationRouter = require('./routes/notificationRoutes')
const patientRouter = require('./routes/patientRoutes')
const appointmentRouter = require('./routes/appointmentRoutes')
const commonRouter = require('./routes/commonRoutes')
const eventRouter = require('./routes/eventRoutes');

const jwtMiddleware = require('./middlewares/jwtMiddleware');

require('dotenv').config();

const port = process.env.PORT || 8071

const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/loginview', (req, res) => {
    res.render('login');
  });

  app.get('/home', (req, res) => {
    res.render('home');
  });  

  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

// app.use('/api', apiKeyMiddleware);
// app.use('/api', jwtMiddleware);

app.use('/api/user', userRouter)
app.use('/api/patient', jwtMiddleware, patientRouter)
app.use('/api/vaccine', jwtMiddleware, vaccineRouter)
app.use('/api/notification', jwtMiddleware, notificationRouter)
app.use('/api/appointment', jwtMiddleware, appointmentRouter)
app.use('/api/common', jwtMiddleware, commonRouter)
app.use('/api/event', jwtMiddleware.eventRouter);

app.listen(port, () => {
    console.log('Server is running on port ' + port)
})