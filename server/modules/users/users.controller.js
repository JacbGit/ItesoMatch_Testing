const Users = require('./users.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../../utils/config')

const getUsers = async (req, res) => {
  const users = await Users.find()
  res.status(200).json({ ok: true, data: users })
}

const createUser = async (req, res) => {
  const {
    username,
    age,
    name,
    email,
    expediente,
    phone,
    password
  } = req.body

  try {
    const newUser = await Users.create({
      username,
      age,
      name,
      email,
      expediente,
      phone,
      password
    })

    const token = jwt.sign({ userId: newUser._id }, config.JWT_SECRET, { expiresIn: '1h' })

    res.status(200).json({ ok: true, token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ ok: false, error: 'Register error!' })
  }
}

const loginUser = async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await Users.findOne({ username })

    if (!user) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials!' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials!' })
    }

    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '1h' })

    res.status(200).json({ ok: true, data: { userData: { username: user.username, _id: user._id }, token } })
  } catch (error) {
    console.error(error)
    res.status(500).json({ ok: false, error: 'Server error!' })
  }
}

const checkToken = async (req, res) => {
  const token = req.get('Authorization')

  if (!token) {
    return res.status(401).json({ ok: false, error: 'Authorization token is missing!' })
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET)
    console.log(decoded)
    const user = await Users.findById(decoded.userId)

    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found!' })
    }

    res.status(200).json({ ok: true })
  } catch (error) {
    console.error(error)
    res.status(401).json({ ok: false, error: 'Invalid token!' })
  }
}

module.exports = {
  getUsers,
  createUser,
  loginUser,
  checkToken
}
