const patientController = require('../controllers/patientController');
const cors = require('cors');
const commonFunctions = require('../utils/commonFunctions')
const express = require('express');
const patientRouter = express.Router();

patientRouter.post('/register_patient', patientController.registerPatient);
patientRouter.get('/get_all_patients', patientController.getAllActivePatients);
patientRouter.get('/view_upcoming_appointments', patientController.viewUpcomingAppointments);





module.exports = patientRouter