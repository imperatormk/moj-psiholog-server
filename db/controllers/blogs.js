const User = require('../models').User
const Blog = require('../models').Blog
const DoctorDetails = require('../models').DoctorDetails

module.exports = {
  create(blogData, userId) { // userId temp?
  	if (!blogData || userId == null) return Promise.reject({ msg: 'invalidData' })
  	return User.findOne({ where: { id: userId } })
  	  .then(user => {
    	return Blog.create(blogData)
    	  .then(blog => blog.setPoster(user))
    	  .then(blog => blog.save())
    	  .catch(err => (Promise.reject(err)))
      })
  	  .catch(err => (Promise.reject(err)))
  },
  list() {
  	return Blog.findAll({ include: [{ model: User, as: 'poster' }] })
  },
  listById(blogId) {
    return Blog.findOne({ where: { id: blogId }, include: [{ model: User, as: 'poster', include: [{ model: Blog, as: 'blogs', attributes: ['id'] }, { model: DoctorDetails, as: 'details', attributes: ['bio', 'avatar', 'name'] }] }] })
  },
  listByDocId(doctorId) {
  	return Blog.findAll({ where: { posterId: doctorId } })
  },
  deleteAll() {
  	return Blog.destroy({where: {}})
  }
}