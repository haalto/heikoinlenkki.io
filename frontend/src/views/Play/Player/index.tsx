import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

interface PlayerProps {
  socket: typeof Socket;
  username: string;
}

const Player: React.FC<PlayerProps> = ({ socket, username }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    socket.on("game-state-update", () => {});
  }, [socket]);

  const updateRdy = () => {
    socket.emit("player-ready", !ready);
    setReady(!ready);
  };

  return (
    <div>
      <div>Hey, {username}</div>
      <div>You are a player!</div>
      <button onClick={() => updateRdy()}>
        {!ready ? "Ready" : "Not ready"}
      </button>
    </div>
  );
};

export default Player;
