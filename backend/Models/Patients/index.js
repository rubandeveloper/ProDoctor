const express = require('express')
const Routes = express.Router()

const MONGO_CONFIG = require('../../Config/MongoDB')

const VerifyToken = require('../../Middleware/verifytoken')
const verifyToken = new VerifyToken()

const PatientsController = require('./Patients')
const patientsController = new PatientsController({ mongoConfig: MONGO_CONFIG })

Routes.post('/get-patients', verifyToken.verify, (req, res) => patientsController.getPatientsHandler(req, res))
Routes.post('/create-patient', verifyToken.verify, (req, res) => patientsController.createPatientHandler(req, res))
Routes.post('/update-patient', verifyToken.verify, (req, res) => patientsController.updatePatientHandler(req, res))
Routes.post('/get-next-patientId', verifyToken.verify, (req, res) => patientsController.getNextPatientID(req, res))
Routes.post('/delete-patient', verifyToken.verify, (req, res) => patientsController.deletePatientHandler(req, res))

Routes.post('/get-next-appointmentId', verifyToken.verify, (req, res) => patientsController.getNextAppointmentID(req, res))
Routes.post('/get-patient-appointment', verifyToken.verify, (req, res) => patientsController.getAppointmentsHandler(req, res))
Routes.post('/create-patient-appointment', verifyToken.verify, (req, res) => patientsController.createAppointmentHandler(req, res))
Routes.post('/update-patient-appointment', verifyToken.verify, (req, res) => patientsController.updateAppointmentHandler(req, res))
Routes.post('/delete-patient-appointment', verifyToken.verify, (req, res) => patientsController.deleteAppointmentHandler(req, res))

module.exports = Routes