let authConfig = require('../Config/authentication')
const jwt = require('jsonwebtoken')

module.exports = function (request, response, next) {

    let token = request.headers['x-access-token']

    jwt.verify(token, authConfig.AUTH_SECRET, (err, data) => {

        if (err) {
            response.status(403).json({ success: false, message: "Token Expired" })
        }
        else if (data) {
            request.userId = data.user
            next()
        }

    });
}