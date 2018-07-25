const db = require('../../db')
const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  db.controllers.blogs.list()
	.then(blogs => res.json(blogs))
	.catch(err => res.status(500).send(err))
})

router.get('/:id', (req, res) => {
  const blogId = Number(req.params.id)
  db.controllers.blogs.listById(blogId)
	.then(blog => res.json(blog))
	.catch(err => res.status(500).send(err))
})

router.post('/', (req, res) => {
  const blogObj = req.body.blog
  const userId = req.body.userId
  
  if (!blogObj || userId == null) {
  	res.status(400).send({ msg: 'invalidData' })
  }

  db.controllers.blogs.create(blogObj, userId)
	.then((resp) => {
  	  res.status(201).send({ success: true, data: resp })
  	})
	.catch(err => {
  	  res.status(500).send({ success: false, err })
  	})
})

router.delete('/', (req, res) => {
  db.controllers.blogs.deleteAll()
	.then(resp => res.status(200).send({ success: true }))
	.catch(err => res.status(500).send({ success: false, err }))
})

module.exports = router