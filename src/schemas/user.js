const mongoose = require('mongoose')

const user = new mongoose.Schema({
    username: String,
    password: String,
    pfp: String,
    apiKeys: Object,
})

module.exports = mongoose.model('User', user)