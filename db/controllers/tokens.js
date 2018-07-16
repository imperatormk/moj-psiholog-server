const User = require('../models').User
const Token = require('../models').Token

module.exports = {
  create(tokenData) {
  	
  },
  isValid(tokenData) {
  	return Token.findOne({ where: { value: tokenData.token, purpose: tokenData.type, valid: true }})
  	  .then(res => !!res ? { valid: true } : { valid: false })
      .catch(err => Promise.reject(err))
  },
  list() { // for dev?
  	return Token.findAll({})
  },
  deleteAll() {
  	return Token.destroy({where: {}})
  }
}