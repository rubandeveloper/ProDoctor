
import proxyConfig from '../../config/reverseProxy'
import HeaderConfig from '../../config/header'
class Patients {

    constructor() {

    }

    async createPatientHandler(params) {

        try {
            let response = await fetch(proxyConfig['proxyUrl'] + '/create-patient', {
                method: 'POST',
                headers: HeaderConfig.getHeader({ method: 'POST', isdefault: false, isToken: true }),
                body: params
            })

            response = await response.json()

            if (response) return response
        } catch {
            return { success: false }
        }

    }
    async updatePatientHandler(params) {

        try {
            let response = await fetch(proxyConfig['proxyUrl'] + '/update-patient', {
                method: 'POST',
                headers: HeaderConfig.getHeader({ method: 'POST', isdefault: false, isToken: true }),
                body: params
            })

            response = await response.json()

            if (response) return response
        } catch {
            return { success: false }
        }

    }
    async getPatientsHandler(params) {

        try {
            let response = await fetch(proxyConfig['proxyUrl'] + '/get-patients', {
                method: 'POST',
                headers: HeaderConfig.getHeader({ method: 'POST', isToken: true }),
                body: JSON.stringify(params)
            })

            response = await response.json()

            if (response) return response
        } catch {
            return { success: false }
        }

    }
    async getNextPatientIDHandler(params) {

        try {
            let response = await fetch(proxyConfig['proxyUrl'] + '/get-next-patientId', {
                method: 'POST',
                headers: HeaderConfig.getHeader({ method: 'POST', isToken: true }),
                body: JSON.stringify(params)
            })

            response = await response.json()

            if (response) return response
        } catch {
            return { success: false }
        }

    }
    async deletePatientHandler(params) {

        try {
            let response = await fetch(proxyConfig['proxyUrl'] + '/delete-patient', {
                method: 'POST',
                headers: HeaderConfig.getHeader({ method: 'POST', isToken: true }),
                body: JSON.stringify(params)
            })

            response = await response.json()

            if (response) return response
        } catch {
            return { success: false }
        }

    }
    async getNextAppointmentIDHandler(params) {

        try {
            let response = await fetch(proxyConfig['proxyUrl'] + '/get-next-appointmentId', {
                method: 'POST',
                headers: HeaderConfig.getHeader({ method: 'POST', isToken: true }),
                body: JSON.stringify(params)
            })

            response = await response.json()

            if (response) return response
        } catch {
            return { success: false }
        }

    }
    async getAppointmentsHandler(params) {

        try {
            let response = await fetch(proxyConfig['proxyUrl'] + '/get-patient-appointment', {
                method: 'POST',
                headers: HeaderConfig.getHeader({ method: 'POST', isToken: true }),
                body: JSON.stringify(params)
            })

            response = await response.json()

            if (response) return response
        } catch {
            return { success: false }
        }

    }
    async createAppointmentHandler(params) {

        try {
            let response = await fetch(proxyConfig['proxyUrl'] + '/create-patient-appointment', {
                method: 'POST',
                headers: HeaderConfig.getHeader({ method: 'POST', isToken: true }),
                body: JSON.stringify(params)
            })

            response = await response.json()

            if (response) return response
        } catch {
            return { success: false }
        }

    }
    async updateAppointmentHandler(params) {

        try {
            let response = await fetch(proxyConfig['proxyUrl'] + '/update-patient-appointment', {
                method: 'POST',
                headers: HeaderConfig.getHeader({ method: 'POST', isdefault: false, isToken: true }),
                body: params
            })

            response = await response.json()

            if (response) return response
        } catch {
            return { success: false }
        }

    }
    async deleteAppointmentHandler(params) {

        try {
            let response = await fetch(proxyConfig['proxyUrl'] + '/delete-patient-appointment', {
                method: 'POST',
                headers: HeaderConfig.getHeader({ method: 'POST', isToken: true }),
                body: JSON.stringify(params)
            })

            response = await response.json()

            if (response) return response
        } catch {
            return { success: false }
        }

    }
}

export default Patients;