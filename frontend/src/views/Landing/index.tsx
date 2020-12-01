import React, { useRef, useState } from "react";

import useNavigation from "../../hooks/useNavigation";

const Landing: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const { goToCreateNewGame, goToJoinGame } = useNavigation();

  return (
    <div>
      <div>
        <input value={code} onChange={(e) => setCode(e.target.value)} />
        <button onClick={() => goToJoinGame(code)}>Join</button>
      </div>
      <button onClick={() => goToCreateNewGame()}>Create game room</button>
    </div>
  );
};

export default Landing;
