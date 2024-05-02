const Users = require('../users/users.model')
const Chats = require('../chats/chats.model')
const Match = require('../shared/match/match.model')

const getTopMatches = async (req, res) => {
  const user = req.user
  console.log(user._id)
  const users = await Users.find({ _id: { $ne: user._id } }).select('-password')
  res.status(200).json(users)
}

const postLikeUser = async (req, res) => {
  const user = req.user
  const { targetUser } = req.body
  try {
    const existingMatch = await Match.findOne({ user2: user._id })
    if (existingMatch) {
      if (existingMatch.user1Liked) {
        existingMatch.matched = true
        existingMatch.user2Liked = true
        await existingMatch.save()

        const newChat = await Chats.create({
          users: [existingMatch.user1, existingMatch.user2]
        })

        res.status(200).json({ ok: true, data: { mutualMatch: true, newChat } })
      } else {
        res.send(200)
      }
    } else {
      await Match.create({
        user1: user._id,
        user2: targetUser,
        user1Liked: true
      })

      res.status(200).json({ ok: true, data: {} })
    }
  } catch (error) {
    res.status(400).json({ ok: false, error: 'Server error!' })
  }
}

module.exports = {
  getTopMatches,
  postLikeUser
}
