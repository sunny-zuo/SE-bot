const Discord = require('discord.js');
const ReactionRole = require('../models/reactionRole.model');
const { subscribe } = require('../reactionRoles');

module.exports = {
    name: 'createreactionrole',
    description: 'Create a reaction role prompt',
    args: false,
    aliases: ["createrr"],
    guildOnly: true,
    displayHelp: true,
    usage: "Follow the bot instructions after running the command.",
    permissions: ['MANAGE_ROLES'],
    async execute(client, message, args) {
        let title = "";
        const reactionRoles = [];
        const cleanupMessages = [message];

        message.channel.send("Creating reaction roles: What would you like to title the prompt?").then(msg => cleanupMessages.push(msg));

        const filter = (m) => {
            return m.author.id === message.author.id;
        };

        const collector = message.channel.createMessageCollector(filter, { time: 300000 });
        
        collector.on('collect', async (m) => {
            cleanupMessages.push(m);

            if (title === "") {
                title = m.content;
                message.channel.send("Got it. Next, send the emote followed by mentioning the role you want to assign.").then(msg => cleanupMessages.push(msg));
            }
            else if (m.content.toLowerCase() === "end" && reactionRoles.length > 0) {
                const description = reactionRoles.map(rr => `${rr.emote} - <@&${rr.roleId}>`).join("\n");
                const embed = await message.channel.send(new Discord.MessageEmbed().setColor("#0000ff")
                    .setTitle(title)
                    .setDescription(description));

                const rr = new ReactionRole({
                    guildId: embed.guild.id,
                    channelId: embed.channel.id,
                    messageId: embed.id,
                    roles: reactionRoles
                });

                await rr.save();
                subscribe(client, rr);

                for (cleanupMessage of cleanupMessages) {
                    cleanupMessage.delete({ reason: "Cleanup reaction role creation messages"});
                }
            } else {
                let emoteName = m.content.split(" ")[0];
                if (/(?<=:)(.*)(?=:)/g.test(emoteName)) {
                    [emoteName] = emoteName.match(/(?<=:)(.*)(?=:)/g);
                }

                reactionRoles.push({
                    emote: m.content.split(" ")[0],
                    emoteName: emoteName,
                    roleId: m.mentions.roles.first().id,
                    name: m.mentions.roles.first().name
                });
                message.channel.send("Got it. Send the emote followed by mentioning the role you want to assign, or type `end` to finish.").then(msg => cleanupMessages.push(msg));
            }
        })
    }
}