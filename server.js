'use strict';

require('dotenv').config();
let express = require('express');
const cors = require('cors');
const pg = require('pg');
const superagent = require('superagent');
let server = express();
const PORT = process.env.PORT || 3000;
server.use(cors());
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => console.log(error));
let long;
let lat;

// for the location
server.get('/location', convertSearchQuery);

function convertSearchQuery(req, res) {
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
        long = val.rows[0].longitude;
        lat = val.rows[0].latitude;
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
    .catch(err => errorHandler(err));
}

function locationData(nameCity) {
  let key = process.env.LOCATION_KEY_API;
  console.log('are you here');
  const geoData = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${nameCity}&format=json`;
  return superagent.get(geoData)
    .then(val => {
      const locate = new Location(nameCity, val.body);
      long = locate.longitude;
      lat = locate.latitude;
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

// localhost:3030/weather
server.get('/weather', responseWeather);

function responseWeather(req, res) {
  const weatherCity = req.query.city;
  dataWeather(weatherCity)
    .then(val => res.status(200).json(val));
}

function dataWeather(weatherCity) {
  const key = process.env.WEATHER_KEY_API;
  const dataWeather = `https://api.weatherbit.io/v2.0/forecast/daily?city=${weatherCity}&key=${key}`;
  return superagent.get(dataWeather)
    .then(val => {
      const dataArray = val.body.data;
      let array = dataArray.map(val => {
        const weather = new Weather(val);
        return weather;
      });
      return array;
    })
}

function Weather(dataWeath) {
  this.forecast = dataWeath.weather.description;
  this.time = dataWeath.valid_date;
}

// localhost:3030/trails?city=amman
server.get('/trails', trailHandler);

function trailHandler(req, res) {
  // let nameCity = req.query.city;
  dataTrails()
    .then(val => res.status(200).json(val));
}


function dataTrails() {
  const key = process.env.TRAIL_API;
  const secondUrl = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${long}&maxDistance=150&maxResults=10&key=${key}`;
  return superagent.get((secondUrl))
    .then(val => {
      const dataArray = val.body.trails;
      let arrayResult = dataArray.map(val => {
        const theTarget = new Campgrounds(val);
        return theTarget;
      });
      return arrayResult;
    });
}

function Campgrounds(data) {
  this.name = data.name;
  this.location = data.location;
  this.length = data.length;
  this.stars = data.stars;
  this.star_votes = data.starVotes;
  this.summary = data.summary;
  this.trail_url = data.url;
  this.conditions = data.conditionDetails;
  this.condition_date = data.conditionDate.split(' ')[0];
  this.condition_time = data.conditionDate.split(' ')[1];

}
// MOVIE

server.get('/movies', movieHandler);

function movieHandler(req, res) {
  const nameCity = req.query.city;
  chechDataBaseMovie(nameCity)
    .then(val => res.status(200).send(val));
}

function chechDataBaseMovie(nameCity) {
  let SQL = 'SELECT * FROM movies WHERE city = ($1);';
  let safeValues = [nameCity];
  return client.query(SQL, safeValues)
    .then(val => {
      if (val.rows[0]) {
        console.log('from tabMovie SQL');
        return val.rows.slice(0,19);
      }
      else {
        console.log('are you enterMovie from API');
        return dataMovie(nameCity)
          .then(val => {
            return val;
          });
      }
    })
    .catch(err => errorHandler(err));
}


function dataMovie(nameCity) {
  const key = process.env.MOVIE_API;
  const secondUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${key}&city=${nameCity}`;
  return superagent.get((secondUrl))
    .then(val => {
      const dataArray = val.body.results;
      let arrayResult = dataArray.map(val => {
        const theTarget = new Movies(val);
        let SQL = 'INSERT INTO movies (city,title,overview,average_votes,total_votes,image_url,popularity,released_on) VALUES ($1,$2,$3,$4,$5,$6,$7,$8);';
        let safeValues = [nameCity,theTarget.title,theTarget.overview,theTarget.average_votes,theTarget.total_votes,theTarget.image_url,theTarget.popularity,theTarget.released_on];
        client.query(SQL, safeValues)
          .then(result => {
            return result; })
          .catch(err => console.log(err));
        return theTarget;
      });
      return arrayResult;
    })
    .catch(err => errorHandler(err));
}

function Movies(data) {
  this.title = data.title;
  this.overview = data.overview;
  this.average_votes = data.vote_average;
  this.total_votes = data.vote_count;
  this.image_url = data.poster_path;
  this.popularity = data.popularity;
  this.released_on = data.release_date;
}
// yelp


server.get('/yelp', yelpHandler);
function yelpHandler(req, res) {
  let nameCity = req.query.city;
  chechDataBaseYelp(nameCity)
    .then(val => res.status(200).send(val));
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
    .catch(err => errorHandler(err));
}


function dataYelp(nameCity) {
  const apiKey = process.env.YELP_API;
  let url = `https://api.yelp.com/v3/businesses/search?location=${nameCity}`;
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



//

server.get('/', (req, res) => {
  res.send('Hi! open city explorer and enjoye :)');
})
server.get('*', (req, res) => {
  res.status(404).send('The page is not excit');
});

function errorHandler(error, request, response) {
  response.status(500).send(new UserError(error));
}

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


