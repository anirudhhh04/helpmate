const express=require("express");
const User=require('../models/User');
const Booking=require('../models/Booking');
const Slot=require('../models/Slot');
const router=express.Router();
const moment = require("moment"); 

router.put("/bookings/cancel/:id/:date/:starthour",async (req,res)=>{

  const { id, date, starthour } = req.params;

  try {
    // Parse the booking date and today's date
    const bookingDate = moment(date, "YYYY-MM-DD").startOf('day');
    const today = moment().startOf('day');

    // Only allow cancellation if today is before the booking date
    if (!today.isBefore(bookingDate)) {
      return res.status(400).json({
        message: "Booking can only be cancelled the day before or earlier.",success:false
      });
    }
   console.log("cancellation allowed");
    // Find and update the booking
    const booking = await Booking.findOneAndUpdate(
      {
        uid: id,
        date: date,
        startHour: starthour
      },
      { deleted: true, status:2 },
      { new: true }
    );

     
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const result = await Slot.updateOne(
      {
        wid: booking.wid,
        date: date,
        "slots.startHour": Number(starthour)
      },
      {
        $set: { "slots.$.available": true }
      }
    );


   return res.status(200).json({ message: "Booking cancelled", success :true });

  } catch (error) {
    
      return res.status(500).json({ message: error.message });
  }
});
router.get("/bookings/:id/:date",async (req,res)=>{
    const userid=req.params.id;
    const date=req.params.date;
    try{
     const bookings=await Booking.find({uid:userid,date});
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
 
  return res.status(500).json({ error: 'Server error' });
}
});

router.post('/book',async (req,res)=>{
    const {wid,startHour,endHour,userId,description,status,date}=req.body;
    const booleanStatus = status === 1;
    if (!wid || !userId || !startHour || !endHour) {
      return res.status(400).json({ message: "Missing required fields", success: false });
  }
    try{
        const book=await Booking.create({
          wid,uid:userId,description,status,startHour,endHour,date
        });
    
    if(book) return res.status(200).json({message:"created book",success:true}); 

    return res.status(500).json({message:"failed in creating book",success:false}); 
    }catch(err){
      return res.status(500).json({message:err.message,success:false});
    }



});

module.exports=router;