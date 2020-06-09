import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GameAction } from "../game-data/gameActions";
import { WorkerPlacement, placeWorker } from "../game-data/board/boardActionCreators";
import { SummerActions, WinterActions } from "../game-data/board/boardPlacements";
import BoardPlacement from "./BoardPlacement";

import "./GameBoard.css";
import { AppState } from "../store/AppState";

interface Props {
    canPlaceWorker: boolean;
    onPlaceWorker: (placement: WorkerPlacement) => void;
}

const GameBoard: React.FunctionComponent<Props> = props => {
    const { canPlaceWorker, onPlaceWorker } = props;
    return <div className="GameBoard">
        <div className="GameBoard-order">
            Order
        </div>
        <div className="GameBoard-summerActions">
            {SummerActions.map(action =>
                <BoardPlacement
                    key={action.type}
                    onClick={canPlaceWorker ? () => onPlaceWorker(action.type) : null}
                    title={action.title}
                    season="summer"
                />)}
        </div>
        <div className="GameBoard-winterActions">
            {WinterActions.map(action =>
                <BoardPlacement
                    key={action.type}
                    onClick={canPlaceWorker ? () => onPlaceWorker(action.type) : null}
                    title={action.title}
                    season="winter"
                />)}
        </div>
    </div>;
};

const mapStateToProps = (state: AppState) => {
    const { currentTurn } = state.game;
    return {
        canPlaceWorker: currentTurn.type === "workerPlacement" &&
            currentTurn.pendingAction === null &&
            currentTurn.playerId === state.playerId,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<GameAction>) => {
    return {
        onPlaceWorker: (placement: WorkerPlacement) => dispatch(placeWorker(placement)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(GameBoard);
