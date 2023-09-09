
import proxyConfig from '../../config/reverseProxy'
import HeaderConfig from '../../config/header'
class User {

    constructor() {

    }

    async updateProfileHandler(params) {

        try {
            let response = await fetch(proxyConfig['proxyUrl'] + '/update-profile', {
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
    async updateOnBoardingHandler(params) {

        try {
            let response = await fetch(proxyConfig['proxyUrl'] + '/update-onboarding', {
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
    async createCustomerFeedbackHandler(params) {

        try {
            let response = await fetch(proxyConfig['proxyUrl'] + '/create-customer-feedback', {
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
    async getProfileHandler(params) {

        try {

            let response = await fetch(proxyConfig['proxyUrl'] + '/get-profile', {
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

export default User;