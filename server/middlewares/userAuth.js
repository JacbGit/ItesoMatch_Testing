const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const Users = require('../modules/users/users.model')
module.exports = async (req, res, next) => {
  const token = req.get('Authorization')

  if (!token) {
    return res
      .status(401)
      .json({ ok: false, error: 'Authorization token is missing!' })
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET)
    console.log(decoded)
    const user = await Users.findById(decoded.userId)

    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found!' })
    }

    req.user = user
    next()
  } catch (error) {
    console.error(error)
    res.status(401).json({ ok: false, error: 'Invalid token!' })
  }
}
