module.exports = {
    name: 'se26',
    description: 'Gain access as an admitted SE 26 student',
    args: false,
    guildOnly: false,
    displayHelp: false,
    usage: '',
    async execute(client, message, args) {
        message.member.roles.add(message.guild.roles.cache.find(role => role.name === 'SE 2026 Admit'));
        message.reply('you\'ve been given the SE 26 Admit role. If you choose to accept your offer, please come back in June once your email is setup and `$verify` for full server access!')
    }
}