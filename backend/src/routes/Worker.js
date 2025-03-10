const express=require("express");
const mongoose = require('mongoose');
const Worker=require('../models/Worker');
const Slot=require("../models/Slot");
const Convertslot=require("../controller/Convertslot");
const Booking=require("../models/Booking");
const router=express.Router();

router.put("/slots/update/:wid",async (req,res)=>{
  const wid=req.params.wid;
  const starthour=req.body.starthour;
  const endhour=req.body.endhour;

  try{
 
   const  slot=await Slot.findOneAndUpdate(
      { 
        wid, 
        date: req.body.date, 
        "slots.startHour": starthour, 
        "slots.endHour": endhour 
      }, 
      { 
        $set: { "slots.$.available": false } // ✅ Correct - Updates only the matched slot
      },
      { new: true } 
    );
    if(slot) return res.status(200).json({success:true});
    return res.status(500).json({success:false});

  }catch(err){
    return res.status(500).json({message:err.message,success:false});
  }
})

router.put("/bookings/confirm/:id",async (req,res)=>{
  const bookingid=req.params.id;
  try{
     const booking=await Booking.findOneAndUpdate(
      { _id: bookingid, date: req.body.date },
      { status: req.body.status }, 
      { new: true }                 
    );
    if(booking) return res.status(200).json({message:"booking confirmed",success:true});
    return res.status(500).json({message:"booking doesnt exist",success:false});

  }catch(err){
    return res.status(500).json({message:err.message,success:true});
  }

})
router.get("/bookings/:id",async (req,res)=>{
    const wid=req.params.id;
    try{
      const bookings=await Booking.find({wid}).populate('uid', 'username');;
     if(bookings) return res.status(200).json({bookings,success:true});
     return res.status(500).json({message:"no bookings",success:false});

    }catch(err){
      return res.status(500).json({message:err.message,success:false});
    }
});
router.get("/slots/:id/:date",async (req,res)=>{
  const id=req.params.id;
  const date=req.params.date;
  
  try{

    
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid Slot ID" });
  }

  // Find slot by id and select only the 'slots' field
  const slot = await Slot.findOne({wid: id,date}).select("slots");
  
  
  // If no slot found
  if (!slot) {
    return res.status(404).json({ message: "Slot not found" ,success:false});
  }

  // If slot found, return only the slots field
  return res.status(200).json({slots:slot.slots,success:true});

} catch(error) {
 
  return res.status(500).json({ message: "Server error", error: error.message });
}
}
  );

router.post('/register',async (req,res)=>{
    try{
    const workerexisting=await  Worker.findOne({email:req.body.email});
    if(workerexisting) return res.json({message:"worker already exist",success:false});
    const {username,email,password,location,phone,service,description}=req.body;
   const worker =await Worker.create({username,email,password,location:location.toLowerCase(),contactNumber:phone,service,description});
    return res.status(200).json({ message: "worker created successfully",success:true});
}catch(err){
   
    return res.status(500).json({message:err.message});
}
});

router.post('/login',async (req,res)=>{
    const {email,password}=req.body;
    try{
        const workerregistered=await Worker.findOne({email:req.body.email});
        if(workerregistered==null){
          return res.json({message:"worker not registered",success:false });
        }
    const token= await Worker.matchpassword(email,password);
    if(!token) return res.json({message:"invalid email or password",success:false});
     return res.status(200).json({ message: 'User logged in',token,success:true });
} catch (error) {
  console.error('Error logging in:', error);
  res.status(500).json({ error: 'Server error' });
}
});

router.get('/get/:id',async (req,res)=>{
    try {

      console.log(req.params.id)
        
        const worker = await Worker.findById(req.params.id);
        
        if (!worker) {
          return res.status(404).json({ message: "Worker not found",success:false });
        }
    
        
       return res.status(200).json({worker,success:true});
    
      } catch (error) {
        
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }


});
router.get('/services/:location',async (req,res)=>{
  try{
    const location=req.params.location.toLowerCase();
     const services = await Worker.find({ location: location }).distinct('service');

    if (services.length === 0) {
      return res.status(404).json({ message: "No services found in this location" });
    }
   
    return res.json(services);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }

}
);
router.get('/:location/:service',async (req,res)=>{
  try{
    const location=req.params.location.toLowerCase();
    const service=req.params.service.toLowerCase();
    const workers=await Worker.find({location:location,service:service});
    return res.json(workers) ;
  }catch(err){
    return res.json({message:err.message});
  }


});
router.post("/slots",async (req,res)=>{
  try {
    const { workerId, date, slots } = req.body;

    // Validate workerId
    if (!mongoose.Types.ObjectId.isValid(workerId)) {
      return res.status(400).json({ message: "Invalid Worker ID" });
    }

    const formattedslot = Convertslot(slots);
    

    // Find the slot document
    let slotDocument = await Slot.findOne({ wid: workerId, date });

    if (slotDocument) {
      // Update existing slot document
      slotDocument.slots = formattedslot;
      await slotDocument.save();
      return res.status(200).json({ message: "Slots updated successfully!", slotDocument });
    } else {
      // Create new slot document
      const newSlot = await Slot.create({
        wid: workerId,
        date,
        slots: formattedslot
      });
      return res.status(201).json({ message: "Slots created successfully!", newSlot });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});



module.exports=router;