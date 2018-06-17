const emailHelper = require('../helpers/email-helper.js')
const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  emailHelper.sendEmail('windows_ntuser@hotmail.com', 'darko.simonovski@hotmail.com')
    .then(() => {
      res.send({
        success: true
      })
    })
    .catch((err) => {
      console.log(err)
      res.send({
        success: false
      })
    })
})

module.exports = router
