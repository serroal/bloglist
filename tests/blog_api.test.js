const assert = require('node:assert')
const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)

  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })
  await user.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('all blogs have property id', async () => {
  const response = await api.get('/api/blogs')

  for (const blog of response.body) {
    assert.notStrictEqual(blog.id, undefined)
    assert.strictEqual(blog._id, undefined)
  }
})

test('a blog can be added ', async () => {
  const newBlog = {
    title: 'test blog',
    author: 'test author',
    url: 'http://www.testblogurl.com',
    likes: 0
  }

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  await api
    .post('/api/blogs')
    .set('Authorization', 'Bearer ' + loginResponse.body.token)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const titles = response.body.map(r => r.title)

  assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
  assert(titles.includes('test blog'))
})

test('a blog can\'t be added without a token', async () => {
  const newBlog = {
    title: 'test blog',
    author: 'test author',
    url: 'http://www.testblogurl.com',
    likes: 0
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)

})

test('a blog without likes prop is saved with 0 likes', async () => {
  const newBlog = {
    title: 'test blog no likes',
    author: 'test author',
    url: 'http://www.testblogurl.com',
  }

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const response = await api
    .post('/api/blogs')
    .set('Authorization', 'Bearer ' + loginResponse.body.token)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

test('a blog without title prop fails with 400 Error', async () => {
  const newBlog = {
    author: 'test author',
    url: 'http://www.testblogurl.com',
    likes: 0
  }

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  await api
    .post('/api/blogs')
    .set('Authorization', 'Bearer ' + loginResponse.body.token)
    .send(newBlog)
    .expect(400)
})

test('a blog without url prop fails with 400 Error', async () => {
  const newBlog = {
    title: 'test blog',
    author: 'test author',
    likes: 0
  }

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  await api
    .post('/api/blogs')
    .set('Authorization', 'Bearer ' + loginResponse.body.token)
    .send(newBlog)
    .expect(400)
})

test('a blog can be deleted', async () => {
  const newBlog = {
    title: 'test blog',
    author: 'test author',
    url: 'http://www.testblogurl.com',
    likes: 0
  }

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const insertResponse = await api
    .post('/api/blogs')
    .set('Authorization', 'Bearer ' + loginResponse.body.token)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = insertResponse.body

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', 'Bearer ' + loginResponse.body.token)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  const ids = blogsAtEnd.map(n => n.id)
  assert(!ids.includes(blogToDelete.id))

  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
})

test('a blog can be updated', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]

  blogToUpdate.likes = 13

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(blogToUpdate)
    .expect(200)

  assert.strictEqual(response.body.likes, 13)
})

test('a blog can\'t be updated is not exists', async () => {
  const id = await helper.nonExistingId()

  const blogToUpdate = new Blog({})

  await api
    .put(`/api/blogs/${id}`)
    .send(blogToUpdate)
    .expect(404)
})

after(async () => {
  await mongoose.connection.close()
})