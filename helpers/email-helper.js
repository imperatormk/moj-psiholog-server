var exports = {}

const nodemailer = require("nodemailer")
let Email = require('email-templates')

const emailFrom = 'psiholog0@hotmail.com'

var smtpTransport = nodemailer.createTransport({
  host: 'smtp.live.com',
  port: 587,
  service: "Hotmail",
  secureConnection: true,
  secure: false,
  auth: {
    user: emailFrom,
    pass: 'Psihologo'
  },
  tls: {
    rejectUnauthorized: false
  }
})

exports.sendEmail = (emailTo, template, vars) => {
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
    template,
    message: {
      to: emailTo
    },
    locals: vars || {}
  })
	.then((data) => {
  	  console.log(data)
  	  return Promise.resolve(data)
  	})
}

module.exports = exports