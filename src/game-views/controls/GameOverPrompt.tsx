import "./GameOverPrompt.css";
import cx from "classnames";
import * as React from "react";
import ChartistGraph from "react-chartist";
import { connect } from "react-redux";
import PromptStructure from "./PromptStructure";
import { AppState } from "../../store/AppState";
import GameState, { PlayerState, BoardType } from "../../game-data/GameState";
import { allWines } from "../../game-data/shared/sharedSelectors";
import VictoryPoints from "../icons/VictoryPoints";
import Coins from "../icons/Coins";
import { SummerVisitor, WinterVisitor, Order, Vine } from "../icons/Card";
import { visitorCards } from "../../game-data/visitors/visitorCards";
import CrownIcon from "../icons/CrownIcon";
import Worker from "../icons/Worker";
import { Dispatch } from "redux";
import { endGame } from "../../game-data/gameActions";
import { VPSource } from "../../game-data/ActivityLog";

interface PlayerWithStats extends PlayerState {
    coinsGained: number;
    vinesPlanted: number;
    sVisitorsPlayed: number;
    ordersFilled: number;
    wVisitorsPlayed: number;
    workersPlaced: number;
    accumulatedVPByYear: number[];
    vpBySource: Record<VPSource, number>;
}
interface Props {
    players: PlayerWithStats[]; // Ordered by win conditions
    boardType: BoardType;
    shouldEndGame: boolean;
    endGame: () => void;
}

const GameOverPrompt: React.FunctionComponent<Props> = props => {
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [showStats, setShowStats] = React.useState(true);

    const { shouldEndGame, endGame } = props;
    React.useEffect(() => {
        if (shouldEndGame) {
            endGame();
        }
    }, [shouldEndGame, endGame]);

    const handleScroll = (event: React.UIEvent) => {
        const nowScrolled = (event.target as HTMLDivElement).scrollLeft > 5;
        if (nowScrolled !== isScrolled) {
            setIsScrolled(nowScrolled);
        }
    };

    return <PromptStructure title="Game over!">
        <div
            className={cx({
                "GameOverPrompt-body": true,
                "GameOverPrompt-body--scrolled": isScrolled && showStats,
            })}
            onScroll={handleScroll}
        >
            {showStats
                ? <table className="GameOverPrompt-table">
                    <thead>
                        <tr className="GameOverPrompt-row">
                            <th className="GameOverPrompt-colHeader GameOverPrompt-rowHeader">
                                <button className="GameOverPrompt-graphButton" onClick={() => setShowStats(false)}>
                                    <svg className="GameOverPrompt-graphIcon" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 100 100">
                                        <polygon points="95,95 5,95 5,5 16.25,5 16.25,83.75 95,83.75"/>
                                        <polygon points="94.173,9.467 60.989,47.021 47.059,30.419 21.273,56.107 21.273,72.018 46.508,47.081 60.537,64.229 94.173,26.338"/>
                                    </svg>
                                </button>
                            </th>
                            <th className="GameOverPrompt-colHeader"><Coins /><br />gained</th>
                            <th className="GameOverPrompt-colHeader"><Vine /><br />planted</th>
                            <th className="GameOverPrompt-colHeader"><SummerVisitor /><br />played</th>
                            <th className="GameOverPrompt-colHeader"><Order /><br />filled</th>
                            <th className="GameOverPrompt-colHeader"><WinterVisitor /><br />played</th>
                            <th className="GameOverPrompt-colHeader"><Worker /><br />placed</th>
                            <th className="GameOverPrompt-colHeader"><VictoryPoints /><br />orders</th>
                            <th className="GameOverPrompt-colHeader"><VictoryPoints /><br />visitors</th>
                            <th className="GameOverPrompt-colHeader"><VictoryPoints /><br />structures</th>
                            <th className="GameOverPrompt-colHeader"><VictoryPoints /><br />bonus</th>
                            {props.boardType !== "base" && <>
                                <th className="GameOverPrompt-colHeader"><VictoryPoints /><br />trade</th>
                                <th className="GameOverPrompt-colHeader"><VictoryPoints /><br />influence</th>
                            </>}
                        </tr>
                    </thead>
                    <tbody>
                        {props.players.map((p, i) =>
                            <tr key={p.id} className="GameOverPrompt-row">
                                <th className="GameOverPrompt-rowHeader" scope="row">
                                    <VictoryPoints className="GameOverPrompt-vpIcon">{p.victoryPoints}</VictoryPoints>
                                    <strong className="GameOverPrompt-playerName">{p.name}</strong>
                                    {i === 0 && <CrownIcon className="GameOverPrompt-winnerIcon" />}
                                </th>
                                <td className="GameOverPrompt-statCell">{p.coinsGained}</td>
                                <td className="GameOverPrompt-statCell">{p.vinesPlanted}</td>
                                <td className="GameOverPrompt-statCell">{p.sVisitorsPlayed}</td>
                                <td className="GameOverPrompt-statCell">{p.ordersFilled}</td>
                                <td className="GameOverPrompt-statCell">{p.wVisitorsPlayed}</td>
                                <td className="GameOverPrompt-statCell">{p.workersPlaced}</td>
                                <td className="GameOverPrompt-statCell">{p.vpBySource.fill}</td>
                                <td className="GameOverPrompt-statCell">{p.vpBySource.visitor}</td>
                                <td className="GameOverPrompt-statCell">{p.vpBySource.structure}</td>
                                <td className="GameOverPrompt-statCell">{p.vpBySource.bonus}</td>
                                {props.boardType !== "base" && <>
                                    <td className="GameOverPrompt-statCell">{p.vpBySource.trade}</td>
                                    <td className="GameOverPrompt-statCell">{p.vpBySource.influence}</td>
                                </>}
                            </tr>)}
                    </tbody>
                </table>
                : <div className="GameOverPrompt-chart">
                    <button className="GameOverPrompt-statsButton" onClick={() => setShowStats(true)}>
                        Back to Stats
                    </button>
                    {renderVPGraph(props)}
                </div>}
        </div>
    </PromptStructure>;
};

const renderVPGraph = (props: Props): React.ReactNode => {
    return <ChartistGraph
        className="GameOverPrompt-graph"
        type="Line"
        data={{
            labels: props.players[0].accumulatedVPByYear.map((_, i) => `Year ${i}`).slice(1),
            series: props.players.map((p, i) => ({
                className: cx(`ct-series-${"abcdef".charAt(i)}`, `GameOverPrompt-line--${p.color}`),
                name: p.name,
                data: p.accumulatedVPByYear,
            })),
        }}
        options={{
            fullWidth: true,
            height: 280,
            width: 440,
        }}
    />;
};

const cellarValue = (state: GameState, playerId: string) => {
    return allWines(state, playerId).reduce((v, w) => v + w.value, 0);
};
const crushPadValue = (state: GameState, playerId: string) => {
    const { red, white } = state.players[playerId].crushPad;
    return red.reduce((v, hasToken, i) => v + (hasToken ? i + 1 : 0), 0)
        + white.reduce((v, hasToken, i) => v + (hasToken ? i + 1 : 0), 0);
};

const mapStateToProps = (state: AppState) => {
    const game = state.game!
    const playersWithStats: Record<string, PlayerWithStats> = Object.fromEntries(
        Object.entries(game.players).map(([id, p]) => [
            id, {
                ...p,
                coinsGained: 0,
                vinesPlanted: 0,
                sVisitorsPlayed: 0,
                ordersFilled: 0,
                wVisitorsPlayed: 0,
                workersPlaced: 0,
                accumulatedVPByYear: [0, 0],
                vpBySource: {
                    bonus: 0,
                    fill: 0,
                    influence: 0,
                    structure: 0,
                    trade: 0,
                    visitor: 0,
                },
            }
        ])
    );
    let year = 1;
    game.activityLog.forEach(event => {
        switch (event.type) {
            case "coins":
                if (event.delta > 0) {
                    playersWithStats[event.playerId].coinsGained += event.delta;
                }
                return;
            case "fill":
                playersWithStats[event.playerId].ordersFilled++;
                return;
            case "placeWorker":
                playersWithStats[event.playerId].workersPlaced++;
                return;
            case "plant":
                playersWithStats[event.playerId].vinesPlanted++;
                return;
            case "season":
                if (event.season.startsWith("End of Year")) {
                    year++;
                    Object.values(playersWithStats).forEach(p => {
                        p.accumulatedVPByYear.push(p.accumulatedVPByYear[year - 1]);
                    });
                }
                return;
            case "visitor":
                switch (visitorCards[event.visitorId].season) {
                    case "summer":
                        playersWithStats[event.playerId].sVisitorsPlayed++;
                        return;
                    case "winter":
                        playersWithStats[event.playerId].wVisitorsPlayed++;
                        return;
                }
                return;
            case "vp":
                playersWithStats[event.playerId].accumulatedVPByYear[year] += event.delta;
                playersWithStats[event.playerId].vpBySource[event.source] += event.delta;
                return;
        }
    });

    const players = Object.values(playersWithStats);
    players.sort((p2, p1) => {
        if (p1.victoryPoints !== p2.victoryPoints) {
            return p1.victoryPoints - p2.victoryPoints;
        } else if (p1.coins !== p2.coins) {
            return p1.coins - p2.coins;
        } else if (cellarValue(game, p1.id) !== cellarValue(game, p2.id)) {
            return cellarValue(game, p1.id) - cellarValue(game, p2.id);
        } else {
            return crushPadValue(game, p1.id) - crushPadValue(game, p2.id);
        }
    });
    return {
        players,
        boardType: game.boardType ?? "base",
        shouldEndGame: game.playerId === game.currentTurn.playerId
            && state.room.gameStatus !== "completed",
    };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: { playerId: string }) => {
    return { endGame: () => dispatch(endGame(ownProps.playerId)) };
};

export default connect(mapStateToProps, mapDispatchToProps)(GameOverPrompt);
