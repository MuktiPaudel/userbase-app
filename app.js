const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost/nodekb', { useNewUrlParser: true });
//Get the default connection
let db = mongoose.connection;

// check the connection
db.once('open', function(){
    console.log('connected to database');
});
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//Init the app
const app = express();

//Bring in the models
let Article = require('./models/article');

//load the view engine
app.set('views',path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// body parser middleware, parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// set public folder as a collection of static files.
app.use(express.static(path.join(__dirname, 'public')));

// index.pug route
app.get('/', (req, res) => {

  Article.find({}, function (err, articles){
      if(err){
          console.log(err);
      } else {
        res.render('index', {
            title:'articles',
            articles : articles
        });
      }
  }); 
});

//get single article
app.get('/article/:id', function(req, res){
 Article.findById(req.params.id, function(err, article){
    res.render('article',{
        article:article
    });
 });
});

// add route
app.get('/articles/add', (req, res) =>{
    res.render('add_article',{
        title: 'add articles',
    });
  });

// add form submit post route
app.post('/articles/add', function(req, res) {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    article.save(function(err){
     if(err){
         console.log(err);
         return;
     }else{
         res.redirect('/');
     }
    });
  });



app.listen(3000, () => console.log(`App running on port 3000`));