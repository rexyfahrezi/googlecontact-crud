const express = require('express');
const {google} = require('googleapis');
const createError = require('http-errors');
const path = require('path');

const indexRouter = require('./routes/index');
const oauthRouter = require('./routes/auth');
const usersRouter = require('./routes/users');

const app = express();
const port = 3000;

const scopes = ['https://www.googleapis.com/auth/contacts'];

const oAuth2Client = new google.auth.OAuth2(
  "126642494520-ol6ih978on66eb3h027ckqjm1unvli9h.apps.googleusercontent.com",
  "k1fZZwARpqHDdKXhgzoDAGwl",
  "http://localhost:3000/auth/callback"
);

var authUrl = oAuth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent'
});

app.set('authentUrl', authUrl);
console.log('Authorize this app by visiting this url:', authUrl);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', oauthRouter);

app.listen(port, () => {
  console.log(`listening on ${port}`);
});

module.exports = app;
