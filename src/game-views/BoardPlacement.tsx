import cx from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import "./BoardPlacement.css";
import Worker from "./icons/Worker";
import { BoardWorker, BoardType, Season } from "../game-data/GameState";
import { BoardAction, PlacementBonus } from "../game-data/board/boardPlacements";
import { AppState } from "../store/AppState";
import { Order, Vine, SummerVisitor, WinterVisitor } from "./icons/Card";
import Coins from "./icons/Coins";
import VictoryPoints from "./icons/VictoryPoints";
import StarToken from "./icons/StarToken";

interface Props {
    boardType: BoardType;
    title: React.ReactNode;
    bonuses: (PlacementBonus | undefined)[];
    numSpots: number;
    season: Season;
    workers: (BoardWorker | null)[];
}

const BoardPlacement: React.FunctionComponent<Props> = props => {
    const { boardType, title, numSpots, bonuses, season, workers } = props;
    return <>
        <tr className="BoardPlacement">
            {boardType !== "base"
                ? <td className={cx("BoardPlacement-cell--vertical", "BoardPlacement-cell")} colSpan={42}>
                    <div className="BoardPlacement-title">{title}</div>
                    <ul className="BoardPlacement-spots">
                        {new Array(numSpots).fill(0).map((_, i) => {
                            const worker = workers[i];
                            return <li key={i}>
                                {renderSpot(season, worker, bonuses[i])}
                            </li>;
                        })}
                    </ul>
                    {renderOverflow(workers, numSpots)}
                </td>
                : <>
                    {new Array(numSpots).fill(0).map((_, i) => {
                        const worker = workers[i];
                        return <td key={i} className={cx("BoardPlacement-spotCell", "BoardPlacement-cell")}>
                            {renderSpot(season, worker, bonuses[i])}
                            {i === 0 && workers.length > numSpots && renderOverflow(workers, numSpots)}
                        </td>;
                    })}
                    <td className={cx("BoardPlacement-title", "BoardPlacement-cell")}>
                        {title}
                    </td>
                </>}
        </tr>
    </>;
};

const renderSpot = (season: Season, worker: BoardWorker | null, bonus: PlacementBonus | undefined) => {
    return <div className={cx({
        "BoardPlacement-spot": true,
        [`BoardPlacement-spot--${season}`]: true,
        "BoardPlacement-spot--taken": !!worker,
    })}>
        {worker
            ? <Worker workerType={worker.type} color={worker.color} isTemp={worker.isTemp} animateWithId={worker.id} />
            : ((bonus && renderBonusIcon(bonus)) || <>&nbsp;</>)}
    </div>
};

const renderOverflow = (workers: (BoardWorker | null)[], numSpots: number) => {
    return <div className="BoardPlacement-overflow">
        {workers.slice(numSpots).map((w, i) =>
            w && <Worker key={`${w.color}${i}`} workerType={w.type} color={w.color} animateWithId={w.id} />
        )}
    </div>;
};

const renderBonusIcon = (bonus: PlacementBonus): React.ReactNode => {
    switch (bonus) {
        case "drawOrder":
            return <Order />;
        case "drawVine":
        case "plantVine":
            return <Vine />;
        case "gainCoin":
            return <Coins>1</Coins>;
        case "gainVP":
            return <VictoryPoints>1</VictoryPoints>;
        case "influence":
            return <StarToken />;
        case "playSummerVisitor":
            return <SummerVisitor />;
        case "playWinterVisitor":
            return <WinterVisitor />;
        case "plusOne":
            return "+1";
        default:
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const exhaustivenessCheck: never = bonus;
            return null;
    }
};

const mapStateToProps = (state: AppState, { placement }: { placement: BoardAction; }) => {
    const game = state.game!;
    const numSpots = Math.ceil(Object.keys(game.players).length / 2);
    return {
        title: placement.label(game),
        numSpots,
        bonuses: new Array(numSpots).fill(null).map(
            (_, i) => placement.choiceAt(i, game).bonus
        ),
    };
};

export default connect(mapStateToProps)(BoardPlacement);
