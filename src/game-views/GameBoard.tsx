import "./GameBoard.css";
import cx from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GameAction } from "../game-data/gameActions";
import { WorkerPlacement, placeWorker } from "../game-data/board/boardActions";
import { summerActions, winterActions } from "../game-data/board/boardPlacements";
import BoardPlacement from "./BoardPlacement";
import { AppState } from "../store/AppState";
import { BoardWorker, WorkerType, PlayerColor } from "../game-data/GameState";
import Rooster from "./icons/Rooster";

interface Props {
    canPlaceSummerWorker: boolean;
    canPlaceWinterWorker: boolean;
    wakeUpOrder: ({ current: boolean; passed?: boolean; color: PlayerColor; } | null)[];
    workerPlacements: Record<WorkerPlacement, BoardWorker[]>;
    onPlaceWorker: (placement: WorkerPlacement, workerType: WorkerType) => void;
    pendingWorkerType: WorkerType;
}

const GameBoard: React.FunctionComponent<Props> = props => {
    const { canPlaceSummerWorker, canPlaceWinterWorker, onPlaceWorker, pendingWorkerType, workerPlacements } = props;
    return <div className="GameBoard">
        <ol className="GameBoard-wakeUpOrder">
            {props.wakeUpOrder.map((pos, i) =>
                <li key={i} className={cx({
                    "GameBoard-wakeUpPosition": true,
                    "GameBoard-wakeUpPosition--current": pos && pos.current,
                    "GameBoard-wakeUpPosition--passed": pos && pos.passed,
                })}>
                    {pos ? <Rooster color={pos.color} /> : i + 1}
                </li>
            )}
        </ol>
        <div className="GameBoard-summerActions">
            {summerActions.map(action =>
                <BoardPlacement
                    key={action.type}
                    onClick={canPlaceSummerWorker ? () => onPlaceWorker(action.type, pendingWorkerType) : undefined}
                    title={action.title}
                    placement={action}
                    season="summer"
                    workers={workerPlacements[action.type]}
                />)}
        </div>
        <div className="GameBoard-winterActions">
            {winterActions.map(action =>
                <BoardPlacement
                    key={action.type}
                    onClick={canPlaceWinterWorker ? () => onPlaceWorker(action.type, pendingWorkerType) : undefined}
                    title={action.title}
                    placement={action}
                    season="winter"
                    workers={workerPlacements[action.type]}
                />)}
        </div>
    </div>;
};

const mapStateToProps = (state: AppState) => {
    const { currentTurn, wakeUpOrder, workerPlacements, players } = state.game;
    return {
        canPlaceSummerWorker: currentTurn.type === "workerPlacement" &&
            currentTurn.pendingAction === null &&
            currentTurn.playerId === state.playerId &&
            currentTurn.season === "summer",
        canPlaceWinterWorker: currentTurn.type === "workerPlacement" &&
            currentTurn.pendingAction === null &&
            currentTurn.playerId === state.playerId &&
            currentTurn.season === "winter",
        wakeUpOrder: wakeUpOrder.map(pos => {
            return !pos ? null : {
                current: pos.playerId === currentTurn.playerId,
                passed: pos.passed,
                color: players[pos.playerId].color,
            };
        }),
        workerPlacements,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<GameAction>) => {
    return {
        onPlaceWorker: (placement: WorkerPlacement, workerType: WorkerType) => dispatch(placeWorker(placement, workerType)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(GameBoard);
