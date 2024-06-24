const jwt =require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware=async(req,res,next)=>{
    const token=req.header('Authorization');
    if(!token){
        return res.status(401).json({message:"Unauthorized HTTP,Token not provided"})
    }
    const jsonwebtoken=token.replace("Bearer","").trim();
    
    try{
        const isVerified=await jwt.verify(jsonwebtoken,"Komal");
        console.log(isVerified);
        const user=await User.findOne({email:isVerified.email}).select({password:0});
        req.user=user;
        req.token=token;
        req.userID=user._id;
        next();


    }
    catch(error){
        res.status(401).json({message:"Unauthorized HTTP,Token not provided"})

    }
    


}
module.exports=authMiddleware;