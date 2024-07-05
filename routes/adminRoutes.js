const adminController = require('../controllers/adminController');
const cors = require('cors');
const commonFunctions = require('../utils/commonFunctions')
const express = require('express');
const adminRouter = express.Router();
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');

adminRouter.post('/login', apiKeyMiddleware, adminController.login);

adminRouter.use(jwtMiddleware);
adminRouter.post('/register', adminController.registerUser);
adminRouter.post('/create_master_vaccine_template', adminController.createMasterVaccineTemplate);
adminRouter.post('/create_event', adminController.createEvent);
adminRouter.get('/get_upcoming_events', adminController.getUpcomingEvents);
adminRouter.put('/edit_event', adminController.editEvent);
adminRouter.get('/view_event', adminController.viewEvent);
adminRouter.put('/delete_event', adminController.deleteEvent);
adminRouter.post('/create_master_vaccine_template_vaccines', adminController.createMasterVaccineTemplateVaccines);

module.exports = adminRouter;
