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

server.get('/',(req,res)=>{
  res.status(200).send('we do great');
})
server.get('*',(req,res)=>{
  res.status(404).send('You have an error');
})


server.listen( PORT, () =>{
  console.log(`listen ${PORT}`);
})
