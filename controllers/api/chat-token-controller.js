const chatTokenHelper = require('../../helpers/chat-token-helper.js')
const express = require('express')
const router = express.Router()

router.post('/', (req, res) => {
  const reqObj = req.body
  if (!reqObj) res.status(400).send({ msg: 'invalidData' })

  chatTokenHelper.createToken(reqObj)
    .then((resp) => {
      res.send(resp)
    })
    .catch((err) => {
      res.send({
        success: false
      })
    })
})

module.exports = router
