const db = require('../utils/db.js')
const commonFunctions = require('../utils/commonFunctions');

async function sendNotification(req, res) {

    try {
        const logged_in_id = req?.body?.logged_in_id || req.user.id;
        const { notification_message, notification_to, created_date } = req.body;
        
        // const user_role_id = await commonFunctions.getUserRoleByUserId(logged_in_id);
        const logged_in_user_role_id = await commonFunctions.getUserRoleIdByUserId(logged_in_id);
        const isUserSuperadmin = await commonFunctions.isSuperAdmin(logged_in_user_role_id);
        console.log("Is super admin ->",isUserSuperadmin);
        const permissions = await commonFunctions.checkPermission(logged_in_id, 'notification', 'create_permission');
            
        if(permissions != false || isUserSuperadmin) {

            if((permissions != false && permissions[0].create_permission == 1) || isUserSuperadmin) {
                const SQL = `INSERT INTO notifications (notification_message, notification_to, created_date) VALUES (?, ?, ?)`;
                const values = [notification_message, notification_to, created_date];
                const formattedQuery = db.format(SQL, values);
                console.log(formattedQuery);
                await db.execute(SQL, values);

                return res.status(200).json({ response_data: {}, message: "Notification sent successfully", status: 200 });
            } else {
                return res.status(403).json({ response_data: {}, message: "You are not authorized to perform this operation", status: 403 });
            }
        } else {
            return res.status(404).json({ response_data: {}, message: "There is no create permission assigned for this user to send a notification", status: 404 });
        }
            
        
    } catch (err) {
        console.error("Error sending notification:", err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function viewAllNotifications(req, res) {

    try {
        const SQL = `SELECT notification_message, role_name as notification_for FROM notifications 
        INNER JOIN user_roles ON notification_to = user_roles.id 
        WHERE notifications.status = 1`;
        
        const [result] = await db.execute(SQL);
        if(result.length > 0) {
            return res.status(200).json({response_data : result, message : "All Notifications", status : 200});
        } else {
            return res.status(404).json({response_data : result, message : "No Notifications Found", status : 404});
        }
        
    } catch(catcherr) {
        console.log(catcherr);
    }

}

module.exports = {
    sendNotification,
    viewAllNotifications
};