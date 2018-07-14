const User = require('../models').User
const Token = require('../models').Token

module.exports = {
  create(user) {
  	const userObj = {
      ...user,
      pass: user.pass || 'x',
      type: user.type || 'patient'
    }
    return User.create(userObj)
  	  .then(user => {
      	const token = {
          purpose: 'confirmation',
          value: Math.random().toString(36).slice(-8)
        }
        
        return Token.create(token, {include: [{ model: User }]})
    	  .then(token => token.setUser(user))
          .then(token => token.save())
    	  .then(token => ({
        	status: {
              success: true
            },
        	data: {
              token,
              user
            }
          }))
      })
  	  .catch(err => {
    	if (err.errors[0].type === 'unique violation') {
          return Promise.reject({
          	success: false,
          	msg: 'accountExists'
          })
        }
    	return Promise.reject(err)
      })
  },
  confirm(token) {
  	return Token.findOne({where: {value: token}, include: [{ model: User }]})
  	  .then(token => {    
    	if (!token) return Promise.resolve({
          success: false,
          status: 'invalidToken'
        })
    
    	if (token.used === true) {
          return Promise.resolve({
          	success: false,
        	status: 'alreadyUsed'
          })
        }
    
    	return token.update({ used: true })
    	  .then(() => {
        	return token.User.update({ confirmed: true })
        	  .then(() => ({
            	success: true
              }))
          })
      })
  },
  list() {
    return User.findAll({})
  },
  listById(id) {
    return User.find({ where: { id: id }})
  },
  listOne(config) {
    return User.find({ where: config })
  },
  deleteAll() {
  	return User.destroy({where: {}})
  }
};