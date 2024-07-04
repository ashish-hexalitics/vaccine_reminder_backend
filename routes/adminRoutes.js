const adminController = require('../controllers/adminController');
const cors = require('cors');
const commonFunctions = require('../utils/commonFunctions')
const express = require('express');
const adminRouter = express.Router();
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');

adminRouter.post('/login', apiKeyMiddleware, clientController.login);

adminRouter.use(jwtMiddleware);

module.exports = adminRouter;
