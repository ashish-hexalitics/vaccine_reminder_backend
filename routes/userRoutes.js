const userController = require('../controllers/userController');
const cors = require('cors');
const commonFunctions = require('../utils/commonFunctions')
const express = require('express');
const userRouter = express.Router();
const jwtMiddleware = require('../middlewares/jwtMiddleware');
const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');

// const corsOptions = {
//     origin: 'http://localhost:8071', // Replace with your frontend URL
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true,
//     optionsSuccessStatus: 204
// };

// app.use(cors(corsOptions));

userRouter.post('/login', apiKeyMiddleware, userController.login);

userRouter.use(jwtMiddleware);

userRouter.post('/register', userController.registerUser);

userRouter.get('/getuserinfo', userController.getAUser);
userRouter.get('/getstafflist', userController.getStaffList);
userRouter.delete('/deletestaff', userController.deleteStaff);

userRouter.get('/viewalladmins', userController.viewAllAdmins);
userRouter.put('/editadmin', userController.editAdmin);
userRouter.get('/viewtodaybirthdays', userController.viewTodaysBirthdays);
userRouter.get('/viewupcomingbirthdays', userController.viewUpcomingBirthdays);
userRouter.post('/setclinicinfo', userController.registerClinicInfo);
userRouter.get('/getclinicinfo', userController.getAllClinicInfo);
userRouter.post('/getalldoctors', userController.getAllDoctors);
userRouter.post('/viewdoctorprofile', commonFunctions.authenticateToken, userController.getDoctorProfile);
userRouter.get('/testtoken', userController.testToken);
userRouter.post('/setdoctortimeslots', userController.setDoctorTimeSlots);
userRouter.post('/forgotpassword', userController.forgotPassword);
userRouter.post('/rememberme', userController.rememberMe);
userRouter.post('/createpermission', userController.createPermission);
userRouter.post('/editstaff', userController.editStaff);
userRouter.get('/getuserroles', userController.getUserRoles);
userRouter.get('/testscheduling', userController.testScheduling);


userRouter.get('/testting', userController.testting);
// userRouter.get('/getallroles', userController.getAllRoles);



module.exports = userRouter

//Test comment in the user route.