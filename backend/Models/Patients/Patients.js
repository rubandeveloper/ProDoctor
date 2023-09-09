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

class Patients {

    constructor({ mongoConfig }) {

        this.mongoConfig = mongoConfig
        this.db_templates = new DB_Templates()
        this.mail_templates = new Mail_Templates()
    }

    async createPatientHandler(req, res) {

        const Mult_Upload = MulterUploader.imageUpload.fields([{ name: "profile_img", maxCount: 1 }])

        try {
            Mult_Upload(req, res, async (err) => {

                let isPayloadValid = await payloadValidator.createPatient(req.body)

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

                const {
                    patientID,
                    name,
                    phone,
                    email,
                    bloodgroup,
                    city,
                    state,
                    pincode,
                    age,
                    gender,
                    status,
                    address,
                    description,
                    weight,
                    height,
                    birthdate,
                    hospital_id,
                    user_id,
                } = req.body

                let isUserExist = await this.mongoClient.findOneAnProject(
                    this.mongoConfig.PATIENTS,
                    {
                        patientID: patientID,
                    },
                    {
                        _id: 1,
                    }
                ).then(data => data).catch(err => false)

                if (isUserExist) {
                    return res.status(400).json({
                        "sucess": false,
                        "message": "Invalid parameters"
                    })
                }

                const profile_img = req.files['profile_img'] ? Utils.base64_encode(req.files['profile_img'][0].path) : null;

                let insetData = {

                    _id: Utils.getUniqueId(),
                    patientID,
                    name,
                    age,
                    email,
                    bloodgroup,
                    city,
                    state,
                    pincode,
                    gender,
                    status,
                    address,
                    description,
                    phone,
                    weight,
                    height,
                    birthdate,
                    hospital_id,
                    user_id,
                    created_at: new Date().getTime(),
                    updated_at: new Date().getTime(),
                    profile_img: profile_img

                }

                let update_response = await this.mongoClient.insertOne(this.mongoConfig.PATIENTS, insetData)

                if (!update_response) {
                    return res.status(400).json({
                        "sucess": false,
                        "message": "Invalid parameters"
                    })
                }

                return res.status(200).json({
                    success: true,
                    message: "Patient created successfully",

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
    async updatePatientHandler(req, res) {

        const Mult_Upload = MulterUploader.imageUpload.fields([{ name: "profile_img", maxCount: 1 }])

        try {
            Mult_Upload(req, res, async (err) => {

                let isPayloadValid = await payloadValidator.updatePatient(req.body)

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

                const {
                    id,
                    patientID,
                    name,
                    age,
                    email,
                    bloodgroup,
                    city,
                    state,
                    pincode,
                    gender,
                    status,
                    address,
                    description,
                    phone,
                    weight,
                    height,
                    birthdate,
                    hospital_id,
                    user_id,
                } = req.body

                let isUserExist = await this.mongoClient.findOneAnProject(
                    this.mongoConfig.PATIENTS,
                    {
                        _id: id,
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

                let insetData = {

                    $set: {
                        name,
                        status,
                        age,
                        gender,
                        email,
                        bloodgroup,
                        city,
                        state,
                        pincode,
                        address,
                        description,
                        phone,
                        weight,
                        height,
                        birthdate,
                        hospital_id,
                        user_id,
                        created_at: new Date().getTime(),
                        updated_at: new Date().getTime(),
                        profile_img: profile_img

                    }
                }

                let update_response = await this.mongoClient.updateOne(this.mongoConfig.PATIENTS,
                    { _id: id },
                    insetData)

                if (!update_response) {
                    return res.status(400).json({
                        "sucess": false,
                        "message": "Invalid parameters"
                    })
                }

                return res.status(200).json({
                    success: true,
                    message: "Patient profile updated successfully",

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
    async _getNextPatientID() {
        try {

            let response = await new Promise(async (resolve, reject) => {

                this.mongoClient.client.collection(this.mongoConfig.PATIENTS).find({}).sort({ created_at: -1 }).limit(1).project({ patientID: 1 }).toArray(function (err, result) {
                    if (err) reject(err)
                    resolve(result)
                })
            })

            let patientId = Array.isArray(response) && response.length ? String(response[response.length - 1].patientID) : "0"
            patientId = String(parseInt(patientId.split('-')[patientId.split('-').length - 1] || 0) + 1)

            patientId = `P-${patientId.length < 3 ? `00${patientId}` : patientId}`

            return { patientID: patientId }

        } catch (err) {
            return { patientID: undefined }
        }

    }
    async getNextPatientID(req, res) {

        try {

            let isPayloadValid = await payloadValidator.getNextPatientID(req.body)
            if (!req.body || !isPayloadValid || !Object.keys(req.body).length) {
                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters. Please try again.",
                })
            }

            this.mongoClient = req.app.locals.mongoClient;

            const { user_id, hospital_id } = req.body
            const IP = requestIp.getClientIp(req)

            let isUserExist = await this.mongoClient.findOneAnProject(
                this.mongoConfig.HOSPITALS,
                {
                    _id: hospital_id,
                    owner_id: user_id,
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

            let response = await new Promise(async (resolve, reject) => {

                this.mongoClient.client.collection(this.mongoConfig.PATIENTS).find({}).sort({ created_at: -1 }).limit(1).project({ patientID: 1 }).toArray(function (err, result) {
                    if (err) {
                        reject(err)
                    }
                    resolve(result)
                })
            })

            let patientId = Array.isArray(response) && response.length ? String(response[response.length - 1].patientID) : "0"
            patientId = String(parseInt(patientId.split('-')[patientId.split('-').length - 1] || 0) + 1)
            patientId = `P-${patientId.length < 3 ? `00${patientId}` : patientId}`

            return res.status(200).json({
                success: true,
                message: "Project updated successfully",
                data: {
                    patientID: patientId
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

    async getPatientsHandler(req, res) {


        try {

            let isPayloadValid = await payloadValidator.getPatients(req.body)
            if (!req.body || !isPayloadValid || !Object.keys(req.body).length) {
                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters. Please try again.",
                })
            }

            this.mongoClient = req.app.locals.mongoClient;

            const { user_id, hospital_id, id, patientid } = req.body
            const IP = requestIp.getClientIp(req)

            if (!user_id || !hospital_id) {

                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters"
                })
            }

            let filter = {
                hospital_id: hospital_id,
                user_id: user_id,
            }

            if (id) filter['_id'] = id
            if (patientid) filter['patientID'] = patientid


            console.log(filter, 'filter');

            let isPatientsExist = await this.mongoClient.find(
                this.mongoConfig.PATIENTS,
                filter
            ).then(data => data).catch(err => false)

            return res.status(200).json({
                success: true,
                message: "Patients retrived successfully",
                data: isPatientsExist || []
            })

        } catch (err) {
            setLog(req.originalUrl, process.env.PRODUCTION == "FALSE" ? req.connection.remoteAddress : req.headers['x-forwarded-for'].split(',')[0], req.method, false, err.message, req.hostname, "error", err.name, err.stack)
            res.status(500).json({
                success: false,
                message: err.message,
            })
        }

    }

    async deletePatientHandler(req, res) {

        try {

            let isPayloadValid = await payloadValidator.deletePatient(req.body)
            if (!req.body || !isPayloadValid || !Object.keys(req.body).length) {
                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters. Please try again.",
                })
            }


            this.mongoClient = req.app.locals.mongoClient;

            const { id, hospital_id, user_id } = req.body

            const IP = requestIp.getClientIp(req)

            let isUserExist = await this.mongoClient.findOneAnProject(
                this.mongoConfig.HOSPITALS,
                {
                    _id: hospital_id,
                    owner_id: user_id,
                },
                {
                    _id: 1
                }
            ).then(data => data).catch(err => false)

            if (!isUserExist) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }

            let isProjectExist = await this.mongoClient.findOneAnProject(
                this.mongoConfig.PATIENTS,
                {
                    _id: id,
                },
                {
                    _id: 1,
                    projectID: 1
                }
            ).then(data => data).catch(err => false)

            if (!isProjectExist) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters, Patient not exists"
                })
            }

            let response = await this.mongoClient.deleteOne(
                this.mongoConfig.PATIENTS,
                {
                    _id: id
                })

            if (!response) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }


            return res.status(200).json({
                success: true,
                message: "Patient deleted successfully",

            })

        } catch (err) {
            setLog(req.originalUrl, process.env.PRODUCTION == "FALSE" ? req.connection.remoteAddress : req.headers['x-forwarded-for'].split(',')[0], req.method, false, err.message, req.hostname, "error", err.name, err.stack)
            res.status(500).json({
                success: false,
                message: err.message,
            })
        }

    }

    /*Appointments */
    async getAppointmentsHandler(req, res) {

        try {

            let isPayloadValid = await payloadValidator.getAppointments(req.body)
            if (!req.body || !isPayloadValid || !Object.keys(req.body).length) {
                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters. Please try again.",
                })
            }

            this.mongoClient = req.app.locals.mongoClient;

            const { user_id, patient_id, hospital_id, id, appointment_id } = req.body
            const IP = requestIp.getClientIp(req)


            let isUserExist = await this.mongoClient.findOneAnProject(
                this.mongoConfig.HOSPITALS,
                {
                    _id: hospital_id,
                    owner_id: user_id,
                },
                {
                    _id: 1
                }
            ).then(data => data).catch(err => false)

            if (!isUserExist) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }

            let filter = {
                hospital_id: hospital_id,
                user_id: user_id,
            }

            if (id) filter['_id'] = id
            if (patient_id) filter['patient_id'] = patient_id
            if (appointment_id) filter['appointmentID'] = appointment_id

            let isDataExist = await this.mongoClient.find(
                this.mongoConfig.APPOINTMENTS,
                filter
            ).then(data => data).catch(err => false)

            return res.status(200).json({
                success: true,
                message: "Patients retrived successfully",
                data: isDataExist || []
            })

        } catch (err) {
            setLog(req.originalUrl, process.env.PRODUCTION == "FALSE" ? req.connection.remoteAddress : req.headers['x-forwarded-for'].split(',')[0], req.method, false, err.message, req.hostname, "error", err.name, err.stack)
            res.status(500).json({
                success: false,
                message: err.message,
            })
        }

    }
    async createAppointmentHandler(req, res) {

        try {

            let isPayloadValid = await payloadValidator.createAppointment(req.body)

            if (!req.body || !isPayloadValid || !Object.keys(req.body).length) {
                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters. Please try again.",
                })
            }

            this.mongoClient = req.app.locals.mongoClient;

            const {
                date,
                diagnosis,
                description,
                patient_id,
                user_id,
                hospital_id,
            } = req.body

            let isUserExist = await this.mongoClient.findOneAnProject(
                this.mongoConfig.HOSPITALS,
                {
                    _id: hospital_id,
                    owner_id: user_id,
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

            let { appointmentID } = await this._getNextAppointmentID()

            let insetData = {

                _id: Utils.getUniqueId(),
                appointmentID,
                date,
                diagnosis,
                description,
                patient_id,
                status: "waiting",
                hospital_id,
                user_id,
                created_at: new Date().getTime(),
                updated_at: new Date().getTime(),
                documents: {
                    ecg_doc: null,
                    bp_doc: null
                }

            }

            let update_response = await this.mongoClient.insertOne(this.mongoConfig.APPOINTMENTS, insetData)

            if (!update_response) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }

            return res.status(200).json({
                success: true,
                message: "Appointment created successfully",

            })


        } catch (err) {
            setLog(req.originalUrl, process.env.PRODUCTION == "FALSE" ? req.connection.remoteAddress : req.headers['x-forwarded-for'].split(',')[0], req.method, false, err.message, req.hostname, "error", err.name, err.stack)
            res.status(500).json({
                success: false,
                message: err.message,
            })
        }


    }
    async updateAppointmentHandler(req, res) {

        const Appointment_Mult_Upload = MulterUploader.imageUpload.any()

        try {

            Appointment_Mult_Upload(req, res, async (err) => {

                // let isPayloadValid = await payloadValidator.updateAppointment(req.body)
                let isPayloadValid = true

                if (!req.body || !isPayloadValid) {

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

                const {
                    id,
                    date,
                    diagnosis,
                    description,
                    status,
                    temperature,
                    bloodPressure,
                    bloodSugar,
                    patient_id,
                    user_id,
                    hospital_id,
                    file_names,
                    opentext_prescription_id,
                    opentext_prescription_blobId,
                    opentext_prescription_fileName,
                    opentext_prescription_providerId,
                    opentext_prescription_MD5,
                    opentext_prescription_download_link,
                    opentext_prescription_self_link,
                    opentext_prescription_risk,
                } = req.body

                let isUserExist = await this.mongoClient.findOneAnProject(
                    this.mongoConfig.PATIENTS,
                    {
                        patientID: patient_id,
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

                const documents = [];

                for (const file of req.files) {

                    let { fieldname, path } = file

                    let url = Utils.base64_encode(path)

                    documents.push({
                        id: Utils.getUniqueId(),
                        file: url,
                        name: fieldname,
                    })
                }


                let updateData = {

                    $set: {
                        date,
                        diagnosis,
                        description,
                        status,
                        temperature,
                        bloodPressure,
                        bloodSugar,
                        patient_id,
                        user_id,
                        hospital_id,
                        opentext_prescription: {
                            id: opentext_prescription_id,
                            blobId: opentext_prescription_blobId,
                            fileName: opentext_prescription_fileName,
                            providerId: opentext_prescription_providerId,
                            MD5: opentext_prescription_MD5,
                            download_link: opentext_prescription_download_link,
                            self_link: opentext_prescription_self_link,
                            risk: opentext_prescription_risk || "",
                        },
                        updated_at: new Date().getTime(),
                        documents: documents || []

                    }

                }

                let update_response = await this.mongoClient.updateOne(this.mongoConfig.APPOINTMENTS, { _id: id }, updateData)

                if (!update_response) {
                    return res.status(400).json({
                        "sucess": false,
                        "message": "Invalid parameters"
                    })
                }

                return res.status(200).json({
                    success: true,
                    message: "Patient created successfully",

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
    async getNextAppointmentID(req, res) {

        try {

            let isPayloadValid = await payloadValidator.getNextAppointmentID(req.body)
            if (!req.body || !isPayloadValid || !Object.keys(req.body).length) {
                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters. Please try again.",
                })
            }

            this.mongoClient = req.app.locals.mongoClient;

            const { user_id, hospital_id } = req.body
            const IP = requestIp.getClientIp(req)

            let isUserExist = await this.mongoClient.findOneAnProject(
                this.mongoConfig.HOSPITALS,
                {
                    _id: hospital_id,
                    owner_id: user_id,
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

            let response = await new Promise(async (resolve, reject) => {

                this.mongoClient.client.collection(this.mongoConfig.APPOINTMENTS).find({}).sort({ created_at: -1 }).limit(1).project({ appointmentID: 1 }).toArray(function (err, result) {
                    if (err) {
                        reject(err)
                    }
                    resolve(result)
                })
            })

            let appointmentId = Array.isArray(response) && response.length ? String(response[response.length - 1].appointmentID) : "0"
            appointmentId = String(parseInt(appointmentId.split('-')[appointmentId.split('-').length - 1] || 0) + 1)
            appointmentId = `AP-${appointmentId.length < 3 ? `00${appointmentId}` : appointmentId}`

            return res.status(200).json({
                success: true,
                message: "Appointment next Id get successfully",
                data: {
                    appointmentID: appointmentId
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
    async _getNextAppointmentID() {
        try {

            let response = await new Promise(async (resolve, reject) => {

                this.mongoClient.client.collection(this.mongoConfig.APPOINTMENTS).find({}).sort({ created_at: -1 }).limit(1).project({ appointmentID: 1 }).toArray(function (err, result) {
                    if (err) reject(err)
                    resolve(result)
                })
            })

            let appointmentId = Array.isArray(response) && response.length ? String(response[response.length - 1].appointmentID) : "0"
            appointmentId = String(parseInt(appointmentId.split('-')[appointmentId.split('-').length - 1] || 0) + 1)
            appointmentId = `AP-${appointmentId.length < 3 ? `00${appointmentId}` : appointmentId}`

            return { appointmentID: appointmentId }

        } catch (err) {
            return { appointmentID: undefined }
        }

    }
    async deleteAppointmentHandler(req, res) {

        try {

            let isPayloadValid = await payloadValidator.deleteAppointmentHandler(req.body)
            if (!req.body || !isPayloadValid || !Object.keys(req.body).length) {
                return res.status(400).json({
                    "success": false,
                    "message": "Invalid parameters. Please try again.",
                })
            }


            this.mongoClient = req.app.locals.mongoClient;

            const { id, patient_id, hospital_id, user_id } = req.body

            const IP = requestIp.getClientIp(req)

            let isUserExist = await this.mongoClient.findOneAnProject(
                this.mongoConfig.HOSPITALS,
                {
                    _id: hospital_id,
                    owner_id: user_id,
                },
                {
                    _id: 1
                }
            ).then(data => data).catch(err => false)

            if (!isUserExist) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }

            let isProjectExist = await this.mongoClient.findOneAnProject(
                this.mongoConfig.PATIENTS,
                {
                    _id: patient_id,
                },
                {
                    _id: 1,
                }
            ).then(data => data).catch(err => false)

            if (!isProjectExist) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters, Patient not exists"
                })
            }

            let response = await this.mongoClient.deleteOne(
                this.mongoConfig.APPOINTMENTS,
                {
                    _id: id
                })

            if (!response) {
                return res.status(400).json({
                    "sucess": false,
                    "message": "Invalid parameters"
                })
            }


            return res.status(200).json({
                success: true,
                message: "Appointment deleted successfully",

            })

        } catch (err) {
            setLog(req.originalUrl, process.env.PRODUCTION == "FALSE" ? req.connection.remoteAddress : req.headers['x-forwarded-for'].split(',')[0], req.method, false, err.message, req.hostname, "error", err.name, err.stack)
            res.status(500).json({
                success: false,
                message: err.message,
            })
        }

    }
    /*End Appointments */
}

module.exports = Patients;