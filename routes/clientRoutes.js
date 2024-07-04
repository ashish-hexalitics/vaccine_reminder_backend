const clientController = require('../controllers/clientController');
const cors = require('cors');
const commonFunctions = require('../utils/commonFunctions')
const express = require('express');
const clientRouter = express.Router();
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');

clientRouter.post('/login', apiKeyMiddleware, clientController.login);

clientRouter.use(jwtMiddleware);

clientRouter.get('/get_staff_list', clientController.getStaffList);
clientRouter.get('/view_todays_birthdays', clientController.viewTodaysBirthdays);
clientRouter.get('/view_upcoming_birthdays', clientController.viewUpcomingBirthdays);

module.exports = clientRouter;
