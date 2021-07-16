const express = require('express');
//const app = require('app');
const router = express.Router();

//mendapatkan accessToken & refreshToken
router.use('/', (req, res, next) => {
    const authcode = req.query.code;
    const oauth2Client = req.app.get('getOAuthClient');
    const session = req.session;
    console.log('[user.js] - Mendapatkan authCode:', authcode);
    console.log('[user.js] - Mendapatkan oauth2Client data');
    console.log('[user.js] - Mencoba mendapatkan access & refreshToken');

    oauth2Client.getToken(authcode, function(err, tokens) {
        console.log("tokens : ", tokens);
        // Now tokens contains an access_token and an optional refresh_token. Save them.
        if (!err) {
            oauth2Client.setCredentials(tokens);
            session["tokens"] = tokens;
        }
    });
    next();
});


router.get('/', function(req, res) {
    const user = 'Fahrz';
    const authcode = req.query.code;
    
    res.render('users', { 
        title: 'Users Page', 
        authcode: authcode,
        user: user
       });
});


module.exports = router;