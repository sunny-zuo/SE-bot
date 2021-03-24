const Discord = require('discord.js');

module.exports = {
    name: 'coinflip',
    description: 'Flip a coin',
    args: false,
    aliases: ['coin', 'flip'],
    guildOnly: false,
    displayHelp: true,
    async execute(client, message, args) {
        if (Math.random() < 0.5) {
            return message.channel.send(`Coin flipped: It's heads!`, {
                embed: new Discord.MessageEmbed().setColor("#000000")
                    .setImage("https://i.imgur.com/3YvGn4c.png")
                    .setFooter(`Requested by ${message.author.tag}`, message.author.avatarURL())
            });
        } else {
            return message.channel.send(`Coin flipped: It's tails!`, {
                embed: new Discord.MessageEmbed().setColor("#000000")
                    .setImage("https://i.imgur.com/pzSSgHA.png")
                    .setFooter(`Requested by ${message.author.tag}`, message.author.avatarURL())
            });
        }
    }
}