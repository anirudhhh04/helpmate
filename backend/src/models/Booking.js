const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  uid:{
    type:Number,
    required:true,
  },
  wid:{
    type:Number,
    required:true,
  },
  date:{
    type:date,
    required:true,
  },
  status:{
   type:Boolean,
   required:true,
  },
  description:{
    type:String,
    required:true,
  }
  
 
  },{
    timestamps:true,
  }
 
);

const Booking= mongoose.model('Booking', bookingSchema);


module.exports = Booking;