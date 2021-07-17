const express = require('express');
const {google} = require('googleapis');
const fs = require('fs');
const createError = require('http-errors');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');

const indexRouter = require('./routes/index');
const oauthRouter = require('./routes/auth');
const usersRouter = require('./routes/users');

const app = express();
const port = 3000;

const G_CLIENT_ID = "126642494520-ol6ih978on66eb3h027ckqjm1unvli9h.apps.googleusercontent.com";
const G_CLIENT_SECRET = "k1fZZwARpqHDdKXhgzoDAGwl";
const G_REDIRECT_URL = "http://localhost:3000/auth/callback";


// view engine setup
app.set('view engine', 'ejs');

// third party middleware
//app.use(morgan('dev'));
app.use(express.static('public'));
app.use(session({
  secret: 'gcontact-secret-19890913007',
  resave: true,
  saveUninitialized: true
}));

// router level middleware?
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', oauthRouter);


  const oAuth2Client = new google.auth.OAuth2(
    G_CLIENT_ID,
    G_CLIENT_SECRET,
    G_REDIRECT_URL
  );

const getAuthUrl = () => {
  const scopes = ['https://www.googleapis.com/auth/contacts'];
  
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  return url;
}

authUrl = getAuthUrl();
app.set('authentUrl', authUrl);
console.log('[app.js] - Mendapatkan authUrl');

app.set('oAuth2Client', oAuth2Client);
app.set('googleapis', google);

app.listen(port, () => {
  console.log(`[app.js] - Listening on: ${port}`);
});

module.exports = app;