const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    discordId: String,
    uwid: String,
    verified: Boolean,
    token: Number
}, {
    timestamps: true
})

const User = mongoose.model('User', userSchema);

module.exports = User;