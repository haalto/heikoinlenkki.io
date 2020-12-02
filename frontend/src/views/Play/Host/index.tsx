import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { GameState } from "../../../types";

interface HostProps {
  socket: typeof Socket;
  username: string;
}

const Host: React.FC<HostProps> = ({ socket, username }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  useEffect(() => {
    socket.on("game-state-update", (newGameState: GameState) => {
      setGameState(newGameState);
    });
  }, [socket]);

  const startGame = () => {
    socket.emit("start-game");
  };

  if (gameState?.gameStarted) {
    return <div>Game started! Speak something</div>;
  }

  return (
    <div>
      <div>Hey, {username}</div>
      <div>You are the host!</div>
      <button onClick={() => startGame()}>Start game</button>
    </div>
  );
};

export default Host;
