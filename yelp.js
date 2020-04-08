'use strict';

// location library
const pg = require('pg');
const superagent = require('superagent');
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => console.log(error));

client.connect()
  .then();
//object

const main = require('./server.js');

//
function yelpHandler(req, res) {
  let nameCity = req.query.city;
  chechDataBaseYelp(nameCity)
    .then(val => res.status(200).send(val))
    .catch(err => main.errorHandler(err));
}

function chechDataBaseYelp(nameCity) {
  let SQL = 'SELECT * FROM yelp WHERE city = ($1);';
  let safeValues = [nameCity];
  return client.query(SQL, safeValues)
    .then(val => {
      if (val.rows[0]) {
        console.log('from tabYelp SQL');
        return val.rows.slice(0,19);
      }
      else {
        console.log('are you enterYelp from API');
        return dataYelp(nameCity)
          .then(val => {
            return val;
          });
      }
    })
    .catch(err => main.errorHandler(err));
}

function dataYelp(nameCity) {
  const apiKey = process.env.YELP_API;
  let url = `https://api.yelp.com/v3/businesses/search?location=${nameCity}`;
  console.log('are you enter??');
  return superagent.get(url)
    .set('Authorization',`Bearer ${apiKey}`)
    .then(val => {
      const dataArray = val.body.businesses;
      let arrayResult = dataArray.map(val => {
        const theTarget = new Yelp(val);
        let SQL = 'INSERT INTO yelp (city,name,image_url,price,rating,url) VALUES ($1,$2,$3,$4,$5,$6);';
        let safeValues = [nameCity,theTarget.name,theTarget.image_url,theTarget.price,theTarget.rating,theTarget.url];
        client.query(SQL, safeValues)
          .then(result => {
            return result; })
          .catch(err => console.log(err));
        return theTarget;
      });
      return arrayResult;
    });
}

function Yelp(data) {
  this.name = data.name;
  this.image_url = data.image_url;
  this.price = data.price;
  this.rating = data.rating;
  this.url = data.url;
}

module.exports = yelpHandler;

