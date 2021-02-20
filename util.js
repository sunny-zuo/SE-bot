const Discord = require('discord.js');

/**
 * Send a basic embed (title + description) with a red highlight
 * @param {*} channel 
 * @param {*} title 
 * @param {*} description 
 */
function sendErrorEmbed(channel, title, description) {
    return channel.send(new Discord.MessageEmbed().setColor("#ff0000")
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
    return channel.send(new Discord.MessageEmbed().setColor("#00ff00")
        .setTitle(title)
        .setDescription(description));
}

module.exports = { sendErrorEmbed, sendSuccessEmbed };