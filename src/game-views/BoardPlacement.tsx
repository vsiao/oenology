import * as React from "react";
import cx from "classnames";
import "./BoardPlacement.css";
import Worker from "./icons/Worker";
import { BoardWorker } from "../game-data/GameState";
import { connect } from "react-redux";
import { BoardAction } from "../game-data/board/boardPlacements";
import { AppState } from "../store/AppState";

interface Props {
    title: React.ReactNode;
    disabledReason: string | undefined;
    onClick: (() => void) | undefined;
    season: string;
    workers: BoardWorker[];
}

const BoardPlacement: React.FunctionComponent<Props> = props => {
    const { title, disabledReason, onClick, season, workers } = props;
    const interactive = onClick && !disabledReason;
    return <div
        className={cx({
            "BoardPlacement": true,
            "BoardPlacement--interactive": interactive,
            [`BoardPlacement--${season}`]: true,
        })}
        onClick={interactive ? onClick : undefined}
    >
        <div className="BoardPlacement-title">
            {title}
        </div>
        <ul className="BoardPlacement-spots">
            {new Array(3).fill(0).map((_, i) => {
                const worker = workers[i];
                return <li key={i} className="BoardPlacement-spot">
                    {worker && <Worker workerType={worker.type} color={worker.color} />}
                </li>;
            })}
        </ul>
    </div>;
};

const mapStateToProps = (state: AppState, ownProps: { placement: BoardAction }) => {
    return {
        disabledReason: ownProps.placement.disabledReason &&
            ownProps.placement.disabledReason(state.game),
    };
}

export default connect(mapStateToProps)(BoardPlacement);
