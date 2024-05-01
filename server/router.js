const express = require('express')

const router = express.Router()

const usersRoutes = require('./modules/users/users.routes.js')

router.use('/users', usersRoutes)
router.get('/', (req, res) => {
  res.send('API')
})
module.exports = router
