import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import useNavigation from "../../hooks/useNavigation";

interface ParamTypes {
  roomCode: string;
  username: string;
}

type ResponseJoinRoom = {
  roomCode: string;
};

const Play: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const { roomCode, username } = useParams<ParamTypes>();

  const { goToLanding } = useNavigation();

  const { current: socket } = useRef(
    io("http://localhost:5001", {
      autoConnect: false,
    })
  );

  useEffect(() => {
    socket.open();
    socket.emit("join-room-player", { roomCode, username });

    socket.on("room-unavailable", () => {
      goToLanding();
    });

    socket.on("connected", () => {
      setLoading(false);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, socket]);

  if (loading) {
    return <div>Loading</div>;
  }

  return (
    <div>
      <div>{roomCode}</div>
      <div>{username}</div>
    </div>
  );
};

export default Play;
