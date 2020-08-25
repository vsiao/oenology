import "./GameBoard.css";
import cx from "classnames";
import { motion } from "framer-motion";
import * as React from "react";
import { connect } from "react-redux";
import { BoardAction, boardActionsBySeason } from "../game-data/board/boardPlacements";
import BoardPlacement from "./BoardPlacement";
import { AppState } from "../store/AppState";
import { BoardWorker, PlayerColor, CurrentTurn, WorkerPlacement, Season } from "../game-data/GameState";
import Rooster from "./icons/Rooster";
import StatusBanner from "./StatusBanner";
import { Vine, Order, SummerVisitor, WinterVisitor } from "./icons/Card";
import Coins from "./icons/Coins";
import VictoryPoints from "./icons/VictoryPoints";
import Worker from "./icons/Worker";
import { useTooltip } from "./shared/useTooltip";

interface Props {
    wakeUpOrder: (WakeUpPosition | null)[];
    currentSeason: Season;
    seasonOrder: Season[];
    actionsBySeason: Record<Season, BoardAction[]>;
    workerPlacements: Record<WorkerPlacement, (BoardWorker | null)[]>;
}

const GameBoard: React.FunctionComponent<Props> = props => {
    const { currentSeason, seasonOrder, workerPlacements } = props;

    const scrollableRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const scrollNode = scrollableRef.current;
        if (scrollNode) {
            const targetPct = seasonOrder.indexOf(currentSeason) / (seasonOrder.length - 1);
            scrollNode.scroll({
                left: targetPct * scrollNode.scrollWidth,
                behavior: "smooth",
            });
        }
    }, [currentSeason, scrollableRef, seasonOrder]);

    return <div className={cx("GameBoard", `GameBoard--${currentSeason}`)}>
        <StatusBanner />
        <ol className="GameBoard-wakeUpOrder">
            {props.wakeUpOrder.map((pos, i) =>
                <WakeUpPosition key={i} pos={pos} season={currentSeason} i={i} />
            )}
        </ol>
        <span className="GameBoard-currentSeason">{currentSeason}</span>
        <div className="GameBoard-actionsScroller" ref={scrollableRef}>
            <div className="GameBoard-seasons">
                {seasonOrder.map(season =>
                    <div key={season} className={cx(
                        "GameBoard-season",
                        `GameBoard-season--${season}`
                    )}>
                        <table className="GameBoard-actionsTable">
                            <thead>
                                <tr>
                                    <td className="GameBoard-seasonHeader" colSpan={42}>{season}</td>
                                </tr>
                            </thead>
                            <tbody>
                            {props.actionsBySeason[season].map(action =>
                                <BoardPlacement
                                    key={action.type}
                                    placement={action}
                                    season={season}
                                    workers={workerPlacements[action.type]}
                                />)}
                            </tbody>
                        </table>
                    </div>
                )}
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
                    animate={{ borderColor: colors[pos.color] }}
                    initial={false}
                    transition={{ ease: "easeInOut" }}
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
            return <Worker isTemp={true} animateWithId={999} />;
    }
};

const mapStateToProps = (state: AppState) => {
    const { currentTurn, wakeUpOrder, workerPlacements, players } = state.game!;
    const actionsBySeason = boardActionsBySeason(state.game!);
    return {
        wakeUpOrder: wakeUpOrder.map(pos => {
            return !pos ? null : {
                current: pos.playerId === currentTurn.playerId,
                passed: pos.passed,
                color: players[pos.playerId].color,
            };
        }),
        currentSeason: seasonFromCurrentTurn(currentTurn),
        seasonOrder: (["spring", "summer", "fall", "winter"] as const)
            .filter(s => actionsBySeason[s].length > 0),
        actionsBySeason,
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
