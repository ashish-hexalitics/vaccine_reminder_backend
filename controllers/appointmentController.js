const db = require('../utils/db.js')
const commonFunctions = require('../utils/commonFunctions');

async function bookAppointment(req, res) {
    try {

        const {appointment_booked_by, patient_id, appointment_time, appointment_date, created_by, created_date} = req.body;
        const user_role_id = await commonFunctions.getUserRoleIdByUserId(appointment_booked_by);
        const permissions = await commonFunctions.checkPermission(user_role_id, 'appointment', 'create_permission');
        
        if(permissions[0].create_permission == 1) {
            const SQL = `INSERT INTO appointments (appointment_booked_by, patient_id, appointment_time, appointment_date, created_by, created_date) VALUES (?,?,?,?,?,?)`;
            const values = [appointment_booked_by, patient_id, appointment_time, appointment_date, created_by, created_date];
            
            await db.execute(SQL, values);
            return res.status(200).json({ response_data : {}, message: 'Appointment booked successfully', status : 200 });
        } else {
            return res.status(403).json({ response_data : {}, message: 'You are not authorized to do this operation', status : 403 });
        }
        
            
    } catch( catcherr ) {
        console.log(catcherr);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function viewUpcomingAppointments(req, res) {

    const admin_id = req.query.admin_id;
    try {
        const SQL = `SELECT a.appointment_date, booked_by.name AS appointment_booked_by_name, patient.name AS patient_name FROM appointments a 
        JOIN users booked_by ON a.appointment_booked_by = booked_by.id JOIN users patient ON a.user_id = patient.id 
        JOIN users admin ON booked_by.admin_id = admin.id 
        WHERE a.is_deleted = 0 AND a.appointment_date >= CURDATE() AND admin.id = ?`;
        
        [result] = await db.execute(SQL, [admin_id]);
        
        if( result.length > 0 ) {
            return res.status(200).json({response_data : result, message : "Data fetched successfully", status : 200});
        } else {
            return res.status(404).json({response_data : {}, message : "No data found", status : 404});
        }
    } catch(catcherr){
        throw catcherr;
    }
        
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function viewTodayAppointments(req, res) {
    const admin_id = req.body.admin_id;
    try{
        const SQL = `SELECT a.appointment_date, booked_by.name AS appointment_booked_by_name, patient.name AS patient_name 
        FROM appointments a 
        JOIN users booked_by ON a.appointment_booked_by = booked_by.id 
        JOIN users patient ON a.user_id = patient.id 
        JOIN users admin ON booked_by.admin_id = admin.id 
        WHERE a.is_deleted = 0 AND a.appointment_date = CURDATE() AND admin.id = ?`;

        [result] = await db.execute(SQL, [admin_id]);
        
        if( result.length > 0 ) {
            return res.status(200).json({response_data : result, message : "Data fetched successfully", status : 200});
        } else {
            return res.status(404).json({response_data : {}, message : "No data found", status : 404});
        }
            
    } catch( catcherr ) {
        console.log(catcherr)
    }
    
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function viewPreviousAppointments(req, res) {
    const admin_id = req.query.admin_id;

    try{
        const SQL = `SELECT a.appointment_date, booked_by.name AS appointment_booked_by_name, patient.name AS patient_name 
        FROM appointments a 
        JOIN users booked_by ON a.appointment_booked_by = booked_by.id 
        JOIN users patient ON a.user_id = patient.id 
        JOIN users admin ON booked_by.admin_id = admin.id 
        WHERE a.is_deleted = 0 AND a.appointment_date < CURDATE() AND admin.id = ?`;

        [result] = await db.execute(SQL, [admin_id]);
            
        if( result.length > 0 ) {
            return res.status(200).json({response_data : result, message : "Data fetched successfully", status : 200});
        } else {
            return res.status(404).json({response_data : {}, message : "No data found", status : 404});
        }
            
    } catch( catcherr ) {
        console.log(catcherr)
    }
    
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function markAppointmentAsCompleted(req, res) {
    try {
        const {logged_in_user_id, appointment_id, prescription_details} = req.body;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_user_id);
        
        var permissions = await commonFunctions.checkPermission(logged_in_user_role_id, 'appointments', 'update_permission');

        if(permissions[0].update_permission == 1) {
            const SQL = `UPDATE appointments SET is_completed = 1, prescription_details = ? WHERE id = ?`;
            await db.execute(SQL, [prescription_details, appointment_id]);

            return res.status(200).json({response_data : {}, message : 'Information updated successfully', status : 200});
        } else {
            return res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
        }
    } catch(catcherr) {
        throw catcherr;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function rejectAppointment(req, res) {
    try {
        const logged_in_id = req?.query?.logged_in_id || req.user.id;
        const appointment_id = req.body.appointment_id;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        
        var permissions = await commonFunctions.checkPermission(logged_in_user_role_id, 'appointments', 'delete_permission');
        
        if(permissions[0].delete_permission == 1) {
            const SQL = `UPDATE appointments SET status = 0 WHERE id = ?`;
            await db.execute(SQL, [appointment_id]);

            return res.status(200).json({response_data : {}, message : 'Information updated successfully', status : 200});
        } else {
            return res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
        }
    } catch(catcherr) {
        throw catcherr;
    }
}

module.exports = {
    bookAppointment, 
    viewUpcomingAppointments, 
    viewTodayAppointments, 
    viewPreviousAppointments,
    markAppointmentAsCompleted,
    rejectAppointment
}