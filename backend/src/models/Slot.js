const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
 
  wid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  slots: [
    {
      startHour: {
        type: Number,
        required: true,
      },
      endHour: {
        type: Number,
        required: true,
      },
      available: {
        type: Boolean,
        default:true,
      },
    },
  ],
},{
    timestamps:true,
  }
 
);

const Slot= mongoose.model('Slot', slotSchema );


module.exports = Slot;