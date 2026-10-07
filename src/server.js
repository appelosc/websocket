const httpServer = require("http").createServer();
const jwt = require("jsonwebtoken");
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

// verification middleware
io.use((socket,next) =>{
    const token = socket.handshake.auth.token;
    if(!token){
        return next(new Error("No token provided"))
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.data.user = decoded;
        next();
    }catch(err){
        if(err.name === "TokenExpiredError"){
            return next(new Error("Token expired"))
        }
        return next(new Error("Invalid token"))
    }
})
// simple sendback function. user joins room based on id so messages is only sent to users other devices
// message server recieves is sent back to all other devices in the room
io.on("connection", (socket) => {
  console.log("connected")
  socket.emit("hello", "world");

  const room = `room-${socket.data.user.sub}`;
  socket.join(room);

  socket.on("message", (data) => {
    socket.to(room).emit("message", data);
  });
});

httpServer.listen(3000);