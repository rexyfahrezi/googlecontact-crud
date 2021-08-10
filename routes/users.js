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
        range: `${sheetname}!A1:C200`,
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

const apiAddMultipleKontak = async function (body) {
    return await service.people.batchCreateContacts({
        readMask: 'names,emailAddresses,phoneNumbers',
        requestBody : JSON.stringify(body),
        auth: oAuth2Client,
    });
}

const apiUpdateMultipleKontak = async function (body) {
    return await service.people.batchUpdateContacts({
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
            // warmup cache search
            await apiSearchKontak();

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
        // warmup cache search
        await apiSearchKontak();
        
        if (datavalues) {
            let dataBuat = {"contacts": []}
            let arrdataupdate = [];
            let arrdatasearch = [];
            let dataUpdate =   {
                "contacts": {},
                "updateMask": 'names,emailAddresses,phoneNumbers',
                "readMask": 'names,emailAddresses,phoneNumbers',
            };            

            async function asyncForEach(array, callback) {
                for (let index = 0; index < array.length; index++) {
                  await callback(array[index], index, array);
                }
              }

            const createAndUpdateBatch = async () => {
                await asyncForEach(datavalues, async (e) => {

                    const search = await apiSearchKontak(e[1]);
                    const search2 = await apiSearchKontak(e[2]);
                    const datasearch = search.data.results;
                    const datasearch2 = search2.data.results;
                    console.log('[user.js] - Searching by mail & phone');

                    if(datasearch != undefined || datasearch2 != undefined){
                        if (datasearch != datasearch2){
                            if (datasearch) {
                            arrdatasearch.push(datasearch);
                            arrdataupdate.push(e);
                            console.log('[user.js] - Found data by email');
                            }
                            else if (datasearch2) {
                            arrdatasearch.push(datasearch2);
                            arrdataupdate.push(e);
                            console.log('[user.js] - Found data by phone');
                            }
                        } else {
                            arrdatasearch.push(datasearch);
                            arrdataupdate.push(e);
                            console.log('[user.js] - Found data by email & phone');
                        }
                    }

                      if (!datasearch && !datasearch2) {
                        dataBuat.contacts.push(parseMultiKontak(e[0], e[1],e[2]));
                        console.log('[user.js] - Email / Phone not found, creating contact . .');
                    };






                    // const search = await apiSearchKontak(e[2]);
                    // const datasearch = search.data.results;
                    // console.log(`${e} data dari sheet`);
                    // // console.log(`${datasearch}`);
                    
                    // if (datasearch){
                    //     // arrdatasearch untuk dapetin etag, id dll dari hasil search
                    //     // arrdataupdate utk nyimpen data yang didapet dari spreadsheet
                    //     arrdatasearch.push(datasearch);
                    //     arrdataupdate.push(e);
                    // } else {
                    //     dataBuat.contacts.push(parseMultiKontak(e[0],e[1],e[2]));
                    // }
                });
                console.log('[user.js] - Done search /multiple');
                console.log('[user.js] - Updating data /multiple');
                //console.log(arrdataupdate);

                arrdatasearch.map((e, i) => { 
                    const obj = {
                      [`${e[0].person.resourceName}`]: {
                        "etag": e[0].person.etag,
                        "names": [{"givenName": arrdataupdate[i][0]}],
                        "emailAddresses": [{"value": arrdataupdate[i][1]}],
                        "phoneNumbers": [{"value": arrdataupdate[i][2]}]
                      }
                    };

                    if (arrdataupdate[i][0] != e[0].person.names[0].displayName ||
                        arrdataupdate[i][1] != e[0].person.emailAddresses[0].value ||
                        arrdataupdate[i][2] != e[0].person.phoneNumbers[0].value){
                            Object.assign(dataUpdate.contacts, obj);
                        }
                });

                // console.log(`Data yang akan diupdate :`);
                //console.log(dataUpdate.contacts);                
                // console.log(`Data yang akan dibuat :`);
                // console.log(dataBuat);
                
                try {
                    if (dataBuat.contacts.length > 0){
                        console.log(`[user.js] - Membuat ${dataBuat.contacts.length} kontak baru dari sheet`);
                        await apiAddMultipleKontak(dataBuat);
                    }
                    if (Object.keys(dataUpdate.contacts).length != 0){
                        console.log(`[user.js] - Ada ${Object.keys(dataUpdate.contacts).length} data update dari sheet`);
                        await apiUpdateMultipleKontak(dataUpdate);
                    }
                } catch(err) {
                    console.log('Error',err);
                }
                console.log(`[users.js] - Sukses menambahkan ${datavalues.length} kontak`)
                console.log(`[user.js] - Proses createAndUpdateBatch() selesai`);
                return res.render('success-modal', { 
                    title: 'Sukses Menambahkan Kontak', 
                    message: `${datavalues.length} kontak berhasil ditambahkan`,
                    layout: 'layouts/main-layout',
                    loginstatus: loggedin,
                   });                
              };
            
            createAndUpdateBatch();

        } else {
            console.log("[users.js] - fail getting datavalues");
        }

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