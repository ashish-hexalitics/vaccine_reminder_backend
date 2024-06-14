const jwt = require('jsonwebtoken');

const secretKey = process.env.TOKEN;
// const jwtMiddleware = (req, res, next) => {
//     const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

//     if (token) {
//         jwt.verify(token, secretKey, (err, decoded) => {
//             if (err) {
//                 return res.status(401).json({ message: 'Failed to authenticate token' });
//             } else {
//                 req.user = decoded;
//                 next();
//             }
//         });
//     } else {
//         return res.status(401).json({ message: 'No token provided' });
//     }
// };

const jwtMiddleware = ( req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    
    if (token) {
        jwt.verify(token, process.env.TOKEN, (err, decoded) => {
            if (err) {
                console.error('JWT verification error:', err);
                console.error('Token:', token);
                return res.status(401).json({ message: 'Failed to authenticate token' });
            } else {
                req.user = decoded;
                // console.log("middleware response" + req.user);
                next();
            }
            
        });
        createSendToken(req.user, token, req, res);
    } else {
        return res.status(401).json({ message: 'No token provided' });
    }
};

const createSendToken = (user, token, req, res) => {
    
    res.cookie('jwt', token, {
        // expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        expires: new Date(Date.now() + 5 * 60 * 1000), // Set expiration time to 5 minutes from now
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    })

    return true;
}

module.exports = jwtMiddleware;
