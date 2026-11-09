const assert = require('node:assert')
const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
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

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const titles = response.body.map(r => r.title)

  assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
  assert(titles.includes('test blog'))
})

after(async () => {
  await mongoose.connection.close()
})