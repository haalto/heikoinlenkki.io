import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

type ResponseCreateRoom = {
  roomCode: string;
};

type ResponsePlayers = {
  players: Player[];
};

type Player = {
  roomCode: string;
  username: string;
};

const Game: React.FC = () => {
  const [roomCode, setRoomCode] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const { current: socket } = useRef(
    io("http://localhost:5001", {
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

    socket.on("player-joined", (res: ResponsePlayers) => {
      console.log(res.players);
      setPlayers(res.players);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const renderPlayers = () => {
    return players.map((p, i) => <div key={i}>{p.username}</div>);
  };
  return (
    <div>
      <span>Join the room using following code!</span>
      <div>{roomCode}</div>
      <div>Players:</div>
      {renderPlayers()}
    </div>
  );
};

export default Game;
