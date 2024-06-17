const patientController = require('../controllers/patientController');
const cors = require('cors');
const commonFunctions = require('../utils/commonFunctions')
const express = require('express');
const patientRouter = express.Router();

patientRouter.post('/registerpatient', patientController.registerPatient);
patientRouter.get('/getallpatients', patientController.getAllActivePatients);
patientRouter.get('/viewupcomingappointments', patientController.viewUpcomingAppointments);





module.exports = patientRouter