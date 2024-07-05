const clientController = require('../controllers/clientController');
const cors = require('cors');
const commonFunctions = require('../utils/commonFunctions')
const express = require('express');
const clientRouter = express.Router();
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');

clientRouter.post('/login', apiKeyMiddleware, clientController.login);
clientRouter.post('/forgot_password', clientController.forgotPassword);
clientRouter.post('/reset_password', clientController.resetPassword);

clientRouter.use(jwtMiddleware);

clientRouter.get('/get_staff_list', clientController.getStaffList);
clientRouter.get('/view_todays_birthdays', clientController.viewTodaysBirthdays);
clientRouter.get('/view_upcoming_birthdays', clientController.viewUpcomingBirthdays);
clientRouter.put('/delete_staff', clientController.deleteStaff);
clientRouter.get('/get_doctor_vaccine_templates', clientController.getDoctorVaccineTemplates);
clientRouter.get('/get_doctor_vaccine_template_vaccines', clientController.getDoctorVaccineTemplateVaccines);

module.exports = clientRouter;
