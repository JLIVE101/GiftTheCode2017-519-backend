var nodemailer = require('nodemailer');

// TODO: Update URL here to the permanent address.
var sendConfirmationEmail = function(member, hash) {
    let mailOptions = {
        from: 'The 519 <giftthecode519@gmail.com>',
        to: `${member.firstName} ${member.lastName} <${member.email}>`,
        subject: 'Complete your 519.org registration', // Subject line
        html: `
<p>Thanks for signing up as a member for the 519.org!<p>
<p>Please click the link below to complete your registration:</p>
<p><a href="http://159.203.45.55:8080/api/confirmAccount/${hash}"><button>Click here</button></a></p>
<small>Please do not reply to this email.</small>
        `
    };

    console.log(mailOptions);
    sendEmail(mailOptions);
}

// TODO: Update URL here to the permanent address.
// The URL here should go to the front end. The hash should be a hidden field that gets passed
// back to the API when the form is completed.
var sendPasswordResetEmail = function(member, hash) {
    let mailOptions = {
        from: 'The 519 <giftthecode519@gmail.com>',
        to: `${member.firstName} ${member.lastName} <${member.email}>`,
        subject: 'The 519 account password reset', 
        html: `
<p>You've requested a password reset for your 519.org account. You can click the link below to reset the password.<p>
<p><a href="http://159.203.45.55:8080/reset/${hash}"><button>Click here</button></a></p>
<p>If you haven't requested a password reset, you can ignore this email.</p>
<small>Please do not reply to this email.</small>
        `
    };

    console.log(mailOptions);
    sendEmail(mailOptions);
}

var sendEmail = function(message) {
    nodemailer.createTestAccount(function(err, account) {

        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        transporter.sendMail(message, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    });
};

module.exports = {
    sendConfirmationEmail,
    sendPasswordResetEmail
}