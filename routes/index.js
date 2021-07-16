const express = require('express');
const router = express.Router();


let authUrl = '';

router.get('/', function(req, res) {
  authUrl = req.app.get('authentUrl');
  res.render('index', { 
    title: 'Home Page', 
    authurl: authUrl
   });
});

module.exports = router;
