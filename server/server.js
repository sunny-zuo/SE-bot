const CryptoJS = require('crypto-js');
const axios = require('axios');
const express = require('express');
const app = express();
const port = process.env.SERVER_PORT || 5000;
const User = require('../models/user.model');
const { assignRoles } = require('../seRoles');

app.get('/', (req, res) => {
    res.send('There\'s nothing here!');
});

app.get('/verify/:encodedId', (req, res) => {
    if (req.params.encodedId) {
        res.redirect(`https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${process.env.SERVER_URI}/authorize&response_mode=query&scope=offline_access%20user.read&state=${req.params.encodedId}`);
    } else {
        res.send('This authorization link is invalid. Please get a new link by messaging the bot with $verify');
    }
});

app.get('/authorize', async (req, res) => {
    try {
        const decodedUID = CryptoJS.AES.decrypt(req.query.state.replace(/_/g, '/').replace(/-/g, '+'), process.env.AES_PASSPHRASE).toString(CryptoJS.enc.Utf8);
        if (!decodedUID.endsWith('-sebot')) {
            res.send('Error: The link you followed appears to be malformed. Try verifying again.');
            return;
        }
        const discordId = decodedUID.replace('-sebot', '');

        const getTokenParams = new URLSearchParams();
        getTokenParams.append('client_id', process.env.CLIENT_ID);
        getTokenParams.append('scope', 'user.read offline_access');
        getTokenParams.append('redirect_uri', 'https://sebot.sunnyzuo.com/authorize');
        getTokenParams.append('grant_type', 'authorization_code');
        getTokenParams.append('client_secret', process.env.CLIENT_SECRET);
        getTokenParams.append('code', req.query.code);

        const getTokenRes = await axios.post(`https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`, getTokenParams).catch(err => console.log(err));
        if (getTokenRes.status !== 200) {
            res.send('We had issues fetching your data. Please try again later.');
            return;
        }
        const { access_token, refresh_token } = getTokenRes.data;

        const userDataReq = await axios.get(`https://graph.microsoft.com/v1.0/me?$select=department,createdDateTime,userPrincipalName`, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        if (userDataReq.status !== 200) {
            res.send('We had issues fetching your data. Please try again later.');
            return;
        }

        const uwid = userDataReq.data.userPrincipalName.replace('@uwaterloo.ca', '');
        let user = {
            discordId: discordId,
            uwid: uwid,
            department: userDataReq.data.department,
            o365CreatedDate: new Date(userDataReq.data.createdDateTime),
            refreshToken: refresh_token
        }

        await User.replaceOne({ uwid: uwid }, user, { upsert: true });
        assignRoles(user);

        res.send('You\'ve been verified successfully! You can close this window and return to Discord.');
    } catch (e) {
        console.error(e);
        res.send('We ran into an unknown error. Please try again later or message an admin on Discord for help.')
    }
})

app.listen(port, () => {
    console.log(`Express server running on port ${port}`);
});