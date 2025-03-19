const express=require("express");
const router=express.Router();
const Rating=require('../models/Rating');


router.post("/add",async (req,res)=>{
 const {userId,workerId,rating,comment}=req.body;
try{
     const rate=await Rating.create({
        uid:userId,
        wid:workerId,
        rating,
        comment,
     });

     return res.status(200).json({message:"rating created",success:true});


}catch(err){

    return res.status(500).json({message:err.message,success:false});
}

})

router.get("/worker/:wid",async (req,res)=>{
    
    const wid=req.params.wid;
    try{
         const ratings=await Rating.find({wid}).populate('uid', 'username');;
         
         return res.status(200).json({ratings,success:true});
    
    
    }catch(err){
    
        return res.status(500).json({message:err.message,success:false});
    }




})


module.exports=router;