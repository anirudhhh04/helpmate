const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  uid:{
    type: mongoose.Schema.Types.ObjectId,  
    ref: "User",   
    required: true
  },
  wid:{
    type:String,
    required:true,
  },
  date:{
    type: String,
    default: () => new Date().toISOString().split("T")[0],
  },
  status:{
   type:Boolean,
   required:true,
  },
  description:{
    type:String,
    required:true,
  },
  startHour:Number,
  endHour:Number,
  
 
  },{
    timestamps:true,
  }
 
);

const Booking= mongoose.model('Booking', bookingSchema);


module.exports = Booking;