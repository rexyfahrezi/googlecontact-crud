const express = require('express');
const router = express.Router();

router.get('/callback', function(req, res, next) {
  const authcode = encodeURIComponent(req.query.code);
  console.log(req.query.code);
  res.redirect('/users?valid=' + authcode);
});

module.exports = router;
