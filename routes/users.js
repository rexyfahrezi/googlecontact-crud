const express = require('express');
const { google } = require('googleapis');
const router = express.Router();


router.get('/', function(req, res) {

    const oAuth2Client = req.app.get('oAuth2Client');
    const service = google.people({version: 'v1', oAuth2Client});
    
    
    const getDataMe = async function () {
        return await service.people.get({
            resourceName: 'people/me',
            personFields: 'emailAddresses,names',
            auth: oAuth2Client,
        })
    }
    
    const tampilKontak = async function () {
        return await service.people.connections.list({
            resourceName: 'people/me',
            pageSize: 10,
            personFields: 'names,emailAddresses',
            auth: oAuth2Client,
        });
    };
    
    async function renderData() {
        try {

            const dataKontak = await tampilKontak()
            const dataUser = await getDataMe();

            const givenName = JSON.stringify(dataUser.data.names[0].givenName);
            const displayName = JSON.stringify(dataUser.data.names[0].displayName);
            const emailAddr = JSON.stringify(dataUser.data.emailAddresses[0].value);

            const arrKontak = dataKontak.data.connections;
            let listKontak = [];            

            if(arrKontak) {
                arrKontak.forEach(function(kontak, i) {
                    if (!arrKontak[i].emailAddresses){
                        listKontak.push({
                            "kontaknama": kontak.names[0].displayName,
                            "kontakemail": "Tidak ada data email"
                        });
                    } 
                    else {
                        listKontak.push({
                            "kontaknama": kontak.names[0].displayName,
                            "kontakemail": kontak.emailAddresses[0].value
                        });
                    }
                });
            } else {
                console.log('Tidak ada data kontak')
            }
            
            //console.log(arrKontak[1].emailAddresses[0].value);

            res.render('users', { 
                title: 'Users Page', 
                namaLengkapUser: displayName,
                namaUser: givenName,
                emailUser: emailAddr,
                namaKontak: listKontak
               });
            
        } catch (err) {
            return console.log('promiseerror', err);
        }
    }
    renderData();
});






function listConnectionNames(auth) {
    service.people.connections.list({
      resourceName: 'people/me',
      pageSize: 10,
      personFields: 'names,emailAddresses',
    }, (err, res) => {
      if (err) return console.error('The API returned an error: ' + err);
      const connections = res.data.connections;
      if (connections) {
        console.log('Connections:');
        connections.forEach((person) => {
          if (person.names && person.names.length > 0) {
            console.log(person.names[0].displayName);
          } else {
            console.log('No display name found for connection.');
          }
        });
      } else {
        console.log('No connections found.');
      }
    });
  }


  








module.exports = router;