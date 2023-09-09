require('dotenv')

const Utils = require("../../utils/utils");
const Auth_Utils = require('../../utils/authentication')
const DB_Templates = require('../../DB_Templates/Template')
const Mail_Templates = require('../../utils/Mail_Templates')
const { Mailer } = require('../../utils/mailer')
const { logger, setLog } = require('../../utils/logger')
const requestIp = require('request-ip');
const MulterUploader = require('../../utils/multer');

const PayloadValidator = require('../../utils/PayloadValidator');
const payloadValidator = new PayloadValidator()

const Mult_Upload = MulterUploader.imageUpload.fields([{ name: "profile_img", maxCount: 1 }])

class User {

    constructor({ mongoConfig }) {

        this.mongoConfig = mongoConfig
        this.db_templates = new DB_Templates()
        this.mail_templates = new Mail_Templates()
    }

    async registerHandler(req, res) {

        try {

            let isPayloadValid = await payloadValidator.signup(req.body)
            if (!req.body || !isPayloadValid || !Object.keys(req.body).length) {
                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters. Please try again.",
                })
            }

            this.mongoClient = req.app.locals.mongoClient;

            const { username, hospital_name, phone, email, password } = req.body
            const IP = requestIp.getClientIp(req)

            let isUserExist = await this.mongoClient.findOneAnProject(
                this.mongoConfig.USERS,
                {
                    email: email,
                },
                {
                    _id: 1,
                }
            ).then(data => data).catch(err => false)

            if (isUserExist) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "User already exisit. Please try to login"
                })
            }

            let hashed_password = await Auth_Utils.HashPassword(password)

            let hospitalID = await this.getNextHospitalID()

            let { USER_TEMPLATE, HOSPITAL_TEMPLATE } = this.db_templates.NewUserTemplate({
                hospitalID: hospitalID.hospitalID,
                username,
                hospital_name,
                email,
                phone,
                password: hashed_password,
                IP
            })

            let user_response = await this.mongoClient.insertOne(
                this.mongoConfig.USERS,
                USER_TEMPLATE
            ).then(data => true).catch(err => false)

            let hospital_response = await this.mongoClient.insertOne(
                this.mongoConfig.HOSPITALS,
                HOSPITAL_TEMPLATE
            ).then(data => true).catch(err => false)

            if (!user_response && hospital_response) {

                return res.status(200).json({
                    success: true,
                    message: "Failed to register, Please try again!"
                })
            }

            let jwt_token = await Auth_Utils.GenerateJWTToken({
                user_id: USER_TEMPLATE._id,
                email: USER_TEMPLATE.email,
                hospital_id: USER_TEMPLATE.hospital_id
            })

            res.cookie("access_token", jwt_token, { httpOnly: true, expires: new Date(Date.now() + 60 * 24 * 60 * 1000) })

            let userdetails = {

                id: USER_TEMPLATE._id,
                email: USER_TEMPLATE.email,
                username: USER_TEMPLATE.username,
                phone: USER_TEMPLATE.phone,
                profile_img: USER_TEMPLATE.profile_img,
                status: USER_TEMPLATE.status,
                hospital_id: USER_TEMPLATE.hospital_id
            }

            return res.status(200).json({
                success: true,
                message: "User registered successfully",
                data: {
                    authToken: jwt_token,
                    user: userdetails,
                    redirect_to: "/app/hospital"
                }

            })

        } catch (err) {
            setLog(req.originalUrl, process.env.PRODUCTION == "FALSE" ? req.connection.remoteAddress : req.headers['x-forwarded-for'].split(',')[0], req.method, false, err.message, req.hostname, "error", err.name, err.stack)

            res.status(500).json({
                success: false,
                message: err.message,
            })
        }

    }
    async loginHandler(req, res) {
        try {

            let isPayloadValid = await payloadValidator.signin(req.body)
            if (!req.body || !isPayloadValid || !Object.keys(req.body).length) {
                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters. Please try again.",
                })
            }

            this.mongoClient = req.app.locals.mongoClient;

            const { email, password } = req.body
            const IP = requestIp.getClientIp(req)

            if (!email || !password) {

                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters"
                })
            }

            let isUserExist = await this.mongoClient.findOneAnProject(
                this.mongoConfig.USERS,
                {
                    email: email,
                },
                {
                    _id: 1,
                    username: 1,
                    phone: 1,
                    profile_img: 1,
                    status: 1,
                    passwordHash: 1,
                    email: 1,
                    hospital_id: 1,
                    hospitalID: 1,
                    signin_count: 1,
                    curent_signin_at: 1,
                    curent_signin_ip: 1,
                }
            ).then(data => data).catch(err => false)

            if (!isUserExist) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }

            let comparePassword = await Auth_Utils.ComparePassword(password, isUserExist.passwordHash)

            let jwt_token = await Auth_Utils.GenerateJWTToken({
                user_id: isUserExist._id,
                email: isUserExist.email,
                hospital_id: isUserExist.hospital_id
            })

            if (!comparePassword || !jwt_token) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }

            let updateData = {
                $set: {
                    signin_count: (isUserExist.signin_count + 1),
                    curent_signin_at: new Date().getTime(),
                    curent_signin_ip: IP,
                    last_signin_at: isUserExist.curent_signin_at,
                    last_signin_ip: isUserExist.curent_signin_ip,
                    updated_at: new Date().getTime()
                }
            }


            let update_response = await this.mongoClient.updateOne(this.mongoConfig.USERS, { email }, updateData)

            if (!update_response) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }

            res.cookie("access_token", jwt_token, { httpOnly: true, expires: new Date(Date.now() + 60 * 24 * 60 * 1000) })

            let userdetails = {

                id: isUserExist._id,
                email: isUserExist.email,
                username: isUserExist.username,
                phone: isUserExist.phone,
                profile_img: isUserExist.profile_img,
                status: isUserExist.status,
                hospital_id: isUserExist.hospital_id,
                hospitalID: isUserExist.hospitalID,
            }


            return res.status(200).json({
                success: true,
                message: "User logged in successfully",
                data: {
                    authToken: jwt_token,
                    user: userdetails,
                    redirect_to: `/app/hospital/${isUserExist.hospitalID}`
                }

            })

        } catch (err) {
            setLog(req.originalUrl, process.env.PRODUCTION == "FALSE" ? req.connection.remoteAddress : req.headers['x-forwarded-for'].split(',')[0], req.method, false, err.message, req.hostname, "error", err.name, err.stack)
            res.status(500).json({
                success: false,
                message: err.message,
            })
        }

    }
    async forgotPasswordHandler(req, res) {
        try {

            let isPayloadValid = await payloadValidator.forgetPassword(req.body)
            if (!req.body || !isPayloadValid || !Object.keys(req.body).length) {
                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters. Please try again.",
                })
            }

            this.mongoClient = req.app.locals.mongoClient;

            const { email } = req.body

            if (!email) {

                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters"
                })
            }

            let isUserExist = await this.mongoClient.findOneAnProject(
                this.mongoConfig.USERS,
                {
                    email: email,
                },
                {
                    _id: 1,
                    username: 1,
                }
            ).then(data => data).catch(err => false)

            if (!isUserExist) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }

            const reset_password_token = Auth_Utils.GenerateOTP()

            let updateData = {
                $set: {
                    reset_password_token: reset_password_token,
                    reset_password_send_at: new Date().getTime(),
                    isVerified: false
                }
            }
            let response = await this.mongoClient.updateOne(this.mongoConfig.USERS, { email }, updateData)

            let mail_template = this.mail_templates.passVerifiyTemplate({ name: isUserExist.username, email: email, code: reset_password_token })

            let mail_response = await Mailer(
                {
                    to: email,
                    message: "Reset your ProDoctor password",
                    subject: "Reset your ProDoctor password",
                    html: mail_template
                }
            )

            if (!response || !mail_response.status) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }

            return res.status(200).json({
                success: true,
                message: "Verification Code send successfully",
                data: {
                    redirect_to: "/app/verify-reset-password"
                }
            })

        } catch (err) {
            setLog(req.originalUrl, process.env.PRODUCTION == "FALSE" ? req.connection.remoteAddress : req.headers['x-forwarded-for'].split(',')[0], req.method, false, err.message, req.hostname, "error", err.name, err.stack)
            res.status(500).json({
                success: false,
                message: err.message,
            })
        }
    }
    async verifyPasswordResetCodeHandler(req, res) {
        try {


            let isPayloadValid = await payloadValidator.verifyResetCode(req.body)
            if (!req.body || !isPayloadValid || !Object.keys(req.body).length) {
                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters. Please try again.",
                })
            }


            this.mongoClient = req.app.locals.mongoClient;

            const { email, code } = req.body

            if (!email || !code) {

                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters"
                })
            }

            let isUserExist = await this.mongoClient.findOneAnProject(
                this.mongoConfig.USERS,
                {
                    email: email,
                },
                {
                    _id: 1,
                    reset_password_token: 1,
                    reset_password_send_at: 1,
                }
            ).then(data => data).catch(err => false)

            if (!isUserExist) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }

            let is_reset_code_valid = isUserExist.reset_password_token ? code == isUserExist.reset_password_token : false
            let is_reset_password_expired = isUserExist.reset_password_send_at ? (isUserExist.reset_password_send_at + (5 * 60000)) > new Date().getTime() : true

            if (!is_reset_code_valid || !is_reset_password_expired) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }

            let updateData = {
                $set: {
                    reset_password_token: null,
                    reset_password_send_at: null,
                    isVerified: true,
                    updated_at: new Date().getTime()
                }
            }
            let response = await this.mongoClient.updateOne(this.mongoConfig.USERS, { email }, updateData)

            if (!response) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }

            return res.status(200).json({
                success: true,
                message: "Reset Code Verified successfully",
                data: {
                    redirect_to: "/app/reset-password"
                }
            })

        } catch (err) {
            setLog(req.originalUrl, process.env.PRODUCTION == "FALSE" ? req.connection.remoteAddress : req.headers['x-forwarded-for'].split(',')[0], req.method, false, err.message, req.hostname, "error", err.name, err.stack)
            res.status(500).json({
                success: false,
                message: err.message,
            })
        }
    }
    async resendPasswordResetCodeHandler(req, res) {
        try {

            let isPayloadValid = await payloadValidator.resendResetCode(req.body)
            if (!req.body || !isPayloadValid || !Object.keys(req.body).length) {
                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters. Please try again.",
                })
            }

            this.mongoClient = req.app.locals.mongoClient;

            const { email } = req.body

            if (!email) {

                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters"
                })
            }

            let isUserExist = await this.mongoClient.findOneAnProject(
                this.mongoConfig.USERS,
                {
                    email: email,
                },
                {
                    _id: 1,
                    username: 1,
                }
            ).then(data => data).catch(err => false)

            if (!isUserExist) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }

            const reset_password_token = Auth_Utils.GenerateOTP()

            let updateData = {
                $set: {
                    reset_password_token: reset_password_token,
                    reset_password_send_at: new Date().getTime(),
                    isVerified: false
                }
            }
            let response = await this.mongoClient.updateOne(this.mongoConfig.USERS, { email }, updateData)

            let mail_template = this.mail_templates.passVerifiyTemplate({ name: isUserExist.username, email: email, code: reset_password_token })

            let mail_response = await Mailer(
                {
                    to: email,
                    message: "Reset your ProDoctor password",
                    subject: "Reset your ProDoctor password",
                    html: mail_template
                }
            )

            if (!response || !mail_response.status) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }

            return res.status(200).json({
                success: true,
                message: "Verification Code send successfully",
            })

        } catch (err) {
            setLog(req.originalUrl, process.env.PRODUCTION == "FALSE" ? req.connection.remoteAddress : req.headers['x-forwarded-for'].split(',')[0], req.method, false, err.message, req.hostname, "error", err.name, err.stack)
            res.status(500).json({
                success: false,
                message: err.message,
            })
        }
    }
    async resetPasswordHandler(req, res) {
        try {

            let isPayloadValid = await payloadValidator.resetPassword(req.body)
            if (!req.body || !isPayloadValid || !Object.keys(req.body).length) {
                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters. Please try again.",
                })
            }

            this.mongoClient = req.app.locals.mongoClient;

            const { code, email, password } = req.body

            if (!email || !password) {

                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters"
                })
            }

            let isUserExist = await this.mongoClient.findOneAnProject(
                this.mongoConfig.USERS,
                {
                    email: email,
                },
                {
                    _id: 1,
                    reset_password_send_at: 1,
                    reset_password_token: 1,
                }
            ).then(data => data).catch(err => false)

            if (!isUserExist) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }

            let is_reset_password_expired = (isUserExist.reset_password_send_at + (5 * 60000)) > new Date().getTime()

            if (code != isUserExist.reset_password_token && is_reset_password_expired) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }

            let hashed_password = await Auth_Utils.HashPassword(password)

            let updateData = {
                $set: {
                    reset_password_token: null,
                    reset_password_send_at: null,
                    passwordHash: hashed_password,
                    updated_at: new Date().getTime()
                }
            }
            let response = await this.mongoClient.updateOne(this.mongoConfig.USERS, { email }, updateData)

            if (!response) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }

            return res.status(200).json({
                success: true,
                message: "Password reset successfully",
                data: {
                    redirect_to: "/app/signin"
                }
            })

        } catch (err) {
            setLog(req.originalUrl, process.env.PRODUCTION == "FALSE" ? req.connection.remoteAddress : req.headers['x-forwarded-for'].split(',')[0], req.method, false, err.message, req.hostname, "error", err.name, err.stack)
            res.status(500).json({
                success: false,
                message: err.message,
            })
        }
    }
    async updateProfileHandler(req, res) {

        try {
            Mult_Upload(req, res, async (err) => {

                let isPayloadValid = await payloadValidator.updateProfile(req.body)
                console.log(isPayloadValid, 'isPayloadValid');
                if (!req.body || !isPayloadValid || !Object.keys(req.body).length) {
                    return res.status(400).json({
                        "success": false,
                        "message": "Invalid parameters. Please try again.",
                    })
                }

                if (err) {
                    return res.status(500).json({
                        "sucess": false,
                        "message": "Invalid parameters"
                    })
                }

                this.mongoClient = req.app.locals.mongoClient;

                const { username, email, work_email, phone } = req.body
                const IP = requestIp.getClientIp(req)

                if (!username || !work_email || !phone) {

                    return res.status(400).json({
                        "success": false,
                        "message": "Invalid parameters"
                    })
                }

                let isUserExist = await this.mongoClient.findOneAnProject(
                    this.mongoConfig.USERS,
                    {
                        email: email,
                    },
                    {
                        _id: 1,

                    }
                ).then(data => data).catch(err => false)

                if (!isUserExist) {
                    return res.status(400).json({
                        "sucess": false,
                        "message": "Invalid parameters"
                    })
                }


                const profile_img = req.files['profile_img'] ? Utils.base64_encode(req.files['profile_img'][0].path) : null;
                let updateData = {
                    $set: {
                        username: username,
                        work_email: work_email,
                        phone: phone,
                        updated_at: new Date().getTime(),
                        profile_img: profile_img || null
                    }
                }

                let update_response = await this.mongoClient.updateOne(this.mongoConfig.USERS, { email }, updateData)

                if (!update_response) {
                    return res.status(400).json({
                        "sucess": false,
                        "message": "Invalid parameters"
                    })
                }

                return res.status(200).json({
                    success: true,
                    message: "User profile updated successfully",

                })

            })
        } catch (err) {
            setLog(req.originalUrl, process.env.PRODUCTION == "FALSE" ? req.connection.remoteAddress : req.headers['x-forwarded-for'].split(',')[0], req.method, false, err.message, req.hostname, "error", err.name, err.stack)
            res.status(500).json({
                success: false,
                message: err.message,
            })
        }


    }
    async getProfileHandler(req, res) {


        let isPayloadValid = await payloadValidator.getProfile(req.body)
        console.log(isPayloadValid, 'isPayloadValid');
        if (!req.body || !isPayloadValid || !Object.keys(req.body).length) {
            return res.status(400).json({
                "success": false,
                "message": "Invalid parameters. Please try again.",
            })
        }

        let { user_id, email, hospital_id } = req;

        if (!user_id || !email || !hospital_id) {
            return res.status(400).json({
                "success": false,
                "messages": "Invalid parameters, Please try again!",
            })
        }

        try {


            this.mongoClient = req.app.locals.mongoClient;

            const { user_id } = req.body
            const IP = requestIp.getClientIp(req)

            if (!user_id) {

                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters, Please try again!"
                })
            }

            let isUserExist = await this.mongoClient.findOneAnProject(
                this.mongoConfig.USERS,
                {
                    _id: user_id,
                },
                {
                    _id: 1,
                    username: 1,
                    email: 1,
                    isOnBoarderd: 1,
                    phone: 1,
                    profile_img: 1,
                    status: 1,
                    hospital_id: 1,
                }
            ).then(data => data).catch(err => false)

            if (!isUserExist) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }

            let userdetails = {

                id: isUserExist._id,
                email: isUserExist.email,
                isOnBoarderd: isUserExist.isOnBoarderd || false,
                username: isUserExist.username,
                phone: isUserExist.phone,
                profile_img: isUserExist.profile_img,
                status: isUserExist.status,
                hospital_id: isUserExist.hospital_id
            }

            return res.status(200).json({
                success: true,
                message: "User profile updated successfully",
                data: userdetails
            })

        } catch (err) {
            setLog(req.originalUrl, process.env.PRODUCTION == "FALSE" ? req.connection.remoteAddress : req.headers['x-forwarded-for'].split(',')[0], req.method, false, err.message, req.hostname, "error", err.name, err.stack)
            res.status(500).json({
                success: false,
                message: err.message,
            })
        }

    }
    async updateOnBoardingHandler(req, res) {

        try {

            let isPayloadValid = await payloadValidator.updateOnBoarding(req.body)

            if (!req.body || !isPayloadValid || !Object.keys(req.body).length) {
                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters. Please try again.",
                })
            }

            this.mongoClient = req.app.locals.mongoClient;

            const { hospital_type, demo_select, user_id, hospital_id } = req.body

            let isUserExist = await this.mongoClient.findOneAnProject(
                this.mongoConfig.USERS,
                {
                    _id: user_id,
                },
                {
                    _id: 1,
                }
            ).then(data => data).catch(err => false)

            if (!isUserExist) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }


            let updateData = {
                $set: {
                    isOnBoarderd: true,
                    hospital_type: hospital_type,
                    isDemoImported: demo_select,
                    updated_at: new Date().getTime(),
                }
            }

            let update_response = await this.mongoClient.updateOne(this.mongoConfig.USERS, { _id: user_id }, updateData)


            if (!update_response) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }
            return res.status(200).json({
                success: true,
                message: "User profile updated successfully",

            })

        } catch (err) {
            setLog(req.originalUrl, process.env.PRODUCTION == "FALSE" ? req.connection.remoteAddress : req.headers['x-forwarded-for'].split(',')[0], req.method, false, err.message, req.hostname, "error", err.name, err.stack)
            res.status(500).json({
                success: false,
                message: err.message,
            })
        }


    }
    async createCustomerFeedbackHandler(req, res) {

        try {

            let isPayloadValid = await payloadValidator.updateCustomerFeedback(req.body)

            if (!req.body || !isPayloadValid || !Object.keys(req.body).length) {
                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters. Please try again.",
                })
            }

            this.mongoClient = req.app.locals.mongoClient;

            const { rating, category, message, user_id, hospital_id } = req.body

            let isUserExist = await this.mongoClient.findOneAnProject(
                this.mongoConfig.USERS,
                {
                    _id: user_id,
                },
                {
                    _id: 1,
                }
            ).then(data => data).catch(err => false)

            if (!isUserExist) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }

            let data = {
                _id: Utils.getUniqueId(),
                rating,
                category,
                message,
                user_id,
                hospital_id,
                status: '0',
                created_at: new Date().getTime(),
                updated_at: new Date().getTime(),
            }

            let response = await this.mongoClient.insertOne(this.mongoConfig.FEEDBACKS, data)

            if (!response) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }

            return res.status(200).json({
                success: true,
                message: "Customer feedback created successfully",

            })

        } catch (err) {
            setLog(req.originalUrl, process.env.PRODUCTION == "FALSE" ? req.connection.remoteAddress : req.headers['x-forwarded-for'].split(',')[0], req.method, false, err.message, req.hostname, "error", err.name, err.stack)
            res.status(500).json({
                success: false,
                message: err.message,
            })
        }


    }

    async getNextHospitalID() {
        try {

            let response = await new Promise(async (resolve, reject) => {

                this.mongoClient.client.collection(this.mongoConfig.HOSPITALS).find({}).sort({ created_at: -1 }).limit(1).project({ hospitalID: 1 }).toArray(function (err, result) {
                    if (err) reject(err)
                    resolve(result)
                })
            })

            let hospitalId = Array.isArray(response) && response.length ? String(response[response.length - 1].hospitalID) : "0"
            hospitalId = String(parseInt(hospitalId.split('-')[hospitalId.split('-').length - 1] || 0) + 1)

            hospitalId = `H-${hospitalId.length < 3 ? `00${hospitalId}` : hospitalId}`

            return { hospitalID: hospitalId }

        } catch (err) {
            return { hospitalID: undefined }
        }

    }

}

module.exports = User;