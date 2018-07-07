var emailController = require('./email-controller.js')
var apiRoutes = require('./api/index.js')
const express = require('express')
const router = express.Router()

router.use('/sendEmail', emailController)
router.use('/api', apiRoutes)

let startDate = new Date()

router.get('/', (req, res) => {
  res.json({
    sane: 'true',
	startDate
  })
})

module.exports = router
