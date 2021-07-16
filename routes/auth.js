const express = require('express');
const router = express.Router();

router.get('/callback', function(req, res) {
  const authcode = encodeURIComponent(req.query.code);
  console.log('[auth.js] User berhasil login, redirecting to /users. .');
  res.redirect('/users?code=' + authcode);
});

module.exports = router;
