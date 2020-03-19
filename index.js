const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:kbGIYyXz0G2z8VSQ@cluster0-srp04.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;// Send message for default URL
app.get('/', (req, res) => res.send('Hello World with Express'));// Launch app to listen to specified port
app.listen(port, function () {
     console.log("Running RestHub on port " + port);
});
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});
