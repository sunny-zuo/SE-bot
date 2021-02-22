const Discord = require('discord.js');

/**
 * Send a basic embed (title + description) with a red highlight. Optionally mention a user.
 * @param {Discord.Channel} channel
 * @param {String} title
 * @param {String} description
 * @param {Discord.User} mention
 */
function sendErrorEmbed(channel, title, description, mention = undefined) {
    if (mention) {
        return channel.send(`${mention}`, {
            embed: new Discord.MessageEmbed().setColor("#ff0000")
                .setTitle(title)
                .setDescription(description)
        })
    } else {
        return channel.send(new Discord.MessageEmbed().setColor("#ff0000")
            .setTitle(title)
            .setDescription(description));
    }
}

/**
 * Send a basic embed (title + description) with a green highlight. Optionally mention a user.
 * @param {Discord.Channel} channel
 * @param {String} title
 * @param {String} description
 * @param {Discord.User} mention
 */
function sendSuccessEmbed(channel, title, description, mention = undefined) {
    if (mention) {
        return channel.send(`${mention}`, {
            embed: new Discord.MessageEmbed().setColor("#00ff00")
                .setTitle(title)
                .setDescription(description)
        })
    } else {
        return channel.send(new Discord.MessageEmbed().setColor("#00ff00")
            .setTitle(title)
            .setDescription(description));
    }
}

/**
 * Send a basic embed (title + description) with a specified color. Optionally mention a user.
 * @param {Discord.Channel} channel
 * @param {String} title
 * @param {String} description
 * @param {String} color
 * @param {Discord.User} mention
 */
function sendColorEmbed(channel, title, description, color, mention = undefined) {
    if (mention) {
        return channel.send(`${mention}`, {
            embed: new Discord.MessageEmbed().setColor(color)
                .setTitle(title)
                .setDescription(description) })
    } else {
        return channel.send(new Discord.MessageEmbed().setColor(color)
            .setTitle(title)
            .setDescription(description));
    }
};

module.exports = { sendErrorEmbed, sendSuccessEmbed, sendColorEmbed };