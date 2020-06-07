import * as React from "react";
import Sidebar from "./Sidebar";
import GameBoard from "./GameBoard";
import "./OenologyGame.css";
import PlayerMat from "./controls/PlayerMat";

interface Props {
    currentPlayerId: string;
}

const OenologyGame: React.FunctionComponent<Props> = props => {
    return <div className="OenologyGame">
        <Sidebar />
        <GameBoard />
        <PlayerMat currentPlayerId={props.currentPlayerId} />
    </div>; 
};
export default OenologyGame;
