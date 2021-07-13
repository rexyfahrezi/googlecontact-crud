const express = require('express');
const {google} = require('googleapis');

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

app.get('/', (req, res) => {
    res.send('tes.');
  });

app.listen(port, () => {
    console.log(`listening on ${port}`);
  });