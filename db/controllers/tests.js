const User = require('../models').User
const Test = require('../models').Test

module.exports = {
  create(id, testData) {
  	if (!testData || !id) return Promise.reject({ msg: 'invalidData' })
    const userId = Number(id)
  	
    return Test.findOne({ where: { userId }})
  	  .then(res => {
    	if (res) return Promise.reject({ msg: 'alreadyDone' })
        try {
          const answersObj = JSON.parse(JSON.stringify(testData))
          const dataObj = { answers: answersObj, criteriaResult: { points: 9, result: 'You might be a bit depressed but nothing too bad' } }
          const testObj = { userId, data: dataObj }
          
          return Test.create(testObj)
        	.then(test => {
              return Promise.resolve(test)
            })
          .catch(err => Promise.reject(err))
        }
        catch(err) {
          return Promise.reject(err)
        }
      })
      .catch(err => Promise.reject(err))
  },
  getByUser(userId) {
  	return Test.findOne({ where: { userId: Number(userId) }})
  	  .then(res => res)
      .catch(err => Promise.reject(err))
  },
  list() {
  	return Test.findAll({})
  },
  deleteAll() {
  	return Test.destroy({where: {}})
  }
}