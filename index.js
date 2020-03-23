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

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

var port = process.env.SERVER_PORT;

app.get('/', (req, res) => res.send('Hello World with Express'));

app.use(userRoutes);
app.use(postRoutes);
app.use(eventRoutes);
app.use(runRoutes);
app.use(chatRoutes);

app.listen(port, function () {
    console.log("Running ApiServer on port " + port);
});