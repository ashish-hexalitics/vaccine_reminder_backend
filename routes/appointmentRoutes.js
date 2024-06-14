const appointmentController = require('../controllers/appointmentController');
const express = require('express');
const appointmentRouter = express.Router();

appointmentRouter.post('/bookappointment', appointmentController.bookAppointment);
appointmentRouter.get('/viewupcomingappointments', appointmentController.viewUpcomingAppointments);
appointmentRouter.get('/viewtodayappointments', appointmentController.viewTodayAppointments);
appointmentRouter.put('/markappointmentascompleted', appointmentController.markAppointmentAsCompleted);
appointmentRouter.put('/rejectappointment', appointmentController.rejectAppointment);

module.exports = appointmentRouter;