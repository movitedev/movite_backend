const mongoose = require('mongoose');

const runSchema  = new mongoose.Schema({
    from:{
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
    },
    to:{
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
    },
    driver:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    eventDate:{
        type: Date,
        required:true
    },
    passengers:[{
        passenger:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    validated:[{
        passenger:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    active:{
        type: Boolean,
        required: true,
        default: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

runSchema.methods.toJSON = function(){
    const run = this
    const runObj = run.toObject()

    delete runObj.passengers
    delete runObj.validated
    delete runObj.active

    return runObj
}

runSchema.methods.details = async function(){

    const run = this
    await run.populate({path: 'driver', select: 'name'})
    .populate({path: 'passengers.passenger', select: 'name'})
    .populate({path: 'validated.passenger', select: 'name'})
    .execPopulate()

    const runObj = run.toObject()

    return runObj
}

runSchema.pre('save', async function(next){

    const run = this

    run.validated = run.validated.filter((elem, index, self) => self.findIndex(
        (t) => {return (t.passenger).equals(elem.passenger)}) === index);
    

        run.passengers = (run.validated.concat(run.passengers)).filter((elem, index, self) => self.findIndex(
            (t) => {return (t.passenger).equals(elem.passenger)}) === index);

    next();
})

const Run = mongoose.model('Run', runSchema);

module.exports = Run;