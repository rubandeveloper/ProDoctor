
require('dotenv').config()

module.exports = {
    URI: process.env.MONGO_URI,
    DATABASE: 'ProDoctor',
    USERS: 'users',
    HOSPITALS: 'HOSPITALS',
    PATIENTS: 'PATIENTS',
    APPOINTMENTS: 'APPOINTMENTS',
}