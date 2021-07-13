const express = require('express');
const {google} = require('googleapis');
const createError = require('http-errors');
const path = require('path');

const indexRouter = require('./routes/index');
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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', indexRouter);
app.use('/users', usersRouter);


app.listen(port, () => {
  console.log(`listening on ${port}`);
});

module.exports = app;
