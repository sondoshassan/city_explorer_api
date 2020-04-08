'use strict';
// library
const superagent = require('superagent');


//
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

module.exports = responseWeather;
