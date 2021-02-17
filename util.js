const Discord = require('discord.js');

function sendErrorEmbed(message, title, description) {
    message.channel.send(new Discord.MessageEmbed().setColor("#ff0000")
        .setTitle(title)
        .setDescription(description));
}

function sendSuccessEmbed(message, title, description) {
    message.channel.send(new Discord.MessageEmbed().setColor("#00ff00")
        .setTitle(title)
        .setDescription(description));
}

module.exports = { sendErrorEmbed, sendSuccessEmbed };