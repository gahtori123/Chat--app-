 
 const express = require("express");
 const router = express.Router();
 const {protect} = require("../middlewares/authMiddleware");
 const {accessChat,fetchChats,fetchGroupChats,renameGroup, addToGroup, removeFromGroup}= require("../controlles/chatController")
 

 router.route("/").post(protect, accessChat);
 router.route("/").get(protect, fetchChats);


 router.route("/group").post(protect,fetchGroupChats);
 router.route("/rename").put(protect, renameGroup);
 router.route("/groupremove").put(protect, removeFromGroup);
 router.route("/groupadd").put(protect, addToGroup);

 
module.exports = router;







