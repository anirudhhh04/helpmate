const express=require("express");
const Worker=require('../models/Worker');
const router=express.Router();

router.post('/register',async (req,res)=>{
    try{
    const workerexisting=await  Worker.findOne({email:req.body.email});
    if(workerexisting) return res.json({message:"worker already exist",success:false});
    const {username,email,password,location,phone,service,description}=req.body;
   const worker =await Worker.create({username,email,password,location,contactNumber:phone,service,description});
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

module.exports=router;