module.exports = (req, res, next) => {
  const adminHeader = req.get('adminToken')
  if (adminHeader === 'admin123') {
    return next()
  }
  res.status(401).json({
    ok: false,
    err: {
      message: 'No admin token!'
    }
  })
}
