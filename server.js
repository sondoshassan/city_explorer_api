'use strict';

let express = require('express');
let server = express();

const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 3000;

server.use(cors());

// localhost:3000/location?city=Lynnwood
server.get('/location',(req,res) =>{
  convertSearchQuery(req, res);
});

function convertSearchQuery(req, res) {
  const nameCity = req.query.city;
  const data = require('./data/geo.json');
  res.send(new Location(nameCity, data));
}

function Location(nameCity,data){
  this.search_query = nameCity;
  this.formatted_query = data[0].display_name;
  this.latitude = data[0].lat;
  this.longitude = data[0].lon;
}
// localhost:3000/weather
server.get('/weather',(req,res) =>{
  let array = [];
  const weatherCity = req.query.city;
  const dataWeather = require('./data/weather.json');
  for (let i=0;i<dataWeather.data.length;i++){
    array.push(new Weather(dataWeather,i));
  }
  res.send(array);
});

function Weather(dataWeath,i){
  this.forecast = dataWeath.data[i].weather.description;
  this.time = dataWeath.data[i].valid_date;
}

server.get('/',(req,res)=>{
  res.status(200).send('we do great');
})
server.get('*',(req,res)=>{
  res.status(404).send('You have an error');
})
server.use((eror,req,res)=>{
  console.log(eror);
  res.status(500).send({status:500,responseText:'Sorry, something went wrong'});
})


server.listen( PORT, () =>{
  console.log(`listen ${PORT}`);
})
