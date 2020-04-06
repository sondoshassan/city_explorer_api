'use strict';

let express = require('express');
let server = express();
const cors = require('cors');
require('dotenv').config();
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;
server.use(cors());


server.get('/location',convertSearchQuery);

function convertSearchQuery(req, res) {
  const nameCity = req.query.city;
  locationData(nameCity)
    .then(val => res.status(200).json(val));
}

function locationData(nameCity) {
  let key = process.env.LOCATION_KEY_API;
  const geoData = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${nameCity}&format=json`;
  return superagent.get(geoData)
    .then(val => {
      const locate = new Location(nameCity, val.body);
      return locate;
    });
}

function Location(nameCity,data){
  this.city = nameCity;
  this.formatted_query = data[0].display_name;
  this.latitude = data[0].lat;
  this.longitude = data[0].lon;
}

// localhost:3000/weather
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


server.get('/',(req,res)=>{
  res.send('Hi! you can complete url /location?city=Lynnwood or /weather');
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


server.listen( PORT, () =>{
  console.log(`listen ${PORT}`);
})
