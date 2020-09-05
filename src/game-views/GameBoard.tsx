import "./GameBoard.css";
import cx from "classnames";
import { motion } from "framer-motion";
import * as React from "react";
import { connect } from "react-redux";
import { BoardAction, boardActionsBySeason } from "../game-data/board/boardPlacements";
import BoardPlacement from "./BoardPlacement";
import { AppState } from "../store/AppState";
import { BoardWorker, PlayerColor, CurrentTurn, WorkerPlacement, Season, BoardType } from "../game-data/GameState";
import Rooster from "./icons/Rooster";
import StatusBanner from "./StatusBanner";
import Card, { Vine, Order, SummerVisitor, WinterVisitor } from "./icons/Card";
import Coins from "./icons/Coins";
import VictoryPoints from "./icons/VictoryPoints";
import Worker from "./icons/Worker";
import { useTooltip } from "./shared/useTooltip";
import { wakeUpBonuses, WakeUpBonus } from "../game-data/board/wakeUpOrder";
import GrapeToken from "./icons/GrapeToken";
import { influenceRegions, InfluenceData } from "../game-data/board/influence";

interface Props {
    wakeUpOrder: (WakeUpPosition | null)[];
    boardType: BoardType;
    currentSeason: Season;
    seasonOrder: Season[];
    actionsBySeason: Record<Season, BoardAction[]>;
    workerPlacements: Record<WorkerPlacement, (BoardWorker | null)[]>;
}

const GameBoard: React.FunctionComponent<Props> = props => {
    const { boardType, currentSeason, seasonOrder, workerPlacements } = props;
    const bonusesBySeason = wakeUpBonuses(boardType);

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

    return <div className={cx("GameBoard", `GameBoard--${currentSeason}`, `GameBoard--${boardType}`)}>
        <StatusBanner />
        <div className="GameBoard-sidebar">
            {boardType === "base"
                ? <>
                    <span className="GameBoard-currentSeason">{currentSeason}</span>
                    <ol className="GameBoard-wakeUpOrder">
                        {props.wakeUpOrder.map((pos, i) =>
                            <WakeUpPosition key={i} pos={pos} season={currentSeason} i={i} />
                        )}
                    </ol>
                </>
                : <>
                    <div className="GameBoard-wakeUpChart">
                        <table className="GameBoard-wakeUpTable">
                            <thead>
                                <tr className="GameBoard-wakeUpHeader">
                                    {(["spring", "summer", "fall", "winter"] as const).map(season =>
                                        <td key={season} className={cx({
                                            "GameBoard-wakeUpSeason": true,
                                            "GameBoard-currentSeason": season === currentSeason,
                                            [`GameBoard-wakeUpSeason--${season}`]: true,
                                        })}>{season}</td>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {new Array(7).fill(null).map((_, i) =>
                                    <tr key={i} className="GameBoard-wakeUpRow">
                                        {(["spring", "summer", "fall", "winter"] as const).map(season =>
                                            bonusesBySeason[season].length
                                                ? <td key={season} className={cx("GameBoard-wakeUpCell", `GameBoard-wakeUpCell--${season}`)}>
                                                    {renderBonus(
                                                        bonusesBySeason[season][i],
                                                        () => season === "spring"
                                                            ? <>{i === 0 ? <GrapeToken /> : i + 1}</>
                                                            : null
                                                    )}
                                                </td>
                                                : null
                                        )}
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="GameBoard-influence">
                        <img className="GameBoard-influenceMap" alt="Map of Tuscany" src="/influence-map.png" />
                        {influenceRegions(boardType).map(renderInfluenceRegion)}
                    </div>
                </>}
        </div>
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
    const bonus = wakeUpBonuses("base").spring[i];
    const [anchorRef, maybeLayer] = useTooltip(
        "right",
        React.useMemo(() => {
            return <>Wake-up bonus: {renderBonus(bonus, () => "(none)")}</>;
        }, [bonus])
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
            : season === "spring" ? renderBonus(bonus, () => null) : i+1}
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

const renderBonus = (
    bonus: WakeUpBonus,
    renderNothing: () => React.ReactNode,
    withAnimatedWorker = false
): React.ReactNode => {
    switch (bonus) {
        case "ageGrapes":
            return "Age grapes";
        case "drawCard":
            return <Card />;
        case "drawOrder":
            return <Order />;
        case "drawStructure":
            return "XCXC";
        case "drawSummerVisitor":
            return <SummerVisitor />;
        case "drawVine":
            return <Vine />;
        case "drawVisitor":
            return <span><SummerVisitor /> or <WinterVisitor /></span>;
        case "drawWinterVisitor":
            return <WinterVisitor />;
        case "firstPlayer":
            return <GrapeToken />;
        case "gainCoin":
            return <Coins>1</Coins>;
        case "gainVP":
            return <VictoryPoints>1</VictoryPoints>;
        case "influence":
            return "STAR_TOKEN";
        case "nothing":
            return renderNothing();
        case "tempWorker":
            return <>
                <Worker isTemp={true} animateWithId={withAnimatedWorker ? 999 : undefined} /> for this year
            </>;
    }
}

const renderInfluenceRegion = (region: InfluenceData) => {
    return <div
        key={region.name}
        className={cx("GameBoard-influenceRegion", `GameBoard-influenceRegion--${region.name}`)}
    >
        <span>{renderInfluencePlacementBonus(region)} <VictoryPoints>{region.vp}</VictoryPoints></span>
        <span className="GameBoard-regionName">{region.name}</span>
    </div>;
};
const renderInfluencePlacementBonus = ({ bonus }: InfluenceData): React.ReactNode => {
    switch (bonus) {
        case "drawOrder":
            return <Order />;
        case "drawStructure":
            return "XCXC";
        case "drawSummerVisitor":
            return <SummerVisitor />;
        case "drawVine":
            return <Vine />;
        case "drawWinterVisitor":
            return <WinterVisitor />;
        case "gain1":
            return <Coins>1</Coins>;
        case "gain2":
            return <Coins>2</Coins>;
    }
};

const mapStateToProps = (state: AppState) => {
    const { boardType, currentTurn, wakeUpOrder, workerPlacements, players } = state.game!;
    const actionsBySeason = boardActionsBySeason(state.game!);
    return {
        wakeUpOrder: wakeUpOrder.map(pos => {
            return !pos ? null : {
                current: pos.playerId === currentTurn.playerId,
                passed: pos.passed,
                color: players[pos.playerId].color,
            };
        }),
        boardType: boardType ?? "base",
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
