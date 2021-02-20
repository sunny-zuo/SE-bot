const ReactionRole = require('./models/reactionRole.model');

/**
 * Subscribe to all reaction roles stored in the database
 * 
 * @param {*} client Discord.js client
 */
async function subscribeAll(client) {
    const reactionRoles = await ReactionRole.find({});
    reactionRoles.forEach(rr => subscribe(client, rr));
}
/**
 * Subscribe to a reaction role embed for role assignment
 * 
 * @param {Client} client Discord.js client
 * @param {ReactionRole} rr MongoDB ReactionRole document
 */
async function subscribe(client, rr) {
    const message = await client.channels.cache.get(rr.channelId).messages.fetch(rr.messageId);
    const roles = {};
    rr.roles.forEach(role => {
        message.react(role.emote);
        roles[role.emoteName] = message.guild.roles.cache.get(role.roleId);
    });

    const collector = message.createReactionCollector((reaction, user) => user.id !== client.user.id, { dispose: true });
    collector.on('collect', async (reaction, user) => {
        const member = await message.guild.members.fetch(user.id);
        member.roles.add(roles[reaction.emoji.name]).catch(console.error);
    });

    collector.on('remove', async (reaction, user) => {
        const member = await message.guild.members.fetch(user.id);
        member.roles.remove(roles[reaction.emoji.name]).catch(console.error);
    });
}

module.exports = { subscribeAll, subscribe };