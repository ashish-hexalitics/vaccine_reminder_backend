const vaccineController = require('../controllers/vaccineController');
const express = require('express');
const vaccineRouter = express.Router();

// vaccineRouter.post('/createdoctorvaccine', vaccineController.createDoctorVaccine);

vaccineRouter.post('/createmastervaccine', vaccineController.createMasterVaccineTemplate);
vaccineRouter.post('/testcheckpermission', vaccineController.testCheckPermission);
vaccineRouter.post('/createmastervaccinedetails', vaccineController.createMasterVaccineDetails);
vaccineRouter.get('/getvaccineversionlist', vaccineController.getVaccineVersionList);
vaccineRouter.get('/getvaccinetemplatelist', vaccineController.getMasterVaccineTemplateList);
// vaccineRouter.get('/calculatevaccineschedule', vaccineController.calculateVaccineSchedule);


module.exports = vaccineRouter