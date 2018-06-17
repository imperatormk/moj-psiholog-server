const chatTokenHelper = require('../../helpers/chat-token-helper.js')
const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  chatTokenHelper.createSession()
    .then((resp) => {
      res.send({
        ...resp
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
