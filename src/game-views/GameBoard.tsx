import "./GameBoard.css";
import cx from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import { WorkerPlacement } from "../game-data/board/boardActions";
import { summerActions, winterActions } from "../game-data/board/boardPlacements";
import BoardPlacement from "./BoardPlacement";
import { AppState } from "../store/AppState";
import { BoardWorker, PlayerColor } from "../game-data/GameState";
import Rooster from "./icons/Rooster";

interface Props {
    wakeUpOrder: ({ current: boolean; passed?: boolean; color: PlayerColor; } | null)[];
    workerPlacements: Record<WorkerPlacement, BoardWorker[]>;
}

const GameBoard: React.FunctionComponent<Props> = props => {
    const { workerPlacements } = props;
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
            <table className="GameBoard-actionsTable">
                <tbody>
                {summerActions.map(action =>
                    <BoardPlacement
                        key={action.type}
                        title={action.title}
                        placement={action}
                        season="summer"
                        workers={workerPlacements[action.type]}
                    />)}
                </tbody>
            </table>
        </div>
        <div className="GameBoard-winterActions">
            <table className="GameBoard-actionsTable">
                <tbody>
                {winterActions.map(action =>
                    <BoardPlacement
                        key={action.type}
                        title={action.title}
                        placement={action}
                        season="winter"
                        workers={workerPlacements[action.type]}
                    />)}
                </tbody>
            </table>
        </div>
    </div>;
};

const mapStateToProps = (state: AppState) => {
    const { currentTurn, wakeUpOrder, workerPlacements, players } = state.game;
    return {
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

export default connect(mapStateToProps)(GameBoard);
