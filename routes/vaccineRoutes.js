const vaccineController = require('../controllers/vaccineController');
const express = require('express');
const vaccineRouter = express.Router();

// vaccineRouter.post('/createdoctorvaccine', vaccineController.createDoctorVaccine);

vaccineRouter.post('/create_master_vaccine', vaccineController.createMasterVaccineTemplate);
vaccineRouter.post('/test_check_permission', vaccineController.testCheckPermission);
vaccineRouter.post('/create_master_vaccine_details', vaccineController.createMasterVaccineDetails);
vaccineRouter.get('/get_vaccine_version_list', vaccineController.getVaccineVersionList);
vaccineRouter.get('/get_vaccine_template_list', vaccineController.getMasterVaccineTemplateList);
// vaccineRouter.get('/calculatevaccineschedule', vaccineController.calculateVaccineSchedule);
vaccineRouter.put('/update_patient_vaccination_status', vaccineController.updatePatientVaccinationStatus);

vaccineRouter.put('/update_vaccine_details', vaccineController.updateVaccineDetails);

vaccineRouter.post('/create_master_vaccine_template', vaccineController.createMasterVaccines);



module.exports = vaccineRouter