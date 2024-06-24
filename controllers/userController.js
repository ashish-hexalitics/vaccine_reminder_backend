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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function createPermission(req, res) {
    try {
        const {logged_in_id, user_role_id, module, create_permission, read_permission, update_permission, delete_permission, created_by, created_date} = req.body;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        
        if( isUserSuperadmin ) {
            const SQL = `INSERT INTO permissions (user_role_id, module, create_permission, 
            read_permission, update_permission, delete_permission, created_by, 
            created_date) VALUES (?,?,?,?,?,?,?,?)`;

            const values = [user_role_id, module, create_permission, read_permission, update_permission, delete_permission, created_by, created_date];

            await db.execute(SQL, values);
            return res.status(200).json({response_data : {}, message : 'Permission for this user role has been created successfully', status : 200});
            
        } else {
            return res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
        }
    } catch(catcherr) {
        console.log(catcherr);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function insertUserIntoDB(role_id, parent_id, admin_id, superadmin_id, name, email, hashedPassword, date_of_birth, mobile_number, created_by, created_date) {
    
    const query = `INSERT INTO users (role_id, parent_id, admin_id, superadmin_id, name, 
    email, password, date_of_birth, mobile_number, created_by, created_date) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [role_id, parent_id, admin_id, superadmin_id, name, email, hashedPassword, date_of_birth, mobile_number, created_by, created_date];
    
    await db.execute(query, values);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function registerUser(req, res) {

    try{
        
        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        const { 
            // role_name, 
            role_id, 
            name, 
            email, 
            password, 
            date_of_birth, 
            mobile_number, 
            created_by, 
            created_date 
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
        
        const registeredUserRoleName = await commonFunctions.getUserRoleNameByRoleId(role_id);
        
        // if(role_name === 'superadmin') {
        if(registeredUserRoleName == 'superadmin'){    
            return res.status(403).json({
                response_data : {}, 
                message : 'You are not authorized to perform this operation', 
                status : 403 
            });
        }

        if ( !isUserSuperadmin ) {
            var permissions = await commonFunctions.checkPermission(logged_in_user_role_id, registeredUserRoleName, 'create_permission');
            if(permissions[0].create_permission == 1) {
                canCreate = true;
            } else {
                canCreate = false;
            }
        } else {
            canCreate = true;
        }
        
        
        // const db_role_id = await commonFunctions.getRoleIdByRoleName(role_name);
        
        // if(db_role_id == role_id) {

            if( canCreate ) {

                const hashedPassword = await bcrypt.hash(password, 10);
                const SQL = `INSERT INTO users (role_id, parent_id, name, email, password, date_of_birth, mobile_number, created_by, created_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                
                const values = [
                    role_id, 
                    logged_in_id, 
                    name, 
                    email, 
                    hashedPassword, 
                    date_of_birth, 
                    mobile_number, 
                    created_by, 
                    created_date
                ];
                
                const emailRegistered = await commonFunctions.isEmailAlreadyRegistered(email);
                if (emailRegistered) {
                    return res.status(403).json({ response_data: {}, message: "Email already in use", status: 403 });
                }

                const formattedQuery = db.format(SQL, values);
                // console.log('Executing Query:', formattedQuery);
                
                const [result] = await db.execute(SQL, values);
                
                const newUserId = result.insertId;
                const isRegisteredUserDoctor = await commonFunctions.checkedDoctorByRoleId(role_id);
                // const registeredUserRoleName = await commonFunctions.getUserRoleNameByRoleId(role_id);
                if ( isRegisteredUserDoctor ) {

                    const copySQL1 = `INSERT INTO doctor_master_vaccine (doctor_id, name, description, vaccine_range, 
                        range_type, is_mandatory, is_default, created_by, created_date)
                        SELECT ?, name, description, vaccine_range, 
                            range_type, is_mandatory, is_default, 
                            created_by, created_date
                        FROM master_vaccine`;

                    await db.execute(copySQL1, [newUserId]);

                    const copySQL2 = `INSERT INTO doctor_master_vaccine_details (doctor_id, master_vaccine_id, name, 
                        description, vaccine_range, range_type, version_number, is_mandatory, created_by, created_date)
                        SELECT ?, master_vaccine_id, name, 
                        description, vaccine_range, range_type, version_number, is_mandatory, created_by, created_date
                        FROM master_vaccine_details`;

                    await db.execute(copySQL2, [newUserId]);

                }

                // if( registeredUserRoleName === 'staff' ) {
                //     if( staffPermission == true ) {
                //         const {create_permission, read_permission, update_permission, delete_permission} = req.body;
                //     }
                // }

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
        // } else {
        //     return res.status(404).json({
        //         response_data : {}, 
        //         message : 'You are mismatching the role name and role id. Please check twice.', 
        //         status : 404 
        //     });
        // }
        
    } catch(catcherr) {
        throw catcherr;
    }
}

async function testting( req, res ) {
    const ress = await commonFunctions.getUserRoleNameByRoleId(3);
    return res.status(200).json({response_data : ress, message : 'Success', status : 200});
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function testToken() {
    console.log(process.env.TOKEN)
}

// async function login(req, res) {

//     const email = req.body.email;
//     const password = req.body.password;

//     try {

//         const SQL = `SELECT users.id, role_id, parent_id, name, email, password, mobile_number, role_name FROM users 
//         INNER JOIN user_roles ON users.role_id = user_roles.id 
//         WHERE email = ? AND users.status = 1`;
        
//         const [result] = await db.execute(SQL, [email]);
        
//         if( result.length == 0 ) {
//             return res.status(400).json({response_data : {}, message : "Invalid email id or user is deactive", status : 400});
//         } else {
//             const user = result[0];
//             const passwordMatch = await bcrypt.compare(password, user.password);

//             if (passwordMatch) {
//                 //jwt authentication
//                 const tokenPayload = {
//                     id: user.id,
//                     email : user.email,
//                     name : user.name
//                 };
//                 const accessToken = jwt.sign(tokenPayload, process.env.TOKEN);
//                 //jwt authentication
//                 // var accessToken = 'haskaksd';
//                 user.token = accessToken;
//                 // return res.status(200).json({ response_data: user, token : accessToken, message : "Logged in Successfully", status: 'Success' });
//                 return res.status(200).json({ response_data: user, message : "Logged in Successfully", status: 200 });
                
//             } else {
//                 return res.status(400).json({ response_data : {}, message: 'Invalid email or password', status : 400 });
//             }
//         }
            
//     } catch( catcherr ) {
//         throw catcherr;
//         res.status( 403 ).json({data : {}, status : 'Failed'})
//     }

    
// }

async function login(req, res) {
    const email_or_number = req.body.email;
    const password = req.body.password;

    try {
        const SQL = `SELECT users.id, role_id, parent_id, name, email, password, mobile_number, role_name FROM users 
        INNER JOIN user_roles ON users.role_id = user_roles.id 
        WHERE (email = ? OR mobile_number = ?) AND users.status = 1`;
        
        const [result] = await db.execute(SQL, [email_or_number, email_or_number]);
        // console.log(result);
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
            WHERE user_role_id = ?`;
            const permissions = await db.execute(SQL2, [user.role_id]);
            user.permissions = permissions[0];
            const accessToken = jwt.sign(tokenPayload, process.env.TOKEN, { expiresIn: '7h' }); // Token expires in 7 hour
            
            // Remove sensitive data from user object
            delete user.password;
            

            return res.status(200).json({ 
                response_data : user, 
                token: accessToken, 
                message: "Logged in Successfully" 
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// function getaLLRoles(req, res) {
//     db.query("SELECT * FROM user_roles", (err, result) => {
//         if( err ) {
//             console.log('Error is, ' + err )
//             res.status(400).json({data : NULL, status : 'Failed'})
//         } else {
//             res.status(200).json({data : result, status : 'Success'})
//         }
//     });
// }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function getAUser(req, res) {

    try{
        const user_id = req.query.user_id;
        const SQL = `SELECT u.id, u.role_id, ur.role_name, u.parent_id, u.name, u.email, u.date_of_birth, u.mobile_number FROM users u 
        INNER JOIN user_roles ur ON u.role_id = ur.id 
        WHERE u.id = ? AND u.status = 1`;
        const [result] = await db.execute(SQL, [user_id]);
        
        if( result.length == 0 ) {
            return res.status(404).json({response_data : {}, message : 'No user found', status : 404})    
        } else {
            return res.status(200).json({response_data : result[0], userinfo : req.user, message : 'User fetched successfully', status : 200})
        }   
    } catch(catcherr) {
        // throw catcherr;
        return res.status(500).json({response_data : {}, message : 'Server error', status : 500});
    }
    
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// async function getStaffList(req, res) {
    
//     try {

//         // const admin_id = req?.query?.admin_id || req.user.id;
//         const logged_in_id = req?.query?.logged_in_id || req.user.id;

//         const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
//         const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);

//         var permissions = await commonFunctions.checkPermission(logged_in_user_role_id, role_name, 'read_permission');

//         if( isUserSuperadmin || permissions[0].read_permission == 1 ) {
//             // const SQL = `SELECT * FROM users WHERE role_id = ? AND admin_id = ? AND status = 1`;

//             const SQL = `WITH RECURSIVE AdminHierarchy AS ( 
//                             SELECT id, parent_id FROM users WHERE id = ?
//                             UNION ALL SELECT u.id, u.parent_id FROM users u JOIN AdminHierarchy ah ON u.parent_id = ah.id 
//                         ) SELECT u.* FROM users u JOIN AdminHierarchy ah ON u.parent_id = ah.id 
//                         JOIN user_roles ur ON u.role_id = ur.id 
//                         WHERE ur.role_name = 'Staff'`;

//             const [result] = await db.execute(SQL, [admin_id]);
                
//             if( result.length == 0 ) {
//                 res.status(404).json({response_data : {}, message : 'No user found', status : 404})    
//             } else {
//                 res.status(200).json({response_data : result, message : 'Staff fetched successfully', status : 200})
//             }
//         } else {
//             res.status(403).json({response_data : result, message : 'You are not authorized to perform this operation', status : 403})
//         }
        
//     } catch( catcherr ) {
//         console.log(catcherr)
//     }
// }

async function getStaffList(req, res) {
    
    try {

        const logged_in_id = req?.query?.logged_in_id || req.user.id;

        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        const isUserAdmin = await commonFunctions.isAdmin( logged_in_user_role_id );
        const isUserDoctor = await commonFunctions.isDoctor( logged_in_user_role_id );

        var isAuthenticated = false;

        var permissions = await commonFunctions.checkPermission(logged_in_user_role_id, 'staff', 'read_permission');
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function viewAllAdmins(req, res) {
    
    try {
        
        const to_search = 'admin';
        const logged_in_id = req?.query?.logged_in_id || req.user.id;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        
        if(isUserSuperadmin) {
            const SQL1 = `SELECT id FROM user_roles WHERE role_name = ?`;
            const [result1] = await db.execute(SQL1, [to_search]);
                
            if(result1.length > 0){

                const role_id = result1[0].id;
                const SQL2 = `SELECT id, role_id, parent_id, name, email FROM users WHERE role_id = ? AND status = 1`;
                const [result] = await db.execute(SQL2, [role_id]);
                    
                if( result.length == 0 ) {
                    return res.status(404).json({response_data : {}, message : 'No admins found', status : 404})    
                } else {
                    return res.status(200).json({response_data : result, status : 200})
                }
                        
            } else {
                return res.status(404).json({response_data : {}, message : 'No admin found', status : 404})
            }
                    
                
        } else {
            return res.status(403).json({response_data : {}, message : 'You are not a superadmin and hence cannot perform this operation', status : 403})
        }
    } catch( catcherr ) {
        console.log(catcherr)
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function editAdmin(req, res) {

    try{
        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        const {user_id, name, email, date_of_birth, mobile_number, status} = req.body;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        
        if( isUserSuperadmin ) {

            const SQL = `UPDATE users SET name = ?, email = ?, date_of_birth = ?, mobile_number = ?, status = ? WHERE id = ?`;
            await db.execute(SQL, [name, email, date_of_birth, mobile_number, status, user_id]);
            res.status(200).json({response_data : {}, message : "Admin Updated Successfully", status : 200})
                
        } else {
            res.status(403).json({response_data : {}, message : "You are not authorized to perform this operation", status : 403})
        }
        
    } catch( catcherr ) {
        console.log(catcherr);
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function registerClinicInfo(req, res) {
    const {doctor_id, name, description, address, created_by, created_date} = req.body;
    
    try {
        
        var SQL = `INSERT INTO clinic_info (doctor_id, name, description, address, created_by, created_date) VALUES (?, ?, ?, ?, ?, ?)`;
        var values = [doctor_id, name, description, address, created_by, created_date]

        await db.query(SQL, values);
        return res.status(200).json({response_data : {}, message : "Clinic info set successfully", status : 200})
        
    } catch(catcherr) {
        console.log(catcherr);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function getAllClinicInfo(req, res) {
    try{
        
        const SQL = `SELECT clinic_info.id, clinic_info.doctor_id, clinic_info.name as clinic_name, users.name as doctor_name, address FROM clinic_info 
        INNER JOIN users ON  clinic_info.doctor_id = users.id 
        WHERE clinic_info.status = 1`;
        
        const [result] = await db.execute(SQL);
        if(result.length > 0) {
            return res.status(200).json({response_data : result, message : "All clinics", status : 200});
        } else {
            return res.status(404).json({response_data : {}, message : "No clinic found", status : 404});
        }

    } catch(catcherr) {
        console.log(catcherr);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function getAllDoctors(req, res) {
    try{
        
        const logged_in_id =req?.query?.logged_in_id || req.user.id;

        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        
        var permissions = await commonFunctions.checkPermission(logged_in_user_role_id, 'Doctor', 'read_permission');

        if( isUserSuperadmin || permissions[0].read_permission == 1 ) {

            let SQL;
            if (isUserSuperadmin) {
                // Superadmin can see all doctors
                SQL = `SELECT users.id, name, email, date_of_birth FROM users 
                       INNER JOIN user_roles ON user_roles.id = role_id 
                       WHERE users.role_id = user_roles.id 
                       AND user_roles.role_name = 'Doctor' 
                       AND users.status = 1`;
                    //    console.log("inside if");
            } else {
                // Admin can see only the doctors they registered
                SQL = `SELECT users.id, name, email, date_of_birth FROM users 
                       INNER JOIN user_roles ON user_roles.id = role_id 
                       WHERE users.role_id = user_roles.id 
                       AND user_roles.role_name = 'Doctor' 
                       AND users.status = 1 
                       AND users.parent_id = ?`;
            }

            const values = isUserSuperadmin ? [] : [logged_in_id];

            const formattedQuery = db.format(SQL, values);
            // console.log(formattedQuery);

            const [result] = await db.execute(SQL, values);
            if (result.length > 0) {
                return res.status(200).json({ response_data: result, message: "All doctors info", status: 200 });
            } else {
                return res.status(404).json({ response_data: {}, message: "No doctor found", status: 404 });
            }

        } else {
            return res.status(403).json({response_data : {}, message : "You are not authorized to perform this operation", status : 403});
        }

    } catch(catcherr) {
        console.log(catcherr);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function getDoctorProfile(req, res) {
    
    const doctor_id = req.query.doctor_id;
    
    try{
        
        const SQL = `SELECT users.id, name, email, date_of_birth FROM users 
        INNER JOIN user_roles ON user_roles.id = role_id 
        WHERE users.role_id = user_roles.id AND user_roles.role_name = 'Doctor' AND users.id = ? AND users.status = 1`;
        
        [result] = await db.execute(SQL, [doctor_id]);
        if(result.length > 0) {
            return res.status(200).json({response_data : result, message : "Doctor's info", status : 200});
        } else {
            return res.status(404).json({response_data : {}, message : "No doctor found", status : 404});
        }
        
    } catch(catcherr) {
        console.log(catcherr);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function checkJWTAuthentication() {

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function setDoctorTimeSlots(req, res) {
    
    const {doctor_id, time_slot, shift_day_number, status, created_by, created_date, updated_date, is_deleted} = req.body;
    
    const SQL = `SELECT user_roles.id, role_name FROM user_roles 
    INNER JOIN users on user_roles.id = users.role_id 
    WHERE users.id = ?`;

    [result1] = await db.execute(SQL, [doctor_id]);
        
    if(result1.length > 0) {
        
        if(result1[0].role_name == 'Doctor') {
            
            const insertSQL = `INSERT INTO doctor_time_slots (doctor_id, time_slot, shift_day_number, created_by, created_date) VALUES (?, ?, ?, ?, ?)`;

            const values = [doctor_id, time_slot, shift_day_number, created_by, created_date];
            [result2] = await db.execute(insertSQL, values);
            
            return res.status(200).json({response_data : {}, message : "Time slot for this doctor has been created successfully", status : 200});        
            
        } else {
            return res.status(403).json({response_data : result1, message : "You cannot set time slots for this type of user", status : 403});
        }
        
    }
}

function rememberMe() {
    
}

async function editStaff(req, res) {
    try{

        const logged_in_id = req?.body?.logged_in_id || req.user.id;

        const { user_id, name, email, date_of_birth, mobile_number, country, state, city, updated_date } = req.body;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_user_id);
        
        var permissions = await commonFunctions.checkPermission(logged_in_user_role_id, 'staff', 'update_permission');
        
        if(permissions[0].update_permission == 1) {
            const SQL = `UPDATE users SET name = ?, email = ?, date_of_birth = ?, mobile_number = ?, country = ?, 
            state = ?, city = ?, updated_date = ? WHERE id = ?`;
            const values = [name, email, date_of_birth, mobile_number, country, state, city, updated_date, user_id];

            await db.execute(SQL, values);
            return res.status(200).json({response_data : {}, message : 'Staff updated successfully', status : 200})
        } else {
            return res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403})
        }
        
    } catch(catcherr){
        throw catcherr;
    }
}

async function deleteAdmin(req,res) {
    try {

        const logged_in_id = req?.body?.logged_in_id || req.user.id;

        const user_id = req.body.user_id;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        
        if( isUserSuperadmin ) {

            const SQL = `UPDATE users SET status = 0 WHERE id = ?`;
            await db.execute(SQL, [user_id]);

            return res.status(200).json({response_data : {}, message : 'Admin Removed Successfully', status : 200})
            
        } else {
            return res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403})
        }
    } catch(catcherr) {
        throw catcherr;
    }
}

async function getUserRoles(req, res) {
    try {
        const status = 1;
        const SQL = `SELECT id, role_name FROM user_roles WHERE status = ?`;
        const [result] = await db.execute(SQL, [status]);

        if( result.length > 0 ) {
            return res.status(200).json({response_data : result, message : 'All User Roles', status : 200});
        } else {
            return res.status(404).json({response_data : {}, message : 'No User Roles Found', status : 404});
        }
    } catch (catcherr) {
        throw catcherr;
    }
}

async function testScheduling(req, res) {
    const result = await commonFunctions.calculateVaccineSchedule(2);
}

async function staffListUnderAdmin() {

}

async function getUserList(req, res) {
    
    try {

        const logged_in_id = req?.query?.logged_in_id || req.user.id;
        // const user_role_id = req.query.user_role_id;
        const role_name = req.query.role_name;
        const role_id = await commonFunctions.getRoleIdByRoleName(role_name);
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);

        const permissions = await commonFunctions.checkPermission(logged_in_user_role_id, role_name, 'read_permission');
        let SQL;
        if( role_id != 0 ) {
            if( isUserSuperadmin ) {
                SQL = `SELECT * FROM users WHERE role_id = ?`;
            } else if( permissions[0].read_permission == 1 ) {
                SQL = `SELECT * FROM users WHERE role_id = ?`;
            } else {
                res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
            }

            const [result] = await db.execute(SQL, [role_id]);

            if ( result.length > 0 ) {
                res.status(200).json({response_data : result, message : 'All Users of this role', status : 200});
            } else {
                res.status(404).json({response_data : {}, message : 'No users found', status : 404});
            }
        } else {
            res.status(404).json({response_data : {}, message : 'This role name is not found', status : 404});
        }

    } catch (catcherr) {
        throw catcherr;
    }
}



// async function grantBulkPermission(req, res) {
//     try {
        
//     //     const testObj = [ 
//     //         {
//     //         "name": "admin",
//     //         "create": false,
//     //         "delete": false,
//     //         "update": false,
//     //         "read": false
//     //     },
//     //     {
//     //         "name": "doctor",
//     //         "create": false,
//     //         "delete": false,
//     //         "update": false,
//     //         "read": false
//     //     },
//     //     {
//     //         "name": "staff",
//     //         "create": false,
//     //         "delete": false,
//     //         "update": false,
//     //         "read": false
//     //     },
//     //     {
//     //         "name": "appointment",
//     //         "create": false,
//     //         "delete": false,
//     //         "update": false,
//     //         "read": false
//     //     },
//     //     {
//     //         "name": "notification",
//     //         "create": false,
//     //         "delete": false,
//     //         "update": false,
//     //         "read": false
//     //     },
//     //     {
//     //         "name": "patient",
//     //         "create": false,
//     //         "delete": false,
//     //         "update": false,
//     //         "read": false
//     //     }
//     // ];
    
    
//     const dataArr = req.body.dataArr;
//     const user_role_id = req.body.user_role_id;

//     let SQL = 'INSERT INTO permissions (module_id, module_name, create_permission, delete_permission, update_permission, read_permission) VALUES ';
//     const values = [];
    
//     dataArr.forEach((permission, index) => {
//       SQL += `(?, ?, ?, ?, ?, ?)${index < testObj.length - 1 ? ',' : ''} `;
//       values.push(permission.module_id, permission.module_name, permission.create_permission, permission.delete_permission, permission.update_permission, permission.read_permission);
//     });

//     const fq = db.format(SQL, values);
//     console.log(fq);
//     } catch (catcherr) {
//         console.log("Error", catcherr);
//         throw catcherr;
//     }
// }

// async function grantBulkPermission(req, res) {
//     try {
        
//         const logged_in_id = req?.query?.logged_in_id || req.user.id;
//         const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
//         const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        
//         const dataArr = req.body.dataArr;
//         const user_role_id = req.body.user_role_id;

//         const queries = [];
//         const values = [];

//         if( isUserSuperadmin ) {
//             dataArr.forEach(permission => {
//                 const query = `
//                     UPDATE permissions 
//                     SET create_permission = ?, delete_permission = ?, update_permission = ?, read_permission = ? 
//                     WHERE module_id = ? AND user_role_id = ?;
//                 `;
//                 queries.push(query);
//                 values.push(
//                     permission.create_permission, 
//                     permission.delete_permission, 
//                     permission.update_permission, 
//                     permission.read_permission, 
//                     permission.module_id,
//                     user_role_id
//                 );
//             });
    
//             // Join all the queries into a single string
//             const finalQuery = queries.join(' ');
    
//             const fq = db.format(finalQuery, values);
//             console.log(fq);
            
//             // Assuming you have a method to execute the query, something like:
//             await db.query(fq);
            
//             res.status(200).json({ response_data: {}, message: 'Permissions updated successfully', status : 200 });
//         } else {
//             res.status(403)({ success: {}, message: 'You are not authorized to per', status : 403 });
//         }
        
        
//     } catch (catcherr) {
//         console.log("Error", catcherr);
//         res.status(500).send({ success: false, message: 'An error occurred while updating permissions' });
//     }
// }

async function grantBulkPermission(req, res) {
    try {

        const logged_in_id = req?.query?.logged_in_id || req.user.id;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);

        const dataArr = req.body.dataArr;
        const user_role_id = req.body.user_role_id;

        if( isUserSuperadmin ) {
            // Iterate over each permission and execute the update query
            for (const permission of dataArr) {
                const query = `
                    UPDATE permissions 
                    SET create_permission = ?, delete_permission = ?, update_permission = ?, read_permission = ? 
                    WHERE module_id = ? AND user_role_id = ?;
                `;
                const values = [
                    permission.create_permission,
                    permission.delete_permission,
                    permission.update_permission,
                    permission.read_permission,
                    permission.module_id,
                    user_role_id
                ];

                // Execute the query using your database connection instance
                await db.query(query, values);
            }

            res.status(200).json({response_data : {}, message : 'Permissions updated successfully', status : 200});
        } else {
            res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
        }

        
    } catch (catcherr) {
        throw catcherr;
    }
}


async function getMyPermissions() {

    const logged_in_id = req?.query?.logged_in_id || req.user.id;
    const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
    // const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
    
    const SQL = `SELECT * FROM permissions WHERE user_role_id = ?`;
    const [result] = await db.execute(SQL, [logged_in_user_role_id]);

    if( result.length > 0 ) {
        res.status(200).json({response_data : result, message : 'All Permissions for this user type', status : 200});
    } else {
        res.status(404).json({response_data : result, message : 'No Permissions Found', status : 404});
    }
}

async function getAllPermissions(req, res) {
    
    try {
        
        const logged_in_id = req?.query?.logged_in_id || req.user.id;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        
        var permissions = await commonFunctions.checkPermission(logged_in_user_role_id, 'user permissions', 'read_permission');
        console.log('permissions from database', permissions);
        if ( isUserSuperadmin || permissions[0].read_permission == 1) {
            const SQL = `SELECT * FROM permissions WHERE status = 1`;
            const [result] = await db.execute(SQL);

            if( result.length > 0 ) {
                res.status(200).json({response_data : result, message : 'All Permissions', status : 200});
            } else {
                res.status(404).json({response_data : result, message : 'No Permissions Found', status : 404});
            }
        } else {
            res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
        }
        
    } catch (catcherr) {
        throw catcherr;
    }
}

module.exports = {
    registerUser, 
    login,
    getAUser,

    getStaffList, 
    deleteStaff,
    editStaff,

    viewAllAdmins, 
    editAdmin, 
    deleteAdmin,

    viewTodaysBirthdays, 
    viewUpcomingBirthdays,

    registerClinicInfo,
    getAllClinicInfo,
    
    getAllDoctors,
    getDoctorProfile,
    setDoctorTimeSlots,
    testToken,
    
    forgotPassword,
    rememberMe,
    
    createPermission,

    getUserRoles,
    testting,
    testScheduling,
    resetPassword,
    getUserList,

    grantBulkPermission,
    getAllPermissions,
    getMyPermissions

}