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

    const apiBuatKontak = async function (body) {
        return await service.people.createContact({
            personFields: 'names,emailAddresses,phoneNumbers',
            requestBody : JSON.stringify(body),
            auth: oAuth2Client,
        })
    }
    
    const apiTampilKontak = async function () {
        return await service.people.connections.list({
            resourceName: 'people/me',
            pageSize: 10,
            personFields: 'names,emailAddresses,phoneNumbers',
            auth: oAuth2Client,
        });
    };
    
    async function renderData() {
        try {
            
            //akses google API
            const dataKontak = await apiTampilKontak();
            const dataUser = await getDataMe();

            //membuat kontak
            const dataBuat = buatKontak('Budi', '0888999', 'budi@mail');
            apiBuatKontak(dataBuat);
            console.log(`[users.js] - Sukses membuat kontak baru`)
            
            //ini data user
            const givenName = JSON.stringify(dataUser.data.names[0].givenName);
            const displayName = JSON.stringify(dataUser.data.names[0].displayName);
            const emailAddr = JSON.stringify(dataUser.data.emailAddresses[0].value);

            //menampilkan list kontak
            const arrKontak = dataKontak.data.connections;
            let listKontak = []
            renderListcontact(arrKontak, listKontak)
            console.log('[users.js] - Sukses menampilkan renderListcontact')


            // render ke page user
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


function renderListcontact(arrKontak, listKontak) {
          
    if(arrKontak) {
        arrKontak.forEach(function(kontak, i) {
            if (!arrKontak[i].emailAddresses){
                if(!arrKontak[i].phoneNumbers){
                    listKontak.push({
                        "kontaknama": kontak.names[0].displayName,
                        "kontakemail": "Tidak ada email",
                        "nomorhp": "Tidak ada nomor handphone"
                    });
                } 
                else {
                    listKontak.push({
                        "kontaknama": kontak.names[0].displayName,
                        "kontakemail": "Tidak ada email",
                        "nomorhp": kontak.phoneNumbers[0].value    
                });
                }
            } 
            else if ((!arrKontak[i].phoneNumbers)) {
                listKontak.push({
                    "kontaknama": kontak.names[0].displayName,
                    "kontakemail": kontak.emailAddresses[0].value,
                    "nomorhp": "Tidak ada nomor handphone"
                });
            }
            else {
                listKontak.push({
                    "kontaknama": kontak.names[0].displayName,
                    "kontakemail": kontak.emailAddresses[0].value,
                    "nomorhp": kontak.phoneNumbers[0].value
                });
            }
        });
    } else {
        console.log('Tidak ada data kontak')
    }

    return listKontak
}

  
function buatKontak(nama, nohp, email){
    body={
        "names": [
            {
                "givenName": nama
            }
        ],
        "phoneNumbers": [
            {
                'value': nohp
            }
        ],
        "emailAddresses": [
            {
                'value': email
            }
        ]
    }
    return body
}







module.exports = router;