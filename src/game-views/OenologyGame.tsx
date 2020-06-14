import "./OenologyGame.css";
import * as React from "react";
import Sidebar from "./Sidebar";
import GameBoard from "./GameBoard";
import PlayerMat from "./controls/PlayerMat";
import StatusBanner from "./StatusBanner";
import { WorkerType } from "../game-data/GameState";

interface Props {
    currentPlayerId: string | null;
}

const OenologyGame: React.FunctionComponent<Props> = props => {
    const [pendingWorkerType, setPendingWorkerType] = React.useState<WorkerType>("normal");

    return <div className="OenologyGame">
        <Sidebar />
        <StatusBanner />
        <GameBoard pendingWorkerType={pendingWorkerType} />
        {props.currentPlayerId ? <PlayerMat
            playerId={props.currentPlayerId}
            pendingWorkerType={pendingWorkerType}
            setPendingWorkerType={setPendingWorkerType} /> : null}
    </div>;
};
export default OenologyGame;
