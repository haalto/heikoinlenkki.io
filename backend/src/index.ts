import express from "express";
import ioserver, { Socket } from "socket.io";
import { createServer } from "http";
import morgan from "morgan";
import { generateRoomCode } from "./utils/helpers";

const app = express();
const server = createServer(app);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const io = ioserver(server, {
  cors: {
    origin: "*",
  },
});
const PORT = 5001;

app.use(morgan("tiny"));

server.listen(PORT, () => console.log(`Server is running on port: ${PORT}.`));

const connections: Socket[] = [];
const rooms: Room[] = [];

type Room = {
  roomCode: string;
  players: Player[];
};

type Player = {
  roomCode: string;
  username: string;
};

io.on("connection", (socket: Socket) => {
  connections.push(socket);

  socket.on("init-new-room", () => {
    const roomCode = generateRoomCode();
    const newRoom = { roomCode, players: [] };
    rooms.push(newRoom);
    socket.emit("room-created", { roomCode: roomCode });
  });

  socket.on("join-room-game", (roomCode: string) => {
    socket.join(roomCode);
  });

  socket.on("check-room", (roomCode: string) => {
    if (rooms.filter((r) => r.roomCode === roomCode)) {
      socket.emit("room-available", { roomCode: roomCode });
      console.log("room available");
    } else {
      socket.emit("room-available", { roomCode: null });
    }
  });

  socket.on("join-room-player", (player: Player) => {
    console.log(`${player.username} joining room: ${player.roomCode}`);
    socket.join(player.roomCode);
    socket.emit("connected", { roomCode: player.roomCode });

    const room = rooms.find((r) => r.roomCode);

    if (room) {
      room.players.push(player);
    }

    console.log(room);

    io.to(player.roomCode).emit("player-joined", { players: room?.players });
  });

  socket.on("disconnect", () => {
    connections.splice(connections.indexOf(socket), 1);
  });
});
