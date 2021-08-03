const express = require('express');
const {google} = require('googleapis');
const expressLayout = require('express-ejs-layouts');
const session = require('express-session');

const indexRouter = require('./routes/index');
const oauthRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const logoutRouter = require('./routes/logout');

require('dotenv').config();
const app = express();
const port = process.env.PORT;


const G_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const G_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const G_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;


// view engine setup
app.set('view engine', 'ejs');
app.use(expressLayout);

//Body parser utk ngambil data dari method POST
app.use(express.urlencoded())
// third party middleware
//app.use(morgan('dev'));
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {},
  resave: true,
  saveUninitialized: true
}));

// router level middleware?
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', oauthRouter);
app.use('/logout', logoutRouter);


const oAuth2Client = new google.auth.OAuth2(
    G_CLIENT_ID,
    G_CLIENT_SECRET,
    G_REDIRECT_URL
  );

const getAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/contacts',
    'profile',
    'email',
    'https://www.googleapis.com/auth/contacts.readonly',
    'https://www.googleapis.com/auth/directory.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];
  
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  return url;
}




//console.log(isLoggedIn())

authUrl = getAuthUrl();
app.set('authentUrl', authUrl);
console.log('[app.js] - Mendapatkan authUrl');

app.set('oAuth2Client', oAuth2Client);

app.set('googleapis', google);

app.listen(port, () => {
  console.log(`[app.js] - Listening on: ${port}`);
});

module.exports = app;

exports.getoAuth2Client = function() { return oAuth2Client; };
