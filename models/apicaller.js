const {app, oAuth2Client} = require('../app');
const {google} = require('googleapis');

const service = google.people({version: 'v1', oAuth2Client});
const sheets = google.sheets({version: 'v4', oAuth2Client});

exports.getFromSheet = async function (sheetid,sheetname) {
    return await sheets.spreadsheets.values.get({
        spreadsheetId: sheetid,
        range: `${sheetname}!A1:C200`,
        auth: oAuth2Client,
    })
}

exports.getDataMe = async function () {
    return await service.people.get({
        resourceName: 'people/me',
        personFields: 'emailAddresses,names',
        auth: oAuth2Client,
    })
}

exports.apiBuatKontak = async function (body) {
    return await service.people.createContact({
        personFields: 'names,emailAddresses,phoneNumbers',
        requestBody : JSON.stringify(body),
        auth: oAuth2Client,
    })
}

exports.apiTampilKontak = async function () {
    return await service.people.connections.list({
        resourceName: 'people/me',
        pageSize: 20,
        personFields: 'names,emailAddresses,phoneNumbers',
        auth: oAuth2Client,
        sortOrder: 'FIRST_NAME_ASCENDING'
    });
};

exports.apiGetDetailKontak = async function (id) {
    return await service.people.get({
        resourceName: id,
        personFields: 'names,emailAddresses,phoneNumbers',
        auth: oAuth2Client,
    })
}

exports.apiEditKontak = async function (id, data) {
    return await service.people.updateContact({
        resourceName: id,
        personFields: 'names,emailAddresses,phoneNumbers',
        updatePersonFields : 'names,emailAddresses,phoneNumbers',
        requestBody: data,
        auth: oAuth2Client
    })
}

exports.apiDeleteKontak = async function (id) {  
    return await service.people.deleteContact({
        resourceName: id,
        auth: oAuth2Client,
    });
};

exports.apiSearchKontak = async function (search) {
    return await service.people.searchContacts({
        pageSize: 30,
        query: search,
        readMask: 'names,emailAddresses,phoneNumbers',
        auth: oAuth2Client,
    });
}

exports.apiAddMultipleKontak = async function (body) {
    return await service.people.batchCreateContacts({
        readMask: 'names,emailAddresses,phoneNumbers',
        requestBody : JSON.stringify(body),
        auth: oAuth2Client,
    });
}

exports.apiUpdateMultipleKontak = async function (body) {
    return await service.people.batchUpdateContacts({
        requestBody : JSON.stringify(body),
        auth: oAuth2Client,
    });
}
