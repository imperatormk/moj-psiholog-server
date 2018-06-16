const express = require('express');
const app = express();
var http = require('http').Server(app);
var router = express.Router();

var bodyParser = require('body-parser');

// routes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.json({
      sane: true
    });
});

http.listen(3002, () => console.log('App listening on port 3002!'));