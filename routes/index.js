const express = require('express');
const router = express.Router();
const expressLayout = require('express-ejs-layouts');


let authUrl = '';

router.get('/', function(req, res) {
  authUrl = req.app.get('authentUrl');
  res.render('index', { 
    title: 'Home Page', 
    layout: 'layouts/main-layout',
    authurl: authUrl
   });
});

module.exports = router;
