const express = require('express');
const router = express.Router();
const expressLayout = require('express-ejs-layouts');


let authUrl = '';

router.get('/', function(req, res) {

  authUrl = req.app.get('authentUrl');
  let loggedin = false
  if (req.session.auth){
    loggedin = true
  }
  //console.log(loggedin);

  res.render('index', { 
    title: 'Home Page', 
    layout: 'layouts/main-layout',
    authurl: authUrl,
    loginstatus: loggedin
   });
});

module.exports = router;
