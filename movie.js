'use strict';

// movies library
const pg = require('pg');
const superagent = require('superagent');
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => console.log(error));

client.connect()
  .then();
//object

const main = require('./server');

//
function movieHandler(req, res) {
  const nameCity = req.query.city;
  chechDataBaseMovie(nameCity)
    .then(val => res.status(200).send(val))
    .catch(err => main.errorHandler(err));
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
    .catch(err => main.errorHandler(err));
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
    .catch(err => main.errorHandler(err));
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

module.exports = movieHandler;