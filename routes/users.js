const express = require('express');
const { google } = require('googleapis');
const { oauth2 } = require('googleapis/build/src/apis/oauth2');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const router = express.Router();

const getAccessToken = async function (req, res, next){
    const authcode = req.query.code;
    const oAuth2Client = req.app.get('oAuth2Client');

    console.log('[user.js] - Mendapatkan authCode:', authcode);
    console.log('[user.js] - Mendapatkan oauth2Client data');
    console.log('[user.js] - Mencoba mendapatkan access & refreshToken');
    
    // oauth2Client.getToken(authcode, (err, tokens) => {
    //     oauth2Client.setCredentials(tokens);
    //     //console.log(oauth2Client)
    //     console.log(tokens);
    //     //return oauth2Client;
    // })

    try {
        const {tokens} = await oAuth2Client.getToken(authcode);
        //console.log(tokens)
        oAuth2Client.setCredentials(tokens);
    } catch (error) {
        console.log('error', error);
    };
    //console.log(oAuth2Client);
    next();
    //console.log(oauth2Client);
};

router.use(getAccessToken);

//const oauth2Client = req.app.get('getoAuth2Client');
//console.log(oauth2Client);

router.get('/', function(req, res) {
    const oAuth2Client = req.app.get('oAuth2Client');
    console.log(oAuth2Client)
    const token = JSON.stringify(oAuth2Client);

    //console.log(req.tokens)
    const user = 'Rex';
    const authcode = req.query.code;

    res.render('users', { 
        title: 'Users Page', 
        authcode: authcode,
        user: user,
        token: token
       });
});


module.exports = router;