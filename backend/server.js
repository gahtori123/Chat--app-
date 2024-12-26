const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const chats = require("./data/data.js");
const userRouter = require("./routes/userRouter");
const chatRouter = require("./routes/chatRouter");
const messageRouter = require("./routes/messageRoutes");
const path=require("path");

const { notFound, errorHandler } = require("./middlewares/errorMiddleware.js");
dotenv.config();
connectDB();
app.use(cors());
app.use(express.json());
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);


const __dirname1 = "C:/Users/hp/chatapp"

  console.log(process.env.NODE_ENV);
  
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/chatify/build")));
// console.log(path.join(__dirname1, "/frontend/chatify/build"));
// console.log(path.resolve(__dirname1, "frontend","chatify", "build", "index.html"))
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend","chatify", "build", "index.html"))
 
);
  
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
const server = app.listen(5000);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});
 
io.on("connection", (socket) => {
  // console.log("connected");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    // console.log(userData._id);

    socket.emit("Connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    // console.log("room" + room);
  });
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    console.log(newMessageRecieved)
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });
    
  socket.on("typing",(room)=>socket.in(room).emit('typing'))
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.off("setup",()=>{
      socket.leave(userData._id);
    })


});
