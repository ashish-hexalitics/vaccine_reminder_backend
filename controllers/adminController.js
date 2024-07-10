const db = require('../utils/db')
const commonFunctions = require('../utils/commonFunctions')
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

async function registerUser(req, res) {

    try{
        
        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        const {
            role_id, 
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
        
        const registeredUserRoleName = await commonFunctions.getUserRoleNameByRoleId(role_id);
        
        if(registeredUserRoleName == 'superadmin'){    
            return res.status(403).json({
                response_data : {}, 
                message : 'You are not authorized to perform this operation', 
                status : 403 
            });
        }

        if ( !isUserSuperadmin ) {
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
                    role_id, 
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

                const isRegisteredUserDoctor = await commonFunctions.checkedDoctorByRoleId(role_id);
                
                if ( isRegisteredUserDoctor ) {

                    const copySQL1 = `INSERT INTO doctor_master_vaccine_template (doctor_id, name, description, created_by, created_date)
                        SELECT ?, name, description, 
                            created_by, created_date
                        FROM master_vaccine_template WHERE created_by= ?`;

                    const resultcopySQL = await db.execute(copySQL1, [newUserId, logged_in_id]);

                    const doc_template_id = resultcopySQL.insertId;

                    const copySQL2 = `INSERT INTO doctor_master_vaccine_template_vaccines (doctor_id, master_vaccine_template_id, doctor_master_vaccine_template_id, name, 
                        description, vaccine_range, range_type, version_number, is_mandatory, created_by, created_date)
                        SELECT ?, master_vaccine_id, ?, name, 
                        description, vaccine_range, range_type, version_number, is_mandatory, created_by, created_date
                        FROM master_vaccine_template_vaccines WHERE created_by = ?`;


                    const formattedQuery1 = db.format(copySQL2, [newUserId, doc_template_id, logged_in_id]);
                    console.log(formattedQuery1);

                    await db.execute(copySQL2, [newUserId, doc_template_id, logged_in_id]);

                }

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

async function registerDoctor(req, res) {

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
        
        if( !isUserSuperadmin && !isUserAdmin ) {
            return res.status(403).json({response_data : {}, message : 'You are trying to perform this operation with wrong user type', status : 403});
        }

        const findSQL = `SELECT id FROM user_roles WHERE role_name = ?`;
        const [findResult] = await db.execute(findSQL, ['Doctor']);
        const role_id = findResult[0].id;
                
        const registeredUserRoleName = await commonFunctions.getUserRoleNameByRoleId(role_id);
        
        if(registeredUserRoleName == 'superadmin'){    
            return res.status(403).json({
                response_data : {}, 
                message : 'You are not authorized to perform this operation', 
                status : 403 
            });
        }

        // if ( !isUserSuperadmin ) {
        //     var permissions = await commonFunctions.checkPermission(logged_in_id, registeredUserRoleName, 'create_permission');
        //     if(permissions != false && permissions[0].create_permission == 1) {
        //         canCreate = true;
        //     } else {
        //         canCreate = false;
        //     }
        // } else {
        //     canCreate = true;
        // }
        const canCreate = true;
        
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

                const copySQL1 = `INSERT INTO doctor_master_vaccine_template (master_vaccine_template_id, doctor_id, name, description, created_by, created_date)
                            SELECT id, ?, name, description, created_by, created_date
                            FROM master_vaccine_template 
                            WHERE created_by= ? AND status = ?`;

                await db.execute(copySQL1, [newUserId, logged_in_id, 1]);

                // Retrieve inserted IDs
                const [insertedTemplates] = await db.execute(`SELECT id FROM doctor_master_vaccine_template WHERE doctor_id = ?`, [newUserId]);
                const doc_template_ids = insertedTemplates.map(row => row.id);

                const copySQL2 = `INSERT INTO doctor_master_vaccine_template_vaccines (doctor_id, doctor_master_vaccine_template_id, name, 
                                description, vaccine_range, range_type, version_number, is_mandatory, created_by, created_date)
                                SELECT ?, ?, name, description, vaccine_range, range_type, version_number, is_mandatory, created_by, created_date
                                FROM master_vaccine_template_vaccines 
                                WHERE created_by = ? AND status = ?`;

                for (let doc_template_id of doc_template_ids) {
                    await db.execute(copySQL2, [newUserId, doc_template_id, logged_in_id, 1]);
                }

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

async function login(req, res) {

    const email_or_number = req.body.email;
    const password = req.body.password;

    try {

        isUserAdmin = await commonFunctions.isAdminLogin( email_or_number );
        isUserSuperAdmin = await commonFunctions.isSuperAdminLogin( email_or_number );
        
        if ( !isUserAdmin && !isUserSuperAdmin  ) {
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
                response_data : {user_data: user},
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

async function createMasterVaccineTemplate(req, res) {
    
    try {

        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        
        const { name, description } = req.body;
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
            
            let query = `INSERT INTO master_vaccine_template (name, description, created_by, created_date) VALUES (?,?,?,?)`;
            const values = [name, description, logged_in_id, new Date()];
            await db.query(query, values);
            return res.status(200).json({response_data : {}, message : "Vaccine template created sucessfully", status : 200});
            
        } else {
            return res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
        }
    } catch(catcherr){
        console.log(catcherr);
    }
    
}

async function createMasterVaccineTemplateVaccines(req, res) {
    try {

        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        // const { master_vaccine_id, name, description, vaccine_range, range_type, version_number, is_mandatory } = req.body;
        const vaccines = req.body.vaccines; // Assume this is an array of vaccine objects //To add multiple vaccines at once
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);
        const isUserSuperAdmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);

        if( isUserAdmin || isUserSuperAdmin ) {
            // const SQL = `INSERT INTO master_vaccine_template_vaccines 
            // (master_vaccine_id, name, description, vaccine_range, range_type, version_number, is_mandatory, created_by, created_date) VALUES
            // (?,?,?,?,?,?,?,?,?)`;

            const baseSQL = `INSERT INTO master_vaccine_template_vaccines 
            (master_vaccine_id, name, description, vaccine_range, range_type, version_number, is_mandatory, created_by, created_date) VALUES `;

            const valuePlaceholders = vaccines.map(() => '(?,?,?,?,?,?,?,?,?)').join(',');
            const SQL = baseSQL + valuePlaceholders;
            // const values = [master_vaccine_id, name, description, vaccine_range, range_type, version_number, is_mandatory, logged_in_id, new Date()]
            
            const values = vaccines.flatMap(vaccine => [
                vaccine.master_vaccine_id, 
                vaccine.name, 
                vaccine.description, 
                vaccine.vaccine_range, 
                vaccine.range_type, 
                vaccine.version_number, 
                vaccine.is_mandatory, 
                logged_in_id, 
                new Date()
            ]);

            // await db.execute(SQL, values);
            const formattedQuery = db.format(SQL, [values]);
            console.log(formattedQuery);
            await db.execute(SQL, values);
            return res.status(200).json({response_data : {}, 'message' : 'Master vaccine template vaccine has been set successfully', status : 200});

        } else {
            return res.status(403).json({response_data : {}, 'message' : 'You are not authorized to perform this operation', status : 403});
        }

    } catch (catcherr) {
        throw catcherr;
    }
}

async function createEvent(req, res) {

    try {
        const logged_in_id = req.body.logged_in_id || req.user.id;
        const {
            event_name, 
            event_description, 
            event_date,
        } = req.body;

        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        isUserSuperAdmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);
        let SQL;
        if( isUserSuperAdmin || isUserAdmin ) {
            SQL = `INSERT INTO events (event_name, event_description, event_date, created_by, created_date) 
            VALUES (?, ?, ?, ?, ?)`;
            const values = [event_name, event_description, event_date, logged_in_id, new Date()];
            await db.execute(SQL, values);

            res.status(200).json({response_data : {}, message : 'Event has been created successfully', status : 200});

        } else {
            res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
        }
    } catch (catcherr) {
        throw catcherr;
    }
}

async function getUpcomingEvents(req, res) {
    
    try {
        
        const logged_in_id = req?.query?.logged_in_id || req.user.id;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        isUserSuperAdmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);
        let SQL;

        if( isUserSuperAdmin || isUserAdmin ) {
            SQL = `SELECT event_name, event_description, event_date, created_by FROM events 
            WHERE DATE_FORMAT(event_date, '%m-%d') >= DATE_FORMAT(NOW(), '%m-%d') AND status = ? 
            ORDER BY DATE_FORMAT(event_date, '%m-%d') LIMIT 10`;

            const [result] = await db.execute(SQL, [1]);
            
            if ( result.length > 0 ) {
                res.status(200).json({response_data : {upcoming_events : result}, message : 'List of all upcoming events', status : 200});
            } else {
                res.status(404).json({response_data : {}, message : 'No upcoming events found', status : 404});
            }

        } else {
            res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
        }
            
    } catch (catcherr) {
        throw catcherr;
    }
    
}

async function editEvent(req, res){
    try {
        
        const logged_in_id = req?.query?.logged_in_id || req.user.id;
        const {event_id, event_name, event_description, event_date} = req.query;
        console.log("data", req.query);
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        
        isUserSuperAdmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);
        let SQL;

        if ( isUserSuperAdmin || isUserAdmin ) {
            SQL = `UPDATE events SET event_name = ?, event_description = ?, event_date = ? WHERE id = ? AND created_by = ?`;
            const values = [event_name, event_description, event_date, event_id, logged_in_id];

            await db.execute(SQL, values);
            res.status(200).json({response_data : {}, message : 'Event has been updated successfully', status : 200});
        } else {
            res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
        }

    } catch (catcherr) {
        throw catcherr;
    }
}

async function viewEvent(req, res) {

    try {
        
        const logged_in_id = req?.query?.logged_in_id || req.user.id;
        const event_id = req.query.event_id;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        
        isUserSuperAdmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);
        let SQL;

        if ( isUserSuperAdmin || isUserAdmin ) {
            SQL = `SELECT id, event_name, event_description, event_date FROM events 
            WHERE id = ? AND status = ? AND created_by = ?`;

            const values = [event_id, 1, logged_in_id];
            
            const [result] = await db.execute(SQL, values);

            if ( result.length > 0 ) {
                res.status(200).json({response_data : { event_data: [result[0]] }, message : 'Event fetched sucessfully', status : 200});
            } else {
                res.status(404).json({response_data : {}, message : 'Either this event is not found or it is not active', status : 404});
            }

        } else {
            res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
        }

    } catch (catcherr) {
        throw catcherr;
    }
}

async function deleteEvent(req, res) {

    try {
        const logged_in_id = req?.query?.logged_in_id || req.user.id;
        const event_id = req.query.event_id;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        
        isUserSuperAdmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);
        let SQL;

        if ( isUserSuperAdmin || isUserAdmin ) {

            SQL = `UPDATE events SET status = ? WHERE id = ?`;
            const values = [0, event_id];

            await db.execute(SQL, values);

            res.status(200).json({response_data : {}, message : 'Event deleted successfully', status : 200});
            
        } else {
            res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
        }

    } catch (catcherr) {
        throw catcherr;
    }
}

async function getMasterVaccineTemplates ( req, res ) {
    try {
        const logged_in_id = req?.body?.logged_in_id || req.user.id;

        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserSuperAdmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        const isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);

        if ( isUserSuperAdmin || isUserAdmin ) {
            let SQL = `SELECT name, description 
            FROM master_vaccine_template 
            WHERE status = ?`;

            const [result] = await db.execute(SQL, [1]);

            if ( result.length > 0 ) {
                return res.status(200).json({response_data : {master_vaccine_templates : result}, message : 'List of all master vaccine templates', status : 200});
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

async function getMasterVaccineTemplateVaccines ( req, res ) {
    try {
        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        const vaccine_template_id = req?.query?.vaccine_template_id;

        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserSuperAdmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        const isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);

        if ( isUserSuperAdmin || isUserAdmin ) {
            let SQL = `SELECT name, description, vaccine_range, range_type, version_number, is_mandatory 
            FROM master_vaccine_template_vaccines
            WHERE master_vaccine_id = ? AND status = ?`;

            const [result] = await db.execute( SQL, [vaccine_template_id, 1] );

            if ( result.length > 0 ) {
                return res.status(200).json({response_data : {master_template_vaccines : result}, message : 'List of master vaccines', status : 200});
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

module.exports = {
    registerUser,
    login,
    createMasterVaccineTemplate,
    createMasterVaccineTemplateVaccines,
    createEvent,
    getUpcomingEvents,
    editEvent,
    viewEvent,
    deleteEvent,
    registerDoctor,
    getMasterVaccineTemplates,
    getMasterVaccineTemplateVaccines
    
}