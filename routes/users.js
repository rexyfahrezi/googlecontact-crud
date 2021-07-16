const express = require('express');
const { google } = require('googleapis');
const { oauth2 } = require('googleapis/build/src/apis/oauth2');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const router = express.Router();

const getAccessToken = function (req, res, next){
    const authcode = req.query.code;
    const oauth2Client = req.app.get('getoAuth2Client');

    console.log('[user.js] - Mendapatkan authCode:', authcode);
    console.log('[user.js] - Mendapatkan oauth2Client data');
    console.log('[user.js] - Mencoba mendapatkan access & refreshToken');
    
    oauth2Client.getToken(authcode, (err, tokens) => {
        oauth2Client.setCredentials(tokens);
        //console.log(oauth2Client)
        console.log(tokens);
        //return oauth2Client;
    })
    next();
    //console.log(oauth2Client);
};

router.use(getAccessToken);

//const oauth2Client = req.app.get('getoAuth2Client');
//console.log(oauth2Client);

router.get('/', function(req, res) {
    
    const token = 'a'
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