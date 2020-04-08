'use strict';
const main = {};
require('dotenv').config();
let express = require('express');
const cors = require('cors');
const pg = require('pg');
let server = express();
const PORT = process.env.PORT || 3000;
server.use(cors());
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => console.log(error));
//
const locationEx = require('./location');
const weatherEx = require('./weather');
const trailEx = require('./trials');
const movieEx = require('./movie');
const yelpEx = require('./yelp');
//
main.long;
main.lat;

// for the location
server.get('/location', locationEx);
// weather
server.get('/weather', weatherEx);
// trails
server.get('/trails', trailEx);
// MOVIE
server.get('/movies', movieEx);
// yelp
server.get('/yelp', yelpEx);


//
server.get('/', (req, res) => {
  res.send('Hi! open city explorer and enjoye :)');
})
server.get('*', (req, res) => {
  res.status(404).send('The page is not excit');
});

main.errorHandler = function(error, request, response) {
  response.status(500).send(new UserError(error));
};

function UserError(error) {
  this.status = 500;
  this.responseText = 'Sorry, something went wrong';
  this.error = error;
}

client.connect()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`listen ${PORT}`);
    });
  })
  .catch(err => console.log(err));

module.exports = main;


