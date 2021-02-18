const TempRole = require('../models/tempRole.model');
const { sendErrorEmbed, sendSuccessEmbed } = require('../util');

module.exports = {
    name: 'temprole',
    description: 'Assign a role to a user for a specified period of time',
    args: true,
    guildOnly: true,
    displayHelp: true,
    permissions: ["MANAGE_ROLES"],
    usage: "(user) (role) (duration)",
    async execute(message, args) {
        const argArray = [];
        const regex = new RegExp('"[^"]+"|[\\S]+', 'g');

        args.match(regex).forEach(element => {
            if (!element) return;
            return argArray.push(element.replace(/"/g, ''));
        });

        if (argArray.length < 3) {
            sendErrorEmbed(message.channel, 'Error: Missing Command Arguments', `Not all required arguments were provided. \nCommand usage: ${process.env.PREFIX}temprole (user) (role) (duration)`);
            return;
        };

        const user = message.mentions.members.first();
        const role = message.guild.roles.cache.find(r => r.name === argArray[1]);
        const duration = this.parseDuration(argArray[2]);

        if (!role) {
            sendErrorEmbed(message.channel, 'Error: Invalid Role Name', `An invalid role name was provided. Make sure the role exists, and use "" to enclose role names with spaces.`);
            return;
        }
        if (!user) {
            sendErrorEmbed(message.channel, 'Error: Invalid User', 'An invalid user (or no user) was specified to assign the role to.');
            return;
        }
        
        user.roles.add(role).then(async () => {
            const tempRole = new TempRole({
                assigned_by: message.author.id,
                assigned_to: user.id,
                role_id: role.id,
                guild_id: message.guild.id,
                expiry: new Date(Date.now() + duration.durationInMs),
                revoked: false
            });
            await tempRole.save();

            sendSuccessEmbed(message.channel, 'Temporary Role Succesfully Added', `${message.author} has given ${user} the ${argArray[1]} role for ${duration.months} months, ${duration.weeks} weeks, ${duration.days} days, and ${duration.hours} hours.`);
        }).catch(err => {
            sendErrorEmbed(message.channel, 'Error: Invalid Bot Permissions', 'The bot does not have permission to assign this role. Please make sure the bot has the "Manage Roles" permission and is placed above the role you would like to assign.');
        });
    },
    parseDuration(durationString) {
        // Regex to match durations in the format 8m2w7d5h (8 months, 2 weeks, 7 days and 5 hours)
        const hours = /\d+(?=\s*h)/g.test(durationString) ? Number([durationString.match(/\d+(?=\s*h)/g)]) : 0;
        const days = /\d+(?=\s*d)/g.test(durationString) ? Number([durationString.match(/\d+(?=\s*d)/g)]) : 0;
        const weeks = /\d+(?=\s*w)/g.test(durationString) ? Number([durationString.match(/\d+(?=\s*w)/g)]) : 0;
        const months = /\d+(?=\s*m)/g.test(durationString) ? Number([durationString.match(/\d+(?=\s*m)/g)]) : 0;
        return {
            hours: hours,
            days: days,
            weeks: weeks,
            months: months,
            durationInMs: (hours + days * 24 + weeks * 168 + months * 720) * 1000 * 60 * 60
        }
    }
}