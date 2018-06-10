/**
 * Created by dharmendra on 31/8/16.
 */
'use strict';

var nodemailer = require('nodemailer'),
    config = require('config').email;

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
    service: config.authorization.service,
    auth: config.authorization.auth
});


// send mail with defined transport object
var mailSend = function (to, subject, text, html, cb) {
    var mailOptions = {
        from: config.verification.from, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plaintext body
        html: html // html body
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return cb(error);
        }
        return cb();
    });
}

var email = {
    mailSend: mailSend
}
module.exports = email