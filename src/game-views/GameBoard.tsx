import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GameAction } from "../game-data/gameActions";
import { WorkerPlacement, placeWorker } from "../game-data/board/boardActionCreators";
import { SummerActions, WinterActions } from "../game-data/board/boardPlacements";
import BoardPlacement from "./BoardPlacement";

import "./GameBoard.css";

interface Props {
    onPlaceWorker: (placement: WorkerPlacement) => void;
}

const GameBoard: React.FunctionComponent<Props> = props => {
    const { onPlaceWorker } = props;
    return <div className="GameBoard">
        <div className="GameBoard-order">
            Order
        </div>
        <div className="GameBoard-summerActions">
            {SummerActions.map(action =>
                <BoardPlacement
                    key={action.type}
                    onClick={() => onPlaceWorker(action.type)}
                    title={action.title}
                    season="summer"
                />)}
        </div>
        <div className="GameBoard-winterActions">
            {WinterActions.map(action =>
                <BoardPlacement
                    key={action.type}
                    onClick={() => onPlaceWorker(action.type)}
                    title={action.title}
                    season="winter"
                />)}
        </div>
    </div>;
};


const mapDispatchToProps = (dispatch: Dispatch<GameAction>) => {
    return {
        onPlaceWorker: (placement: WorkerPlacement) => dispatch(placeWorker(placement)),
    };
};

export default connect(null, mapDispatchToProps)(GameBoard);
