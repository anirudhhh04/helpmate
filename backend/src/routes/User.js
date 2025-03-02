const express=require("express");
const User=require('../models/User');
const Booking=require('../models/Booking');
const router=express.Router();

router.get("/bookings/:id",async (req,res)=>{
    const userid=req.params.id;

    try{
     const bookings=await Booking.find({uid:userid,date:new Date().toISOString().split("T")[0]});
     if(bookings) return res.status(200).json({bookings,success:true});
     return res.status(500).json({success:false});
    }catch(err){
      return res.status(500).json({message:err.message});
    }
      

});
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

router.get('/profile/:id',async (req,res)=>{

  const id=req.params.id;
  try{
    const user=await User.findById(id);
    
    if(!user) return res.status(500).json({message:"user not found please login"});
    return res.status(200).json(user);
} catch (error) {
  console.error('Error logging in:', error);
  return res.status(500).json({ error: 'Server error' });
}
});

router.post('/book',async (req,res)=>{
    const {wid,startHour,endHour,userId,description,status}=req.body;
    const booleanStatus = status === "true" || status === true;
    if (!wid || !userId || !startHour || !endHour) {
      return res.status(400).json({ message: "Missing required fields", success: false });
  }
    try{
        const book=await Booking.create({
          wid,uid:userId,description,status,startHour,endHour,
        });
     console.log(book);
    if(book) return res.status(200).json({message:"created book",success:true}); 

    return res.status(500).json({message:"failed in creating book",success:false}); 
    }catch(err){
      return res.status(500).json({message:err.message,success:false});
    }



});

module.exports=router;