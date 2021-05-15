const User = require('../models/user.model');
const Discord = require('discord.js');
const CryptoJS = require('crypto-js');
const { sendSuccessEmbed, sendErrorEmbed } = require('../util');
const { assignRoles } = require('../seRoles');

module.exports = {
    name: 'verify',
    description: 'Verify your UW identity for server access',
    args: false,
    guildOnly: false,
    async execute(client, message, args) {
        const encodedUID = CryptoJS.AES.encrypt(`${message.author.id}-sebot`, process.env.AES_PASSPHRASE).toString().replace(/\//g, '_').replace(/\+/g, '-');

        const existingUser = await User.findOne({ discordId: message.author.id });
        if (existingUser && existingUser.givenName) {
            try {
                assignRoles(existingUser);
                sendSuccessEmbed(message.channel, 'Verified Successfully', 'You\'ve been successfully verified!', message.author);
            } catch (e) {
                console.log('Verification Error: ', e);
            }
            return;
        }

        // Check if message is in DMs
        if (message.guild == null) {
            message.author.send(new Discord.MessageEmbed().setColor("#00ff00")
                .setTitle('Verification Prompt')
                .setDescription(`[Click here to login using your UWaterloo account to verify.](${process.env.SERVER_URI}/verify/${encodedUID})
                Authorization allows us to read your profile information to confirm that you are/were a UW student, and you can revoke this permission at any time.
                If you run into issues, message <@!282326223521316866> for help!
                
                **For Applicants:** Unfortunately, you're unable to verify until June when your UW account is activated. Use \`$se26\` in the meantime for a temp role!`));
        } else {
            try {
                message.author.send(new Discord.MessageEmbed().setColor("#00ff00")
                    .setTitle('Verification Prompt')
                    .setDescription(`[Click here to login using your UWaterloo account to verify.](${process.env.SERVER_URI}/verify/${encodedUID})
                Authorization allows us to read your profile information to confirm that you are/were a UW student, and you can revoke this permission at any time.
                If you run into issues, message <@!282326223521316866> for help!
                
                **For Applicants:** Unfortunately, you're unable to verify until June when your UW account is activated. Use \`$se26\` in the meantime for a temp role!`));
                message.channel.send(`${message.author}, we've DMed you a verification link. Please check your DMs!`);
            } catch (e) {
                sendErrorEmbed(message.channel, 'Unable to DM Verification Link', 'We seem to be unable to DM you a verification link. Please [temporarily change your privacy settings](https://cdn.discordapp.com/attachments/811741914340393000/820114337514651658/permissions.png) to allow direct messages from server members in order to verify.', message.author);
            }
            return;
        }
        
    }
}