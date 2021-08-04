const express = require('express');
const { google } = require('googleapis');
const session = require('express-session');
const { search } = require('.');
const router = express.Router();


let oAuth2Client = router.get('/', function(req, res, next) {
                        oAuth2Client = req.app.get('oAuth2Client');
                        next();
                        return oAuth2Client;
                    })


const service = google.people({version: 'v1', oAuth2Client});
const sheets = google.sheets({version: 'v4', oAuth2Client});

const getFromSheet = async function (sheetid,sheetname) {
    return await sheets.spreadsheets.values.get({
        spreadsheetId: sheetid,
        range: `${sheetname}!A1:Z1000`,
        auth: oAuth2Client,
    })
}

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
        pageSize: 2000,
        personFields: 'names,emailAddresses,phoneNumbers',
        auth: oAuth2Client,
        sortOrder: 'FIRST_NAME_ASCENDING'
    });
};

const apiGetDetailKontak = async function (id) {
    return await service.people.get({
        resourceName: id,
        personFields: 'names,emailAddresses,phoneNumbers',
        auth: oAuth2Client,
    })
}

const apiEditKontak = async function (id, data) {
    //console.log(data)
    return await service.people.updateContact({
        resourceName: id,
        personFields: 'names,emailAddresses,phoneNumbers',
        updatePersonFields : 'names,emailAddresses,phoneNumbers',
        requestBody: data,
        auth: oAuth2Client
    })
}

const apiDeleteKontak = async function (id) {  
    return await service.people.deleteContact({
        resourceName: id,
        auth: oAuth2Client,
    });
};

const apiSearchKontak = async function (search) {
    return await service.people.searchContacts({
        pageSize: 30,
        query: search,
        readMask: 'names,emailAddresses,phoneNumbers',
        auth: oAuth2Client,
    });
}

router.get('/', function(req, res) {

    let loggedin = true
    if (!req.session.auth){
        loggedin = false
        res.redirect('/');
    }

    async function renderData() {
        try {

            let listKontak = []
            let listkontaksearch = []
            let searchquery = req.query.q;


            //akses google API
            const dataKontak = await apiTampilKontak();
            const dataUser = await getDataMe();

            //ini data user
            const givenName = dataUser.data.names[0].givenName;
            const displayName = dataUser.data.names[0].displayName;
            const emailAddr = dataUser.data.emailAddresses[0].value;
            
            //kalo ada query /search?q=
            if (searchquery) {
                const search = await apiSearchKontak(searchquery);
                const datasearch = search.data.results;

                datasearch.forEach(function(data, i) {
                    listkontaksearch.push(datasearch[i].person);
                });

                renderListcontact(listkontaksearch, listKontak)
                console.log('[users.js] - Sukses mencari kontak');
            } else {
                //ngambil list kontak dari API kalo gada query
                const arrKontak = dataKontak.data.connections;
                //di render, masukin ke listKontak[]
                renderListcontact(arrKontak, listKontak)
                console.log('[users.js] - Sukses menampilkan renderListcontact')
            }

            // render ke page user
            res.render('users', { 
                title: 'Users Page', 
                layout: 'layouts/main-layout',
                namaLengkapUser: displayName,
                namaUser: givenName,
                emailUser: emailAddr,
                peopleKontak: listKontak,
                loginstatus: loggedin,
               });
            
        } catch (err) {
            res.status(404).send('Data tidak ditemukan!');
            return console.log('promiseerror', err);
        }
    }

    renderData();
});

router.get('/add', async function(req, res) {
    let loggedin = true
    if (!req.session.auth){
        loggedin = false
        res.redirect('/');
    }

    res.render('add-kontak', { 
        title: 'Tambah Kontak', 
        layout: 'layouts/main-layout',
        loginstatus: loggedin
       });
});

router.post('/add', async function(req, res) {
    let loggedin = true
    if (!req.session.auth){
        loggedin = false
        res.redirect('/');
    }

    //console.log(req.body)
    const dataBuat = parseKontak(req.body.nama, req.body.nohp, req.body.email);
    apiBuatKontak(dataBuat);
    
    console.log(`[users.js] - Sukses membuat kontak baru`)
    //res.send('Kontak berhasil disimpan')
    res.render('success-modal', { 
        title: 'Sukses Menyimpan Kontak', 
        message: 'Kontak berhasil disimpan',
        layout: 'layouts/main-layout',
        loginstatus: loggedin,
       });
});

router.get('/delete/people/:id', async function(req, res) {
    let loggedin = true
    if (!req.session.auth){
        loggedin = false
        res.redirect('/');
    }

    const id = `people/${req.params.id}`;
    await apiDeleteKontak(id)
    res.render('success-modal', { 
        title: 'Sukses Menghapus Kontak', 
        message: 'Kontak berhasil dihapus',
        layout: 'layouts/main-layout',
        loginstatus: loggedin
       });
});

router.get('/edit/people/:id', async function(req, res) {
    let loggedin = true
    if (!req.session.auth){
        loggedin = false
        res.redirect('/');
    }

    const id = `people/${req.params.id}`;
    const detailContact = await apiGetDetailKontak(id)

    const displayName = detailContact.data.names[0].displayName;
    const emailAddr = detailContact.data.emailAddresses[0].value;
    const phoneNumbers = detailContact.data.phoneNumbers[0].value;
    const idKontak = detailContact.data.resourceName;


    res.render('edit-kontak', { 
        title: 'Edit Kontak', 
        layout: 'layouts/main-layout',
        namakontak: displayName,
        emailkontak: emailAddr,
        nohpkontak: phoneNumbers,
        idKontak: idKontak,
        loginstatus: loggedin,
       });
});

router.post('/edit/people/:id', async function(req, res) {
    let loggedin = true
    if (!req.session.auth){
        loggedin = false
        res.redirect('/');
    }
    
    const id = `people/${req.params.id}`;
    const detailContact = await apiGetDetailKontak(id)
    const etag = detailContact.data.etag;

    const dataKontak = parseKontak(req.body.nama, req.body.nohp, req.body.email, etag);
    //console.log(dataKontak);

    apiEditKontak(id, dataKontak);
    console.log(`[users.js] - Sukses edit kontak`)
    res.render('success-modal', { 
        title: 'Sukses Mengubah Kontak', 
        message: 'Kontak berhasil diubah',
        layout: 'layouts/main-layout',
        loginstatus: loggedin,
       });
});

router.get('/multiple', async function (req, res){
    let loggedin = true
    if (!req.session.auth){
        loggedin = false
        res.redirect('/');
    }

    res.render('add-multi-kontak', { 
        title: 'Tambah Multi Kontak', 
        layout: 'layouts/main-layout',
        loginstatus: loggedin
       });
})

router.post('/multiple', async function(req, res){
    let loggedin = true
    if (!req.session.auth){
        loggedin = false
        res.redirect('/');
    }

    try {
        const datasheet = await getFromSheet(req.body.idsheet, req.body.namasheet);
        const datavalues = datasheet.data.values;
        if (datavalues) {
            datavalues.forEach(function(data, i) {
                const dataBuat = parseKontak(datavalues[i][0], datavalues[i][1],datavalues[i][2]);
                apiBuatKontak(dataBuat);
            });
        } else {
            console.log("[users.js] - fail getting datavalues");
        }

        console.log(`[users.js] - Sukses menambahkan ${datavalues.length} kontak`)
        res.render('success-modal', { 
            title: 'Sukses Menambahkan Kontak', 
            message: `${datavalues.length} kontak berhasil ditambahkan`,
            layout: 'layouts/main-layout',
            loginstatus: loggedin,
           });

    } catch(err) {
        console.log("error",err);
    }
});


function renderListcontact(arrKontak, listKontak) {
          
    if(arrKontak) {
        arrKontak.forEach(function(kontak, i) {
            if (!arrKontak[i].emailAddresses){
                if(!arrKontak[i].phoneNumbers){
                    listKontak.push({
                        "kontaknama": kontak.names[0].displayName,
                        "kontakemail": "Tidak ada email",
                        "nomorhp": "Tidak ada nomor handphone",
                        "idKontak": kontak.resourceName
                    });
                } 
                else {
                    listKontak.push({
                        "kontaknama": kontak.names[0].displayName,
                        "kontakemail": "Tidak ada email",
                        "nomorhp": kontak.phoneNumbers[0].value,    
                        "idKontak": kontak.resourceName
                });
                }
            } 
            else if ((!arrKontak[i].phoneNumbers)) {
                listKontak.push({
                    "kontaknama": kontak.names[0].displayName,
                    "kontakemail": kontak.emailAddresses[0].value,
                    "nomorhp": "Tidak ada nomor handphone",
                    "idKontak": kontak.resourceName
                });
            }
            else {
                listKontak.push({
                    "kontaknama": kontak.names[0].displayName,
                    "kontakemail": kontak.emailAddresses[0].value,
                    "nomorhp": kontak.phoneNumbers[0].value,
                    "idKontak": kontak.resourceName
                });
            }
        });
    } else {
        console.log('Tidak ada data kontak')
    }

    return listKontak
}

function parseKontak(nama, nohp, email, etag){
    body={
        "etag": etag,
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