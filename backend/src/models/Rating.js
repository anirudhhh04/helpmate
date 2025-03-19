const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  uid:{
    type: mongoose.Schema.Types.ObjectId,  
    ref: "User",   
    required: true
  },
  wid:{
    type:String,
    required:true,
  },
   comment:{
    type:String,
   },
   rating:{
    type:Number,
   }
  },{
      timestamps:true,
    }
   
  );
  
  const Rating= mongoose.model('Rating', RatingSchema);
  
  
  module.exports = Rating;