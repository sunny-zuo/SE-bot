const fs = require('fs');
const path = require('path');
const CryptoJS = require('crypto-js');
const Discord = require('discord.js');

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
 * Returns whether or not a uwid is in the list of SE uwid hashes.
 * 
 * @param {String} uwid 
 */
function isUserSE(uwid) {
    return hashes.get(CryptoJS.SHA256(uwid).toString(CryptoJS.enc.Hex)) !== undefined;
}

/**
 * Assigns all correct roles to a user based on their user data.
 * 
 * @param {Discord.Guild} guild Server to assign role(s) on
 * @param {Discord.GuildMember} user Represents a member of a guild
 * @param {Object} userInfo User data in object format with keys as described in the mongoose model
 */
async function assignRoles(guild, user, userInfo) {
    const userHash = CryptoJS.SHA256(userInfo.uwid).toString(CryptoJS.enc.Hex);
    const cohort = hashes.get(userHash);
    const roles = [];
    if (cohort) {
        const cohortYear = Number(cohort.replace(/[^0-9]/g, ''));
        if (cohortYear < 2021) {
            roles.push(guild.roles.cache.find(role => role.name === 'Alumn'));
        } else {
            roles.push(guild.roles.cache.find(role => role.name === "SE"));
            roles.push(guild.roles.cache.find(role => role.name === cohort));
            roles.push(
                cohortYear % 2 === 0
                    ? guild.roles.cache.find(role => role.name === 'A-Soc')
                    : guild.roles.cache.find(role => role.name === 'B-Soc')
            );
        }
    } else {
        roles.push(guild.roles.cache.find(role => role.name === "Non-SE"));
    }
    user.roles.add(roles);
}

module.exports = { assignRoles, buildHashMap, isUserSE };