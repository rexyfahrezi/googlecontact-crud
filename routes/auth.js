const express = require('express');
const router = express.Router();

router.get('/callback', function(req, res, next) {
  res.send('wait for auth');
});

module.exports = router;
