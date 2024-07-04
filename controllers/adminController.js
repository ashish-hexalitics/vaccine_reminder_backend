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

        isUserAdmin = await commonFunctions.isAdmin( email_or_number );
        isUserSuperAdmin = await commonFunctions.isSuperAdmin( email_or_number );
        
        if ( !isUserAdmin || !isUserSuperAdmin  ) {
            return res.status(404).json({response_data : {}, message : 'You are trying to login with wrong user type', status : 404});
        }

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
            WHERE user_id = ?`;
            const permissions = await db.execute(SQL2, [user.id]);
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

async function createMasterVaccineTemplate(req, res) {
    
    try {

        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        
        const { name, description, vaccine_range, range_type, is_mandatory, created_by, created_date} = req.body;
        const role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        
        if(role_id == 0) {
            return res.status(400).json({response_data : {}, message : "This user does not exist", status : 400});
        }
        
        isUserSuperAdmin = await commonFunctions.isSuperAdmin(role_id);
        // return res.status(200).send(isUserSuperAdmin);
        if(isUserSuperAdmin === 0) {
            return res.status(400).json({response_data : {}, message : "This role does not exist", status : 400});
        }
        if(isUserSuperAdmin) {
            
            let query = `INSERT INTO master_vaccine (name, description, vaccine_range, range_type, is_mandatory, created_by, created_date) VALUES (?,?,?,?,?,?,?)`;
            const values = [name, description, vaccine_range, range_type, is_mandatory, created_by, created_date];
            await db.query(query, values);
            return res.status(200).json({response_data : {}, message : "Information stored sucessfully", status : 200});
            
        } else {
            return res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
        }
    } catch(catcherr){
        console.log(catcherr);
    }
    
}

async function createMasterVaccineDetails(req, res) {
    try {

        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        const { master_vaccine_id, name, description, vaccine_range, range_type, is_mandatory, created_date} = req.body;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);

        if( isUserAdmin ) {
            const SQL = `INSERT INTO master_vaccine_details 
            (master_vaccine_id, name, description, vaccine_range, range_type, is_mandatory, created_by, created_date) VALUES
            (?,?,?,?,?,?,?,?)`;

            const values = [master_vaccine_id, name, description, vaccine_range, range_type, is_mandatory, logged_in_id, created_date]

            await db.execute(SQL, values);
            return res.status(200).json({response_data : {}, 'message' : 'Master vaccine details has been set successfully', status : 200});

        } else {
            return res.status(403).json({response_data : {}, 'message' : 'You are not authorized to perform this operation', status : 403});
        }

    } catch (catcherr) {
        throw catcherr;
    }
}

module.exports = {
    createMasterVaccineTemplate,
    createMasterVaccineDetails
}