var chatTokenController = require('./chat-token-controller.js')
var accountController = require('./account-controller.js')
var sessionController = require('./session-controller.js')
var paymentController = require('./payment-controller.js')
const express = require('express')
const router = express.Router()

router.use('/tokens', chatTokenController)
router.use('/accounts', accountController)
router.use('/sessions', sessionController)
router.use('/payments', paymentController)

module.exports = router