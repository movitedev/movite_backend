const mongoose = require('mongoose');

const locationSchema  = new mongoose.Schema({
    name:{
        type:String,
        trim: true
    },
    location: {
        type: {
          type: String,
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      }
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;