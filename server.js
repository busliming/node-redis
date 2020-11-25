const express = require('express');
const app = express();
const axios = require('axios');
// const ejs = require('ejs')
const path = require('path');
const redis = require('redis')



app.use(express.static(path.join(__dirname, 'public')))
app.set("view engine", "ejs");

app.use('*', (req,res,next) => {
  let { username } = req.query;
  if(!username){
    res.render('index', {list: []})
    return 
  }
  client.get(username+'-repos',(err,data) => {
    // console.error(data);
    if(data){
      res.render('index', {list: JSON.parse(data)});
    }else{
      next();
    }
  })
  
  // next();
})


app.get('/', async (req, res) => {
  console.log(req.query)
  let {username} = req.query
  let response = await axios.get(`https://api.github.com/search/repositories?q=${username}`)
  // let response = await axios.get(`https://api.github.com/users/${username}/repos`)
  let data = response.data.items.map(item => ({
    name: item.full_name,
    url: item.url,
    forks: item.forks,
    language: item.language
  }))

  client.setex(username+'-repos',30,JSON.stringify(data));
  // console.log(response.data);
  res.render('index', {list: data})
})


const PORT = 2080;

const REDIS_PORT = 6379;
const client = redis.createClient(REDIS_PORT);
client.on('connect', (err) => {
  if(err) throw err;
  console.log('redis is connected!')
})

app.listen(PORT, () => {
  console.log(`app is running on port ${PORT}`);
})