const db = require('../utils/db.js')
const commonFunctions = require('../utils/commonFunctions');
const e = require('express');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// function createDoctorVaccine(req, res) {
    
//     try {
//         const {doctor_id, name, description, vaccine_frequency, version_number, is_mandatory, created_by, created_date} = req.body;
//         var query = "INSERT INTO doctor_vaccine (doctor_id, name, description, vaccine_frequency, version_number, is_mandatory, created_by, created_date) VALUES (?,?,?,?,?,?,?,?)";
//         const values = [doctor_id, name, description, vaccine_frequency, version_number, is_mandatory, created_by, created_date];
//         db.query(query, values, (err, result) => {
//             if(err) {
//                 console.log(err);
//                 return res.status(400).json({data : {}, message : err, status : "Failed"});
//             } else {
//                 return res.status(400).json({data : {}, message : "Information stored sucessfully", status : "Success"});
//             }
//         })
//     } catch(catcherr){
//         console.log(catcherr);
//     }
    
// }

async function createMasterVaccineTemplate(req, res) {
    
    try {

        const {logged_in_id, name, description, vaccine_frequency, version_number, is_mandatory, created_by, created_date} = req.body;
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
            
            let query = `INSERT INTO master_vaccine (name, description, vaccine_frequency, version_number, is_mandatory, created_by, created_date) VALUES (?,?,?,?,?,?)`;
            const values = [name, description, vaccine_frequency, version_number, is_mandatory, created_by, created_date];
            await db.query(query, values);
            return res.status(200).json({response_data : {}, message : "Information stored sucessfully", status : 200});
            
        } else {
            return res.status(403).json({response_data : {}, message : 'You are not authorized to do this operation', status : 403});
        }
    } catch(catcherr){
        console.log(catcherr);
    }
    
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function createMasterVaccineDetails(req, res) {
    try {
        const {logged_in_id, master_vaccine_id, name, description, vaccine_frequency, version_number, is_mandatory, created_date} = req.body;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);

        if( isUserAdmin ) {
            const SQL = `INSERT INTO master_vaccine_details 
            (master_vaccine_id, name, description, vaccine_frequency, version_number, is_mandatory, created_by, created_date) VALUES
            (?,?,?,?,?,?,?,?)`;

            const values = [master_vaccine_id, name, description, vaccine_frequency, version_number, is_mandatory, logged_in_id, created_date]

            await db.execute(SQL, values);
            return res.status(200).json({response_data : {}, 'message' : 'Master vaccine details has been set successfully', status : 200});

        } else {
            return res.status(403).json({response_data : {}, 'message' : 'You are not authorized to perform this operation', status : 403});
        }

    } catch (catcherr) {
        throw catcherr;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function testCheckPermission(req, res) {
    
    try{
        console.log(req.body);
        const {user_role_id, module, testmsg} = req.body
        const result = await commonFunctions.checkPermission(user_role_id, module);
        return res.json({data : result})
    } catch(catcherr) {
        console.log(catcherr);
    }
    
}

async function getVaccineVersionList(req, res){
    try {
        const logged_in_id = req?.query?.logged_in_id || req.user.id;
        const {vaccine_id} = req.query;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);
        const isUserSuperAdmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);

        if( isUserAdmin || isUserSuperAdmin ) {
            const SQL = `SELECT name, description, vaccine_frequency, is_mandatory FROM master_vaccine_details WHERE master_vaccine_id = ?`;
            const result = await db.execute(SQL, [vaccine_id]);

            if( result.length > 0 ) {
                return res.status(200).json({response_data : result[0], 'message' : 'List of vaccine versions', status : 200});
            } else {
                return res.status(404).json({response_data : {}, 'message' : 'No vaccine Found', status : 404});
            }
        } else {
            return res.status(403).json({response_data : {}, 'message' : 'You are not authorized to perform this operation', status : 403});
        }

    } catch (catcherr) {
        throw catcherr;
    }
}

async function getMasterVaccineTemplateList(req, res) {
    try {
        const logged_in_id = req?.query?.logged_in_id || req.user.id;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);
        const isUserSuperAdmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);

        if( isUserAdmin || isUserSuperAdmin ) {
            const SQL = `SELECT id, name, vaccine_range, is_mandatory, created_by, created_date FROM master_vaccine`;
            const result = await db.execute(SQL);

            if( result.length > 0 ) {
                return res.status(200).json({response_data : result[0], 'message' : 'List of vaccine templates', status : 200});
            } else {
                return res.status(404).json({response_data : {}, 'message' : 'No vaccine template Found', status : 404});
            }

        } else {
            return res.status(403).json({response_data : {}, 'message' : 'You are not authorized to perform this operation', status : 403});
        }

    } catch (catcherr) {
        throw catcherr;
    }
}

async function updatePatientVaccinationStatus(req, res) {
    try {

        const logged_in_id = req?.query?.user_id || req.user.id;

        const {patient_id, vaccine_id} = req.query;

        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        const isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);

        if( !isUserSuperadmin && !isUserAdmin ) {

            isVaccineForThisPatient = await commonFunctions.isVaccineForPatient(vaccine_id, patient_id);

            if( isVaccineForThisPatient ) {
                const SQL = `UPDATE patient_vaccination_info SET vaccinated_status = 1 WHERE patient_id = ? AND vaccine_id = ?`;
                await db.execute(SQL, [patient_id, vaccine_id]);

                return res.status(200).json({response_data : {}, message : "Patient's Vaccination Status Updated Successfully", status : 200});
            } else {
                return res.status(404).json({response_data : {}, message : "This vaccine is not meant for this patient", status : 404});
            }
                        
        } else {
            return res.status(403).json({response_data : {}, message : "You are not authorized to perform this operation", status : 403});
        }

    } catch (catcherr) {
        throw catcherr;
    }
}


async function updateVaccineDetails(req, res) {
    try {
        
        const logged_in_id = req?.query?.user_id || req.user.id;
        const vaccine_id = req.query.vaccine_id;
        
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        const isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);
        
        if (!isUserSuperadmin && !isUserAdmin) {
            
            //Checking if this vaccine has been assigned to this doctor.
            const isVaccineAssignedToThisDoctor = await commonFunctions.isVaccineAssignedToDoctor(vaccine_id, logged_in_id);
            //Checking if this vaccine has been assigned to this doctor.
            
            if ( isVaccineAssignedToThisDoctor ) {
                const {
                    name, 
                    description, 
                    vaccine_range, 
                    version_number, 
                    is_mandatory, 
                    status, 
                    updated_date, 
                    updated_by
                } = req.query;
    
                const SQL = `UPDATE doctor_master_vaccine_details 
                SET name = ?, description = ?, vaccine_range = ?, 
                version_number = ?, is_mandatory = ?, status = ?, 
                updated_date = ?, updated_by = ? WHERE id = ? AND doctor_id = ?`;
    
                const values = [name, description, vaccine_range, version_number, is_mandatory, status, updated_date, updated_by, vaccine_id, logged_in_id];
    
                await db.execute(SQL, values);
    
                return res.status(200).json({response_data : {}, message : "Vaccine details have been updated successfully", status : 200});
            } else {
                return res.status(404).json({response_data : {}, message : "This vaccine has not been assigned to this doctor", status : 404});
            }
        } else {
            return res.status(403).json({response_data : {}, message : "You are not authorized to perform this operation", status : 403});
        }
        
        
    } catch (catcherr) {
        throw catcherr;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// async function calculateVaccineSchedule(req, res) {
//     try {
//         const SQL = `SELECT id, parent_id, name, date_of_birth, vaccine_ids FROM patients`;
//         const [rows, fields] = await db.execute(SQL);

//         if (rows.length > 0) {
//             const ids = {};
//             for (const elem of rows) {
//                 // ids.push(...elem.vaccine_ids.split(","));
//                 ids[elem.id] = elem.vaccine_ids.split(",");
//             }
//             console.log("Vaccine IDs: ", ids);
//             const SQL2 = ``;
//             for (var key in ids) {
//                 SQL2 += `SELECT `
//             }

//             // Returning response with the vaccine IDs
//             return res.status(200).json({response_data: ids, message: 'All Patients', status: 200});
//         } else {
//             return res.status(404).json({response_data: {}, message: 'Not Found', status: 404});
//         }

//     } catch (error) {
//         console.error('Error executing query:', error);
//         return res.status(500).json({response_data: {}, message: 'Internal Server Error', status: 500});
//     }
// }

async function getUpcomingVaccineList(req, res) {
    
    try {
        const logged_in_id = req?.query?.logged_in_id || req.user.id;
        
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        const isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);
        
        if ( isUserSuperadmin || isUserAdmin ) {
            const SQL = `SELECT p.name as patient_name, u.name as doctor_name, 
            dmv.name as vaccine_name, pvi.vaccination_start_date, pvi.vaccination_end_date, pvi.vaccine_id
            FROM patient_vaccination_info as pvi 
            INNER JOIN patients as p ON pvi.patient_id = p.id
            INNER JOIN users as u ON pvi.doctor_id = u.id
            INNER JOIN doctor_master_vaccine as dmv ON pvi.vaccine_id = dmv.id  
            WHERE DATE_FORMAT(vaccination_start_date, '%m-%d') >= DATE_FORMAT(NOW(), '%m-%d') 
            ORDER BY DATE_FORMAT(vaccination_start_date, '%m-%d')`

            const [result] = await db.execute(SQL);

            if( result.length > 0 ) {
                return res.status(200).json({response_data : result, message : 'All Upcoming vaccination info', status : 200});
            } else {
                return res.status(404).json({response_data : {}, message : 'No upcomng vaccination found', status : 404});
            }
        } else {
            return res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
        }

    } catch (catcherr) {
        throw catcherr;
    }
}

async function deleteSuperAdminVaccine(req, res) {
    try {
            const logged_in_id = req?.body?.logged_in_id || req.user.id;
            const template_id = req.body.template_id;
            const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
            
            const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
            const isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);

            if( isUserSuperadmin || isUserAdmin ) {
                const SQL1 = `UPDATE master_vaccine SET status = 0 WHERE id = ?`;
                await db.execute(SQL1, [template_id]);

                const SQL2 = `UPDATE master_vaccine_details SET status = 0 WHERE master_vaccine_id = ?`;
                await db.execute(SQL2, [template_id]);

                return res.status(200).json({response_data : {}, message : 'Vaccine Status Updated successfully', status : 200});
            } else {
                return res.status(200).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
            }

    } catch (catcherr) {
        throw catcherr;
    }
}

async function deleteDoctorVaccine(req, res) {
    try {
        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        const template_id = req.body.template_id;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        const isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);

        if( isUserSuperadmin || isUserAdmin ) {
            const SQL1 = `UPDATE doctor_master_vaccine SET status = 0 WHERE id = ?`;
            await db.execute(SQL1, [template_id]);

            const SQL2 = `UPDATE doctor_master_vaccine_details SET status = 0 WHERE master_vaccine_id = ?`;
            await db.execute(SQL2, [template_id]);

            return res.status(200).json({response_data : {}, message : 'Vaccine Status Updated successfully', status : 200});
        } else {
            return res.status(200).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
        }

    } catch (catcherr) {
        throw catcherr;
    }
}

async function getCompletedVaccinationList() {
    try {

        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        const template_id = req.body.template_id;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        const isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);

        if ( isUserSuperadmin || isUserAdmin ) {
            const SQL = `SELECT * FROM patient_vaccination_info WHERE vaccinated_status = ?`;
            const [result] = await db.execute(SQL, [1]);

            if( result.length > 0 ) {
                res.status(404).json({response_data : result, message : 'List of completed vaccination', status : 200});
            } else {
                res.status(404).json({response_data : {}, message : 'No completed vaccination found', status : 404});
            }
        } else {
            res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation.', status : 403});
        }

    } catch (catcherr) {
        throw catcherr;
    }
}

async function getDueVaccinationList() {
    try {

        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        const template_id = req.body.template_id;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        const isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);

        if ( isUserSuperadmin || isUserAdmin ) {
            const SQL = `SELECT * FROM patient_vaccination_info WHERE vaccinated_status = ?`;
            const [result] = await db.execute(SQL, [0]);

            if( result.length > 0 ) {
                res.status(404).json({response_data : result, message : 'List of due vaccination', status : 200});
            } else {
                res.status(404).json({response_data : {}, message : 'No due vaccination found', status : 404});
            }
        } else {
            res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation.', status : 403});
        }

    } catch (catcherr) {
        throw catcherr;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
    // createDoctorVaccine,
    createMasterVaccineTemplate,
    createMasterVaccineDetails,
    testCheckPermission,
    getMasterVaccineTemplateList,
    getVaccineVersionList,
    updatePatientVaccinationStatus, //14-06-2024
    updateVaccineDetails,  //14-06-2024
    deleteSuperAdminVaccine,
    deleteDoctorVaccine,
    getUpcomingVaccineList,
    getCompletedVaccinationList,
    getDueVaccinationList
}