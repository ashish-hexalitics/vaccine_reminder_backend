const commonController = require('../controllers/commonController');
const cors = require('cors');
const commonFunctions = require('../utils/commonFunctions')
const express = require('express');
const commonRouter = express.Router();

commonRouter.get('/gettotalcount', commonController.getTotalCount);
commonRouter.get('/getdashboardcounts', commonController.getDashboardCounts);

module.exports = commonRouter;