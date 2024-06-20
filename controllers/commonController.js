const db = require('../utils/db.js')
const commonFunctions = require('../utils/commonFunctions');
const e = require('express');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function getTotalCount(req, res) {
    
    try {
        const {logged_in_id, property} = req.query;
        
        const isValidUser = await commonFunctions.checkValidUserId(logged_in_id);
        
        if(!isValidUser) {
            return res.status(404).json({response_data : {}, message : 'Invalid id of logged in user', status : 404 });
        }
        
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);
        const isUserSuperAdmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        const propertyName = property.toLowerCase();

        var SQL = ``;

        if( isUserAdmin || isUserSuperAdmin ) {
            if ( propertyName == 'superadmin' || propertyName == 'admin' || propertyName == 'doctor' || propertyName == 'staff' ) {

                SQL += `SELECT count(users.id) as rowcount FROM users 
                INNER JOIN user_roles ON users.role_id = user_roles.id 
                WHERE LOWER(user_roles.role_name) = '${propertyName}' AND users.status = 1`;

            } else if ( propertyName == 'vaccine template' ) {

                SQL += `SELECT count(id) as rowcount FROM master_vaccine WHERE status = 1`;

            } else if ( propertyName == 'vaccine' ) {

                SQL += `SELECT count(id) as rowcount FROM master_vaccine_details WHERE status = 1`;

            } else {
                return res.status(404).json({response_data : {}, 'message' : 'Not Found', status : 404});
            }

            const result = await db.execute(SQL);
            return res.status(200).json({response_data : result[0], 'message' : 'Total Count', status : 200});

        } else {
            return res.status(401).json({response_data : {}, 'message' : 'You are not authorized to perform this operation', status : 401});
        }
    } catch (catcherr) {
        throw catcherr;
    }
}

async function getDashboardCounts (req, res) {
    try {
        const logged_in_id = req.query.logged_in_id;

        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        
        // console.log(logged_in_user_role_id);
        // return 0;

        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        const isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);
        
        if( isUserSuperadmin || isUserAdmin ) {

            const SQL = `SELECT 'admin' AS property_name, COUNT(u.id) AS role_count
            FROM users u
            INNER JOIN user_roles ur ON u.role_id = ur.id
            WHERE ur.role_name = 'admin'
            UNION ALL
            SELECT 'doctor' AS property_name, COUNT(u.id) AS role_count
            FROM users u
            INNER JOIN user_roles ur ON u.role_id = ur.id
            WHERE ur.role_name = 'doctor'
            UNION ALL
            SELECT 'staff' AS property_name, COUNT(u.id) AS role_count
            FROM users u
            INNER JOIN user_roles ur ON u.role_id = ur.id
            WHERE ur.role_name = 'staff'
            UNION ALL
            SELECT 'patient' AS property_name, COUNT(p.id) AS role_count
            FROM patients p
            UNION ALL
            SELECT 'vaccine template' AS property_name, COUNT(vt.id) AS role_count
            FROM master_vaccine vt;`;

            const [result] = await db.execute(SQL);

            if( result.length > 0 ) {
                return res.status(200).json({response_data : result, message : 'Count', status : 200});
            } else {
                return res.status(404).json({response_data : {}, message : 'Not found', status : 404});
            }
            

        } else {
            return res.status(401).json({response_data : {}, message : 'You are not authorized to perform this operation'});
        }

        
    } catch (catcherr) {
        throw catcherr;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function getModules(req, res) {
    try {
        const SQL = `SELECT id, module_name FROM modules`;
        const [result] = await db.execute(SQL);

        if( result.length > 0 ) {
            res.status(200).json({response_data : result, message : 'List of all modules', status : 200});
        } else {
            res.status(404).json({response_data : {}, message : 'No module found', status : 404});
        }

    } catch (catcherr) {
        throw catcherr;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
    getTotalCount,
    getDashboardCounts,
    getModules
}