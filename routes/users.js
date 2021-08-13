const express = require('express');
const router = express.Router();
const {
    getFromSheet, getDatabyId, apiBuatKontak, apiTampilKontak, apiGetDetailKontak, apiEditKontak,
    apiDeleteKontak, apiSearchKontak, apiAddMultipleKontak, apiUpdateMultipleKontak
} = require('../models/apicaller');

const {
    renderListcontact, parseKontak, parseMultiKontak
  } = require('../models/users')

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
            const dataUser = await getDatabyId('me');

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
                directurl: '/users/',
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

    //warmup cache search
    await apiSearchKontak();

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

    const search = await apiSearchKontak(req.body.nohp);
    const search2 = await apiSearchKontak(req.body.email);
    const datasearch = search.data.results;
    const datasearch2 = search2.data.results;
    console.log('[user.js post:/add] - Searching email & phone');
    
    if(datasearch != undefined || datasearch2 != undefined){
        console.log('[user.js post:/add] - Found data by email & phone');
        res.render('fail-modal', { 
            title: 'Gagal Membuat Kontak', 
            message: 'Email / No HP sudah ada di kontak',
            layout: 'layouts/main-layout',
            directurl: '/users/add',
            loginstatus: loggedin,
           });       
    } else {
        const dataBuat = parseKontak(req.body.nama, req.body.nohp, req.body.email);
        apiBuatKontak(dataBuat);

        console.log(`[users.js post:/add] - Sukses membuat kontak baru`)
        res.render('success-modal', { 
            title: 'Sukses Menyimpan Kontak', 
            message: 'Kontak berhasil disimpan',
            layout: 'layouts/main-layout',
            loginstatus: loggedin,
        });
    }
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
});

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
                });
                console.log('[user.js] - Done search /multiple');
                console.log('[user.js] - Updating data /multiple');

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
                console.log(`[users.js] - Sukses membaca ${datavalues.length} kontak dari spreadsheet`);
                console.log(`[user.js] - Proses createAndUpdateBatch() selesai`);
                return res.render('success-modal', { 
                    title: 'Sukses Menambahkan Kontak', 
                    message: `${dataBuat.contacts.length} kontak baru berhasil ditambahkan & ${Object.keys(dataUpdate.contacts).length} kontak berhasil di update`,
                    layout: 'layouts/main-layout',
                    loginstatus: loggedin,
                   });                
              };
            
            createAndUpdateBatch();

        } else {
            console.log("[users.js] - fail getting datavalues");
        }

    } catch(err) {
        console.log("error POST/multiple",err);
    }
});

router.get('/multiplecreate', async function(req, res) {
    let loggedin = true
    if (!req.session.auth){
        loggedin = false
        res.redirect('/');
    }

    res.render('create-multi-kontak', { 
        title: 'Create Multi Kontak', 
        layout: 'layouts/main-layout',
        loginstatus: loggedin
       });
});

router.post('/multiplecreate', async function(req, res) {
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

            datavalues.forEach(e => {
                dataBuat.contacts.push(parseMultiKontak(e[0], e[1], e[2]));
            });

            console.log(`[user.js] - Membuat ${dataBuat.contacts.length} kontak baru dari sheet`);
            await apiAddMultipleKontak(dataBuat);
            
            res.render('success-modal', { 
                title: 'Sukses Menambahkan Kontak', 
                message: `${dataBuat.contacts.length} kontak baru berhasil ditambahkan`,
                layout: 'layouts/main-layout',
                loginstatus: loggedin,
           });
        }

    } catch (err) {
        console.log("Error POST/MultipleCreate", err);
        res.render('fail-modal', { 
            title: 'Gagal Menambahkan Kontak', 
            message: `Gagal menambahkan kontak`,
            layout: 'layouts/main-layout',
            directurl: '/users/multiplecreate',
            loginstatus: loggedin,
       });
    }
});

router.get('/multipleupdate', async function(req, res) {
    let loggedin = true
    if (!req.session.auth){
        loggedin = false
        res.redirect('/');
    }

    res.render('update-multi-kontak', { 
        title: 'Update Multi Kontak', 
        layout: 'layouts/main-layout',
        loginstatus: loggedin
       });
});

router.post('/multipleupdate', async function(req,res) {
    let loggedin = true
    if (!req.session.auth){
        loggedin = false
        res.redirect('/');
    }

    try {
        const datasheet = await getFromSheet(req.body.idsheet, req.body.namasheet);
        const datavalues = datasheet.data.values;
        let dataUpdate =   {
            "contacts": {},
            "updateMask": 'names,emailAddresses,phoneNumbers',
            "readMask": 'names,emailAddresses,phoneNumbers',
        };

        let databyId = []

        for (i = 0; i < datavalues.length; i++){
            databyId.push(await getDatabyId(datavalues[i][0]));
        }
        // console.log(databyId);

        if (datavalues) {
            datavalues.map((e, i) => { 
                const obj = {
                  [`people/${e[0]}`]: {
                    "etag": databyId[i].data.etag,
                    "names": [{"givenName": e[1]}],
                    "emailAddresses": [{"value": e[2]}],
                    "phoneNumbers": [{"value": e[3]}]
                  }
                };
                Object.assign(dataUpdate.contacts, obj);
            });
            // console.log(dataUpdate);
            console.log(`[user.js POST/multipleupdate] - Ada ${Object.keys(dataUpdate.contacts).length} data update dari sheet`);
            await apiUpdateMultipleKontak(dataUpdate);
            
            res.render('success-modal', { 
                title: 'Sukses Menambahkan Kontak', 
                message: `${Object.keys(dataUpdate.contacts).length} kontak berhasil di update`,
                layout: 'layouts/main-layout',
                loginstatus: loggedin,
               });
        }
    } catch (err) {
        console.log("Error POST/MultipleUpdate", err);
        res.render('fail-modal', { 
            title: 'Gagal Mengupdate Kontak', 
            message: `Gagal Mengupdate kontak`,
            layout: 'layouts/main-layout',
            directurl: '/users/multipleupdate',
            loginstatus: loggedin,
       })
    }
});

module.exports = router;