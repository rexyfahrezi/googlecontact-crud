const express = require('express');
const router = express.Router();


let authUrl = 'auth';

router.get('/', function(req, res, next) {
  authUrl = req.app.get('authentUrl');
  res.render('index', { title: 'Ini Title', GENERATED_GOOGLE_URL: `${authUrl}` });
});

module.exports = router;
