import "./GameOverPrompt.css";
import cx from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import PromptStructure from "./PromptStructure";
import { AppState } from "../../store/AppState";
import GameState, { PlayerState } from "../../game-data/GameState";
import { allWines } from "../../game-data/shared/sharedSelectors";
import VictoryPoints from "../icons/VictoryPoints";
import Coins from "../icons/Coins";
import { SummerVisitor, WinterVisitor, Order, Vine } from "../icons/Card";
import { visitorCards } from "../../game-data/visitors/visitorCards";
import Worker from "../icons/Worker";

interface PlayerWithStats extends PlayerState {
    coinsGained: number;
    vinesPlanted: number;
    sVisitorsPlayed: number;
    ordersFilled: number;
    wVisitorsPlayed: number;
    workersPlaced: number;
}
interface Props {
    players: PlayerWithStats[]; // Ordered by win conditions
}

const GameOverPrompt: React.FunctionComponent<Props> = props => {
    const [isScrolled, setIsScrolled] = React.useState(false);

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
                "GameOverPrompt-body--scrolled": isScrolled,
            })}
            onScroll={handleScroll}
        >
            <table className="GameOverPrompt-table">
                <thead>
                    <tr className="GameOverPrompt-row">
                        <th className="GameOverPrompt-colHeader GameOverPrompt-rowHeader"></th>
                        <th className="GameOverPrompt-colHeader"><Coins /><br />gained</th>
                        <th className="GameOverPrompt-colHeader"><Vine /><br />planted</th>
                        <th className="GameOverPrompt-colHeader"><SummerVisitor /><br />played</th>
                        <th className="GameOverPrompt-colHeader"><Order /><br />filled</th>
                        <th className="GameOverPrompt-colHeader"><WinterVisitor /><br />played</th>
                        <th className="GameOverPrompt-colHeader"><Worker /><br />placed</th>
                    </tr>
                </thead>
                <tbody>
                    {props.players.map(p =>
                        <tr key={p.id} className="GameOverPrompt-row">
                            <th className="GameOverPrompt-rowHeader" scope="row">
                                <VictoryPoints>{p.victoryPoints}</VictoryPoints>&nbsp;
                                <strong>{p.name}</strong>
                            </th>
                            <td>{p.coinsGained}</td>
                            <td>{p.vinesPlanted}</td>
                            <td>{p.sVisitorsPlayed}</td>
                            <td>{p.ordersFilled}</td>
                            <td>{p.wVisitorsPlayed}</td>
                            <td>{p.workersPlaced}</td>
                        </tr>)}
                </tbody>
            </table>
        </div>
    </PromptStructure>;
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
            }
        ])
    );
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
            case "visitor":
                switch (visitorCards[event.visitorId].season) {
                    case "summer":
                        playersWithStats[event.playerId].sVisitorsPlayed++;
                        return;
                    case "winter":
                        playersWithStats[event.playerId].wVisitorsPlayed++;
                        return;
                }
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
    return { players };
};

export default connect(mapStateToProps)(GameOverPrompt);
