import "./GameBoard.css";
import cx from "classnames";
import { motion } from "framer-motion";
import * as React from "react";
import { connect } from "react-redux";
import { BoardAction, boardActionsBySeason } from "../game-data/board/boardPlacements";
import BoardPlacement from "./BoardPlacement";
import { AppState } from "../store/AppState";
import { BoardWorker, PlayerColor, WorkerPlacement, Season, BoardType, WakeUpPosition } from "../game-data/GameState";
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
import StarToken from "./icons/StarToken";

interface WakeUpSpot extends WakeUpPosition {
    current: boolean;
}

interface Props {
    wakeUpOrder: (WakeUpSpot | null)[];
    playerColors: Record<string, PlayerColor>;
    boardType: BoardType;
    currentSeason: Season;
    seasonOrder: Season[];
    actionsBySeason: Record<Season, BoardAction[]>;
    workerPlacements: Record<WorkerPlacement, (BoardWorker | null)[]>;
    influenceData: InfluenceRegion[];
}

const GameBoard: React.FunctionComponent<Props> = props => {
    const { boardType, currentSeason, seasonOrder, playerColors, workerPlacements } = props;
    const bonusesBySeason = wakeUpBonuses(boardType);

    const scrollableRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const scrollNode = scrollableRef.current;
        if (scrollNode) {
            const availableScroll = scrollNode.scrollWidth - scrollNode.clientWidth;
            const numSeasonsVisible = seasonOrder.length * scrollNode.clientWidth / scrollNode.scrollWidth;
            if (numSeasonsVisible === seasonOrder.length) {
                return;
            }
            const targetPct = Math.min(
                1,
                seasonOrder.indexOf(currentSeason) / (seasonOrder.length - numSeasonsVisible)
            );
            scrollNode.scroll({
                left: targetPct * availableScroll,
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
                            <WakeUpCell key={i} pos={pos} playerColors={playerColors} season={currentSeason} i={i} />
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
                                {props.wakeUpOrder.map((pos, i) =>
                                    <tr key={i} className="GameBoard-wakeUpRow">
                                        {(["spring", "summer", "fall", "winter"] as const).map(season =>
                                            bonusesBySeason[season].length
                                                ? <td key={season} className={cx("GameBoard-wakeUpCell", `GameBoard-wakeUpCell--${season}`)}>
                                                    <div className="GameBoard-wakeUpPosition">
                                                        {pos && (
                                                            pos.season === season ||
                                                            (pos.nextYearPlayerId && season === "spring") ||
                                                            (pos.season === "endOfYear" && season === "winter" && !pos.hasChosenNextYear)
                                                        )
                                                            ? <Rooster color={
                                                                pos.nextYearPlayerId && season === "spring"
                                                                    ? playerColors[pos.nextYearPlayerId]
                                                                    : playerColors[pos.playerId]
                                                            } />
                                                            : renderBonus(
                                                                bonusesBySeason[season][i],
                                                                () => season === "spring"
                                                                    ? <>{i === 0 ? <GrapeToken /> : i + 1}</>
                                                                    : null,
                                                                // Don't animate the grape token in the spring season
                                                                /* withAnimatedTokens */ season !== "spring"
                                                            )
                                                        }
                                                        {pos && pos.current && pos.season === season
                                                            ? <motion.span
                                                                layout
                                                                layoutId="currentPlayer"
                                                                className="GameBoard-currentPlayer"
                                                            >
                                                                <motion.span
                                                                    className="GameBoard-currentPlayerIndicator"
                                                                    animate={{ borderColor: colors[playerColors[pos.playerId]] }}
                                                                    initial={false}
                                                                    transition={{ ease: "easeInOut" }}
                                                                />
                                                            </motion.span>
                                                            : null}
                                                    </div>
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
                        {props.influenceData.map(renderInfluenceRegion)}
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
                                    boardType={boardType}
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

const colors: Record<PlayerColor, string> = {
    blue: "#4169e1", // royalblue
    green: "#2e8b57", // seagreen
    orange: "#ff8c00", // darkorange
    purple: "#800080", // purple
    red: "#b22222", // firebrick
    yellow: "#ffd700", // gold
    pink: "#ff69b4", // hotpink
};

const WakeUpCell: React.FunctionComponent<{
    pos: WakeUpSpot | null;
    playerColors: Record<string, PlayerColor>;
    season: Season;
    i: number;
}> = ({ pos, playerColors, season, i }) => {
    const bonus = wakeUpBonuses("base").summer[i];
    const [anchorRef, maybeLayer] = useTooltip(
        "right",
        React.useMemo(() => {
            return <>Wake-up bonus: {renderBonus(bonus, () => "(none)")}</>;
        }, [bonus])
    );

    return <li
        ref={anchorRef as React.RefObject<HTMLLIElement>}
        className={cx({
            "GameBoard-wakeUpPosition": true,
            "GameBoard-wakeUpPosition--passed": pos && pos.season !== season,
        })}
    >
        {pos
            ? <Rooster color={playerColors[pos.playerId]} />
            : season === "spring"
                ? renderBonus(bonus, () => null, /* withAnimatedTokens */ true)
                : i + 1}
        {pos && pos.current
            ? <motion.span
                layout
                layoutId="currentPlayer"
                className="GameBoard-currentPlayer"
            >
                <motion.span
                    className="GameBoard-currentPlayerIndicator"
                    animate={{ borderColor: playerColors[pos.playerId] }}
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
    withAnimatedTokens = false
): React.ReactNode => {
    switch (bonus) {
        case "ageGrapes":
            return <span>Age grapes</span>;
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
            return <span style={{whiteSpace: "nowrap"}}><SummerVisitor /> or <WinterVisitor /></span>;
        case "drawWinterVisitor":
            return <WinterVisitor />;
        case "firstPlayer":
            return <GrapeToken animated={withAnimatedTokens} />;
        case "gainCoin":
            return <Coins>1</Coins>;
        case "gainVP":
            return <VictoryPoints>1</VictoryPoints>;
        case "influence":
            return <StarToken />;
        case "nothing":
            return renderNothing();
        case "tempWorker":
            return <span>
                <Worker isTemp={true} animateWithId={withAnimatedTokens ? 999 : undefined} />
            </span>;
    }
}

interface InfluenceRegion extends InfluenceData {
    tokens: {
        id: string;
        color: PlayerColor;
    }[];
}

const renderInfluenceRegion = (region: InfluenceRegion) => {
    return <div
        key={region.id}
        className={cx("GameBoard-influenceRegion", `GameBoard-influenceRegion--${region.id}`)}
    >
        <span>{renderInfluencePlacementBonus(region)} <VictoryPoints>{region.vp}</VictoryPoints></span>
        <span className="GameBoard-regionName">{region.name}</span>
        <ul className="GameBoard-mapTokens">
            {region.tokens.map(t =>
                <li key={t.id}>
                    <StarToken className="GameBoard-mapStarToken" color={t.color} animateWithId={t.id} />
                </li>
            )}
        </ul>
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
    const { boardType, currentTurn, season, wakeUpOrder, workerPlacements, players } = state.game!;
    const actionsBySeason = boardActionsBySeason(state.game!);
    return {
        wakeUpOrder: wakeUpOrder.map(pos => {
            return !pos ? null : {
                ...pos,
                current: pos.playerId === currentTurn.playerId,
            };
        }),
        playerColors: Object.fromEntries(Object.entries(players).map(([id, p]) => [id, p.color])),
        boardType: boardType ?? "base",
        currentSeason: season,
        seasonOrder: (["spring", "summer", "fall", "winter"] as const)
            .filter(s => actionsBySeason[s].length > 0),
        actionsBySeason,
        workerPlacements,
        influenceData: influenceRegions(boardType ?? "base").map(d => ({
            ...d,
            tokens: Object.values(players)
                .map(p =>
                    p.influence
                        .filter(i => i.placement === d.id)
                        .map(i => ({ ...i, color: p.color }))
                )
                .flat()
        })),
    };
};

export default connect(mapStateToProps)(GameBoard);
