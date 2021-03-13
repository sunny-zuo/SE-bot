const Discord = require('discord.js');
const User = require('../models/user.model');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'createreactionlist',
    description: 'Get an email list of all members that reacted to a message',
    aliases: ['serverstat'],
    args: true,
    guildOnly: false,
    displayHelp: false,
    ownerOnly: true,
    usage: "(channel id) (message id)",
    /**
     * @param {Discord.Client} client 
     * @param {Discord.Message} message 
     * @param {String} args 
     */
    async execute(client, message, args) {
        if (message.guild != null) {
            message.reply('this command can only be used in DMs');
            return;
        }
        args = args.split(" ");
        const msg = await (await client.channels.fetch(args[0]))?.messages.fetch(args[1]);
        if (!msg) { return; }

        const userSet = new Set();
        for (reaction of msg.reactions.cache.map(r => r)) {
            const users = await reaction.users.fetch({ limit: 100 });
            users.forEach(u => userSet.add(u.id));
        }

        let emailList = 'Email list: (message will be deleted in 30 seconds)\n';
        for (userId of userSet) {
            const userData = await User.findOne({ discordId: userId });
            emailList += `${userData.uwid}@uwaterloo.ca,\n`;
        }
        
        message.channel.send(emailList).then(sentMessage => {
            setTimeout(() => sentMessage.delete(), 30000);
        });
    }
}