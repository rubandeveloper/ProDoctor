
import proxyConfig from '../../config/reverseProxy'
import HeaderConfig from '../../config/header'
import PayloadConfig from '../../config/payload'

class Authentication {

    constructor() {

    }

    async signup(params) {

        let { username, hospital_name, phone, email, password } = params

        try {

            let payload = PayloadConfig.processPayload({ username, hospital_name, phone, email, password })

            let response = await fetch(proxyConfig['proxyUrl'] + '/signup', {
                method: 'POST',
                headers: HeaderConfig.getHeader({ method: 'POST', isToken: false }),
                body: JSON.stringify(payload)
            })

            response = await response.json()

            if (response) return response
        } catch {
            return { success: false }
        }


    }
    async signin(params) {

        let { email, password } = params

        try {

            let payload = PayloadConfig.processPayload({ password, email })

            let response = await fetch(proxyConfig['proxyUrl'] + '/signin', {
                method: 'POST',
                headers: HeaderConfig.getHeader({ method: 'POST', isToken: false }),
                body: JSON.stringify(payload)
            })

            response = await response.json()

            if (response) return response
        } catch {
            return { success: false }
        }


    }
    async forgetPassword(params) {

        let { email } = params

        try {

            let payload = PayloadConfig.processPayload({ email })

            let response = await fetch(proxyConfig['proxyUrl'] + '/forgot-password', {
                method: 'POST',
                headers: HeaderConfig.getHeader({ method: 'POST', isToken: false }),
                body: JSON.stringify(payload)
            })

            response = await response.json()

            if (response) return response
        } catch {
            return { success: false }
        }


    }
    async verifyResetCode(params) {

        let { code, email } = params

        try {

            let payload = PayloadConfig.processPayload({ code, email })

            let response = await fetch(proxyConfig['proxyUrl'] + '/veify-reset-password', {
                method: 'POST',
                headers: HeaderConfig.getHeader({ method: 'POST', isToken: false }),
                body: JSON.stringify(payload)
            })

            response = await response.json()

            if (response) return response
        } catch {
            return { success: false }
        }


    }
    async resendResetCode(params) {

        let { email } = params

        try {

            let payload = PayloadConfig.processPayload({ email })

            let response = await fetch(proxyConfig['proxyUrl'] + '/resend-reset-code', {
                method: 'POST',
                headers: HeaderConfig.getHeader({ method: 'POST', isToken: false }),
                body: JSON.stringify(payload)
            })

            response = await response.json()

            if (response) return response
        } catch {
            return { success: false }
        }



    }
    async resetPassword(params) {

        let { code, email, password } = params

        try {

            let payload = PayloadConfig.processPayload({ code, email, password })

            let response = await fetch(proxyConfig['proxyUrl'] + '/reset-password', {
                method: 'POST',
                headers: HeaderConfig.getHeader({ method: 'POST', isToken: false }),
                body: JSON.stringify(payload)
            })

            response = await response.json()

            if (response) return response
        } catch {
            return { success: false }
        }


    }

}

export default Authentication;