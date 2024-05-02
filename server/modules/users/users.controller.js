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
    res.status(200).json({ ok: true, data: newUser })
  } catch (error) {
    console.error(error)
    res.status(500).json({ ok: false, error: 'Login error!' })
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

    res.status(200).json({ token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ ok: false, error: 'Server error!' })
  }
}

module.exports = {
  getUsers,
  createUser,
  loginUser
}
