const express = require('express');
const router = express.Router();


const authUrl = 'a';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Ini Title', GENERATED_GOOGLE_URL: `${authUrl}` });
});

module.exports = router;
