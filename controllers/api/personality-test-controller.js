const express = require('express')
const router = express.Router()
const fs = require('fs')

router.get('/', (req, res) => {
  const jsonRaw = fs.readFileSync(require('path').resolve(__dirname, 'personality-test-template.json'))
  const jsonParsed = JSON.parse(jsonRaw).questions

  res.json(jsonParsed)
})

router.get('/getResults/:id', (req, res) => {
  const userId = Number(req.params.id)
  
  const answers = [{  
	questionId: 1,
	answerIndex: 1
  }, {  
	questionId: 2,
	answerIndex: 0
  }, {  
	questionId: 3,
	answerIndex: 2
  }]
  
  const criteriaResult = {
  	points: 9,
  	result: 'b'
  }
  
  const resultObj = {
  	id: 1,
  	datetime: new Date(),
  	answers,
  	criteriaResult
  }
  
  const hasDone = true
  hasDone ? res.json(resultObj) : res.json({})
})

module.exports = router