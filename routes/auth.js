const express = require('express');
const router = express.Router();

const getAccessToken = async function (req, res, next){
  const authcode = req.query.code;
  const oAuth2Client = req.app.get('oAuth2Client');

  console.log('[auth.js] - Mendapatkan authCode:', authcode);
  console.log('[auth.js] - Mendapatkan oauth2Client data');
  console.log('[auth.js] - Mencoba mendapatkan access & refreshToken');
  
  try {
    const {tokens} = await oAuth2Client.getToken(authcode);
    oAuth2Client.setCredentials(tokens);
    req.session.auth = tokens
    console.log('[auth.js] - Sukses mendapatkan access & refreshToken');
  } catch (error) {
      console.log('error', error);
  };
  next();
};

router.use(getAccessToken);


router.get('/callback', function(req, res) {
  console.log('[auth.js] - User berhasil login, redirecting to /users. .');
  res.redirect('/users');
});

module.exports = router;
