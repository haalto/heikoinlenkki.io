import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

interface ParamTypes {
  roomCode: string;
}

type ResponseJoinRoom = {
  roomCode: string | null;
};

const Play: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState("");
  const { roomCode } = useParams<ParamTypes>();
  const { current: socket } = useRef(
    io("http://localhost:5000", {
      autoConnect: false,
    })
  );

  useEffect(() => {
    socket.open();

    socket.emit("check-room", roomCode);

    socket.on("room-available", (res: ResponseJoinRoom) => {
      console.log("res");
      if (res.roomCode === roomCode) {
        setConnected(true);
      }
    });
  }, [roomCode, socket]);

  const sendUsername = (e: React.FormEvent, username: string) => {
    e.preventDefault();
    socket.emit("set-username", { roomCode, username });
  };

  if (connected && !username) {
    return (
      <div>
        <span>Connected</span>
        <div>
          <form onSubmit={(e) => sendUsername(e, username)}>
            <input type="submit" />
            <button>Send</button>
          </form>
        </div>
      </div>
    );
  }

  if (connected) return <div>{roomCode}</div>;
};

export default Play;
