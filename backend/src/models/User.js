const mongoose = require('mongoose');
const{setuser}=require('../services/auth');
const {
    createHmac,randomBytes,
  } = require('crypto');


const userSchema = new mongoose.Schema({
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
  
 
  },{
    timestamps:true,
  }
 
);
userSchema.pre('save',function(next){
    const user=this;
    if(!user.isModified('password')) return next();
    const salt=randomBytes(16).toString('hex');
    const hashpassword = createHmac('sha256', salt).update(user.password).digest('hex');
    this.salt=salt;
    this.password=hashpassword;
    next();
});
userSchema.static("matchpassword",async function(email,password){
    const user=await this.findOne({email});
    if(!user) return  null;
    
    const hashpassword = createHmac('sha256',user.salt).update(password).digest('hex');
    if(user.password!==hashpassword) return ;
    const token=setuser(user);
    return token;
     
});

const User = mongoose.model('User', userSchema);


module.exports = User;