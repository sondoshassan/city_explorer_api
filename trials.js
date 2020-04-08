'use strict';
// library
const superagent = require('superagent');

//
const main = require('./server');

//
function trailHandler(req, res) {
  // let nameCity = req.query.city;
  dataTrails()
    .then(val => res.status(200).json(val));
}
  
  
function dataTrails() {
  const key = process.env.TRAIL_API;
  const secondUrl = `https://www.hikingproject.com/data/get-trails?lat=${main.lat}&lon=${main.long}&maxDistance=150&maxResults=10&key=${key}`;
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

module.exports = trailHandler;