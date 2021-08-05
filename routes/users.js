const express = require('express');
const { google } = require('googleapis');
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
        pageSize: 20,
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

const apiSearchKontakSpreadsheet = async function (search) {
    return await service.people.searchContacts({
        pageSize: 30,
        query: search,
        readMask: 'emailAddresses,phoneNumbers',
        auth: oAuth2Client,
    });
}

const apiAddMultipleKontak = async function (body) {
    return await service.people.batchCreateContacts({
        readMask: 'names,emailAddresses,phoneNumbers',
        requestBody : JSON.stringify(body),
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
                const search = await apiSearchKontak(searchquery.toLowerCase());
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
            console.log('promiseerror', err);

            res.render('fail-modal', { 
                title: 'Gagal mencari', 
                message: 'Kontak tidak ditemukan, pastikan query sesuai dengan karakter awal yang dicari.\nContoh : "Budi" "Bu" "Bud" ',
                layout: 'layouts/main-layout',
                loginstatus: loggedin,
               });
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
            let dataBuat = {"contacts": []}
            let arrdatasearch = [];
            let dataUpdate =   {
                "contacts": [],
                "updateMask": "names,emailAddresses,phoneNumbers"
            };
            // const search = await apiSearchKontak(e[2]);
            // const datasearch = search.data.results;
            // arrdatasearch.push(datasearch);
            //  console.log(arrdatasearch);
            

            async function asyncForEach(array, callback) {
                for (let index = 0; index < array.length; index++) {
                  await callback(array[index], index, array);
                }
              }

            const cariDuplikat = async () => {
                await asyncForEach(datavalues, async (e) => {
                    const search = await apiSearchKontak(e[2]);
                    const datasearch = search.data.results;
                    if (datasearch){
                        arrdatasearch.push(datasearch);
                    }
                });
                console.log('[user.js] - Done search /multiple');
                console.log('[user.js] - Updating data /multiple');

                arrdatasearch.map((e) => { 
                    const obj = {
                      [`${e[0].person.resourceName}`]: {
                        "etag": e[0].person.etag,
                        "names": [{"givenName": e[0].person.names}],
                        "emailAddresses": [{"value": e[0].person.emailAddresses}],
                        "phoneNumbers": [{"value": e[0].person.phoneNumbers}]
                      }
                    };
                    dataUpdate.contacts.push(obj);
                });

                console.log(`Data yang sudah ada ditemukan :`);
                console.log(dataUpdate);
              };

            cariDuplikat();

            // create batch kontak
            // datavalues.forEach(function(data, i) {  
            //     dataBuat.contacts.push(parseMultiKontak(datavalues[i][0], datavalues[i][1],datavalues[i][2]));
            // });
            // await apiAddMultipleKontak(dataBuat);
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

function parseMultiKontak(nama, email, nohp){
    body={
        "contactPerson": {
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
    }
    return body
}

module.exports = router;