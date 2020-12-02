import React, { useEffect } from "react";
import { Socket } from "socket.io-client";

interface HostProps {
  socket: typeof Socket;
  username: string;
}

const Host: React.FC<HostProps> = ({ socket, username }) => {
  useEffect(() => {
    socket.on("game-state-update", () => {});
  }, [socket]);

  const startGame = () => {
    socket.emit("start-game");
  };

  return (
    <div>
      <div>Hey, {username}</div>
      <div>You are the host!</div>
      <button onClick={() => startGame()}>Start game</button>
    </div>
  );
};

export default Host;
