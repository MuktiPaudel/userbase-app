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
// set public folder as a collection of static files.
app.use(express.static(path.join(__dirname, './public')));
// body parser middleware, parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());



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

//Get Single Article , :id used here is a placeholder and it could be anything. 
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

  /**   EDIT ARTICLES  */ 

  /** 
       render the edit form when user clicks on edit button this is almost similar to Get Single 
       Article  except You need to specify the page url and rendering (edit_article) page which is different. 
  **/
  app.get('/article/edit/:id', function(req, res){
    Article.findById(req.params.id, function(err, article){
       res.render('edit_article',{
           title: 'Edit article',
           article:article
       });
    });
   });
   /** 
       Finally after we get the article and now we POST it. It is similar to post form but the difference is
       we are not going to create a new Article but we set it as a empty object.
   **/
// add form submit post route

app.post('/articles/edit/:id', function(req, res){
    // set article as a empty object
    let article = {};
    // we will get the fields from the form and add to the object
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;
    
    // now we create a query because we need to specify which one we want to update
    let query = {_id:req.params.id}
  
    Article.update(query, article, function(err){
      if(err){
        console.log(err);
        return;
      } else {
        res.redirect('/');
      }
    });
  });

  //Delete article
  app.get('/article/delete/:id', function(req, res){
    Article.findByIdAndRemove(req.params.id, function(err, article){
      res.redirect('/');
    });
  });


app.listen(3000, () => console.log(`App running on port 3000`));