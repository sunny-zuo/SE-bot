const { sendErrorEmbed } = require('../util');

module.exports = {
    name: 'confirm',
    description: 'Confirm your UW identity with the code provided in the verify step',
    args: false,
    guildOnly: true,
    displayHelp: false,
    async execute(client, message, args) {
        return sendErrorEmbed(message.channel, 'Command No Longer Supported', `We've migrated to OAuth verification, so all pending verifications have been deleted. Please verify again using \`${process.env.PREFIX}verify\``, message.author);
    }
}