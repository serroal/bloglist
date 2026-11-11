const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => blogs.reduce((a, c) => a + c.likes, 0)

const favoriteBlog = (blogs) => {
  if(!blogs.length) return null
  const likesArray = blogs.map(blog => blog.likes)
  const mostLikedIndex = likesArray.indexOf(Math.max(...likesArray))
  return blogs[mostLikedIndex]
}

const mostBlogs = (blogs) => {
  if(!blogs.length) return null
  const count = _.countBy(blogs, 'author')
  const countMapped = _.map(count, (blogs, author) => ({ author, blogs }))
  return _.maxBy(countMapped, 'blogs')
}

const mostLikes = (blogs) => {
  if(!blogs.length) return null
  const blogsByAuthor = _.groupBy(blogs, 'author')
  const countMapped = _.map(blogsByAuthor, (blogs, author) => ({ author, likes: _.sumBy(blogs, 'likes') }))
  return _.maxBy(countMapped, 'likes')
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}