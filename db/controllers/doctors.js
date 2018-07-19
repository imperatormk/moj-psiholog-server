const User = require('../models').User
const DoctorDetails = require('../models').DoctorDetails

module.exports = {
  list() {
    return DoctorDetails.findAll({ include: [{ model: User, as: 'doctor' }] })
  },
  listById(doctorId) {
    return DoctorDetails.findOne({ where: { doctorId }, include: [{ model: User, as: 'doctor' }] }) // #1 same A
  },
  listOne(config) {
  	const configObj = { ...config }
    configObj.include = [{ all: true, nested: true }]
    return DoctorDetails.findOne({ where: configObj })
  },
  update(doctorId, data) {
  	return DoctorDetails.findOne({ where: { doctorId }, include: [{ model: User, as: 'doctor' }] }) // #1 same B
  	  .then(doctorDetails => {
    	if (doctorDetails) {
          return doctorDetails.updateAttributes(data)
        	.then(resp => ({ success: true }))
        	.catch(err => Promise.reject(err))
        }
    	return Promise.reject({ msg: 'notFound' })
      })
  	  .catch(err => Promise.reject(err))
  },
}