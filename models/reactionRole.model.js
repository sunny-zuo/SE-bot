const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reactionRoleSchema = new Schema({
    guildId: String,
    channelId: String,
    messageId: String,
    roles: [{
        emote: String,
        emoteName: String,
        roleId: String,
        name: String
    }]
}, {
    timestamps: true
})

const ReactionRole = mongoose.model('ReactionRole', reactionRoleSchema);

module.exports = ReactionRole;