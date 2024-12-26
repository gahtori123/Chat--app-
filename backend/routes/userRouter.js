
const express=require('express');
const router=express.Router();
const{ protect}=require("../middlewares/authMiddleware")


const {registerUser,authUser,allUsers}=require('../controlles/userController');

router.route('/').post(registerUser)
 router.post('/login',authUser)
 router.get("/",protect,allUsers)

 
module.exports=router;





