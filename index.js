const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");
const app = express();
const bcrypt=require("bcryptjs");
const {signupSchema,loginSchema,contactSchema}=require("./validators/auth-validators");
const validate=require("./middlewares/validator");
const errorMiddleware=require("./middlewares/error-handling");
const Contact=require("./models/contact-model");
const cors=require("cors");
const authMiddleware = require("./middlewares/auth-middleware");
const Service = require("./models/service-model");
const adminMiddleware = require("./middlewares/admin-middleware");


const corsOption={
  origin:"http://localhost:3000",
  methods:"GET,POST,PUT,DELETE,PATCH,HEAD",
  creadentials:true,
}
app.use(cors(corsOption));

app.use(express.json());
main().then(() => {
  console.log("connected");
})
  .catch((err) => {
    console.log(err);

  })


async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/thapatechnical');
}
app.get("/", (req, res) => {
  res.status(200).send("Welcome to thapa technical Mern Series Updated");
});

app.post("/api/auth/register",validate(signupSchema), async (req, res) => {
  try {

    const { username, email, phone, password } = req.body;

    const userExist = await User.findOne({ email: email });

    if (userExist) {
      return res.status(400).json({ message: "email already exists" });
    }

    const userCreated = await User.create({ username, email, phone, password });

    // res.status(201).json({ message: "User registered successfully" });
    res.status(201).json({
      msg: "Registration Successful", token: await userCreated.generateToken(),
      userId: userCreated._id.toString()
    });
  } catch (error) {
    // res.status(500).json({ message: "Internal server error" });
    next(error)
  }
});

app.post("/api/auth/login",validate(loginSchema),async(req,res)=>{
  try{
    let {email,password}=req.body;
    const userExist=await User.findOne({email});
    if(!userExist){
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid=await bcrypt.compare(password,userExist.password);
    
    if(isPasswordValid){
      res.status(200).json({message:"Login Successful",
        token:await userExist.generateToken(),
        userId:userExist._id.toString()
      })
    }
    else{
      res.status(401).json({ message: "Invalid email or passord " });
    }

  }
  catch(error){
    res.status(500).json({ message: "Internal server error" });
  }
})

app.post("/api/form/contact",validate(contactSchema),async(req,res)=>{
  try{
   
    await Contact.create(req.body);
    return res.status(200).json({ message: "message send successfully" });
  }
  catch(error){
    console.error(error);
    return res.status(500).json({ message: "message not delivered" });
  }
})
app.get('/api/data/user',authMiddleware,async(req,res)=>{
  try{
    const userData=req.user;
    console.log(userData);
    return res.status(200).json({userData});
  }
  catch(error){
    console.log(`error from the user route ${error}`);
  }
   
})
app.get('/api/data/services',async(req,res)=>{
  try{
    const response=await Service.find();
    if(!response){
      res.status(404).json({data:response});
      return ;
    }
    return res.status(200).json({data:response});

  }
  catch(error){
    console.log("error from server ",error);

  }
})

app.get('/api/admin/users',authMiddleware,adminMiddleware,async(req,res,next)=>{
  try{
    const users= await User.find({},{password:0});
    if(!users||users.length===0){
      return res.status(404).json({message:"No user found"});
    }
    return res.status(200).json({users});

  }
  catch(error){
    console.log(error);
  }
})
app.get('/api/admin/contacts',authMiddleware,adminMiddleware,async(req,res,next)=>{
  try{
    const contacts= await Contact.find();
    if(!contacts||contacts.length===0){
      return res.status(404).json({message:"No contact found"});
    }
    return res.status(200).json({contacts});

  }
  catch(error){
    console.log(error);
  }
})
app.delete("/api/admin/users/delete/:id",authMiddleware,adminMiddleware,async(req,res)=>{
  try{
    const id=req.params.id;
    await User.deleteOne({_id:id});
    res.status(200).json({message:"User deleted Successfully"});

  }
  catch(error){
    console.log(error);
  }
})
app.get("/api/admin/users/:id",authMiddleware,adminMiddleware,async(req,res)=>{
  try{
    const id=req.params.id;
    const data=await User.findOne({_id:id},{password:0});
    res.status(200).json({data});

  }
  catch(error){
    console.log(error);
  }
})
app.patch("/api/admin/users/update/:id",authMiddleware,adminMiddleware,async(req,res)=>{
  try{
    const id=req.params.id;
    const data=req.body;
    const response=await User.updateOne({_id:id},{$set:data});
    res.status(200).json({message:"User data updated successfully."});

  }
  catch(error){
    console.log(error);
  }
})
app.use(errorMiddleware)
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`server is running at port: ${PORT}`);
});