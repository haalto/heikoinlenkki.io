import express from "express";
import ioserver, { Socket } from "socket.io";
import { createServer } from "http";
import morgan from "morgan";
import { generateRoomCode } from "./utils/helpers";
import { emit } from "process";

const app = express();
const server = createServer(app);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const io = ioserver(server, {
  cors: {
    origin: "*",
  },
});
const PORT = 5000;

app.use(morgan("tiny"));

server.listen(PORT, () => console.log(`Server is running on port: ${PORT}.`));

const connections: Socket[] = [];
const rooms: string[] = [];

io.on("connection", (socket: Socket) => {
  connections.push(socket);

  socket.on("init-new-room", () => {
    const roomCode = generateRoomCode();
    rooms.push(roomCode);
    socket.emit("room-created", { roomCode: roomCode });
  });

  socket.on("join-room-game", (roomCode: string) => {
    socket.join(roomCode);
  });

  socket.on("check-room", (roomCode: string) => {
    if (rooms.includes(roomCode)) {
      socket.emit("room-available", { roomCode: roomCode });
    } else {
      socket.emit("room-available", { roomCode: null });
    }
  });

  socket.on("join-room-player", (roomCode: string) => {
    console.log(`New player joining room: ${roomCode}`);
    socket.join(roomCode);
    socket.emit("connected", { roomCode: roomCode });
    //io.to(roomCode).emit('player-joined', )
  });

  socket.on("disconnect", () => {
    connections.splice(connections.indexOf(socket), 1);
  });
});
