import express from "express";
import ioserver, { Socket } from "socket.io";
import { createServer } from "http";
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
server.listen(PORT, () => console.log(`Server is running on port: ${PORT}.`));

const rooms: GameRoom[] = [];

type GameState = {
  gameStarted: boolean;
  players: PlayerData[];
};

type JoiningPlayerData = {
  roomCode: string;
  username: string;
};

interface SocketWithProps extends Socket {
  playerData: PlayerData;
  roomCode: string;
  type: "GAME" | "PLAYER";
}

interface PlayerData {
  username: string;
  isHost: boolean;
  ready: boolean;
}

class GameRoom {
  roomCode: string;
  gameState: GameState;
  sockets: SocketWithProps[];

  constructor(roomCode: string) {
    this.roomCode = roomCode;
    this.gameState = { gameStarted: false, players: [] };
    this.sockets = [];
  }

  getGameState() {
    const players = this.sockets.map((s) => s.playerData);
    return { ...this.gameState, players };
  }
}

io.on("connection", (socket: SocketWithProps) => {
  socket.on("init-new-room", () => {
    const roomCode = generateRoomCode();
    const newRoom = new GameRoom(roomCode);
    rooms.push(newRoom);
    socket.emit("room-created", { roomCode: roomCode });
  });

  socket.on("join-room-game", (roomCode: string) => {
    socket.roomCode = roomCode;
    socket.type = "GAME";
    socket.join(roomCode);
  });

  socket.on("join-room-player", (player: JoiningPlayerData) => {
    console.log(`${player.username} joining room: ${player.roomCode}`);

    const room = rooms.find((r) => r.roomCode === player.roomCode);

    if (!room) {
      socket.emit("room-unavailable");
    }

    const existingSocket = room?.sockets.find(
      (s) => s.playerData.username === player.username
    );

    if (existingSocket) {
      room?.sockets.splice(
        room.sockets.findIndex(
          (s) => s.playerData.username === player.username
        ),
        1
      );
      existingSocket.leave(existingSocket.roomCode);
    }

    socket.type = "PLAYER";
    socket.playerData = {
      username: player.username,
      isHost: room?.sockets.length === 0,
      ready: false,
    };
    socket.roomCode = player.roomCode;

    room?.sockets.push(socket);
    room?.gameState.players.push(socket.playerData);

    socket.join(player.roomCode);
    io.to(player.roomCode).emit("player-joined", {
      players: room?.sockets.map((s) => s.playerData),
    });
    socket.emit("connected", socket.playerData);
  });

  socket.on("start-game", () => {
    console.log(`Game started on room: ${socket.roomCode}`);

    if (socket.playerData.isHost) {
      const room = rooms.find((r) => r.roomCode === socket.roomCode);

      if (room) {
        room.gameState.gameStarted = true;
        io.to(socket.roomCode).emit("game-state-update", room.gameState);
      }
    }
  });

  socket.on("player-ready", (rdy: boolean) => {
    socket.playerData.ready = rdy;
    const room = getRoomByCode(socket.roomCode);
    io.to(socket.roomCode).emit("game-state-update", room?.getGameState());
  });
  socket.on("disconnect", () => {
    if (socket.type === "GAME") {
      console.log(`Game room ${socket.roomCode} disconnected`);
    }

    if (socket.type === "PLAYER") {
      console.log(
        `Player ${socket.playerData.username} was disconnected from room ${socket.roomCode}`
      );
    }
  });
});

function getRoomByCode(roomCode: string) {
  return rooms.find((r) => r.roomCode === roomCode);
}
