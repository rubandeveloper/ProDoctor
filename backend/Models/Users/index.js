const express = require('express')
const Routes = express.Router()

const MONGO_CONFIG = require('../../Config/MongoDB')

const VerifyToken = require('../../Middleware/verifytoken')
const verifyToken = new VerifyToken()

const UserController = require('./User')
const userController = new UserController({ mongoConfig: MONGO_CONFIG })

Routes.post('/signup', (req, res) => userController.registerHandler(req, res))
Routes.post('/signin', (req, res) => userController.loginHandler(req, res))
Routes.post('/forgot-password', (req, res) => userController.forgotPasswordHandler(req, res))
Routes.post('/veify-reset-password', (req, res) => userController.verifyPasswordResetCodeHandler(req, res))
Routes.post('/resend-reset-code', (req, res) => userController.verifyPasswordResetCodeHandler(req, res))
Routes.post('/reset-password', (req, res) => userController.resetPasswordHandler(req, res))
Routes.post('/update-profile', (req, res) => userController.updateProfileHandler(req, res))
Routes.post('/get-profile', verifyToken.verify, (req, res) => userController.getProfileHandler(req, res))
Routes.post('/update-onboarding', verifyToken.verify, (req, res) => userController.updateOnBoardingHandler(req, res))
Routes.post('/create-customer-feedback', verifyToken.verify, (req, res) => userController.createCustomerFeedbackHandler(req, res))

module.exports = Routes