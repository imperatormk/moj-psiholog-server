const express = require('express')
const router = express.Router()
const fs = require('fs')
const db = require('../../db')

router.get('/', (req, res) => {
  const jsonRaw = fs.readFileSync(require('path').resolve(__dirname, 'personality-test-template.json'))
  const jsonParsed = JSON.parse(jsonRaw).questions

  res.json(jsonParsed)
})

router.get('/getResults/:id', (req, res) => {
  const userId = Number(req.params.id)
  
  db.controllers.tests.getByUser(userId)
	.then(resp => {
  	  if (resp) {
      	res.json(resp)
      } else {
      	res.json({})
      }
  	})
})

module.exports = router