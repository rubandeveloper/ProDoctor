
const UserRoutes = require('./Users/index')
const PatientsRoutes = require('./Patients/index')

module.exports = (app) => {

    app.use("/api", UserRoutes)
    app.use("/api", PatientsRoutes)

};