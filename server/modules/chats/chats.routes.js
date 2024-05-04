const { Router } = require('express')
const chatController = require('./chats.controller')
const userAuth = require('../../middlewares/userAuth')
const router = Router()

router.get('/', userAuth, chatController.getAllChats)
router.get('/:id', userAuth, chatController.getMessagesFromChat)
// router.post('/:id', userAuth, chatController.sendMessageToChat)

module.exports = router
