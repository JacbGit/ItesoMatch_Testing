const { Schema, default: mongoose } = require("mongoose");

const MatchSchema = new Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  user1Liked: {
    type: Boolean,
    default: false,
  },
  user2Liked: {
    type: Boolean,
    default: false,
  },
  matched: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Match", MatchSchema);
