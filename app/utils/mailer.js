const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const mailConfig = require('../config/mail.config'); // Adjust the path as necessary

const transport = nodemailer.createTransport({
    host: mailConfig.MAIL_HOST,
    port: mailConfig.MAIL_PORT,
    secure: mailConfig.MAIL_ENCRYPTION === 'ssl', // true for 465, false for other ports
    auth: {
        user: mailConfig.MAIL_USERNAME,
        pass: mailConfig.MAIL_PASSWORD,
    },
});

exports.sendMail = async (to, subject, url, purpose) => {
    try {
        const templatePath = path.join(__dirname, 'emailTemplate.ejs'); // Adjust the path as necessary
        const template = fs.readFileSync(templatePath, 'utf8');
        const htmlContent = ejs.render(template, {
            verificationUrl: purpose === 'verify' ? url : undefined,
            resetUrl: purpose === 'reset' ? url : undefined,
            purpose: purpose
        });

        // Log the rendered HTML content
        console.log('Rendered HTML Content:', htmlContent);

        const options = {
            from: `${mailConfig.MAIL_FROM_NAME} <${mailConfig.MAIL_FROM_ADDRESS}>`,
            to: to,
            subject: subject,
            html: htmlContent,
        };

        // Log email details before sending
        console.log('Sending email...');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('HTML Content:', htmlContent);

        const info = await transport.sendMail(options);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
