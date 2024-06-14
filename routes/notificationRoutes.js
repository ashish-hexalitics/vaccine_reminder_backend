const notificationController = require('../controllers/notificationController');
const express = require('express');
const notificationRouter = express.Router();

notificationRouter.post('/sendnotification', notificationController.sendNotification);
notificationRouter.get('/viewallnotifications', notificationController.viewAllNotifications);

module.exports = notificationRouter;
