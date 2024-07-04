const commonFunctions = require('../utils/commonFunctions');

const checkPermission = (resource, action) => {
    return async (req, res, next) => {
        try {
            const logged_in_id = req?.body?.logged_in_id || req.user.id;
            const permissions = await commonFunctions.checkPermission(logged_in_id, resource, `${action}_permission`);
            
            if (permissions && permissions[0][`${action}_permission`] === 1) {
                next();
            } else {
                return res.status(403).json({ response_data: {}, message: 'You are not authorized to perform this operation', status: 403 });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ response_data: {}, message: 'Internal Server Error', status: 500 });
        }
    };
};

module.exports = {
    checkPermission
};
