const express = require('express');
const router = express.Router();

router.get('/callback', function(req, res, next) {
  const authCode = req.query.code;
  res.redirect(`/users`);
});

module.exports = router;
