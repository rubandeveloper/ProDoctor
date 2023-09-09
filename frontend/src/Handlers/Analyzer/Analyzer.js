
import proxyConfig from '../../config/reverseProxy'
import HeaderConfig from '../../config/header'

class Analyzer {

    constructor() {

    }

    async analyseBrainTumor(params) {

        try {
            let response = await fetch(proxyConfig['servicesUrl'] + '/check-brain_tumor', {
                method: 'POST',
                headers: HeaderConfig.getHeader({ method: 'POST', isdefault: false, isToken: false }),
                body: params
            })

            response = await response.json()

            if (response) return response
        } catch {
            return { success: false }
        }

    }
    async analyseSkinDiseases(params) {

        try {
            let response = await fetch(proxyConfig['servicesUrl'] + '/check-skin_diseases', {
                method: 'POST',
                headers: HeaderConfig.getHeader({ method: 'POST', isdefault: false, isToken: false }),
                body: params
            })

            response = await response.json()

            if (response) return response
        } catch {
            return { success: false }
        }

    }
    async analyseECH_HeartDiseases(params) {

        try {
            let response = await fetch(proxyConfig['servicesUrl'] + '/check-ecg_heart_diseases', {
                method: 'POST',
                headers: HeaderConfig.getHeader({ method: 'POST', isdefault: false, isToken: false }),
                body: params
            })

            response = await response.json()

            if (response) return response
        } catch {
            return { success: false }
        }

    }
}

export default Analyzer;