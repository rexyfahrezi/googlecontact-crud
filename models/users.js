function renderListcontact (arrKontak, listKontak) {
  if(arrKontak) {
      arrKontak.forEach(function(kontak, i) {
          if (!arrKontak[i].emailAddresses){
              if(!arrKontak[i].phoneNumbers){
                  listKontak.push({
                      "kontaknama": kontak.names[0].displayName,
                      "kontakemail": "Tidak ada email",
                      "nomorhp": "Tidak ada nomor handphone",
                      "idKontak": kontak.resourceName,
                  });
              } 
              else {
                  listKontak.push({
                      "kontaknama": kontak.names[0].displayName,
                      "kontakemail": "Tidak ada email",
                      "nomorhp": kontak.phoneNumbers[0].value,    
                      "idKontak": kontak.resourceName,
                  });
              }
          }
          else if ((!arrKontak[i].phoneNumbers)) {
              listKontak.push({
                  "kontaknama": kontak.names[0].displayName,
                  "kontakemail": kontak.emailAddresses[0].value,
                  "nomorhp": "Tidak ada nomor handphone",
                  "idKontak": kontak.resourceName,
              });
          }
          else {
              listKontak.push({
                  "kontaknama": kontak.names[0].displayName,
                  "kontakemail": kontak.emailAddresses[0].value,
                  "nomorhp": kontak.phoneNumbers[0].value,
                  "idKontak": kontak.resourceName,
              });
          }
      });
  } else {
      console.log('Tidak ada data kontak');
  };

  return listKontak;
};

function parseKontak (nama, nohp, email, etag) {
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
};

function parseMultiKontak (nama, email, nohp) {
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
};

module.exports = {renderListcontact, parseKontak, parseMultiKontak};
