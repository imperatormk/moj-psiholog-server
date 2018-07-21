const User = require('../models').User
const Token = require('../models').Token
const DoctorDetails = require('../models').DoctorDetails

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
        
        let detailsPromise = Promise.resolve({})
        if (user.type === 'doctor') {
          const doctorName = userObj.name
          detailsPromise = DoctorDetails.create({ name: doctorName }, { include: [{ model: User, as: 'doctor' }] })
        	.then(details => details.setDoctor(user))
        	.then(details => details.save())
        	.catch(err => {
          	  console.log(err)
          	  return Promise.reject(err)
          	})
        }
        
    	return detailsPromise.then(() => {
          return Token.create(token, {include: [{ model: User }]})
    	  	.then(token => token.setUser(user))
          	.then(token => token.save())
    	  	.then(token => ({
        	  success: true,
        	  data: {
              	token,
              	user
              }
          	}))
    	  	.catch(err => {
          	  console.log(err)
          	  return Promise.reject(err)
          	})
        })
    	.catch(err => {
          console.log(err)
          return Promise.reject(err)
        })
      })
  	  .catch(err => {
    	console.log(err)
    	if (err.errors[0].type === 'unique violation') {
          return Promise.reject({
          	success: false,
          	msg: 'accountExists'
          })
        }
    	return Promise.reject(err)
      })
  },
  confirm(confirmData) {
  	const token = confirmData.token
    const password = confirmData.password
   	return Token.findOne({ where: { value: token }, include: [{ model: User }] })
  	  .then(token => {    
    	if (!token) return Promise.resolve({
          success: false,
          status: 'invalidToken'
        })
    
    	if (!token.valid) {
          return Promise.resolve({
          	success: false,
        	status: 'invalidToken'
          })
        }
    
    	return token.update({ valid: false })
    	  .then(() => {
        	return token.User.update({ pass: password, confirmed: true })
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