const { Router } = require('express')
const usersController = require('./users.controller')
const admin = require('../../middlewares/admin')
const userAuth = require('../../middlewares/userAuth')
const router = Router()

router.get('/', admin, usersController.getUsers)
router.post('/', usersController.createUser)
router.post('/login', usersController.loginUser)
router.get('/checkToken', userAuth, usersController.checkToken)

module.exports = router
