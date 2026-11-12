const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  return response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const { user, body } = request
  const blog = new Blog({
    ...body,
    likes: body.likes || 0,
    user: user._id,
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', userExtractor ,async (request, response) => {
  const { user, params } = request

  const blog = await Blog.findById(params.id)

  if ( blog.user.toString() === user.id.toString() ){
    await Blog.findByIdAndDelete(blog.id)
    response.status(204).end()
  } else {
    return response.status(401).json({ error: 'invalid user' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const { likes } = request.body

  const blog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1 })
  if(!blog){
    return response.status(404).end()
  }

  blog.likes = likes

  const updatedNote = await blog.save()
  response.json(updatedNote)
})

module.exports = blogsRouter