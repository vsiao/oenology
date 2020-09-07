import cx from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import "./BoardPlacement.css";
import Worker from "./icons/Worker";
import { BoardWorker } from "../game-data/GameState";
import { BoardAction, PlacementBonus } from "../game-data/board/boardPlacements";
import { AppState } from "../store/AppState";
import { Order, Vine, SummerVisitor, WinterVisitor } from "./icons/Card";
import Coins from "./icons/Coins";
import VictoryPoints from "./icons/VictoryPoints";

interface Props {
    title: React.ReactNode;
    bonuses: (PlacementBonus | undefined)[];
    numSpots: number;
    season: string;
    workers: (BoardWorker | null)[];
}

const BoardPlacement: React.FunctionComponent<Props> = props => {
    const { title, numSpots, bonuses, season, workers } = props;
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
                        : ((bonuses[i] && renderBonusIcon(bonuses[i]!)) || <>&nbsp;</>)}
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
            return "STAR_TOKEN";
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
