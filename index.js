var express = require('express')
var app = express()
var mongo = require('mongodb').MongoClient
var uri = 'mongodb://heroku_hj043f9f:jjqeethl1t8cnn3smfao50kaai@ds119675.mlab.com:19675/heroku_hj043f9f'
var assert = require('assert')
var local_db = 'mongodb://localhost:27017/url-shortener'
var db_url = uri || local_db
const port = process.env.PORT || 4000;

console.log('App running on Port 4000')

app.use(express.static('app'))

// app.get('/delete',(req,res) => {
// 		mongo.connect(db_url, (err, db) => {
//   	var collection = db.collection('documents');
//   	collection.remove()
//   	console.log("deleted")
//   })
// })

//handle new urls to shorten
app.get('/new/*',(req,res) => {

  mongo.connect(uri, (err, db) => {
  	var host = req.get('host')
  	var url = req.url.substr(5,req.url.length-1)
  	var collection = db.collection('documents');
  	collection.count()
  	.then(count => {
  		var obj = {shortened: count,url: url}
  		collection.insert(obj,
  			(err,data) => {
  				res.send({
  					url: obj['url'],
  					shortened: host+'/'+obj['shortened']
  				})
  			})
  		})
  	.then(() => {
  		db.close()
  	})
  });
})

//link to shortened urls
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
	  		res.send("Shortened URL does not exist")
	  	}
  	})
  	db.close()
  	
  });
})


app.listen(port); 