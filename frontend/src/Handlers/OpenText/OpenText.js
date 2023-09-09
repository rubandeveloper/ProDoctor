
import proxyConfig from '../../config/reverseProxy'
import HeaderConfig from '../../config/header'
import axios from 'axios';

class OpenText {

    constructor() {

    }

    async invokeAsync(xhr, body = null) {
        return new Promise(function (resolve, reject) {
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 300) {
                        reject('Error: status code = ' + xhr.status + '\n' + xhr.responseText)
                    } else {
                        resolve(xhr.responseText);
                    }
                }
            }

            console.log(body, 'body');
            xhr.send(body);
        });
    }
    async getToken() {

        try {

            const xhr = new XMLHttpRequest();
            const url = proxyConfig['OpenText'] + '/tenants/15e487da-86bb-44f8-a7a2-751a9f8c8824/oauth2/token'
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-type', 'application/json');
            let body = JSON.stringify({
                "client_id": "G7C7yka5HlVz7pY6wyHNitp8f3XgJB41",
                "client_secret": "w60O7WzNMLlt19Jo",
                "grant_type": "password",
                "username": "rajajayarubant@gmail.com",
                "password": "Leorajjokesha@237110"
            })
            let response = await this.invokeAsync(xhr, body)

            response = JSON.parse(response)

            if (response && response.status == "approved") {

                let data = {
                    "access_token": response.access_token,
                    "refresh_token": response.refresh_token,
                }

                localStorage.setItem('opentext_token', response.access_token)

                return data
            }

            return false
        } catch {
            return { success: false }
        }

    }
    async UploadFile(params) {

        try {


            const xhr = new XMLHttpRequest();
            const url = proxyConfig['OpenText_CS'] + '/v2/tenant/15e487da-86bb-44f8-a7a2-751a9f8c8824/content?avs-scan=true'
            const token = localStorage.getItem("opentext_token")

            xhr.open('POST', url, true);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`)
            let response = await this.invokeAsync(xhr, params)

            response = JSON.parse(response)

            if (response && response.title == "/content" && Array.isArray(response.entries) && response.entries.length) {

                return {
                    success: true,
                    message: "OpenText file Uploaded successfully",
                    data: response.entries[0] || {}
                }
            }

            return false
        } catch {
            return { success: false }
        }

    }

    async getFileMetaData(params) {

        try {

            let { id } = params
            const xhr = new XMLHttpRequest();
            const url = proxyConfig['OpenText_CS'] + `/v2/content/${id}`
            const token = localStorage.getItem("opentext_token")

            xhr.open('GET', url, true);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`)
            let response = await this.invokeAsync(xhr)

            response = JSON.parse(response)

            if (response && response.title == "/content" && Array.isArray(response.entries) && response.entries.length) {

                return response.entries[0]
            }

            return false
        } catch {
            return { success: false }
        }

    }
    async getTenantUsage() {

        try {

            const xhr = new XMLHttpRequest();
            const url = proxyConfig['OpenText_CS'] + `/v2/tenant/15e487da-86bb-44f8-a7a2-751a9f8c8824/usage?units=GB`
            const token = localStorage.getItem("opentext_token")

            xhr.open('GET', url, true);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`)
            let response = await this.invokeAsync(xhr)

            response = JSON.parse(response)

            if (response && response.tenantId) {

                return response
            }

            return false
        } catch {
            return { success: false }
        }

    }
    async downloadFile(params) {

        try {

            let { id } = params
            const xhr = new XMLHttpRequest();
            const url = proxyConfig['OpenText_CS'] + `/v2/content/${id}/download`
            const token = localStorage.getItem("opentext_token")

            xhr.open('GET', url, true);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`)
            xhr.setRequestHeader('Accept', `application/octet-stream`)
            let response = await this.invokeAsync(xhr)

            if (response) {

                function stringToArrayBuffer(inputString) {
                    const encoder = new TextEncoder();
                    const binaryData = encoder.encode(inputString);
                    const arrayBuffer = binaryData.buffer;
                    return arrayBuffer;
                }

                const uint8Array = new Uint8Array(stringToArrayBuffer(response));
                const base64ImageString = btoa(String.fromCharCode.apply(null, uint8Array));
                const dataUri = `data:image/png;base64,${base64ImageString}`;

                console.log(dataUri, 'dataUri');

                return response
            }

            return false
        } catch {
            return { success: false }
        }

    }

    async checkRish(params) {

        try {


            const xhr = new XMLHttpRequest();
            const url = proxyConfig['OpenText'] + '/mtm-riskguard/api/v1/process'
            const token = localStorage.getItem("opentext_token")

            xhr.open('POST', url, true);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`)
            let response = await this.invokeAsync(xhr, params)

            response = JSON.parse(response)

            if (response && response.header) {

                return {
                    success: true,
                    message: "OpenText file rish check passed",
                    data: response || {}
                }
            }

            return false
        } catch {
            return { success: false }
        }

    }
}

export default OpenText;