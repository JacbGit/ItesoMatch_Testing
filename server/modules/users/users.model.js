const { Schema, default: mongoose } = require("mongoose");
const bcrypt = require('bcrypt')

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    expediente: {
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

UserSchema.pre('save', async function(next) {
    const user = this
    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(user.password, salt)
    user.password = hash
    next()
})

module.exports = mongoose.model('User', UserSchema)