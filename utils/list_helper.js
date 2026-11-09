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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}