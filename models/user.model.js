const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    discordId: String,
    uwid: String,
    givenName: String,
    surname: String,
    department: String,
    o365CreatedDate: Date,
    refreshToken: String
}, {
    timestamps: true
})

const User = mongoose.model('User', userSchema);

module.exports = User;