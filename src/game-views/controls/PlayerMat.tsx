import "./PlayerMat.css";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GameAction } from "../../game-data/gameActions";
import { CurrentTurn, PlayerState } from "../../game-data/GameState";
import { orderCards } from "../../game-data/orderCards";
import { vineCards } from "../../game-data/vineCards";
import { visitorCards, VisitorId } from "../../game-data/visitors/visitorCards";
import { pickVisitor } from "../../game-data/visitors/visitorActions";
import { AppState } from "../../store/AppState";
import Coins from "../icons/Coins";
import Residuals from "../icons/Residuals";
import VictoryPoints from "../icons/VictoryPoints";
import Worker from "../icons/Worker";
import OrderCard from "../cards/OrderCard";
import VineCard from "../cards/VineCard";
import VisitorCard from "../cards/VisitorCard";
import ActionPrompt from "./ActionPrompt";

interface Props {
    currentTurn: CurrentTurn;
    playerState: PlayerState;
    onSelectVisitor: (id: VisitorId) => void;
}

const PlayerMat: React.FunctionComponent<Props> = props => {
    const { currentTurn, playerState } = props;
    return <div className={`PlayerMat PlayerMat--${playerState.color}`}>
        <ActionPrompt />
        <div className="PlayerMat-header">
            <Residuals className="PlayerMat-residualPayments">0</Residuals>
            <Coins className="PlayerMat-coins">{playerState.coins}</Coins>
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
                const cardData = visitorCards[id];
                const canPlaySummerVisitor = currentTurn.playerId === playerState.id &&
                    currentTurn.type === "workerPlacement" &&
                    currentTurn.pendingAction !== null &&
                    currentTurn.pendingAction.type === "playSummerVisitor" &&
                    currentTurn.pendingAction.visitorId === undefined;
                return <li key={id} className="PlayerMat-card">
                    <VisitorCard
                        interactive={canPlaySummerVisitor}
                        type={"summer"}
                        cardData={cardData}
                        onClick={canPlaySummerVisitor
                            ? () => props.onSelectVisitor(id)
                            : undefined}
                    />
                </li>;
            })}
            {playerState.cardsInHand.winterVisitor.map(id => {
                const cardData = visitorCards[id];
                const canPlayWinterVisitor = currentTurn.playerId === playerState.id &&
                    currentTurn.type === "workerPlacement" &&
                    currentTurn.pendingAction !== null &&
                    currentTurn.pendingAction.type === "playWinterVisitor" &&
                    currentTurn.pendingAction.visitorId === undefined;
                return <li key={id} className="PlayerMat-card">
                    <VisitorCard
                        interactive={canPlayWinterVisitor}
                        type={"winter"}
                        cardData={cardData}
                        onClick={canPlayWinterVisitor
                            ? () => props.onSelectVisitor(id)
                            : undefined}
                    />
                </li>;
            })}
            {props.playerState.cardsInHand.vine.map(id => {
                return <li key={id} className="PlayerMat-card">
                    <VineCard cardData={vineCards[id]} />
                </li>;
            })}
            {props.playerState.cardsInHand.order.map(id => {
                return <li key={id} className="PlayerMat-card">
                    <OrderCard cardData={orderCards[id]} />
                </li>;
            })}
        </ul>
    </div>;
};

const mapStateToProps = (state: AppState, ownProps: { playerId: string }) => {
    return {
        currentTurn: state.game.currentTurn,
        playerState: state.game.players[ownProps.playerId],
    };
};
const mapDispatchToProps = (dispatch: Dispatch<GameAction>) => {
    return {
        onSelectVisitor: (id: VisitorId) => dispatch(pickVisitor(id)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlayerMat);
