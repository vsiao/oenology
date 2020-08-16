import "./PlayerMat.css";
import cx from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import { CardId, PlayerState } from "../../game-data/GameState";
import { orderCards } from "../../game-data/orderCards";
import { vineCards } from "../../game-data/vineCards";
import { visitorCards } from "../../game-data/visitors/visitorCards";
import { AppState } from "../../store/AppState";
import Coins from "../icons/Coins";
import Residuals from "../icons/Residuals";
import VictoryPoints from "../icons/VictoryPoints";
import Worker from "../icons/Worker";
import OrderCard from "../cards/OrderCard";
import VineCard from "../cards/VineCard";
import VisitorCard from "../cards/VisitorCard";
import ActionPrompt from "./ActionPrompt";
import MamaPapaCard from "../cards/MamaPapaCard";

interface Props {
    shouldShowMamaPapas: boolean;
    playerState: PlayerState | undefined;
}

const PlayerMat: React.FunctionComponent<Props> = props => {
    const { playerState } = props;

    return <div className={cx("PlayerMat", playerState && `PlayerMat--${playerState.color}`)}>
        <ActionPrompt />
        <div className="PlayerMat-header">
            {playerState && <>
                <Residuals className="PlayerMat-residualPayments">{playerState.residuals}</Residuals>
                <Coins className="PlayerMat-coins">{playerState.coins}</Coins>
                <VictoryPoints className="PlayerMat-victoryPoints">{playerState.victoryPoints}</VictoryPoints>
                <ul className="PlayerMat-workers">
                    {playerState.workers.map((worker, i) =>
                        <li key={i} className="PlayerMat-worker" >
                            <Worker
                                workerType={worker.type}
                                color={playerState.color}
                                isTemp={worker.isTemp}
                                disabled={!worker.available}
                            />
                        </li>
                    )}
                </ul>
            </>}
        </div>
        <ul className="PlayerMat-cards">
            {playerState && (props.shouldShowMamaPapas
                ? renderMamaPapas(playerState)
                : renderCards(playerState))}
        </ul>
    </div>;
};

const renderMamaPapas = ({ mamas, papas }: PlayerState) => {
    return <>
        {mamas.map(mamaId => <li key={mamaId} className="PlayerMat-card">
            <MamaPapaCard key={mamaId} id={mamaId} />
        </li>)}
        {papas.map(papaId => <li key={papaId} className="PlayerMat-card">
            <MamaPapaCard key={papaId} id={papaId} />
        </li>)}
    </>
};

const renderCards = (playerState: PlayerState) => {
    return playerState.cardsInHand.map(card => renderCard(card));
};

const renderCard = (card: CardId) => {
    switch (card.type) {
        case "vine":
            return <li key={card.id} className="PlayerMat-card">
                <VineCard cardData={vineCards[card.id]} />
            </li>;

        case "order":
            return <li key={card.id} className="PlayerMat-card">
                <OrderCard cardData={orderCards[card.id]} />
            </li>;

        case "visitor":
            return <li key={card.id} className="PlayerMat-card">
                <VisitorCard cardData={visitorCards[card.id]} />
            </li>;
    }
};

const mapStateToProps = (state: AppState) => {
    const game = state.game!;
    return {
        shouldShowMamaPapas: game.currentTurn.type === "mamaPapa" &&
            !!game.playerId && game.players[game.playerId].cardsInHand.length === 0,
        playerState: game.playerId ? game.players[game.playerId] : undefined,
    };
};

export default connect(mapStateToProps)(PlayerMat);
