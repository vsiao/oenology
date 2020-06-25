import "./OenologyGame.css";
import * as React from "react";
import Sidebar from "./Sidebar";
import GameBoard from "./GameBoard";
import PlayerMat from "./controls/PlayerMat";
import StatusBanner from "./StatusBanner";

interface Props {
    currentPlayerId: string | null;
}

const OenologyGame: React.FunctionComponent<Props> = props => {
    return <div className="OenologyGame">
        <Sidebar />
        <StatusBanner />
        <GameBoard />
        {props.currentPlayerId ? <PlayerMat playerId={props.currentPlayerId} /> : null}
    </div>;
};
export default OenologyGame;
