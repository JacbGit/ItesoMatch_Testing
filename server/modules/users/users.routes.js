const { Router } = require('express')
const usersController = require('./users.controller')
const admin = require('../../middlewares/admin')
const router = Router()

router.get('/', admin, usersController.getUsers)
router.post('/', usersController.createUser)

module.exports = router