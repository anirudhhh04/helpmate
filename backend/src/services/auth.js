const jwt=require("jsonwebtoken");
const secretkey="emad@123";
function setuser(user){
 
   return jwt.sign({_id:user._id,email:user.email,username:user.username,
     }
    ,secretkey);
}
function getuser(token){
    return jwt.verify(token,secretkey);
}

module.exports={setuser,getuser};