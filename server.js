'use strict';

let express = require('express');
let server = express();

const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 3000;

server.use(cors());

server.get('/',(req,res)=>{
  res.status(200).send('we do great');
})
server.get('*',(req,res)=>{
  res.status(404).send('You have an error');
})


server.listen( PORT, () =>{
  console.log(`listen ${PORT}`);
})
