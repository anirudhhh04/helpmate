const express=require("express");
const User=require('../models/User');
const router=express.Router();

router.post('/register',async (req,res)=>{
    try{
    const userexisting=await User.findOne({email:req.body.email});
    if(userexisting) return res.json({message:"user already exist",success:false});
    const {username,email,password}=req.body;
   const user =await User.create({username,email,password});
   return res.status(200).json({ message: 'User created successfully',success:true});
}catch(err){
    console.log(err.message);
   return res.status(500).json({message:err.message});
}
});

router.post('/login',async (req,res)=>{
    const {email,password}=req.body;
    try{
    const userregistered=await User.findOne({email:req.body.email});
    if(!userregistered){
      return  res.status(200).json({message:"user not registerd",success:false });
    }
    const token= await User.matchpassword(email,password);
    if(!token) return res.json({message:"invalid email or password",success:false});
   return  res.status(200).json({ message: 'User logged in',token,success:true });
} catch (error) {
  console.error('Error logging in:', error);
  return res.status(500).json({ error: 'Server error' });
}
});

module.exports=router;