const db = require('../utils/db.js')
const commonFunctions = require('../utils/commonFunctions');

async function sendNotification(req, res) {

    try {
        
        const { logged_in_id, notification_message, notification_to, created_date } = req.body;
        
        // const user_role_id = await commonFunctions.getUserRoleByUserId(logged_in_id);
        
        const permissions = await commonFunctions.checkPermission(logged_in_id, 'notification', 'create_permission');
        if(permissions[0].create_permission == 1) {
            const query = `INSERT INTO notifications (notification_message, notification_to, created_date) VALUES (?, ?, ?)`;
            const values = [notification_message, notification_to, created_date];

            await db.execute(query, values);

            return res.status(200).json({ response_data: {}, message: "Notification sent successfully", status: 200 });
        } else {
            return res.status(403).json({ response_data: {}, message: "You are not authorized to perform this operation", status: 403 });
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