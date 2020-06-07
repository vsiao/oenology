import * as React from "react";
import { connect } from "react-redux";
import GameState, { CurrentTurn, PlayerState } from "../game-data/GameState";
import { summerVisitorCards } from "../game-data/summerVisitorCards";
import { vineCards } from "../game-data/vineCards";
import { VisitorCardData } from "../game-data/visitorCard";
import { winterVisitorCards } from "../game-data/winterVisitorCards";
import Coins from "./icons/Coins";
import Residuals from "./icons/Residuals";
import VictoryPoints from "./icons/VictoryPoints";
import Worker from "./icons/Worker";
import VineCard from "./VineCard";
import VisitorCard from "./VisitorCard";
import "./PlayerMat.css";

interface Props {
    currentTurn: CurrentTurn;
    playerState: PlayerState;
}

const PlayerMat: React.FunctionComponent<Props> = props => {
    const { currentTurn, playerState } = props;
    const handleVisitor = (data: VisitorCardData) => {

    };
    return <div className={`PlayerMat PlayerMat--${playerState.color}`}>
        <div className="PlayerMat-header">
            <Residuals className="PlayerMat-residualPayments">0</Residuals>
            <Coins className="PlayerMat-coins">0</Coins>
            <VictoryPoints className="PlayerMat-victoryPoints">0</VictoryPoints>
            <ul className="PlayerMat-workers">
                <li className="PlayerMat-worker PlayerMat-worker--grande">
                    <Worker className="PlayerMat-workerIcon" />
                </li>
                <li className="PlayerMat-worker">
                    <Worker className="PlayerMat-workerIcon" />
                </li>
                <li className="PlayerMat-worker">
                    <Worker className="PlayerMat-workerIcon" />
                </li>
            </ul>
        </div>
        <ul className="PlayerMat-cards">
            {playerState.cardsInHand.summerVisitor.map(id => {
                const cardData = summerVisitorCards[id];
                const canPlaySummerVisitor = currentTurn.type === "workerPlacement" &&
                    currentTurn.pendingAction !== null &&
                    currentTurn.pendingAction.type === "playSummerVisitor"
                return <li key={id} className="PlayerMat-card">
                    <VisitorCard
                        interactive={canPlaySummerVisitor}
                        type={"summer"}
                        cardData={cardData}
                        onClick={canPlaySummerVisitor ? () => handleVisitor(cardData) : undefined}
                    />
                </li>;
            })}
            {playerState.cardsInHand.winterVisitor.map(id => {
                const cardData = winterVisitorCards[id];
                const canPlayWinterVisitor = currentTurn.type === "workerPlacement" &&
                    currentTurn.pendingAction !== null &&
                    currentTurn.pendingAction.type === "playWinterVisitor"
                return <li key={id} className="PlayerMat-card">
                    <VisitorCard
                        interactive={canPlayWinterVisitor}
                        type={"winter"}
                        cardData={cardData}
                        onClick={canPlayWinterVisitor ? () => handleVisitor(cardData) : undefined}
                    />
                </li>;
            })}
            {props.playerState.cardsInHand.vine.map(id => {
                return <li key={id} className="PlayerMat-card">
                    <VineCard cardData={vineCards[id]} />
                </li>;
            })}
        </ul>
    </div>;
};

const mapStateToProps = (gameState: GameState, ownProps: { playerId: string; }) => {
    return {
        currentTurn: gameState.currentTurn,
        playerState: gameState.players[ownProps.playerId],
    };
};

export default connect(mapStateToProps)(PlayerMat);
