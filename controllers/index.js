var emailController = require('./email-controller.js')
var apiRoutes = require('./api/index.js')
const express = require('express')
const router = express.Router()

router.use('/sendEmail', emailController)
router.use('/api', apiRoutes)

router.get('/', (req, res) => {
  res.json({
    sane: 'true'
  })
})

module.exports = router
