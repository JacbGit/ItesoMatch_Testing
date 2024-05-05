const Users = require('../users/users.model')
const Chats = require('../chats/chats.model')
const Match = require('../shared/match/match.model')

const getTopMatches = async (req, res) => {
  const user = req.user

  const userMatches = await Match.find({
    $or: [
      { $and: [{ user1: user._id }, { user1Liked: true }] }, // User1 liked User2
      { $and: [{ user2: user._id }, { user2Liked: true }] } // User2 liked User1
    ]
  })

  const matchedUserIds = userMatches.map(match => {
    return match.user1.equals(user._id) ? match.user2 : match.user1
  })

  console.log(userMatches, matchedUserIds)

  const users = await Users.find({ _id: { $nin: [user._id, ...matchedUserIds] } }).select('-password')

  const usersWithSimilarity = users.map(x => {
    const tempTags = user.tags
    let similarityScore = tempTags.filter(tag => x.tags.includes(tag)).length
    if (matchedUserIds.includes(x._id)) {
      similarityScore *= 2
    }
    return { user: x, similarityScore }
  })

  usersWithSimilarity.sort((a, b) => b.similarityScore - a.similarityScore)

  res.status(200).json(usersWithSimilarity)
}

const postLikeUser = async (req, res) => {
  const user = req.user
  const { targetUser } = req.body
  try {
    const existingMatch = await Match.findOne({ user1: targetUser, user2: user._id })
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
