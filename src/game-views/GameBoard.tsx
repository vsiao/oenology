import "./GameBoard.css";
import cx from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import { summerActions, winterActions } from "../game-data/board/boardPlacements";
import BoardPlacement from "./BoardPlacement";
import { AppState } from "../store/AppState";
import { BoardWorker, PlayerColor, CurrentTurn, WorkerPlacement } from "../game-data/GameState";
import Rooster from "./icons/Rooster";
import StatusBanner from "./StatusBanner";

type Season = "spring" | "summer" | "fall" | "winter";
interface Props {
    season: Season;
    wakeUpOrder: ({ current: boolean; passed?: boolean; color: PlayerColor; } | null)[];
    workerPlacements: Record<WorkerPlacement, BoardWorker[]>;
}

const GameBoard: React.FunctionComponent<Props> = props => {
    const { season, workerPlacements } = props;

    const scrollableRef = React.useRef<HTMLDivElement>(null);
    const summerRef = React.useRef<HTMLDivElement>(null);
    const winterRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const seasonNode = season === "spring" || season === "summer"
            ? summerRef.current
            : winterRef.current;
        const seasonRect = seasonNode && seasonNode.getBoundingClientRect();
        const scrollRect = scrollableRef.current && scrollableRef.current.getBoundingClientRect();
        const isScrolledIntoView = seasonRect && scrollRect &&
            seasonRect.left < (scrollRect.left + scrollRect.width / 3) &&
            seasonRect.right >= (scrollRect.left + 2 * scrollRect.width / 3);
        if (seasonNode && !isScrolledIntoView) {
            seasonNode.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [season, summerRef, winterRef]);

    return <div className="GameBoard">
        <StatusBanner />
        <ol className="GameBoard-wakeUpOrder">
            {props.wakeUpOrder.map((pos, i) =>
                <li key={i} className={cx({
                    "GameBoard-wakeUpPosition": true,
                    "GameBoard-wakeUpPosition--current": pos && pos.current,
                    "GameBoard-wakeUpPosition--passed": pos && pos.passed,
                })}>
                    <div className="GameBoard-roosterContainer">
                        {pos ? <Rooster color={pos.color} /> : i + 1}
                    </div>
                </li>
            )}
        </ol>
        <div className="GameBoard-actionsScroller" ref={scrollableRef}>
            <div className="GameBoard-seasons">
                <div className="GameBoard-summerActions" ref={summerRef}>
                    <table className="GameBoard-actionsTable">
                        <thead>
                            <tr><td className="GameBoard-summerHeader" colSpan={42}>Summer</td></tr>
                        </thead>
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
                <div className="GameBoard-winterActions" ref={winterRef}>
                    <table className="GameBoard-actionsTable">
                        <thead>
                            <tr><td className="GameBoard-winterHeader" colSpan={42}>Winter</td></tr>
                        </thead>
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
            </div>
        </div>
    </div>;
};

const mapStateToProps = (state: AppState) => {
    const { currentTurn, wakeUpOrder, workerPlacements, players } = state.game!;
    return {
        season: seasonFromCurrentTurn(currentTurn),
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

const seasonFromCurrentTurn = (currentTurn: CurrentTurn): Season => {
    switch (currentTurn.type) {
        case "papaSetUp":
        case "wakeUpOrder":
            return "spring";
        case "workerPlacement":
            return currentTurn.season;
        case "fallVisitor":
            return "fall";
    }
};

export default connect(mapStateToProps)(GameBoard);
