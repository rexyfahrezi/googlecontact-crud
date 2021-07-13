const express = require('express');
const {google} = require('googleapis');
const createError = require('http-errors');
const path = require('path');

const indexRouter = require('./routes/index');
const oauthRouter = require('./routes/auth');
const usersRouter = require('./routes/users');

const app = express();
const port = 3000;

const scopes = ['https://www.googleapis.com/auth/contacts',
        'https://www.googleapis.com/auth/contacts.readonly',
        'https://www.googleapis.com/auth/directory.readonly',
        'https://www.googleapis.com/auth/user.addresses.read',
        'https://www.googleapis.com/auth/user.birthday.read',
        'https://www.googleapis.com/auth/user.emails.read',
        'https://www.googleapis.com/auth/user.gender.read',
        'https://www.googleapis.com/auth/user.organization.read',
        'https://www.googleapis.com/auth/user.phonenumbers.read',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];

const oAuth2Client = new google.auth.OAuth2(
  "126642494520-ol6ih978on66eb3h027ckqjm1unvli9h.apps.googleusercontent.com",
  "k1fZZwARpqHDdKXhgzoDAGwl",
  "http://localhost:3000/auth/callback"
);

const authUrl = oAuth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent'
});

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
