const commonController = require('../controllers/commonController');
const cors = require('cors');
const commonFunctions = require('../utils/commonFunctions')
const express = require('express');
const commonRouter = express.Router();

commonRouter.get('/get_total_count', commonController.getTotalCount);
commonRouter.get('/get_dashboard_counts', commonController.getDashboardCounts);

module.exports = commonRouter;