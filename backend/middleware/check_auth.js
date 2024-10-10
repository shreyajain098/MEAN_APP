/* this middleware will be used on those routes whcih we want to protect
if user is not authenticated, Here we check if token is valid */

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    /* we can also extract token from query params of req.
    Here in headers it looks like 'someText Token', so use split */
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        req.userData = {email: decodedToken.email, userId: decodedToken.userId};
        next();
    }
    catch (err) {
        return res.status(400).json({message: 'Authentication failed!'});
    }
}