const mongoose = require('mongoose');
const{setuser}=require('../services/auth');


const {
    createHmac,randomBytes,
  } = require('crypto');


const workerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true, 
    trim: true, 
  },
  email: {
    type: String,
    required: true,
    unique: true, 
    },
  salt:{
    type: String,
   
  },
  password: {
    type: String,
    required: true, 
  },
location:{
  required:true,
  type:String,
},
 
  contactNumber:{
    type:String,
    required:true,
  },
  service:{
    type:String,
    required:true,
  },
 imageurl:{
  type:String,
  default: '/images/profilelogo.png',
 },
 
  description:{
    type:String,
    required:true,
  }
  
 
  },{
    timestamps:true,
  }
 
);
workerSchema.pre('save',function(next){
    const worker=this;
    if(!worker.isModified('password')) return next();
    const salt=randomBytes(16).toString('hex');
    const hashpassword = createHmac('sha256', salt).update(worker.password).digest('hex');
    this.salt=salt;
    this.password=hashpassword;
    next();
});
workerSchema.static("matchpassword",async function(email,password){
    const worker=await this.findOne({email});
    if(!worker) return null;
    
    const hashpassword = createHmac('sha256',worker.salt).update(password).digest('hex');
    if(worker.password!==hashpassword) return ;
    const token=setuser(worker);
    return token;
     
});

const Worker= mongoose.model('Worker', workerSchema);


module.exports = Worker;