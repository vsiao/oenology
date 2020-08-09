import "./GameBoard.css";
import cx from "classnames";
import { motion } from "framer-motion";
import * as React from "react";
import { connect } from "react-redux";
import { summerActions, winterActions } from "../game-data/board/boardPlacements";
import BoardPlacement from "./BoardPlacement";
import { AppState } from "../store/AppState";
import { BoardWorker, PlayerColor, CurrentTurn, WorkerPlacement } from "../game-data/GameState";
import Rooster from "./icons/Rooster";
import StatusBanner from "./StatusBanner";
import { Vine, Order, SummerVisitor, WinterVisitor } from "./icons/Card";
import Coins from "./icons/Coins";
import VictoryPoints from "./icons/VictoryPoints";
import Worker from "./icons/Worker";
import { useTooltip } from "./shared/useTooltip";

type Season = "spring" | "summer" | "fall" | "winter";
interface Props {
    season: Season;
    wakeUpOrder: (WakeUpPosition | null)[];
    workerPlacements: Record<WorkerPlacement, (BoardWorker | null)[]>;
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

    return <div className={cx("GameBoard", `GameBoard--${season}`)}>
        <StatusBanner />
        <ol className="GameBoard-wakeUpOrder">
            {props.wakeUpOrder.map((pos, i) =>
                <WakeUpPosition key={i} pos={pos} season={season} i={i} />
            )}
        </ol>
        <span className="GameBoard-season">{season}</span>
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

interface WakeUpPosition {
    current: boolean;
    passed?: boolean;
    color: PlayerColor;
}

const colors: Record<PlayerColor, string> = {
    blue: "#4169e1", // royalblue
    green: "#2e8b57", // seagreen
    orange: "#ff8c00", // darkorange
    purple: "#800080", // purple
    red: "#b22222", // firebrick
    yellow: "#ffd700", // gold
};

const WakeUpPosition: React.FunctionComponent<{
    pos: WakeUpPosition | null;
    season: Season;
    i: number;
}> = ({ pos, season, i }) => {
    const [anchorRef, maybeLayer] = useTooltip(
        "right",
        React.useMemo(() => {
            const bonus = renderWakeUpBonus(i);
            return <>Wake-up bonus: {bonus || "(none)"}</>;
        }, [i])
    )

    return <li
        ref={anchorRef as React.RefObject<HTMLLIElement>}
        className={cx({
            "GameBoard-wakeUpPosition": true,
            "GameBoard-wakeUpPosition--current": pos && pos.current,
            "GameBoard-wakeUpPosition--passed": pos && pos.passed,
        })}
    >
        {pos
            ? <Rooster color={pos.color} />
            : season === "spring" ? renderWakeUpBonus(i) : i+1}
        {pos && pos.current
            ? <motion.span
                layout
                layoutId="currentPlayer"
                className="GameBoard-currentPlayer"
            >
                <motion.span
                    className="GameBoard-currentPlayerIndicator"
                    animate={{
                        scale: [1, 1.2, 1],
                        borderColor: colors[pos.color],
                    }}
                    initial={false}
                    transition={{
                        ease: "easeInOut",
                        loop: Infinity,
                        repeatDelay: .5,
                    }}
                />
            </motion.span>
            : null}
        {maybeLayer}
    </li>;
};

const renderWakeUpBonus = (i: number): React.ReactNode => {
    switch (i) {
        case 0:
            return null;
        case 1:
            return <Vine />;
        case 2:
            return <Order />;
        case 3:
            return <Coins>1</Coins>;
        case 4:
            return <span><SummerVisitor /> or <WinterVisitor /></span>;
        case 5:
            return <VictoryPoints>1</VictoryPoints>;
        case 6:
            return <Worker isTemp={true} />;
    }
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
        case "mamaPapa":
        case "wakeUpOrder":
            return "spring";
        case "workerPlacement":
            return currentTurn.season;
        case "fallVisitor":
            return "fall";
        case "endOfYearDiscard":
            return "winter";
    }
};

export default connect(mapStateToProps)(GameBoard);
