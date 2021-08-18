const express = require('express');
const router = express.Router();
const {google} = require('googleapis');

const authserv = new google.auth.GoogleAuth({
  keyFile: 'servicekey.json',
  scopes: [
  'https://www.googleapis.com/auth/contacts',
  'profile'],
});

const service = google.people({version: 'v1', authserv});


router.get('/', async function(req, res) {
  
  const data = await service.people.get({
    resourceName: `people/me`,
    personFields: 'emailAddresses,names',
    auth: authserv,
  });

  console.log(data.data.names);
  res.send(data.data.names);
});

module.exports = router;