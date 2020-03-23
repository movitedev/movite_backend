const mongoose = require('mongoose');
let dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  }).then(res=>{
          console.log("DB Connected!")
  }).catch(err => {
    console.log(Error, err.message);
  });
  
  module.exports = mongoose;