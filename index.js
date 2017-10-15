var express = require('express')
var mongo = require('mongodb').MongoClient
var isURL = require('is-url')
var app = express()
var uri = 'mongodb://heroku_hj043f9f:jjqeethl1t8cnn3smfao50kaai@ds119675.mlab.com:19675/heroku_hj043f9f'
var local_db = 'mongodb://localhost:27017/url-shortener'
var db_url = uri || local_db
const port = process.env.PORT || 4000;

console.log('App running on '+port)

app.use(express.static('app'))

/* Shorten URLs. Shortened URLs are built from the index of the document the new URL creates 
   in the database. 
   Checks whether the URL that was typed in follows the URL format, using the package is-url*/
app.get('/new/*',(req,res) => {
  mongo.connect(db_url, (err, db) => {
  	var url = req.url.substr(5,req.url.length-1)
  	if (isURL(url)) {
  		var host = req.get('host')
	  	var collection = db.collection('documents');
	  	collection.count()
	  	.then(count => {
	  		var obj = {shortened: count,url: url}
	  		collection.insert(obj,
	  			(err,data) => {
	  				res.send({
	  					original_url: obj['url'],
	  					shortened_url: 'https://'+host+'/'+obj['shortened']
	  				})
	  			})
	  		})
	  	.then(() => {
	  		db.close()
	  	})
  	}
  	else {
  		res.send({
  			'error': 'The string you typed in does not seem to have a valid URL format'
  		})	
	  }
  });
})

/*Redirects shortened URLs to the original URL. If someone types in a link that doesn't exist,
returns that this link doesn't exist*/
app.get('/*',(req,res) => {
  mongo.connect(db_url, (err, db) => {
  	var shortened = req.url.substr(1,req.url.length-1)
  	shortened = parseInt(shortened)
  	var collection = db.collection('documents');
  	var findings = collection.find({
  		'shortened': shortened
  	}).limit(1).next(function(err,result){
  		if (result) {
	  		res.redirect(result['url'])
	  	}
	  	else {
	  		res.send({'error:': 'Shortened URL does not exist'})
	  	}
  	})
  	db.close()
  	
  });
})

// To delete the database, uncomment this and got to the /delete path
// app.get('/delete',(req,res) => {
// 		mongo.connect(db_url, (err, db) => {
//   	var collection = db.collection('documents');
//   	collection.remove()
//   	res.send("deleted")
//   })
// })

app.listen(port); 