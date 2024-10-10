const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');


mongoose.connect("mongodb+srv://jainshreya9846:" + process.env.MONGO_ATLAS_PWD + "@cluster0.1ycj2zj.mongodb.net/node-angular?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log('Connection to db Successful');
  })
  .catch(() => {
    console.log('Connection failed');
  });


app.use(bodyParser.json());    /* this middleware used to parse the req and extract data in a form that we can access */

/* by default, files are not accessible to anyone, so add this below middleware
to allow it, any requests targeting '/images' will go to '/images'. */
app.use('/images', express.static(path.join('images')));

/* To get rid of CORS error, set headers */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader('Access-Control-Allow-Headers', "Origin, X-Requested_With, Content-Type, Accept, Authorization");
  res.setHeader('Access-Control-Allow-Methods', "GET, POST, PATCH, PUT, DELETE, OPTIONS")
  next();
});

app.use('/posts', postRoutes);  /* all the routes starting from '/posts' will be forwarded to postRouts */
app.use('/users', userRoutes); 
  
module.exports = app;