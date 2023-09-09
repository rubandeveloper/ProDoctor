

const getHeader = ({ method, isdefault = true, isToken = true }) => {

    if (method != 'POST') return {}

    let header = {}

    if (isdefault) {
        header['Content-Type'] = 'application/json'
        header['Accept'] = 'application/json'
    } if (isdefault == 'formdata') {
        header['Content-Type'] = 'multipart/form-data';
    }

    if (isToken) {
        let x_access_token = localStorage.getItem('authToken')

        if (x_access_token == undefined || x_access_token == "") return false

        header['x-access-token'] = x_access_token
    }

    return header

}

export default { getHeader };