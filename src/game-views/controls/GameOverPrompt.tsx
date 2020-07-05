import "./GameOverPrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import PromptStructure from "./PromptStructure";
import { AppState } from "../../store/AppState";
import GameState, { PlayerState } from "../../game-data/GameState";
import { allWines } from "../../game-data/shared/sharedSelectors";
import VictoryPoints from "../icons/VictoryPoints";
import Coins from "../icons/Coins";

interface Props {
    players: PlayerState[]; // Ordered by win conditions
}

const GameOverPrompt: React.FunctionComponent<Props> = props => {
    return <PromptStructure title="Game over!">
        <ol>
            {props.players.map(p =>
                <li key={p.id}>
                    <strong>{p.name}</strong>&nbsp;
                    <VictoryPoints>{p.victoryPoints}</VictoryPoints>&nbsp;
                    <Coins>{p.coins}</Coins>
                </li>)}
        </ol>
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
    const players = Object.values(game.players);
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
