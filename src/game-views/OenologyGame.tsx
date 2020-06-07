import * as React from "react";
import Sidebar from "./Sidebar";
import GameBoard from "./GameBoard";
import PlayerMat from "./PlayerMat";
import "./OenologyGame.css";

interface Props {
    currentPlayerId: string;
}

const OenologyGame: React.FunctionComponent<Props> = props => {
    return <div className="OenologyGame">
        <Sidebar />
        <GameBoard />
        <PlayerMat playerId={props.currentPlayerId} />
    </div>; 
};
export default OenologyGame;
