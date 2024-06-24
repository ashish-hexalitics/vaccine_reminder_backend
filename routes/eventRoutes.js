const eventController = require('../controllers/eventController');
const express = require('express');
const eventRouter = express.Router();

eventRouter.post('/create_event', eventController.createEvent);
eventRouter.get('/view_upcoming_events', eventController.getUpcomingEvents);
eventRouter.put('/edit_event', eventController.editEvent);
eventRouter.put('/delete_event', eventController.deleteEvent);
eventRouter.get('/view_event', eventController.viewEvent);

module.exports = eventRouter;