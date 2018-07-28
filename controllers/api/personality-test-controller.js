const express = require('express')
const router = express.Router()
const fs = require('fs')

router.get('/', (req, res) => {
  const jsonRaw = fs.readFileSync(require('path').resolve(__dirname, 'personality-test-template.json'))
  const jsonParsed = JSON.parse(jsonRaw)

  res.json(jsonParsed)
})

module.exports = router