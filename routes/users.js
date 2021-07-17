const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
    const oAuth2Client = req.app.get('oAuth2Client');
    console.log(oAuth2Client)
    const token = JSON.stringify(oAuth2Client);

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