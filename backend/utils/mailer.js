require('dotenv').config();
const nodemailer = require("nodemailer");

let Mailer = async ({ to, message, subject, html, file }) => {

    if (!to || !message || !subject) return;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from: process.env.EMAIL,
        to: to,
        subject: subject,
        text: message,
        html: html,
    };

    if (file) {

        mailOptions.attachments = {
            filename: file.name,
            path: file.path,
        }
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        return {
            status: true,
            output: info,
        };
    } catch (error) {
        console.error("Error occurred:", error);
        return {
            status: false,
            output: error,
        };
    }


};

module.exports = { Mailer };
