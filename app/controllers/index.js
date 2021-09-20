module.exports = {
  index(req, res, next) {
    res.sendfile('public/index.html')
  }
}
