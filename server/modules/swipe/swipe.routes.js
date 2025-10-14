const { Router } = require('express')
const swipeController = require('./swipe.controller')
const userAuth = require('../../middlewares/userAuth')
const router = Router()

router.get('/top_matches', userAuth, swipeController.getTopMatches)
router.post('/like_user', userAuth, swipeController.postLikeUser)

module.exports = router
