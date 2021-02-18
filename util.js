const Discord = require('discord.js');

/**
 * Send a basic embed (title + description) with a red highlight
 * @param {*} channel 
 * @param {*} title 
 * @param {*} description 
 */
function sendErrorEmbed(channel, title, description) {
    channel.send(new Discord.MessageEmbed().setColor("#ff0000")
        .setTitle(title)
        .setDescription(description));
}

/**
 * Send a basic embed (title + description) with a green highlight
 * @param {*} channel
 * @param {*} title
 * @param {*} description
 */
function sendSuccessEmbed(channel, title, description) {
    channel.send(new Discord.MessageEmbed().setColor("#00ff00")
        .setTitle(title)
        .setDescription(description));
}

/**
 * Assigns all correct roles to a user based on their user data.
 * 
 * @param {GuildMember} user Represents a member of a guild
 * @param {User} userInfo User data in object format with keys as described in the mongoose model
 */
function assignRoles(user, userInfo) {
    // TODO: Assign the correct roles w/ email list intergration
}

module.exports = { sendErrorEmbed, sendSuccessEmbed, assignRoles };