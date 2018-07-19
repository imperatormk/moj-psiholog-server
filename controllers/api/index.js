const chatTokenController = require('./chat-token-controller.js')
const accountController = require('./account-controller.js')
const sessionController = require('./session-controller.js')
const paymentController = require('./payment-controller.js')
const tokenController = require('./token-controller.js')
const doctorController = require('./doctor-controller.js')

const express = require('express')
const router = express.Router()

router.use('/chat-tokens', chatTokenController)
router.use('/accounts', accountController)
router.use('/sessions', sessionController)
router.use('/payments', paymentController)
router.use('/tokens', tokenController)
router.use('/doctors', doctorController)

module.exports = router