import cx from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import "./BoardPlacement.css";
import Worker from "./icons/Worker";
import { BoardWorker } from "../game-data/GameState";
import { BoardAction } from "../game-data/board/boardPlacements";
import { AppState } from "../store/AppState";

interface Props {
    title: React.ReactNode;
    icons: React.ReactNode[];
    numSpots: number;
    season: string;
    workers: (BoardWorker | null)[];
}

const BoardPlacement: React.FunctionComponent<Props> = props => {
    const { title, numSpots, icons, season, workers } = props;
    return <tr className="BoardPlacement">
        {new Array(numSpots).fill(0).map((_, i) => {
            const worker = workers[i];
            return <td key={i} className={cx("BoardPlacement-spotCell", "BoardPlacement-cell")}>
                <div className={cx({
                    "BoardPlacement-spot": true,
                    [`BoardPlacement-spot--${season}`]: true,
                    "BoardPlacement-spot--taken": !!worker,
                })}>
                    {worker
                        ? <Worker workerType={worker.type} color={worker.color} isTemp={worker.isTemp} animateWithId={worker.id} />
                        : (icons[i] || <>&nbsp;</>)}
                </div>
                {i === 0 && workers.length > numSpots && (
                    <div className="BoardPlacement-overflow">
                        {workers.slice(numSpots).map((w, i) =>
                            w && <Worker key={`${w.color}${i}`} workerType={w.type} color={w.color} animateWithId={w.id} />
                        )}
                    </div>)}
            </td>;
        })}
        <td className={cx("BoardPlacement-title", "BoardPlacement-cell")}>
            {title}
        </td>
    </tr>;
};

const mapStateToProps = (state: AppState, { placement }: { placement: BoardAction; }) => {
    const game = state.game!;
    const numSpots = Math.ceil(Object.keys(game.players).length / 2);
    return {
        title: placement.label(game),
        numSpots,
        icons: new Array(numSpots).fill(null).map(
            (_, i) => placement.choiceAt(i, game).bonusIcon
        ),
    };
};

export default connect(mapStateToProps)(BoardPlacement);
