'use strict';

const express = require('express');
const server = express();
require('dotenv').config();
const pg = require('pg');
const superagent = require('superagent');
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


server.get('/', getTotal);
server.get('/getCountryResult', getCountry);
server.get('/allCountries', getAllCountries)
server.post('/add', addToRecords);
server.get('/viewDetails/:id', viewDetails);
server.delete('/deleteRecord/:id', deleteRecord);
server.get('/myRecords', getRecords);




function getTotal(req, res){
  let URL = 'https://api.covid19api.com/world/total';
  superagent.get(URL)
  .then(result=>{
    // console.log(result.body)
    res.render('./index', {data: result.body})
  }).catch(error=> console.log('Error in getting total stat:', error.message));
}


function getCountry(req, res){
  let countryName = req.query.countryName;
  let firstDate = req.query.firstDate;
  let lastDate = req.query.lastDate;
  let URL = `https://api.covid19api.com/country/${countryName}/status/confirmed?from=${firstDate}T00:00:00Z&to=${lastDate}T00:00:00Z`;
  console.log(URL);
  superagent.get(URL)
  .then(result=>{
    // console.log(result.body)
    res.render('country-result', {data: result.body})

  }).catch(error => console.log('Error in getting data for country', error.message))
}


function getAllCountries(req, res){
  let URL = `https://api.covid19api.com/summary`;
  superagent.get(URL)
  .then(result=>{
    // console.log(result.body.Countries);
    let data = result.body.Countries.map(value => new Country(value));
    res.render('allCountries', {data: data});

  }).catch(error=> console.log('Error in getting all countries data: ', error.message))
}


function addToRecords(req, res){
  console.log(req.body);
  let {country, confirmed, deaths, recoverd, date} = req.body;
 
  let SQL = 'insert into myTable (country, confirmed, deaths, recovered, date) values($1,$2,$3,$4,$5)';
  let values = [country, confirmed, deaths, recoverd, date]
  client.query(SQL, values)
  .then(result=>{
    console.log('Row inserted Successfully');
    res.redirect('./myRecords')
  }).catch(error=> console.log('Error in inserting country in database',error.message))
}

function getRecords(req, res){
  let sql = 'select * from myTable';
  client.query(sql)
  .then(result =>{
    res.render('myRecords', {data: result.rows});

  }).catch(error=> console.log('Error in inserting country in database',error.message))
}

function viewDetails(req, res){
  let id = req.params.id;
  console.log('id', id);
  let sql = 'select * from myTable where id= $1';
  let values = [id];
  client.query(sql, values)
  .then(results=>{
    res.render('details', {data:results.rows[0]});

  }).catch(error=> console.log('Error in getting country details from database',error.message))
}

function deleteRecord(req, res){
  let id = req.params.id;
  let sql = 'delete from myTable where id = $1';
  let values = [id];
  client.query(sql, values)
  .then(results=>{
    res.redirect('./myRecords')

  }).catch(error=> console.log('Error in deleting country record from database',error.message))
}




function Country(obj){
  this.country = obj.Country,
  this.confirmed = obj.TotalConfirmed,
  this.deaths = obj.TotalDeaths,
  this.recovered = obj.TotalRecovered,
  this.date = obj.Date
}



client.connect()
.then(()=>{
  server.listen(PORT, ()=>{
    console.log(`listening on port ${PORT}...`);
  })
})
