'use strict';

// location library
const pg = require('pg');
const superagent = require('superagent');
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => console.log(error));

client.connect()
  .then();
//object

const main = require('./server');


// functions
function convertSearchQuery (req, res) {
  const nameCity = req.query.city;
  chechDataBase(nameCity)
    .then(val => res.status(200).send(val));
}

function chechDataBase(nameCity) {
  let SQL = 'SELECT * FROM location WHERE city = ($1);';
  let safeValues = [nameCity];
  return client.query(SQL, safeValues)
    .then(val => {
      if (val.rows[0]) {
        console.log('from tab ', val.rows[0]);
        main.long = val.rows[0].longitude;
        main.lat = val.rows[0].latitude;
        return val.rows[0];
      }
      else {
        console.log('are you enter');
        return locationData(nameCity)
          .then(val => {
            console.log('ssssssssss ', val);
            return val;
          });
      }
    })
    .catch(err => main.errorHandler(err));
}

function locationData(nameCity) {
  let key = process.env.LOCATION_KEY_API;
  console.log('are you here');
  const geoData = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${nameCity}&format=json`;
  return superagent.get(geoData)
    .then(val => {
      const locate = new Location(nameCity, val.body);
      main.long = locate.longitude;
      main.lat = locate.latitude;
      let SQL = 'INSERT INTO location (city,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4);';
      let safeValues = [locate.city, locate.formatted_query, locate.latitude, locate.longitude];
      client.query(SQL, safeValues)
        .then(result => { return result; });
      return locate;
    });
}

function Location(nameCity, data) {
  this.city = nameCity;
  this.formatted_query = data[0].display_name;
  this.latitude = data[0].lat;
  this.longitude = data[0].lon;
}

module.exports = convertSearchQuery;
