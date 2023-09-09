const Utils = require("../utils/utils");

class DB_Templates {

    constructor() {

        this.NewUserTemplate = this.NewUserTemplate.bind(this)
    }

    NewUserTemplate({ hospitalID, username, hospital_name, email, phone, password, IP }) {

        let HOSPITAL_TEMPLATE = {
            "_id": Utils.getUniqueId(),
            "owner_id": null,
            "doctors": [],
            "name": hospital_name,
            "hospitalID": hospitalID,
            "email": null,
            "phone": null,
            "logo_img_url": null,
            "status": 1, // 0-Default, 1-Enabled, 2-Disables, 3-Terminated
            "address": null,
            "location": null,
        }

        let USER_TEMPLATE = {
            "_id": Utils.getUniqueId(),
            "hospital_id": null,
            "hospitalID": hospitalID,
            "username": username,
            "hospital_name": hospital_name,
            "email": email,
            "passwordHash": password,
            "phone": phone,
            "profile_img": null,
            "status": 1, // 0-Default, 1-Enabled, 2-Disables, 3-Terminated
            "isOnBoarderd": false,
            "hospital_type": null,
            "isDemoImported": false,
            "curent_signin_at": null,
            "curent_signin_ip": null,
            "signup_ip": IP,
            "last_signin_at": null,
            "last_signin_ip": null,
            "signin_count": 1,
            "reset_password_token": null,
            "reset_password_send_at": null,
            "created_at": new Date().getTime(),
            "updated_at": new Date().getTime(),
        }

        /*Collection Relation */
        USER_TEMPLATE.hospital_id = HOSPITAL_TEMPLATE._id
        HOSPITAL_TEMPLATE.owner_id = USER_TEMPLATE._id

        return { USER_TEMPLATE, HOSPITAL_TEMPLATE }

    }
}

module.exports = DB_Templates;