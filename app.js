var cons 	= require("consolidate");
var	bodyParser 	= require('body-parser');
var express = require("express");
var	app		= express();
var argv = require('optimist').argv;

app.set('port', (process.env.PORT || 5000));


//Rutas	
var routes = require('./routes/rutas');
var control = require('./controller/controller');

app.engine("html", cons.swig); //Template engine...
app.set("view engine", "html");
app.set("views", __dirname + "/vistas");
app.use(express.static('public'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// store session state in browser cookie
var cookieSession = require('cookie-session');
app.use(cookieSession({
    keys: ['secret1', 'secret2']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.use('/', routes);

//app.listen(8080,'127.0.0.1');
//app.listen(3000,argv.fe_ip);
//console.log('Escuchando por el puerto 8080');
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

