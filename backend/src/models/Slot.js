const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
 
  wid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  slots: [
    {
      start: String, 
      end: String,   
      isBooked: {
        type: Boolean,
        default: false,
      },
    },
  ],
 
  },{
    timestamps:true,
  }
 
);

const Slot= mongoose.model('Slot', slotSchema );


module.exports = Slot;