const User = require('../models').User
const Blog = require('../models').Blog

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
    return Blog.findOne({ where: { id: blogId }, include: [{ model: User, as: 'poster' }] })
  },
  deleteAll() {
  	return Blog.destroy({where: {}})
  }
}