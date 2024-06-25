const db = require('./db.js')
const jwt = require('jsonwebtoken');
const moment = require('moment');

async function isSuperAdmin(user_role_id) {
    
    try{
        const [result] = await db.execute(`SELECT role_name FROM user_roles WHERE id = ?`, [user_role_id]);
    
        if(result.length > 0){
            const role_name = result[0].role_name;
            if (role_name.toLowerCase() === 'superadmin') {
                return true;
            } else {
                return false;
            }
        } else {
            return 0;
        }
    } catch(catcherr) {
        throw catcherr;
    }
    
}

async function isAdmin(user_role_id) {
    
    try{
        const [result] = await db.execute(`SELECT role_name FROM user_roles WHERE id = ?`, [user_role_id]);
        
        if(result.length > 0){
            const role_name = result[0].role_name;
            if (role_name.toLowerCase() === 'admin') {
                return true;
            } else {
                return false;
            }
        } else {
            return 0;
        }
    } catch(catcherr) {
        throw catcherr;
    }
    
}

async function isDoctor(user_role_id) {
    try{
        const [result] = await db.execute(`SELECT role_name FROM user_roles WHERE id = ?`, [user_role_id]);
        
        if(result.length > 0){
            const role_name = result[0].role_name;
            if (role_name.toLowerCase() === 'doctor') {
                return true;
            } else {
                return false;
            }
        } else {
            return 0;
        }
    } catch(catcherr) {
        throw catcherr;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function auth(req,res,next){

    const authHeader=req.header('authorization');

    if(authHeader==null){
        return res.status(401).json({error:"Access-denied"});
    }

    try{
        const verified=jwt.verify(authHeader,"secret");
        req.id={username:verified.username};
        next();

    }catch (e){
        res.status(401).json({error:"Invalid-token"});
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function isEmailAlreadyRegistered(email) {
    
    [result] = await db.execute(`SELECT email FROM users WHERE email = ?`, [email]);
    
    if( result.length == 0 ) {
        return false;
    } else {
        return true;
    }    
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.TOKEN, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createTokenAndSetCookie(res, user) { 
    //To provide more security as using localstorage is vulnerable to XSS attacks. The httponly cookies are not vulnerable to XSS attacks.
    const token = jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: '1h' });
    res.cookie('jwt_token', token, { httpOnly: true, secure: true, sameSite: 'Strict' });
    return token;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createTokenAndSetCookie(res, user) {
    //To provide more security as using localstorage is vulnerable to XSS attacks. The httponly cookies are not vulnerable to XSS attacks.
    const tokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name
    };
    const token = jwt.sign(tokenPayload, process.env.TOKEN, { expiresIn: '1h' });
    res.cookie('jwt_token', token, { httpOnly: true, secure: true, sameSite: 'Strict' });
    return token;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function checkPermission(user_id, module, permission) {
    try{
        // const SQL = `SELECT ${permission} FROM permissions WHERE user_role_id = ? AND module_name = ?`;
        const SQL = `SELECT ${permission} FROM permissions WHERE user_id = ? AND module_name = ?`;
        const [rows] = await db.execute(SQL, [user_id, module]);
            
        if(rows && rows.length > 0) {
            return rows;
        } else {
            return false;
        }
    } catch(catcherr) {
        console.log("The error is " + catcherr);
        throw catcherr;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function getUserRoleIdByUserId(user_id){
    try{
        const SQL = `SELECT user_roles.id as role_id FROM user_roles INNER JOIN users ON user_roles.id = users.role_id WHERE users.id = ?`;
        const [rows] = await db.execute(SQL, [user_id]);

        if(rows && rows.length > 0) {
            return rows[0].role_id;
        } else {
            return 0;
        }
    } catch(catcherr){
        throw catcherr;
    }
}

async function getRoleIdByRoleName(role_name){
    try {
        const SQL = `SELECT id FROM user_roles WHERE LOWER(role_name) = LOWER(?);`;
        const [rows] = await db.execute(SQL, [role_name]);

        if(rows && rows.length > 0) {
            return rows[0].id;
        } else {
            return 0;
        }
    } catch(catcherr) {
        throw catcherr;
    }
}

async function checkValidUserId(user_id) {
    try {
        const SQL = `SELECT id FROM users WHERE id = ?`;
        [rows] = await db.execute(SQL, [user_id]);

        if(rows.length > 0) {
            return true;
        }
        return false;
    } catch(catcherr) {
        throw catcherr;
    }
}

async function checkedDoctorByRoleId(user_role_id) {
    try {
        const SQL = `SELECT role_name FROM user_roles WHERE id = ?`;
        const [result] = await db.execute(SQL, [user_role_id]);
        
        const user_role_name = result[0].role_name;

        if (user_role_name.toLowerCase() === 'doctor') {
            return true;
        } else {
            return false;
        }
        
    } catch (catcherr) {
        throw catcherr;
    }
}

async function getUserRoleNameByRoleId(user_role_id) {
    try {
        const SQL = `SELECT role_name FROM user_roles WHERE id = ?`;

        const formattedQuery = db.format(SQL, [user_role_id]);
        // console.log('Executing Query Commonfunctions:', formattedQuery);
        const [result] = await db.execute(SQL, [user_role_id]);
        
        const user_role_name = result[0].role_name;

        if ( result.length > 0 ) {
            return user_role_name.toLowerCase();
        } else {
            return 0;
        }
    } catch (catcherr) {
        throw catcherr;
    }
}

// async function calculateVaccineSchedule(patient_id) {
//     try {
//         console.log("Patient id" + patient_id);
//         const SQL = `SELECT id, parent_id, name, date_of_birth, vaccine_ids FROM patients WHERE id = ?`;
//         const [rows, fields] = await db.execute(SQL, [patient_id]);

//         if (rows.length > 0) {
//             var ids = {};
//             console.log("Rows array" + rows[0]);
//             // ids = rows[0].vaccine_ids.split(",");
//             const vaccineIds = rows[0].vaccine_ids.split(",");
//             const placeholders = vaccineIds.map(() => '?').join(',');
//             const SQL1 = `SELECT id, vaccine_range, range_type FROM doctor_master_vaccine WHERE id IN (${placeholders}) AND doctor_id = ?`;
//             const [rangeArr] = await db.execute(SQL1, [...vaccineIds, rows[0].parent_id]);

//             console.log(rangeArr);
//         } else {
//             console.log("No patient found with this id");
//         }
//     } catch (catcherr) {
//         throw catcherr
//     }
// }

async function calculateVaccineSchedule(patient_id) {
    try {
        
        const SQL = `SELECT id, parent_id, name, date_of_birth, vaccine_ids FROM patients WHERE id = ?`;
        const [rows, fields] = await db.execute(SQL, [patient_id]);

        //If patient has been registered by staff instead of a doctor - START
        
        const user_role_id = await getUserRoleIdByUserId(rows[0].parent_id); //Role id of staff
        const user_role_name = await getUserRoleNameByRoleId(user_role_id);  //Role name of staff
        
        let doctor_id;

        if( user_role_name === 'staff' ) {
            
            const fetchParentDocSQL = `SELECT parent_id FROM users WHERE id = ?`
            const [parentDocResult] = await db.execute(fetchParentDocSQL, [rows[0].parent_id]);
            doctor_id = parentDocResult[0].parent_id;

        } else {
            
            doctor_id = rows[0].parent_id;

        }
        
        //If patient has been registered by staff instead of a doctor - END

        if (rows.length > 0) {
            
            const vaccineIds = rows[0].vaccine_ids.split(",");
            
            const placeholders = vaccineIds.map(() => '?').join(',');
            const SQL1 = `SELECT id, vaccine_range, range_type FROM doctor_master_vaccine WHERE id IN (${placeholders}) AND doctor_id = ?`;
            
            // const [rangeArr] = await db.execute(SQL1, [...vaccineIds, rows[0].parent_id]);
            const [rangeArr] = await db.execute(SQL1, [...vaccineIds, doctor_id]);
            
            var dateOfBirth = rows[0].date_of_birth;

            const returnResult = [];

            for( var ix in rangeArr ) {
                var range_type = '';
                switch( rangeArr[ix].range_type ) {
                    case 'days':
                        range_type = 'days'
                        break;
                    case 'weeks':
                        range_type = 'weeks'
                        break;
                    case 'months':
                        range_type = 'months'
                        break;
                    case 'years':
                        range_type = 'years'
                        break;
                }
                
                const vaccine = rangeArr[ix];
                const [startRange, endRange] = vaccine.vaccine_range.split('-').map(Number);
                // const startDate = moment(dateOfBirth).add(startRange, 'months').format('YYYY-MM-DD');
                // const endDate = moment(dateOfBirth).add(endRange, 'months').format('YYYY-MM-DD');

                const startDate = moment(dateOfBirth).add(startRange, range_type).format('YYYY-MM-DD');
                const endDate = moment(dateOfBirth).add(endRange, range_type).format('YYYY-MM-DD');

                returnResult.push({
                    start_date : startDate,
                    end_date : endDate,
                    doctor_id : doctor_id,
                    vaccine_id: vaccine.id,
                    patient_id : patient_id
                });
                
            }
            // console.log("return REsult" + JSON.stringify(returnResult));
            return returnResult;
        } else {
            return 0;
        }
    } catch (catcherr) {
        console.error(catcherr);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function isVaccineAssignedToDoctor(vaccine_id, doctor_id) {
    try {
        const SQL = `SELECT count(id) as resultcount FROM doctor_master_vaccine_details WHERE id = ? AND doctor_id = ?`;
        const formattedQuery = db.format(SQL, [vaccine_id, doctor_id]);
        console.log(formattedQuery);
        const [result] = await db.execute(SQL, [vaccine_id, doctor_id]);
        console.log(result);
        if( result[0].resultcount > 0 ) {
            return true;
        } else {
            return false;
        }

    } catch (catcherr) {
        throw catcherr;
    }
}

async function isVaccineForPatient(vaccine_id, patient_id) {
    try {
        const SQL = `SELECT vaccine_ids FROM patients WHERE id = ?`
        const [result] = await db.execute(SQL, [patient_id]);
        
        const arr = result[0].vaccine_ids.split(",");

        if( arr.includes(vaccine_id) ) {
            return true;
        } else {
            return false;
        }

    } catch (catcherr) {
        throw catcherr;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports={
    auth,
    isSuperAdmin,
    isAdmin,
    isDoctor,
    isEmailAlreadyRegistered,
    authenticateToken,
    checkPermission,
    getUserRoleIdByUserId,
    getRoleIdByRoleName,
    checkedDoctorByRoleId,
    checkValidUserId,
    calculateVaccineSchedule,
    getUserRoleNameByRoleId,
    isVaccineAssignedToDoctor, //2024-06-14
    isVaccineForPatient //2024-06-14
}