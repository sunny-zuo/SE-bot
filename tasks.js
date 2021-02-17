const TempRole = require('./models/tempRole.model');

async function runTaskLoop(client) {
    handleRoleExpiry(client);
}

async function handleRoleExpiry(client) {
    const toRevokeList = await TempRole.find({ revoked: false, expiry: { $lte: new Date() }});
    
    for (toRevoke of toRevokeList) {
        const guild = client.guilds.cache.get(toRevoke.guild_id);
        const role = guild.roles.cache.get(toRevoke.role_id);
        const user = await guild.members.fetch(toRevoke.assigned_to);

        if (user === undefined || role === undefined) {
            await TempRole.findByIdAndUpdate(toRevoke._id, { revoked: true });
        }
        await user.roles.remove(role).then(async () => {
            await TempRole.findByIdAndUpdate(toRevoke._id, { revoked: true });
        }).catch(err => console.log(err));
    }
}

module.exports = { runTaskLoop };