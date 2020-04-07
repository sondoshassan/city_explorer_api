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
client.on('error',error => console.log(error));
let long;
let lat;

// for the location
server.get('/location',convertSearchQuery);

function convertSearchQuery(req, res) {
  const nameCity = req.query.city;
  chechDataBase(nameCity)
    .then(val => res.status(200).send(val));
}

function chechDataBase(nameCity) {
  let SQL = 'SELECT * FROM location WHERE city = ($1)';
  let safeValues = [nameCity];
  return client.query(SQL, safeValues)
    .then(val => {
      if (val.rows[0]) {
        console.log('from tab ', val.rows[0]);
        return val.rows[0];
      }
      else {
        return locationData(nameCity)
          .then(val => {
            console.log('ssssssssss ',val);
            return val;});
      }
    })
    .catch(err => console.log(err));
}

function locationData(nameCity) {
  let key = process.env.LOCATION_KEY_API;
  const geoData = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${nameCity}&format=json`;
  return superagent.get(geoData)
    .then(val => {
      const locate = new Location(nameCity, val.body);
      long = locate.longitude;
      lat = locate.latitude;
      let SQL = 'INSERT INTO location (city,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4);';
      let safeValues = [locate.city,locate.formatted_query,locate.latitude,locate.longitude];
      client.query(SQL,safeValues)
        .then(result => {return result;});
      return locate;
    });

}

function Location(nameCity,data){
  this.city = nameCity;
  this.formatted_query = data[0].display_name;
  this.latitude = data[0].lat;
  this.longitude = data[0].lon;
}

// localhost:3030/weather
server.get('/weather',responseWeather);

function responseWeather(req,res){
  const weatherCity = req.query.city;
  dataWeather(weatherCity)
    .then(val => res.status(200).json(val));
}

function dataWeather(weatherCity) {
  const key = process.env.WEATHER_KEY_API;
  const dataWeather = `https://api.weatherbit.io/v2.0/forecast/daily?city=${weatherCity}&key=${key}`;
  return superagent.get(dataWeather)
    .then(val =>{
      const dataArray = val.body.data;
      let array = dataArray.map(val => {
        const weather = new Weather(val);
        return weather;});
      return array;
    })
}

function Weather(dataWeath){
  this.forecast = dataWeath.weather.description;
  this.time = dataWeath.valid_date;
}

// localhost:3030/trails?city=amman
server.get('/trails',trailHandler);

function trailHandler(req,res){
  let nameCity = req.query.city;
  dataTrails(nameCity)
    .then(val => res.status(200).json(val));
}


function dataTrails(nameCity) {
  locationData(nameCity)
    .then(val => {return val;});
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

function Campgrounds(data){
  this.name= data.name;
  this.location = data.location;
  this.length= data.length;
  this.stars=data.stars;
  this.star_votes = data.starVotes;
  this.summary = data.summary;
  this.trail_url = data.url;
  this.conditions = data.conditionDetails;
  this.condition_date = data.conditionDate.split(' ')[0];
  this.condition_time = data.conditionDate.split(' ')[1];

}

server.get('/',(req,res)=>{
  res.send('Hi! open city explorer and enjoye :)');
})
server.get('*',(req,res)=>{
  res.status(404).send('The page is not excit');
})
server.use((error,req,res)=>{
  res.status(500).send(new UserError(error));
});

function UserError(error){
  this.status = 500;
  this.responseText = 'Sorry, something went wrong';
  this.error = error;
}

client.connect()
  .then(()=>{
    server.listen( PORT, () =>{
      console.log(`listen ${PORT}`);
    });
  });


