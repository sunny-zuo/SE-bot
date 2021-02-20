const fs = require('fs');
const path = require('path');
const CryptoJS = require('crypto-js');

const hashes = new Map();

/**
 * Read all files containing uwid hashes to build a map for easier usage.
 * Hash files should be named "se20XX.hash" and contain one hash per line
 */
async function buildHashMap() {
    const emailHashFolder = './data/';
    const files = fs.readdirSync(emailHashFolder);

    for (fileName of files) {
        if (fileName.endsWith('.hash')) {
            const cohort = fileName.replace('.hash', '').replace('se', 'SE ');
            const filePath = path.join(emailHashFolder, fileName);
            const fileHashes = fs.readFileSync(filePath, 'utf8').split('\n');

            for (hash of fileHashes) {
                if (hash !== "") {
                    hashes.set(hash, cohort);
                }
            }
        }
    };
}

/**
 * Assigns all correct roles to a user based on their user data.
 * 
 * @param {Guild} guild Server to assign role(s) on
 * @param {GuildMember} user Represents a member of a guild
 * @param {User} userInfo User data in object format with keys as described in the mongoose model
 */
async function assignRoles(guild, user, userInfo) {
    const userHash = CryptoJS.SHA256(userInfo.uwid).toString(CryptoJS.enc.Hex);
    const cohort = hashes.get(userHash);
    const roles = [];
    if (cohort) {
        roles.push(guild.roles.cache.find(role => role.name === "SE"));
        roles.push(guild.roles.cache.find(role => role.name === cohort));

        const cohortYear = Number(cohort.replace(/[^0-9]/g, ''));
        roles.push(cohortYear < 2021
            ? guild.roles.cache.find(role => role.name === 'Alumn')
            : cohortYear % 2 === 0 
            ? guild.roles.cache.find(role => role.name === 'A-Soc')
            : guild.roles.cache.find(role => role.name === 'B-Soc'));
    } else {
        roles.push(guild.roles.cache.find(role => role.name === "Non-SE"));
    }
    user.roles.add(roles);
}

module.exports = { assignRoles, buildHashMap };