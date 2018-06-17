var exports = {}

const nodemailer = require("nodemailer")
let Email = require('email-templates')

var smtpTransport = nodemailer.createTransport({
  host: 'smtp.live.com',
  port: 587,
  service: "Hotmail",
  secureConnection: true,
  secure: false,
  auth: {
    user: 'windows_ntuser@hotmail.com',
    pass: 'jinx'
  },
  tls: {
    rejectUnauthorized: false
  }
})

exports.sendEmail = (emailFrom, emailTo) => {
  const email = new Email({
    views: { root: './templates' },
    message: {
      from: emailFrom
    },
    send: true,
    preview: false,
    transport: smtpTransport
  })
   
  return email.send({
    template: 'mars',
    message: {
      to: emailTo
    },
    locals: {
      name: 'Mrmak'
    }
  })
}

module.exports = exports