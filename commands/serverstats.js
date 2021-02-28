const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'serverstats',
    description: 'List all commands or get specific info about a specific command',
    aliases: ['serverstat'],
    args: false,
    guildOnly: true,
    displayHelp: true,
    usage: "",
    /**
     * @param {Discord.Client} client 
     * @param {Discord.Message} message 
     * @param {String} args 
     */
    async execute(client, message, args) {
        let description = `This server has ${message.guild.memberCount} total members:\n`;
        await message.guild.roles.fetch();

        const emailHashFolder = './data/';
        const files = fs.readdirSync(emailHashFolder).sort();
        for (fileName of files) {
            if (Number(fileName.replace(/[^0-9]/g, '')) < process.env.MIN_GRAD_YEAR) {
                continue;
            }
            if (fileName.endsWith('.hash')) {
                const cohort = fileName.replace('.hash', '').replace('se', 'SE ');
                const filePath = path.join(emailHashFolder, fileName);
                const fileHashes = fs.readFileSync(filePath, 'utf8').split('\n');

                if (fileHashes[fileHashes.length - 1] === "") { fileHashes.pop() }
                
                let roleId = message.guild.roles.cache.find(role => role.name === cohort)?.id;
                let memberCount = (roleId) ? message.guild.roles.cache.get(roleId).members.size : 0;

                description += `**${cohort}**: ${memberCount}/${fileHashes.length} Members (${(memberCount / fileHashes.length * 100).toFixed(2)}%)\n`;
            }
        };

        let alumnRoleId = message.guild.roles.cache.find(role => role.name === "Alumn")?.id;
        description += `**Alumn**: ${(alumnRoleId) ? message.guild.roles.cache.get(alumnRoleId).members.size : 0} Members\n`

        let nonSERoleId = message.guild.roles.cache.find(role => role.name === "Non-SE")?.id;
        description += `**Non-SE**: ${(alumnRoleId) ? message.guild.roles.cache.get(nonSERoleId).members.size : 0} Members\n`

        return message.channel.send(new Discord.MessageEmbed()
            .setTitle(`Server Statistics`)
            .setThumbnail(message.guild.iconURL())
            .setColor('1E90FF')
            .setDescription(description));
    }
}