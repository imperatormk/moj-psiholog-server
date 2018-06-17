var chatTokenController = require('./chat-token-controller.js')
const express = require('express')
const router = express.Router()

router.use('/tokens', chatTokenController)

module.exports = router
