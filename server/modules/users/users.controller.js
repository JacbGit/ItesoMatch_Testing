const Users = require("./users.model")

const getUsers = async (req, res) => {
    const users = await Users.find()
    res.status(200).json({ok:true, data:users})
}

const createUser = async (req, res) => {
    const {
        username,
        age,
        name,
        email,
        expediente,
        phone,
        password
    } = req.body
    const newUser = await Users.create({
        username,
        age,
        name,
        email,
        expediente,
        phone,
        password
    })
    res.status(200).json({ok:true, data: newUser})
}

module.exports = {
    getUsers,
    createUser
}