const mongoose = require("mongoose");
const bcrypt= require("bcryptjs");
const jwt=require("jsonwebtoken");

// Define the User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

//hashing password
userSchema.pre("save",async function(){
  const user=this;
  if(!user.isModified()){
    return next();
  }
  try{
    const saltRound=await bcrypt.genSalt(10);
    const hash_password=await bcrypt.hash(user.password,saltRound);
    user.password=hash_password;

  }
  catch(error){
    return next(error);
  }
})

userSchema.methods.generateToken=async function(){
  try{
    return jwt.sign({
      userId:this._id.toString(),
      email:this.email,
      isAdmin:this.isAdmin
    },
    "Komal",
    {
      expiresIn:"30d"
    }
  )
  }
  catch(error){
    console.error("Token error",error);
  }

}


// define the model or the collection name
 const User = new mongoose.model("User", userSchema);
module.exports=User;