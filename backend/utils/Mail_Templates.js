class Mail_Templates {
    constructor() {

    }

    passVerifiyTemplate({ name, email, code }) {

        let HTML = `
			<h1>OTP: ${code}</h1>
		`

        return HTML

    }
}

module.exports = Mail_Templates