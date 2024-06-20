const appointmentController = require('../controllers/appointmentController');
const express = require('express');
const appointmentRouter = express.Router();

appointmentRouter.post('/book_appointment', appointmentController.bookAppointment);
appointmentRouter.get('/view_upcoming_appointments', appointmentController.viewUpcomingAppointments);
appointmentRouter.get('/view_today_appointments', appointmentController.viewTodayAppointments);
appointmentRouter.put('/mark_appointment_as_completed', appointmentController.markAppointmentAsCompleted);
appointmentRouter.put('/reject_appointment', appointmentController.rejectAppointment);

module.exports = appointmentRouter;