const express=require("express");
const Worker=require('../models/Worker');
const router=express.Router();

router.post('/register',async (req,res)=>{
    try{
    const workerexisting=await  Worker.findOne({email:req.body.email});
    if(workerexisting) return res.json({message:"worker already exist",success:false});
    const {username,email,password,location,phone,service,description}=req.body;
   const worker =await Worker.create({username,email,password,location:location.toLowerCase(),contactNumber:phone,service,description});
    return res.status(200).json({ message: "worker created successfully",success:true});
}catch(err){
    console.log(err.message);
    return res.status(500).json({message:err.message});
}
});

router.post('/login',async (req,res)=>{
    const {email,password}=req.body;
    try{
        const workerregistered=await Worker.findOne({email:req.body.email});
        if(workerregistered==null){
            res.json({message:"worker not registered",success:false });
        }
    const token= await Worker.matchpassword(email,password);
    if(!token) return res.json({message:"invalid email or password",success:false});
    res.status(200).json({ message: 'User logged in',token,success:true });
} catch (error) {
  console.error('Error logging in:', error);
  res.status(500).json({ error: 'Server error' });
}
});

router.post('/:id',async (req,res)=>{
    try {
        
        const worker = await Worker.findById(req.params.id);
        if (!worker) {
          return res.status(404).json({ message: "Worker not found" });
        }
    
        
       return res.status(200).json(worker);
    
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

module.exports=router;