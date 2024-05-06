const { off } = require("process");
const { Server } = require("socket.io");

const io  = new Server(8000,{
    cors: {
        origin: "*",
    }
})

const emailToSocketIdMap = new Map();
const socketIdToemailMap = new Map();


io.on("connection", socket=> {
    console.log(`Socket connected`, socket.id);
    socket.on("room:join", data => {
        const { email, room} = data;
        emailToSocketIdMap.set(email, socket.id);
        socketIdToemailMap.set(socket.id,email);
        io.to(room).emit("user:joined", {email,id: socket.id});
        socket.join(room);
        io.to(socket.id).emit("room:join", data);
    });
    socket.on("message", ({to, message}) => {
        io.to(to).emit("recieve-message", {from: socket.id, message});
    })

    socket.on("user:call", ({to,offer})=> {
        io.to(to).emit("incoming:call", {from: socket.id, offer})
    });

    socket.on("call:Accepted", ({to, ans}) => {
        io.to(to).emit("call:Accepted", {from: socket.id, ans})
    });

    socket.on('peer:nego:needed', ({to, offer}) => {
        io.to(to).emit("peer:nego:needed",{from: socket.id, offer})
    });

    socket.on("peer:nego:done", ({to,ans}) => {
        io.to(to).emit("peer:nego:final",{from: socket.id, ans})
    })
    socket.on("disConnectCall", () => {
        console.log(`Client ${socket.id} wants to disconnect from the call`);
        socket.disconnect(true);
    })

});
