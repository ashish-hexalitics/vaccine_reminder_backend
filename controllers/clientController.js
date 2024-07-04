const db = require('../utils/db')
const commonFunctions = require('../utils/commonFunctions')
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

async function login(req, res) {
    const email_or_number = req.body.email;
    const password = req.body.password;

    try {

        isUserClient = await commonFunctions.isClientLogin( email_or_number );
        
        if ( !isUserClient ) {
            return res.status(404).json({response_data : {}, message : 'You are trying to login with wrong user type', status : 404});
        }

        const SQL2 = `SELECT users.id, role_id, parent_id, name, email, password, mobile_number, role_name FROM users 
        INNER JOIN user_roles ON users.role_id = user_roles.id 
        WHERE (email = ? OR mobile_number = ?) AND users.status = 1`;
        
        const [result] = await db.execute(SQL2, [email_or_number, email_or_number]);
        
        if (result.length === 0) {
            return res.status(400).json({ 
                response_data : {},
                message: "Invalid email id or user is deactivated",
                status : 400
            });
        }

        const user = result[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // Generate JWT token
            const tokenPayload = {
                id: user.id,
                email: user.email,
                name: user.name,
                roleId: user.role_id
            };

            const SQL2 = `SELECT module_id, module_name, create_permission, read_permission, update_permission, delete_permission FROM permissions 
            WHERE user_id = ?`;
            const permissions = await db.execute(SQL2, [user.id]);
            user.permissions = permissions[0];
            const accessToken = jwt.sign(tokenPayload, process.env.TOKEN, { expiresIn: '7h' }); // Token expires in 7 hour
            
            // Remove sensitive data from user object
            delete user.password;
            

            return res.status(200).json({ 
                response_data : { user_data: [user] }, 
                token: accessToken, 
                message: "Logged in Successfully",
                status : 200
            });
        } else {
            return res.status(400).json({ 
                response_data : {},
                message: 'Invalid email or password' ,
                status : 400
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            response_data : {},
            message: 'Internal server error',
            status : 500
        });
    }
}

async function getStaffList(req, res) {
    
    try {

        const logged_in_id = req?.query?.logged_in_id || req.user.id;

        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        const isUserAdmin = await commonFunctions.isAdmin( logged_in_user_role_id );
        const isUserDoctor = await commonFunctions.isDoctor( logged_in_user_role_id );

        var isAuthenticated = false;

        var permissions = await commonFunctions.checkPermission(logged_in_id, 'staff', 'read_permission');
        let SQL;
        let result;
        if( isUserSuperadmin) {
            
            SQL = `SELECT * FROM users WHERE role_id = (SELECT id FROM user_roles WHERE role_name = 'Staff')`;
            [result] = await db.execute(SQL);
            isAuthenticated = true;
        
        } else if( isUserAdmin && permissions[0].read_permission == 1 ) {
            
            SQL = `WITH RECURSIVE AdminDoctors AS (
                        SELECT u.id, u.parent_id
                        FROM users u
                        WHERE u.role_id = (SELECT id FROM user_roles WHERE role_name = 'Doctor')
                        AND u.parent_id = ?
                    ),
                    DoctorStaff AS (
                        SELECT u.*
                        FROM users u
                        JOIN AdminDoctors d ON u.parent_id = d.id
                        WHERE u.role_id = (SELECT id FROM user_roles WHERE role_name = 'staff')
                    )
                    SELECT *
                    FROM DoctorStaff;
                `;
            [result] = await db.execute(SQL, [logged_in_id]);
            isAuthenticated = true;

        } else if ( isUserDoctor && permissions[0].read_permission == 1 ) {
            
            SQL = `SELECT * FROM users WHERE role_id = (SELECT id FROM user_roles WHERE role_name = 'Staff') AND parent_id = ?`;
            [result] = await db.execute(SQL, [logged_in_id]);
            isAuthenticated = true;

        }

        if( !isAuthenticated ) {
            res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403})
        }

        if( result.length == 0 ) {
            res.status(404).json({response_data : {}, message : 'No user found', status : 404})    
        } else {
            res.status(200).json({response_data : result, message : 'Staff fetched successfully', status : 200})
        }
        
    } catch( catcherr ) {
        console.log(catcherr)
    }
}

async function deleteStaff(req, res) {
    try{
        //test comment
        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        const user_id = req.body.user_id;

        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        const isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);
        const isUserDoctor = await commonFunctions.isDoctor(logged_in_user_role_id);
        let SQL;
        
        if( isUserSuperadmin ) {
            SQL = `UPDATE users SET status = 0 WHERE id = ? AND role_id NOT IN (1,2)`;
            await db.execute(SQL, [user_id]);
            res.status(200).json({response_data : {}, message : "Deleted Successfully", status : 200});
        } else if( isUserAdmin ) {
            SQL = `WITH admin_id AS (
                SELECT id
                FROM users
                WHERE role_id = (SELECT id FROM user_roles WHERE role_name = 'admin')
            ),
            admin_doctors AS (
                SELECT u.id
                FROM users u
                JOIN admin_id a ON u.parent_id = a.id
                WHERE u.role_id = (SELECT id FROM user_roles WHERE role_name = 'Doctor')
            ),
            UPDATE users SET status = 0
            WHERE id = ?
              AND (id IN (SELECT id FROM admin_staff) OR id IN (SELECT id FROM doctor_staff));
            `;
        } else if( isUserDoctor ) {

        } else{
            res.status(403).json({response_data : {}, message : "You are not authorized to perform this operation", status : 403});
        }

        
            
    } catch( catcherr ) {
        console.log(catcherr)
    }
}

async function viewTodaysBirthdays(req, res) {
    try{
        
        const SQL = `SELECT name, CONCAT(DATE_FORMAT(date_of_birth, '%e %M')) AS birthday FROM users 
        WHERE DATE_FORMAT(date_of_birth, '%m-%d') = DATE_FORMAT(NOW(), '%m-%d');`;
        
        const [result] = await db.execute(SQL);
        if(result.length > 0) {
            return res.status(200).json({response_data : result, message : "All Birthdays", status : 200});
        } else {
            return res.status(404).json({response_data : {}, message : "No Birthdays today", status : 404});
        }
        
    } catch(catcherr) {
        console.log(catcherr);
    }
}

async function viewUpcomingBirthdays(req, res) {
    try{
        const SQL = `SELECT name, CONCAT(DATE_FORMAT(date_of_birth, '%e %M')) AS birthday FROM users 
        WHERE DATE_FORMAT(date_of_birth, '%m-%d') >= DATE_FORMAT(NOW(), '%m-%d') 
        ORDER BY DATE_FORMAT(date_of_birth, '%m-%d') LIMIT 10`;
        
        const [result] = await db.execute(SQL);
        if(result.length > 0) {
            return res.status(200).json({response_data : result, message : "All Upcoming Birthdays", status : 200});
        } else {
            return res.status(404).json({response_data : {}, message : "No Upcoming Birthdays", status : 404});
        }
    } catch(catcherr) {
        console.log(catcherr);
    }
}

async function resetPassword(req, res) {
    
    const { email, otp, new_password } = req.body;
    if (!email || !otp || !new_password) {
        return res.status(400).json({ response_data : {}, message: 'Email, OTP, and new password are required', status : 400 });
    }

    // Checking if the OTP is valid
    const storedOtp = otpStore[email];

    if (!storedOtp || storedOtp.otp !== otp || storedOtp.expires < Date.now()) {
        return res.status(400).json({ response_data : {}, message: 'Invalid or expired OTP', status : 400 });
    }

    if( storedOtp.otp === otp ) {
        newPasswordEncrypted = await bcrypt.hash(new_password, 10);
        const SQL = `UPDATE users SET password = ? WHERE email = ?`;
        const formattedQ = db.format(SQL, [newPasswordEncrypted, email]);
        // console.log(formattedQ);
        await db.execute(SQL, [newPasswordEncrypted, email]);

        return res.status(200).json({response_data :{} , message : 'Password has changed successfully', status : 200 });
    }
    

}

async function registerPatient ( req, res ) {
    
    try {
        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        const { name, gender, date_of_birth, mobile_number } = req.body;

        const isUserClient = await commonFunctions.isClient(logged_in_id);

        if( !isUserClient ) {
            return res.status(403).json({response_data : {}, message : 'You are trying to register a patient through wrong user type', status : 403});
        }

        const isUserDoctor = await commonFunctions.isDoctor(logged_in_id);

        if( isUserDoctor ) {
           
            
            const SQL1 = `INSERT INTO patients_parent (master_id, mobile_number, name, gender, date_of_birth, vaccine_ids, created_by) VALUES (?,?,?,?,?,?,?)`;
        
            const values1 = [logged_in_id, mobile_number, name, gender, date_of_birth];
            await db.execute(SQL1, values1);
        } else {

        }

        

    } catch (catcherr) {
        throw catcherr;
    }
}

module.exports = {
    login,
    getStaffList,
    deleteStaff,
    viewTodaysBirthdays,
    viewUpcomingBirthdays,
    resetPassword,
    registerPatient
}