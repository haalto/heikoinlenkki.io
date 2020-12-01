import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

type ResponseCreateRoom = {
  roomCode: string;
};

type Player = {
  name: string;
};

const Game: React.FC = () => {
  const [roomCode, setRoomCode] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const { current: socket } = useRef(
    io("http://localhost:5000", {
      autoConnect: false,
    })
  );

  useEffect(() => {
    socket.open();
    socket.emit("init-new-room");

    socket.on("room-created", (res: ResponseCreateRoom) => {
      socket.emit("join-room-game", res.roomCode);
      setRoomCode(res.roomCode);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return (
    <div>
      <span>Join the room using following code!</span>
      <div>{roomCode}</div>
      <div>Players:</div>
      <div>
        {players.map((p, i) => (
          <div key={i}>{p.name}</div>
        ))}
      </div>
    </div>
  );
};

export default Game;
