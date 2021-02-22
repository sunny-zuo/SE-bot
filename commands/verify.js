const User = require('../models/user.model');
const { sendErrorEmbed, sendSuccessEmbed, sendColorEmbed } = require('../util');
const { assignRoles, isUserSE } = require('../seRoles');
const nodemailer = require("nodemailer");
const mailAccount = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});

module.exports = {
    name: 'verify',
    description: 'Verify your UW identity for server access',
    args: true,
    guildOnly: true,
    async execute(client, message, args) {
        // consistently format uwid
        let uwid = args.toLowerCase().replace(/[^a-z0-9.@-]/g, "");
        if (uwid.endsWith("@uwaterloo.ca")) {
            uwid = uwid.slice(0, -13);
        }

        // check to see if the uwid has already been registered
        const existingUser = await User.findOne({ uwid: uwid });

        if (existingUser) {
            if (existingUser.discordId === message.author.id) {
                if (existingUser.verified) {
                    await assignRoles(message.guild, message.member, existingUser);
                    return sendSuccessEmbed(message.channel, "Verified Successfully!", `${message.author}, you have been successfully verified. Welcome to the server!`, message.author);
                } else {
                    return sendErrorEmbed(message.channel, "Email Was Already Sent", `${message.author}, we've already sent a verification email. Please make sure to check your spam/junk mail!`, message.author);
                }
            } else {
                return sendErrorEmbed(message.channel, "UWID Already Registered", `${message.author}, the provided UWID has already been registered. If you think this is a mistake, message <@${process.env.ADMIN_ID}>.`, message.author);
            }
        }

        if (isUserSE(uwid)) {
            this.finishVerification(message, uwid);
        } else {
            const filter = (m) => {
                return m.author.id === message.author.id;
            };

            sendColorEmbed(message.channel, "Note: UWID is not in Software Engineering",
                `${message.author}, the UWID provided is not in SE! If this is correct, type \`continue\` to continue with verification. Otherwise, \`${process.env.PREFIX}verify\` with a different email.
                If you are in SE, please make sure that you are not using the 'friendly' email.
                If everything seems correct, message <@${process.env.ADMIN_ID}> for help.`,
                "#1E90FF", message.author
            ).then(() => {
               message.channel.awaitMessages(filter, { max: 1, time: 30000 }).then(m =>{
                   if (m.first().content === "continue") {
                       this.finishVerification(message, uwid);
                   }
               }).catch(m => {
                   // do nothing
               })
            });
        }
    },
    async finishVerification(message, uwid) {
        let newUser = {
            discordId: message.author.id,
            uwid: uwid,
            verified: false,
            token: Math.floor(Math.random() * 899999 + 100000)
        };

        await User.replaceOne({ discordId: message.author.id }, newUser, { upsert: true });

        await mailAccount.sendMail({
            from: `"SE Bot" <${process.env.EMAIL}>`,
            to: `${uwid}@uwaterloo.ca`,
            subject: `UW Verification Code [${newUser.token}]`,
            text: `Token: ${newUser.token}`,
            html: `<b>HONK</b><br>
                Hey, your verification code is: <b>${newUser.token}</b><br>
                You can verify yourself using this command in the Discord channel:<br>
                <code>${process.env.PREFIX}confirm ${newUser.token}</code>
                <br><br>
                Also, if you have time, reply to this email with something random to prevent this account from being flagged as spam.
                <hr>
                This email was sent because a Discord user attempted to verify with your email. If you did not request this email, please ignore this message.`,
        });

        return sendSuccessEmbed(message.channel, "Verification Email Sent", `${message.author}, we've sent a token to your UW email. Go ahead and type \`${process.env.PREFIX}confirm TOKEN\` to finish the verification process!`, message.author);
    }
}