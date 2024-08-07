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
            let doctor_id;
            let patientParentId = null;
            
            const logged_in_id = req?.body?.logged_in_id || req.user.id;
            const { mobile_number, name, gender, date_of_birth } = req.body

            const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
            const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
            const isUserDoctor = await commonFunctions.isDoctor(logged_in_user_role_id);
            const isUserStaff = await commonFunctions.isStaff(logged_in_user_role_id);
            
            if( !isUserSuperadmin ){
                const role_name = await commonFunctions.getUserRoleNameByRoleId(logged_in_user_role_id);
                var permissions = await commonFunctions.checkPermission(logged_in_id, role_name, 'create_permission');
            }
            
            if( isUserSuperadmin || isUserDoctor || permissions[0].create_permission == 1 ) {
                const validGenders = ['M', 'F', 'O'];

                if (!validGenders.includes(gender)) {
                    return res.status(400).json({ message: 'Invalid gender value given. The valid values are M, F, and O' });
                }

                if( !isUserDoctor ) {
                    doctor_id = req?.body?.doctor_id;
                    if( !doctor_id ) {
                        return res.status(403).json({response_data : {}, message : 'You are not a doctor and hence you need to provide doctor id to register a patient', status : 403});
                    }

                    if( isUserStaff ) {
                        const checkParentDocSQL = `SELECT parent_id FROM users WHERE id = ?`;
                        const [staffParentDocResult] = await db.execute(checkParentDocSQL, [logged_in_id]);

                        doctor_id = staffParentDocResult[0].parent_id;
                    }
                } else {
                    doctor_id = logged_in_id;
                }

                //Getting vaccine_ids
                const vSQL = `SELECT id, doctor_master_vaccine_template_id FROM doctor_master_vaccine_template_vaccines WHERE doctor_id = ?`;
                const [vResult] = await db.execute(vSQL, [doctor_id]);

                const vaccineIds = vResult.map(row => row.id);
                const vaccine_ids = vaccineIds.join(',');
                
                //Getting vaccine_ids

                if( !req?.body?.patient_parent_id ) {
                    const SQL1 = `INSERT INTO patients_parent (master_id, mobile_number, name, gender, date_of_birth, vaccine_ids, created_by, created_date) VALUES (?,?,?,?,?,?,?,?)`;
        
                    const values1 = [logged_in_id, mobile_number, name, gender, date_of_birth, vaccine_ids, logged_in_id, new Date()];
                    const [patientParentData] = await db.execute(SQL1, values1);

                    patientParentId = patientParentData.insertId;
                } else {
                    patientParentId = req?.body?.patient_parent_id;
                }

                var SQL = 'INSERT INTO patients (master_id, parent_id, mobile_number, name, gender, date_of_birth, vaccine_ids, created_by, created_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
                var values = [logged_in_id, patientParentId, mobile_number, name, gender, date_of_birth, vaccine_ids, logged_in_id, new Date()];

                const formattedQuery = db.format(SQL, values);
                
                const [result] = await db.execute(SQL, values);

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
                                parseInt(logged_in_id, 10),
                                new Date()
                            ]);
                            
                        }

                        insertScheduleSQL += placeholders.join(',');
                        
                        await db.execute(insertScheduleSQL, insertScheduleValues.flat());

                    }
                }

                //Calculating the scheduled time period for vaccination

                return res.status(200).json({ response_data : {}, message: 'Patient registered successfully', status : 200 });
            } else {
                return res.status(403).json({ response_data : {}, message: 'You are not authorized', status : 403 });
            }
            
        } catch(catcherr) {
            console.log(catcherr);
        }
    
}

// async function registerPatient ( req, res ) {
    
//     try {
//         const logged_in_id = req?.body?.logged_in_id || req.user.id;
//         const { name, gender, date_of_birth, mobile_number } = req.body;

//         const isUserClient = await commonFunctions.isClient(logged_in_id);

//         if( !isUserClient ) {
//             return res.status(403).json({response_data : {}, message : 'You are trying to register a patient through wrong user type', status : 403});
//         }

//         const isUserDoctor = await commonFunctions.isDoctor(logged_in_id);

//         if( isUserDoctor ) {
           
//             const SQL1 = `INSERT INTO patients_parent (master_id, mobile_number, name, gender, date_of_birth, vaccine_ids, created_by) VALUES (?,?,?,?,?,?,?)`;
        
//             const values1 = [logged_in_id, mobile_number, name, gender, date_of_birth];
//             await db.execute(SQL1, values1);
//         } else {

//         }

        

//     } catch (catcherr) {
//         throw catcherr;
//     }
// }

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

        var permissions = await commonFunctions.checkPermission(logged_in_id, role_name, 'create_permission');

        if( isUserSuperadmin || permissions[0].update_permission == 1 ) {

            const SQL = `UPDATE patients SET name = ?, gender = ?, date_of_birth = ?, status WHERE id = ?`;
            const values = [name, gender, date_of_birth, status, id];

            await db.execute(SQL, values);
            res.status(200).json({response_data : {}, message : 'Patient info updated successfully', status : 200});

        } else {
            res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
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

        var permissions = await commonFunctions.checkPermission(logged_in_id, role_name, 'delete_permission');

        if( isUserSuperadmin || permissions[0].delete_permission == 1 ) {
            const SQL = `UPDATE patients SET status = 0 WHERE id = ?`;
            await db.execute(SQL, [patient_id]);

            res.status(200).json({response_data : {}, message : 'Patient info updated successfully', status : 200});
        } else {
            res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
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