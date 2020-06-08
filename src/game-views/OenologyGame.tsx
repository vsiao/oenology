import * as React from "react";
import Sidebar from "./Sidebar";
import GameBoard from "./GameBoard";
import "./OenologyGame.css";
import PlayerMat from "./controls/PlayerMat";

interface Props {
    currentPlayerId: string | null;
}

const OenologyGame: React.FunctionComponent<Props> = props => {
    return <div className="OenologyGame">
        <Sidebar />
        <GameBoard />
        {props.currentPlayerId ? <PlayerMat playerId={props.currentPlayerId} /> : null}
    </div>; 
};
export default OenologyGame;
