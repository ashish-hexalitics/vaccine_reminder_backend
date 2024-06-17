const db = require('../utils/db')
const commonFunctions = require('../utils/commonFunctions')
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { exit } = require('process');
const port = process.env.PORT || 8071;

async function registerPatient(req, res) {
    
        try {

            const logged_in_id = req?.body?.logged_in_id || req.user.id;
            const { parent_id, mobile_number, name, gender, date_of_birth, vaccine_ids, created_by, created_date } = req.body

            const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
            const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
            
            if( !isUserSuperadmin ){
                const role_name = await commonFunctions.getUserRoleNameByRoleId(logged_in_user_role_id);
                var permissions = await commonFunctions.checkPermission(logged_in_user_role_id, role_name, 'create_permission');
            }
            
            if( isUserSuperadmin || permissions[0].create_permission == 1 ) {
                const validGenders = ['M', 'F', 'O'];
                if (!validGenders.includes(gender)) {
                    return res.status(400).json({ message: 'Invalid gender value given. The valid values are M, F, and O' });
                }

                var query = 'INSERT INTO patients (parent_id, mobile_number, name, gender, date_of_birth, vaccine_ids, created_by, created_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                var values = [parent_id, mobile_number, name, gender, date_of_birth, vaccine_ids, created_by, created_date];

                [result] = await db.execute(query, values);

                //Calculating the scheduled time period for vaccination

                const newPatientId = result.insertId;
                const vaccineSchedulingResult = await commonFunctions.calculateVaccineSchedule(newPatientId);
                
                if( vaccineSchedulingResult !== 0 ) {
                    if( vaccineSchedulingResult.length > 0 ) {
                        let insertScheduleSQL = `INSERT INTO patient_vaccination_info 
                        (patient_id, vaccine_id, doctor_id, vaccination_start_date, vaccination_end_date, created_by, created_date) VALUES `;
                        const insertScheduleValues = [];
                        const placeholders = [];
                        for( var vsr of vaccineSchedulingResult ) {
                            placeholders.push('(?,?,?,?,?,?,?)');
                            // insertScheduleSQL += `(?,?,?,?,?,?,?),`;
                            insertScheduleValues.push([
                                newPatientId,
                                vsr.vaccine_id,
                                vsr.doctor_id,
                                vsr.start_date,
                                vsr.end_date,
                                parseInt(created_by, 10),
                                created_date
                            ]);
                            console.log([newPatientId, vsr.vaccine_id, vsr.doctor_id, vsr.start_date, vsr.end_date, created_by, created_date]);

                        }

                        insertScheduleSQL += placeholders.join(',');
                        
                        await db.execute(insertScheduleSQL, insertScheduleValues.flat());

                    }
                }

                //Calculating the scheduled time period for vaccination

                return res.status(200).json({ response_data : {}, message: 'Patient registered successfully', status : 200 });
            } else {
                return res.status(401).json({ response_data : {}, message: 'You are not authorized', status : 401 });
            }
            
        } catch(catcherr) {
            console.log(catcherr);
        }
    
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//Need to purchase SMS's as patient can login through mobile number but there is no password for a patient. So need to implement OTP based login

// async function login(req, res) {
//     try {
//         const {mobile_number, password} = req.body;
//         const SQL = 'SELECT name, gender, date_of_birth, vaccine_ids FROM patients WHERE '
//     } catch (catcherr) {
        
//     }
// }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function getAllActivePatients(req, res) {

    //Intended to be used by Admins and the Superadmin
    try {
        const status = 1;
        const [result] = await db.execute(`SELECT patients.id, patients.name, gender, patients.date_of_birth, 
        users.name as doctor_or_staff_name FROM patients INNER JOIN users ON 
        patients.parent_id = users.id WHERE patients.status = ?`, [status]);
            
        if( result.length == 0 ) {
            res.status(404).json({response_data : {}, message : 'No Patient Found', status : 404})    
        } else {
            res.status(200).json({response_data : result[0], message : 'all patients', status : 200})
        }
                    
    } catch( catcherr ) {
        console.log(catcherr)
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function editPatient(req, res) {
    try{

        const {logged_in_id, id, name, gender, date_of_birth, status} =req.body;

        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);

        var permissions = await commonFunctions.checkPermission(logged_in_user_role_id, role_name, 'create_permission');

        if( isUserSuperadmin || permissions[0].update_permission == 1 ) {

            const SQL = `UPDATE patients SET name = ?, gender = ?, date_of_birth = ?, status WHERE id = ?`;
            const values = [name, gender, date_of_birth, status, id];

            await db.execute(SQL, values);
            res.status(200).json({response_data : {}, message : 'Patient info updated successfully', status : 200});

        } else {
            res.status(401).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 401});
        }

    } catch(catcherr) {
        throw catcherr;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function deletePatient(req, res) {
    try {
        const {logged_in_id, patient_id} = req.body;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);

        var permissions = await commonFunctions.checkPermission(logged_in_user_role_id, role_name, 'delete_permission');

        if( isUserSuperadmin || permissions[0].delete_permission == 1 ) {
            const SQL = `UPDATE patients SET status = 0 WHERE id = ?`;
            await db.execute(SQL, [patient_id]);

            res.status(200).json({response_data : {}, message : 'Patient info updated successfully', status : 200});
        } else {
            res.status(401).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 401});
        }

    } catch(catcherr) {
        throw catcherr;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function viewUpcomingAppointments(req, res) {
    try {
        const logged_in_id = req?.query?.logged_in_id ||req.user.id;
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];

        const SQL = `SELECT appointment_booked_by, appointment_time, prescription_details FROM appointments 
        WHERE patient_id = ? AND appointment_date > ? AND is_completed = ?`;

        [result] = await db.execute(SQL, [logged_in_id, formattedToday, 0]);

        if( result.length > 0 ) {
            res.status(200).json({response_data : result[0], message : 'List of upcoming appointments', status : 200});
        } else {
            res.status(404).json({response_data : {}, message : 'No upcoming appointments found', status : 404});
        }

    } catch (catcherr) {
        throw catcherr;
    }
}

module.exports = {
    registerPatient,
    getAllActivePatients,
    editPatient,
    deletePatient,
    viewUpcomingAppointments
}