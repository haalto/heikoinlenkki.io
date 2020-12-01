import { useHistory } from "react-router-dom";

function useNavigation() {
  const history = useHistory();

  const goToCreateNewGame = () => {
    history.push("/game");
  };
  const goToJoinGame = (code: string) => {
    history.push(`/play/${code}`);
  };

  return { goToJoinGame, goToCreateNewGame };
}

export default useNavigation;
