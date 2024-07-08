const db = require('../utils/db')
const commonFunctions = require('../utils/commonFunctions')
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const port = process.env.PORT || 8071;

// Global object
const otpStore = {};
// Global object

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
        const isUserDoctor = await commonFunctions.isDoctor( logged_in_user_role_id );

        var isAuthenticated = false;
        let SQL;

        if ( isUserDoctor ) {
            SQL = `SELECT u.id, name, email, date_of_birth, mobile_number 
            FROM users as u INNER JOIN user_roles as ur ON u.role_id = ur.id
            WHERE ur.role_name = ? AND u.parent_id = ? AND u.status = ?`;

            const [result] = await db.execute(SQL, ['Staff', logged_in_id, 1]);

            if ( result.length > 0 ) {
                res.status(200).json({response_data : {staff_list: result}, message : 'List of staff', status : 200});
            } else {
                res.status(404).json({response_data : {}, message : 'No staff found under this doctor', status : 404});
            }
        } else {
            res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
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
        const isUserDoctor = await commonFunctions.isDoctor(logged_in_user_role_id);
        
        let SQL;

        if ( isUserDoctor ) {
            SQL = `UPDATE users 
            SET status = ? 
            WHERE parent_id = ? 
            AND role_id = (SELECT id FROM user_roles WHERE role_name = ?)`;

            await db.execute(SQL, [0, logged_in_id, 'Staff']);

            res.status(200).json({response_data : {}, message : 'Staff deleted successfully', status : 200});
        } else {
            res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
        }
            
    } catch( catcherr ) {
        console.log(catcherr)
    }
}

async function viewTodaysBirthdays(req, res) {
    try{
        
        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        const SQL = `SELECT name, CONCAT(DATE_FORMAT(date_of_birth, '%e %M')) AS birthday 
        FROM users 
        WHERE DATE_FORMAT(date_of_birth, '%m-%d') = DATE_FORMAT(NOW(), '%m-%d')
        AND (id = ? OR parent_id = ?) 
        AND role_id IN (SELECT id FROM user_roles WHERE role_name IN (? , ?));`;
        
        const [result] = await db.execute(SQL, [logged_in_id, logged_in_id, 'Staff', 'Doctor']);
        if(result.length > 0) {
            return res.status(200).json({response_data : {today_birthdays : result}, message : "All Birthdays of doctors and staff", status : 200});
        } else {
            return res.status(404).json({response_data : {}, message : "No Birthdays today", status : 404});
        }
        
    } catch(catcherr) {
        console.log(catcherr);
    }
}

async function viewUpcomingBirthdays(req, res) {
    
    try{

        const logged_in_id = req?.body?.logged_in_id || req.user.id;

        const SQL = `SELECT name, CONCAT(DATE_FORMAT(date_of_birth, '%e %M')) AS birthday FROM users 
        WHERE DATE_FORMAT(date_of_birth, '%m-%d') > DATE_FORMAT(NOW(), '%m-%d')
        AND (id = ? OR parent_id = ?) 
        AND role_id IN (SELECT id FROM user_roles WHERE role_name IN (? , ?))
        ORDER BY DATE_FORMAT(date_of_birth, '%m-%d')`;
        
        // const formattedQuery = db.format(SQL, [logged_in_id, logged_in_id, 'Staff', 'Doctor']);
        // console.log(formattedQuery);

        const [result] = await db.execute(SQL, [logged_in_id, logged_in_id, 'Staff', 'Doctor']);
        if(result.length > 0) {
            return res.status(200).json({response_data : result, message : "All Upcoming Birthdays", status : 200});
        } else {
            return res.status(404).json({response_data : {}, message : "No Upcoming Birthdays", status : 404});
        }

    } catch(catcherr) {
        console.log(catcherr);
    }
}

function generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

async function forgotPassword(req, res) {
    const token = generateToken();
    const email = req.body.email;
    try {

        // const collection = db.collection('users');
        // const document = await collection.findOne({ email: email }); We are using mysql not mongodb
        const [document] = await db.query("SELECT email FROM users WHERE email = ?", [email]);

        if( document.length > 0 ) {
            await sendForgotPasswordEmail(req.body.email, token);
            return res.status(200).json({response_data : {}, message : 'Password reset email sent', status : 200});
        } else {
            return res.status(404).json({response_data : {}, message : "No user with this email found", status : 404});
        }
        
    } catch (error) {
        console.error('Error sending forgot password email:', error);
        return res.status(500).json('Error sending forgot password email');
    }
}

async function sendForgotPasswordEmail(email, token) {
    
    const otp = crypto.randomInt(100000, 999999).toString();

    otpStore[email] = { otp, expires: Date.now() + 3600000 }; // OTP valid for 1 hour
    
    let transporter = nodemailer.createTransport({
    
        service: 'gmail',
        auth: {
            user: 'rupoliavasu2@gmail.com',
            pass: 'hfth antq grvt gjbx'
        }
    });

    let info = await transporter.sendMail({
        from: 'rupoliavasu2@gmail.com',
        to: email,
        subject: 'Reset Your Password',
        text: `Your OTP for password reset is ${otp}`
    });

    console.log('Message sent: %s', info.messageId);
    
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

async function getDoctorVaccineTemplates ( req, res ) {
    try {
        const logged_in_id = req?.body?.logged_in_id || req.user.id;

        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserDoctor = await commonFunctions.isDoctor(logged_in_user_role_id);
        
        if ( isUserDoctor ) {
            let SQL = `SELECT name, description 
            FROM doctor_master_vaccine_template 
            WHERE doctor_id = ? 
            AND status = ?`;

            const [result] = await db.execute(SQL, [logged_in_id, 1]);

            if ( result.length > 0 ) {
                return res.status(200).json({response_data : {doctor_vaccine_templates : result}, message : 'You are not authorized to perform this operation', status : 200});
            } else {
                return res.status(404).json({response_data : {}, message : 'No templates found', status : 404});    
            }

        } else {
            return res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
        }
        
    } catch (catcherr) {
        throw catcherr;
    }
}

async function getDoctorVaccineTemplateVaccines ( req, res ) {
    try {
        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        const vaccine_template_id = req?.query?.vaccine_template_id;

        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserDoctor = await commonFunctions.isDoctor(logged_in_user_role_id);

        if ( isUserDoctor ) {
            let SQL = `SELECT name, description, vaccine_range, range_type, version_number, is_mandatory 
            FROM doctor_master_vaccine_template_vaccines
            WHERE master_vaccine_template_id = ? AND status = ?`;

            const [result] = await db.execute( SQL, [vaccine_template_id, 1] );

            if ( result.length > 0 ) {
                return res.status(200).json({response_data : {doctor_template_vaccines : result}, message : 'List of doctor vaccines', status : 200});
            } else {
                return res.status(404).json({response_data : {}, message : 'No vaccines found', status : 404});
            }
        } else {
            return res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
        }
        
    } catch (catcherr) {
        throw catcherr;
    }
}

async function editDoctorVaccineTemplate( req, res ) {
    try {
        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        const doctor_vaccine_template_id = req.body.doctor_vaccine_template_id;



    } catch (catcherr) {
        throw catcherr;
    }
}

async function registerStaff(req, res) {

    try{
        
        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        const {
            name, 
            email, 
            password, 
            date_of_birth, 
            mobile_number,
        } = req.body;
        const isValidUser = await commonFunctions.checkValidUserId(logged_in_id);
        
        if(!isValidUser) {
            return res.status(404).json({
                response_data : {}, 
                message : 'Invalid id of logged in user', 
                status : 404 
            });
        }

        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        const isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);
        const isUserDoctor = await commonFunctions.isDoctor(logged_in_user_role_id);

        if( !isUserSuperadmin && !isUserAdmin && !isUserDoctor ) {
            return res.status(403).json({response_data : {}, message : 'You are trying to perform this operation with wrong user type', status : 403});
        }

        const findSQL = `SELECT id FROM user_roles WHERE role_name = ?`;
        const [findResult] = await db.execute(findSQL, ['Staff']);
        const role_id = findResult[0].id;
                
        const registeredUserRoleName = await commonFunctions.getUserRoleNameByRoleId(role_id);
        
        if(registeredUserRoleName == 'superadmin'){    
            return res.status(403).json({
                response_data : {}, 
                message : 'You are not authorized to perform this operation', 
                status : 403 
            });
        }

        if ( !isUserSuperadmin && !isUserDoctor ) {
            var permissions = await commonFunctions.checkPermission(logged_in_id, registeredUserRoleName, 'create_permission');
            if(permissions != false && permissions[0].create_permission == 1) {
                canCreate = true;
            } else {
                canCreate = false;
            }
        } else {
            canCreate = true;
        }
        
            if( canCreate ) {

                const hashedPassword = await bcrypt.hash(password, 10);
                const SQL = `INSERT INTO users (role_id, parent_id, name, email, password, date_of_birth, mobile_number, created_by, created_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                
                const values = [
                    findResult[0].id,
                    logged_in_id, 
                    name, 
                    email, 
                    hashedPassword, 
                    date_of_birth, 
                    mobile_number, 
                    logged_in_id, 
                    new Date()
                ];
                
                const emailRegistered = await commonFunctions.isEmailAlreadyRegistered(email);
                if (emailRegistered) {
                    return res.status(403).json({ response_data: {}, message: "Email already in use", status: 403 });
                }

                const formattedQuery = db.format(SQL, values);
                const [result] = await db.execute(SQL, values);
                
                const newUserId = result.insertId;

                const SQL1 = `SELECT id, module_name FROM modules`;
                const [moduleresult] = await db.execute(SQL1);
                
                //Assigning default permissions to the registered user

                let defaultPermissionSQL = `INSERT INTO permissions 
                (user_id, user_role_id, module_name, module_id, 
                create_permission, read_permission, update_permission, 
                delete_permission, created_by, created_date) VALUES `;
                
                const permValues = [];
                const currentDate = new Date();
                for (let i = 0; i < moduleresult.length; i++) {
                    defaultPermissionSQL += '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                    if (i < moduleresult.length - 1) {
                        defaultPermissionSQL += ', ';
                    }
                    permValues.push(newUserId, role_id, moduleresult[i].module_name, moduleresult[i].id, 0, 0, 0, 0, logged_in_id, currentDate);
                }

                await db.execute(defaultPermissionSQL, permValues);

                //Assigning default permissions to the registered user

                return res.status(200).json({
                    response_data : {}, 
                    message : 'User Registered Successfully', 
                    status : 200 
                });
            } else {
                return res.status(403).json({
                    response_data : {}, 
                    message : 'You are not authorized to perform this operation', 
                    status : 403 
                });
            }
        
    } catch(catcherr) {
        throw catcherr;
    }
}

module.exports = {
    registerStaff,
    login,
    getStaffList,
    deleteStaff,
    viewTodaysBirthdays,
    viewUpcomingBirthdays,
    forgotPassword,
    resetPassword,
    getDoctorVaccineTemplates,
    getDoctorVaccineTemplateVaccines
}