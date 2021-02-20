const User = require('../models/user.model');
const { sendErrorEmbed, sendSuccessEmbed } = require('../util');
const { assignRoles } = require('../seRoles');

module.exports = {
    name: 'confirm',
    description: 'Confirm your UW identity with the code provided in the verify step',
    args: true,
    guildOnly: true,
    displayHelp: false,
    async execute(client, message, args) {
        const user = await User.findOne({ discordId: message.author.id });
        if (!user) {
            return sendErrorEmbed(message.channel, 'No User Found', `No user was found. You need to ${process.env.PREFIX}verify first before you can confirm!`);
        }

        if (user.verified) {
            assignRoles(message.guild, message.member, user);
            return sendSuccessEmbed(message.channel, "Verified Successfully!", "You have been successfully verified. Welcome to the server!");
        }

        if (parseInt(args) === user.token) {
            user.verified = true;
            await user.save();
            assignRoles(message.guild, message.member, user);
            return sendSuccessEmbed(message.channel, "Verified Successfully!", "You have been successfully verified. Welcome to the server!");
        } else {
            return sendErrorEmbed(message.channel, 'Invalid Verification Code', 'An invalid verification code was provided. Please double check and make sure you\'re using the right code.');
        }
    }
}