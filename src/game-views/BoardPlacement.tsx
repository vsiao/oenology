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
    numSpots: number;
    bonusDisplay: React.ReactNode;
    season: string;
    workers: (BoardWorker | null)[];
}

const BoardPlacement: React.FunctionComponent<Props> = props => {
    const { title, numSpots, bonusDisplay, season, workers } = props;
    return <tr className="BoardPlacement">
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
                        : (i === 0 ? bonusDisplay : <>&nbsp;</>)}
                </div>
                {i === 0 && workers.length > numSpots && (
                    <div className="BoardPlacement-overflow">
                        {workers.slice(numSpots).map((w, i) =>
                            w && <Worker key={`${w.color}${i}`} workerType={w.type} color={w.color} />
                        )}
                    </div>)}
            </td>;
        })}
        <td className="BoardPlacement-title">
            {title}
        </td>
    </tr>;
};

const mapStateToProps = (state: AppState, ownProps: { placement: BoardAction; }) => {
    const numSpots = Math.ceil(Object.keys(state.game!.players).length / 2);
    return {
        numSpots,
        bonusDisplay: numSpots > 1 ? ownProps.placement.bonus : null,
    };
};

export default connect(mapStateToProps)(BoardPlacement);
