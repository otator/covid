'use strict';

const express = require('express');
const server = express();
require('dotenv').config();
const pg = require('pg');
// const cors = require(cors());
const methodOverride = require('method-override');
// server.use(cors());
server.use(express.urlencoded({ extended: true }));
server.use(methodOverride('_method'));
server.use(express.static('./public'));
server.set('view engine', 'ejs');
let client;
let PORT = process.env.PORT || 3001;
if(PORT === 3000 || 3001){
  client = new pg.Client(process.env.DATABASE_URL);
}else{
  client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });
}


client.connect()
.then(()=>{
  server.listen(PORT, ()=>{
    console.log(`listening on port ${PORT}...`);
  })
})
