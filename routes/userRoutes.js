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
userRouter.post('/reset_password', userController.resetPassword);
userRouter.post('/send_change_password_otp', userController.forgotPassword);

userRouter.use(jwtMiddleware);

userRouter.post('/register', userController.registerUser);

userRouter.get('/get_user_info', userController.getAUser);
userRouter.get('/get_staff_list', userController.getStaffList);
userRouter.delete('/delete_staff', userController.deleteStaff);

userRouter.get('/view_all_admins', userController.viewAllAdmins);
userRouter.put('/edit_admin', userController.editAdmin);
userRouter.get('/view_today_birthdays', userController.viewTodaysBirthdays);
userRouter.get('/view_upcoming_birthdays', userController.viewUpcomingBirthdays);
userRouter.post('/set_clinic_info', userController.registerClinicInfo);
userRouter.get('/get_clinic_info', userController.getAllClinicInfo);
userRouter.get('/get_all_doctors', userController.getAllDoctors);
userRouter.get('/view_doctor_profile', commonFunctions.authenticateToken, userController.getDoctorProfile);
userRouter.get('/test_token', userController.testToken);
userRouter.post('/set_doctor_time_slots', userController.setDoctorTimeSlots);

userRouter.post('/remember_me', userController.rememberMe);
userRouter.post('/create_permission', userController.createPermission);
userRouter.post('/edit_staff', userController.editStaff);
userRouter.get('/get_user_roles', userController.getUserRoles);
userRouter.get('/test_scheduling', userController.testScheduling);
userRouter.get('/get_user_list', userController.getUserList);

userRouter.get('/testting', userController.testting);
userRouter.post('/grant_permissions', userController.grantBulkPermission);
userRouter.get('/get_all_permissions', userController.getAllPermissions);
userRouter.get('/get_my_permissions', userController.getMyPermissions);
userRouter.post('/search_user', userController.searchUser);


// userRouter.get('/getallroles', userController.getAllRoles);



module.exports = userRouter

//Test comment in the user route.