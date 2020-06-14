import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GameAction } from "../game-data/gameActions";
import { WorkerPlacement, placeWorker } from "../game-data/board/boardActions";
import { SummerActions, WinterActions } from "../game-data/board/boardPlacements";
import BoardPlacement from "./BoardPlacement";

import "./GameBoard.css";
import { AppState } from "../store/AppState";
import { BoardWorker, WorkerType } from "../game-data/GameState";

interface Props {
    canPlaceSummerWorker: boolean;
    canPlaceWinterWorker: boolean;
    workerPlacements: Record<WorkerPlacement, BoardWorker[]>,
    onPlaceWorker: (placement: WorkerPlacement, workerType: WorkerType) => void;
    pendingWorkerType: WorkerType;
}

const GameBoard: React.FunctionComponent<Props> = props => {
    const { canPlaceSummerWorker, canPlaceWinterWorker, onPlaceWorker, pendingWorkerType, workerPlacements } = props;
    return <div className="GameBoard">
        <div className="GameBoard-order">
            Order
        </div>
        <div className="GameBoard-summerActions">
            {SummerActions.map(action =>
                <BoardPlacement
                    key={action.type}
                    onClick={canPlaceSummerWorker ? () => onPlaceWorker(action.type, pendingWorkerType) : undefined}
                    title={action.title}
                    season="summer"
                    workers={workerPlacements[action.type]}
                />)}
        </div>
        <div className="GameBoard-winterActions">
            {WinterActions.map(action =>
                <BoardPlacement
                    key={action.type}
                    onClick={canPlaceWinterWorker ? () => onPlaceWorker(action.type, pendingWorkerType) : undefined}
                    title={action.title}
                    season="winter"
                    workers={workerPlacements[action.type]}
                />)}
        </div>
    </div>;
};

const mapStateToProps = (state: AppState) => {
    const { currentTurn, workerPlacements } = state.game;
    return {
        canPlaceSummerWorker: currentTurn.type === "workerPlacement" &&
            currentTurn.pendingAction === null &&
            currentTurn.playerId === state.playerId &&
            currentTurn.season === "summer",
        canPlaceWinterWorker: currentTurn.type === "workerPlacement" &&
            currentTurn.pendingAction === null &&
            currentTurn.playerId === state.playerId &&
            currentTurn.season === "winter",
        workerPlacements
    };
};

const mapDispatchToProps = (dispatch: Dispatch<GameAction>) => {
    return {
        onPlaceWorker: (placement: WorkerPlacement, workerType: WorkerType) => dispatch(placeWorker(placement, workerType)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(GameBoard);
