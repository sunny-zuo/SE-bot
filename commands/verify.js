const User = require('../models/user.model');
const CryptoJS = require('crypto-js');
const { sendSuccessEmbed } = require('../util');

module.exports = {
    name: 'verify',
    description: 'Verify your UW identity for server access',
    args: false,
    guildOnly: false,
    async execute(client, message, args) {
        const encodedUID = CryptoJS.AES.encrypt(`${message.author.id}-sebot`, process.env.AES_PASSPHRASE).toString().replace(/\//g, '_').replace(/\+/g, '-');

        const existingUser = await User.findOne({ discordId: message.author.id });
        if (existingUser) {
            try {
                message.author.send(`You are already verified! You can try to reverify if you want (and update your profile info, including faculty), but it likely won't make a difference.`);
                sendSuccessEmbed(message.author, 'Verification Prompt', `[Click here to login using your UWaterloo account to verify.](${process.env.SERVER_URI}/verify/${encodedUID})
                Authorization allows us to read your profile information to confirm that you are/were a UW student, and you can revoke this permission at any time.
                If you run into issues, message <@!282326223521316866> for help!`);
                message.channel.send(`${message.author}, we've DMed your a verification link. Please check your DMs!`);
            } catch (e) {
                message.channel.send(`${message.author}, we seem to be unable to DM you a verification link. Please directly message the bot with \`${process.env.PREFIX}verify\` to verify.`);
            }
            return;
        }

        // Check if message is in DMs
        if (message.guild == null) {
            sendSuccessEmbed(message.channel, 'Verification Prompt', `[Click here to login using your UWaterloo account to verify.](${process.env.SERVER_URI}/verify/${encodedUID})
                Authorization allows us to read your profile information to confirm that you are/were a UW student, and you can revoke this permission at any time.
                If you run into issues, message <@!282326223521316866> for help!`);
        } else {
            try {
                sendSuccessEmbed(message.author, 'Verification Prompt', `[Click here to login using your UWaterloo account to verify.](${process.env.SERVER_URI}/verify/${encodedUID})
                Authorization allows us to read your profile information to confirm that you are/were a UW student, and you can revoke this permission at any time.
                If you run into issues, message <@!282326223521316866> for help!`);
                message.channel.send(`${message.author}, we've DMed your a verification link. Please check your DMs!`);
            } catch (e) {
                message.channel.send(`${message.author}, we seem to be unable to DM you a verification link. Please directly message the bot with \`${process.env.PREFIX}verify\` to verify.`);
            }
            return;
        }
        
    }
}