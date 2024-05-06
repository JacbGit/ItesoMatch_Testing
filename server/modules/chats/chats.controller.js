const Chats = require('./chats.model')
const Messages = require('../messages/messages.model')

const getAllChats = async (req, res) => {
  const user = req.user
  const chats = await Chats.aggregate([
    {
      $match: { users: user._id }
    },
    {
      $lookup: {
        from: 'users', // Assuming 'users' is the name of your users collection
        localField: 'users',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $unwind: {
        path: '$userDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $match: { userDetails: { $ne: null } }
    }
  ])

  res.status(200).json({ ok: true, data: chats })
}

const getMessagesFromChat = async (req, res) => {
  const user = req.user
  const chatId = req.params.id

  const chat = await Chats.findOne({ _id: chatId, users: user._id })
  if (!chat) {
    return res.status(400).json({ ok: false })
  }

  const messages = await Messages.find({ chat: chatId }).sort({ timestamp: 1 })
  res.status(200).json({ ok: true, data: messages })
}

const sendMessageToChat = async (userId, chatId, message) => {
  await Messages.create({
    chat: chatId,
    sender: userId,
    content: message
  })
}

module.exports = {
  getAllChats,
  sendMessageToChat,
  getMessagesFromChat
}
