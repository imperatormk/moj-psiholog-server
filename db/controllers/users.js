const bcrypt = require('bcrypt')

const User = require('../models').User
const Token = require('../models').Token
const DoctorDetails = require('../models').DoctorDetails
const Blog = require('../models').Blog

module.exports = {
  create(user) {
  	const plainPass = user.pass || 'x'
    
    return bcrypt.hash(plainPass, 10).then((hash) => {
  	  const userObj = {
        ...user,
        pass: hash,
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
              .catch(err => Promise.reject(err))
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
          	  .catch(err => Promise.reject(err))
            })
          .catch(err => Promise.reject(err))
        })
        .catch(err => {
          if (err.errors[0].type === 'unique violation') {
            return Promise.reject({
              msg: 'accountExists'
            })
          }
          return Promise.reject(err)
        })
    })
  	.catch(err => Promise.reject(err))
  },
  confirm(confirmData) {
  	const token = confirmData.token
    const plainPass = confirmData.password
    
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
        	return bcrypt.hash(plainPass, 10)
              .then((hash) => {
        		return token.User.update({ pass: hash, confirmed: true })
        	  	  .then((user) => ({
            		success: true,
                	data: {
                      email: user.email
                    }
              	  }))
           	  })
        	  .catch(err => Promise.reject(err))
          })
    	  .catch(err => Promise.reject(err))
      })
  },
  login(authData) {
  	const email = authData.email
    const plainPass = authData.pass
    
    return User.find({ where: { email } })
  	  .then((user) => {
    	if (!user) return Promise.reject({ msg: 'invalidCreds' })
    	return bcrypt.compare(plainPass, user.pass)
          .then((valid) => {
        	if (valid) return Promise.resolve(user)
        	return Promise.reject({ msg: 'invalidCreds' })
		  })
      })
  },
  list() {
    return User.findAll({})
  },
  listById(id) {
    return User.find({ include: [{ model: Blog, as: 'blogs' }], where: { id } })
  },
  listOne(config) {
    return User.find({ where: config })
  },
  deleteAll() {
  	return User.destroy({where: {}})
  }
}