var exports = {}

const nodemailer = require("nodemailer")
let Email = require('email-templates')

const emailFromA = 'psiholog0@hotmail.com'
const emailFromB = 'psiholozi@outlook.com'

const authA = { user: emailFromA, pass: 'Psihologo' }
const authB = { user: emailFromB, pass: 'Psiholog' }
const auth = authA

var smtpTransport = nodemailer.createTransport({
  host: 'smtp.live.com',
  port: 587,
  service: "Hotmail",
  secureConnection: true,
  secure: false,
  auth,
  tls: {
    rejectUnauthorized: false
  }
})

exports.sendEmail = (emailTo, template, vars) => {
  const email = new Email({
    views: { root: './templates' },
    message: {
      from: auth.user
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
  	  return Promise.resolve(data)
  	})
	.catch(err => Promise.reject(err))
}

module.exports = exports