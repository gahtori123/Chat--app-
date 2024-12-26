const generateToken = require("../config/generateToken");
const userModel = require("../Models/userModel");

const asyncHandler = require("express-async-handler");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter the fields");
  }

  const userExists = await userModel.find({ email: email });
  
  
  if (userExists.length>0) {
    res.status(400);
    throw new Error("Email already exists");
  }

  const user = await userModel.create({
    name,
    email,
    password,
    pic,
  });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
     // isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  }
});

const authUser=asyncHandler(async(req,res)=>{
  const {email, password} = req.body;
  if(!email ||!password){
    res.status(400);
    throw new Error('Please enter the email and password');
  }

   const user = await userModel.findOne({email:email});
   if(!user || !(await user.matchPassword(password))){
    res.status(401);
    throw new Error('Invalid email or password');
   }
   else{
   res.json({
     _id: user._id,
     name: user.name,
     email: user.email,
    // isAdmin: user.isAdmin,
     pic: user.pic,
     token: generateToken(user._id),
   });
  }
})

const allUsers=asyncHandler(async(req,res)=>{
  const keyword=req.query.search
  ?{
    $or:[
      {name:{$regex:req.query.search,$options:"i"}},
      {email:{$regex:req.query.search,$options:"i"}},
    ],
  }:{};
  
  const users=await userModel.find(keyword)
  res.send(users);

})
module.exports = { registerUser,authUser,allUsers};
