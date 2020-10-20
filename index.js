const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const app = express();

dotenv.config();

const mongoose = require('./config/db');

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const eventRoutes = require('./routes/eventRoutes');
const runRoutes = require('./routes/runRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

var port = process.env.PORT || process.env.SERVER_PORT;

app.get('/', (req, res) => res.send('Hello World with Express'));

app.use(userRoutes);
app.use(postRoutes);
app.use(eventRoutes);
app.use(runRoutes);
app.use(chatRoutes);
app.use(messageRoutes);

var server = app.listen(port, function () {
    console.log("Running ApiServer on port " + port);
});

var io = require('socket.io')(server);

app.set('socketio', io);

require('./sockets/chatsSocket')(io);
require('./sockets/messagesSocket')(io);

