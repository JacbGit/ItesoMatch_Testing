const Users = require('./users.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../../utils/config')
const path = require('path')

const getUsers = async (req, res) => {
  const users = await Users.find()
  res.status(200).json({ ok: true, data: users })
}

const createUser = async (req, res) => {
  const { image } = req.files
  console.log(image)
  const {
    username,
    age,
    name,
    email,
    expediente,
    phone,
    password,
    tags
  } = req.body

  try {
    if (!image) return res.sendStatus(400)

    // If does not have image mime type prevent from uploading

    // Move the uploaded image to our upload folder
    const imageName = Date.now() + '-' + image.name
    const newPath = path.join(__dirname, '../../img', imageName)
    await image.mv(newPath)
    const parsedTags = tags.split(',')

    const newUser = await Users.create({
      username,
      age,
      name,
      email,
      expediente,
      phone,
      password,
      tags: parsedTags,
      imageURI: imageName
    })

    console.log(parsedTags, newUser)

    const userData = {
      username: newUser.username,
      age: newUser.age,
      name: newUser.name,
      email: newUser.email,
      expediente: newUser.expediente,
      phone: newUser.phone,
      _id: newUser._id,
      imageURI: newUser.imageURI,
      tags: newUser.tags
    }

    const token = jwt.sign({ userId: newUser._id }, config.JWT_SECRET, { expiresIn: '1h' })

    res.status(200).json({ ok: true, data: { userData, token } })
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

    const userData = {
      username: user.username,
      age: user.age,
      name: user.name,
      email: user.email,
      expediente: user.expediente,
      phone: user.phone,
      _id: user._id,
      imageURI: user.imageURI,
      tags: user.tags
    }

    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '1h' })

    // res.status(200).json({ ok: true, data: { userData: { username: user.username, _id: user._id }, token } })
    res.status(200).json({ ok: true, data: { userData, token } })
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

/*
const updateUser = async (req, res) => {
  const { userId } = req.user; // Asumiendo que el middleware de autenticación proporciona userId
  const updateData = req.body;

  // Filtrar y eliminar claves que tienen valores undefined o nulos
  Object.keys(updateData).forEach(key => {
      if (updateData[key] == null) {
          delete updateData[key];
      }
  });

  try {
      if (Object.keys(updateData).length === 0) {
          res.status(400).json({ ok: false, error: 'No se cambiaron datos' });
          return;
      }
      const updatedUser = await Users.findByIdAndUpdate(userId, updateData, { new: true });
      res.status(200).json({ ok: true, data: updatedUser });
      console.log(updatedUser)
  } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, error: 'Error updating user profile!' });
  }
}
*/

const updateUser = async (req, res) => {
  const { id } = req.params // Obtiene el ID del usuario desde la URL
  const updateData = req.body // Datos que quieres actualizar

  try {
    const updatedUser = await Users.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true } // Devuelve el documento actualizado
    )
    if (!updatedUser) {
      return res.status(404).json({ ok: false, error: 'User not found' })
    }
    res.status(200).json({ ok: true, data: updatedUser })
  } catch (error) {
    console.error(error)
    res.status(500).json({ ok: false, error: 'Error updating user' })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await Users.findByIdAndDelete(id)
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' })
    }
    res.status(200).json({ ok: true, message: 'User deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ ok: false, error: 'Error deleting user' })
  }
}

module.exports = {
  getUsers,
  createUser,
  loginUser,
  checkToken,
  updateUser,
  deleteUser
}
