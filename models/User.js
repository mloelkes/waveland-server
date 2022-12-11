const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
      type: String,
      required: true,
    },
    nameForUrl: String,
    imageUrl: String,
    location: String,
    description: String,
    tracks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Track",
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Track",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
