const notificationController = require('../controllers/notificationController');
const express = require('express');
const notificationRouter = express.Router();

notificationRouter.post('/send_notification', notificationController.sendNotification);
notificationRouter.get('/view_all_notifications', notificationController.viewAllNotifications);

module.exports = notificationRouter;
