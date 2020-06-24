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
    numSpots: number;
    bonusDisplay: React.ReactNode;
    season: string;
    workers: BoardWorker[];
    onClick: (() => void) | undefined;
}

const BoardPlacement: React.FunctionComponent<Props> = props => {
    const { title, disabledReason, numSpots, bonusDisplay, season, workers, onClick } = props;
    const interactive = onClick && !disabledReason;
    return <tr
        className={cx({
            "BoardPlacement": true,
            "BoardPlacement--interactive": interactive,
        })}
        onClick={interactive ? onClick : undefined}
    >
        {new Array(numSpots).fill(0).map((_, i) => {
            const worker = workers[i];
            return <td key={i} className="BoardPlacement-spotCell">
                <div className={cx({
                    "BoardPlacement-spot": true,
                    [`BoardPlacement-spot--${season}`]: true,
                    "BoardPlacement-spot--taken": !!worker,
                })}>
                    {worker
                        ? <Worker workerType={worker.type} color={worker.color} isTemp={worker.isTemp} />
                        : (i === 0 ? bonusDisplay : null)}
                </div>
            </td>;
        })}
        <td className="BoardPlacement-title">
            {title}
        </td>
    </tr>;
};

const mapStateToProps = (state: AppState, ownProps: { placement: BoardAction }) => {
    const numSpots = Math.ceil(Object.keys(state.game.players).length / 2);
    return {
        numSpots,
        bonusDisplay: numSpots > 1 ? ownProps.placement.bonus : null,
        disabledReason: ownProps.placement.disabledReason &&
            ownProps.placement.disabledReason(state.game),
    };
}

export default connect(mapStateToProps)(BoardPlacement);
