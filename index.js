let express = require('express');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let app = express();

const config = require('./config.js');
let apiRoutes = require('./api-routes');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

mongoose.connect(config.url, { useNewUrlParser: true,  useUnifiedTopology: true,});
var db = mongoose.connection;

if(!db)
    console.log("Error connecting db")
else
    console.log("Db connected successfully")

var port = process.env.PORT || config.serverport;

app.get('/', (req, res) => res.send('Hello World with Express'));

app.use('/api', apiRoutes);
app.listen(port, function () {
    console.log("Running ApiServer on port " + port);
});