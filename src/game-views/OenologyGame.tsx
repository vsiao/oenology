import * as React from "react";
import Sidebar from "./Sidebar";
import GameBoard from "./GameBoard";
import PlayerMat from "./PlayerMat";
import "./OenologyGame.css";

interface Props {
}

const OenologyGame: React.FunctionComponent<Props> = props => {
    return <div className="OenologyGame">
        <Sidebar />
        <GameBoard />
        <PlayerMat playerId={"thedrick"} />
    </div>; 
};
export default OenologyGame;
