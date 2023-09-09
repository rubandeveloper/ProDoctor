
const jwt = require("jsonwebtoken")

class Token {
    constructor() { }

    async verify(req, res, next) {

        let header = req.headers['x-access-token'];
        if (!header) {
            res.status(401).json({
                success: false,
                message: 'Authentication failed, Please try to Re-Login!'
            })
        }
        else {
            try {
                let response = await new Promise((resolve, reject) => {
                    return jwt.verify(header, process.env.AUTH_SECRET, function (err, token) {
                        if (err) reject(err)
                        resolve(token)
                    })
                })

                let data = await response

                req.user_id = data.user_id
                req.email = data.email
                req.hospital_id = data.hospital_id

                next()

            } catch (error) {

                res.status(400).json({
                    success: false,
                    message: "Session expired, Please try to Re-Login!",
                })
            }
        }
    }
    async TokenGen(userId) {
        let token = new Promise((resolve, reject) => {
            return jwt.sign({
                user: userId
            }, process.env.AUTH_SECRET, { expiresIn: '24h', algorithm: "HS256" }, function (err, token) {
                if (err) reject(err)
                else {
                    resolve(token)
                }
            })
        })
        return token
    }




}

module.exports = Token