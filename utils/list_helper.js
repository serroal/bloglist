const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((a, c) => a + c.likes, 0)
}

module.exports = {
  dummy,
  totalLikes
}