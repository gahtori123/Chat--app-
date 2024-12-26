const asyncHandler = require("express-async-handler");
const chatModel = require("../Models/chatModel");
const userModel = require("../Models/userModel");

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    console.log("no user id found");
    return res.status(400);
  }

  var isChat = await chatModel
    .find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: userId } } },
        { users: { $elemMatch: { $eq: req.user._id } } },
      ],
    })
    .populate("users", "-password")
    .populate("latestMessage");
  console.log(isChat);
 console.log("hello");
 
  isChat = await userModel.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });
  console.log(isChat);

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatAData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
      // latestMessage:null
    };

    try {
      const createdChat = await chatModel.create(chatAData);
      const fullChat = await chatModel
        .findOne({ _id: createdChat._id })
        .populate("users", "-password");

      res.send(fullChat);
    } catch {
      res.status(500);
      console.log("Error in creating chat");
      res.send("Error in creating chat");
    }
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    chatModel
      .find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
   //    .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await userModel.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.send(results);
      });
  } catch (error) {
    res.send(error);
  }
});

const fetchGroupChats = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.user.name) {
    res.status(400);
    throw new Error("Please provide users and user name");
  }

  var users = JSON.parse(req.body.users);
  if (users.length < 2) {
    res.status(400);
    throw new Error("At least two users required to create group chat");
  }
  users.push(req.user);
  try {
    const groupChat = await chatModel.create({
      chatName: req.body.name,
      isGroupChat: true,
      users: users,
      groupAdmin: req.user,
    });

    const fullGroupChat = await chatModel
      .findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(500);
    console.log("Error in creating group chat");
    res.send("Error in creating group chat");
  }
});

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;
  if (!chatId || !chatName) {
    res.status(400);
    throw new Error("Please provide chat id and new name");
  }

  const updatedChat = await chatModel
    .findByIdAndUpdate(chatId, { chatName: chatName }, { new: true })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat not found");
  }
  console.log(updatedChat);
  
  res.json(updatedChat);
});

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  if (!chatId || !userId) {
    res.status(400);
    throw new Error("Please provide chat id and users to add");
  }

  const added = await chatModel
    .findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
    
  if (!added) {
    res.status(404);
    throw new Error("Chat not found");
  }
  else{
    res.json(added);
  }
   
});

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  if (!chatId || !userId) {
    res.status(400);
    throw new Error("Please provide chat id and users to add");
  }

  const removed = await chatModel
    .findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    
    throw new Error("Chat not found");
  } else {
    res.json(removed);
  }k
});



module.exports = {
  accessChat,
  fetchChats,
  fetchGroupChats,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
