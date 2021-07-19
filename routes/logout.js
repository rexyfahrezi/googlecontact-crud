const express = require('express');
const router = express.Router();


router.get('/', function(req, res) {
    const oAuth2Client = req.app.get('oAuth2Client');

    oAuth2Client.setCredentials('');
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
