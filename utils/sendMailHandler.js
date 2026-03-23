let nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 25,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: "",
        pass: "",
    },
});
module.exports = {
    sendMail: async function (to, url) {
        await transporter.sendMail({
            from: '"admin@" <admin@nnptud.com>',
            to: to,
            subject: "mail reset passwrod",
            text: "lick vo day de doi passs", // Plain-text version of the message
            html: "lick vo <a href=" + url + ">day</a> de doi passs", // HTML version of the message
        });
    },
    sendPasswordEmail: async function (to, username, password) {
        await transporter.sendMail({
            from: '"admin@" <admin@nnptud.com>',
            to: to,
            subject: "Your Account Has Been Created",
            text: `Welcome! Your account has been created.\n\nUsername: ${username}\nPassword: ${password}\n\nPlease change your password after logging in.`,
            html: `<h2>Welcome!</h2><p>Your account has been created.</p><p><strong>Username:</strong> ${username}</p><p><strong>Password:</strong> ${password}</p><p>Please change your password after logging in.</p>`
        });
    }
}