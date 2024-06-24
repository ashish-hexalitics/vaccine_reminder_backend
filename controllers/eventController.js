const db = require('../utils/db')
const commonFunctions = require('../utils/commonFunctions')
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { create } = require('domain');

async function createEvent(req, res) {

    try {
        const logged_in_id = req.body.logged_in_id || req.user.id;
        const {
            event_name, 
            event_description, 
            event_date, 
            created_date
        } = req.body;

        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        isUserSuperAdmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);
        let SQL;
        if( isUserSuperAdmin || isUserAdmin ) {
            SQL = `INSERT INTO events (event_name, event_description, event_date, created_by, created_date) 
            VALUES (?, ?, ?, ?, ?)`;
            const values = [event_name, event_description, event_date, logged_in_id, created_date];
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
            SQL = `SELECT name, event_description, event_date, created_by FROM events 
            WHERE DATE_FORMAT(event_date, '%m-%d') >= DATE_FORMAT(NOW(), '%m-%d') AND status = ? 
            ORDER BY DATE_FORMAT(event_date, '%m-%d') LIMIT 10`;

            const [result] = await db.execute(SQL, [1]);
            
            if ( result.length > 0 ) {
                res.status(200).json({response_data : {}, message : 'List of all upcoming events', status : 200});
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
        
        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        const {event_id, event_name, event_description, event_date} = req.body;
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
        
        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        const event_id = req.body.event_id;
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
                res.status(200).json({response_data : {}, message : 'Event', status : 200});
            } else {
                res.status(404).json({response_data : {}, message : 'This event is not found', status : 404});
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
        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        const event_id = req.body.event_id;
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        
        isUserSuperAdmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        isUserAdmin = await commonFunctions.isAdmin(logged_in_user_role_id);
        let SQL;

        if ( isUserSuperAdmin || isUserAdmin ) {

            SQL = `UPDATE events SET status = ? WHERE id = ?`;
            const values = [1, event_id];

            await db.execute(SQL, values);

            res.status(200).json({response_data : {}, message : 'Event', status : 200});
            
        } else {
            res.status(403).json({response_data : {}, message : 'You are not authorized to perform this operation', status : 403});
        }

    } catch (catcherr) {
        throw catcherr;
    }
}

module.exports = {
    createEvent,
    getUpcomingEvents,
    editEvent,
    viewEvent,
    deleteEvent
}