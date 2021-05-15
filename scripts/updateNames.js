const dotenv = require('dotenv').config();
const User = require('../models/user.model');
const axios = require('axios').default;

const mongoose = require('mongoose');
axios.defaults.validateStatus = false;
/* Initially, the bot did not request the user's name. This script uses each user's
 * refresh token to make a new request to Microsoft Graph API to get the user's name
 * and update the database accordingly
*/

async function updateNames() {
    const users = await User.find({}).exec();

    let missingTokenCount = 0;
    let updatedCount = 0;
    let alreadyUpdatedCount = 0;

    for (user of users) {
        console.log(`Checking uwid ${user.uwid}`)
        if (user.refreshToken) {
            if (user.givenName) {
                alreadyUpdatedCount++;
                continue;
            }
            const getTokenParams = new URLSearchParams();
            getTokenParams.append('client_id', process.env.CLIENT_ID);
            getTokenParams.append('scope', 'user.read offline_access');
            getTokenParams.append('redirect_uri', `${process.env.SERVER_URI}/authorize`);
            getTokenParams.append('grant_type', 'refresh_token');
            getTokenParams.append('client_secret', process.env.CLIENT_SECRET);
            getTokenParams.append('refresh_token', user.refreshToken);

            const getTokenRes = await axios.post(`https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`, getTokenParams).catch(err => console.log(err));
            if (getTokenRes.status !== 200) {
                console.log(`Error fetching user with Discord id ${user.discordId}. This is likely because they revoked app access.`)
                console.log(getTokenRes.data);
            }

            const { access_token, refresh_token } = getTokenRes.data;

            const userDataReq = await axios.get(`https://graph.microsoft.com/v1.0/me?$select=department,createdDateTime,userPrincipalName,givenName,surname`, {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });

            if (userDataReq.status !== 200) {
                console.log(`We had issues fetching data for user with Discord id ${user.discordId}`);
                continue;
            }

            user.refreshToken = refresh_token;
            user.givenName = userDataReq.data.givenName;
            user.surname = userDataReq.data.surname;

            await user.save();
            updatedCount++;
        } else {
            missingTokenCount++;
        }
    }

    console.log(`Updating names completed. ${updatedCount} users were updated, and ${missingTokenCount} users could not be updated. ${alreadyUpdatedCount} users were already updated`)
}

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log('MongoDB database connection established');
    updateNames();
})