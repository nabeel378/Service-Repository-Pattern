const nodemailer = require("nodemailer");
const { SMPT_SERVER, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD } = process.env

let emailInstance = nodemailer.createTransport({
    host: SMPT_SERVER,
    port: SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: SMTP_EMAIL, // generated ethereal user
        pass: SMTP_PASSWORD, // generated ethereal password
    },
})

export {emailInstance}
