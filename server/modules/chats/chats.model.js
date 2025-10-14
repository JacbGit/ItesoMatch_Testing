const { Schema, default: mongoose } = require("mongoose");

const ChatSchema = new Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Chat", ChatSchema);
