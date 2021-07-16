const express = require('express');
const router = express.Router();

//mendapatkan accessCode
router.use('/', (req, res, next) => {
    const authcode = req.query.code;
    console.log('[user.js] - Mendapatkan authCode:', authcode);
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
