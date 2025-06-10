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
import ChoiceButton from "./ChoiceButton";

interface Props {
    shouldShowMamaPapas: boolean;
    playerStates: Record<string, PlayerState>;
    playerId: string | null;
}

const PlayerMat: React.FunctionComponent<Props> = props => {
    const { playerStates, playerId } = props;
    const playerState = playerId && playerStates[playerId];

    return <div className={cx("PlayerMat", playerState && `PlayerMat--${playerState.color}`)}>
        {
            playerState
                ?  <>
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
                </>
                : <div className="PlayerMat-spectator">
                    <p>You're currently <strong>spectating</strong> this game.</p>
                    <ul>
                        {Object.values(playerStates).map(p =>
                            <li><a href={`?p=${p.id}`}><ChoiceButton>Play as <Worker color={p.color} /> <strong>{p.name}</strong></ChoiceButton></a></li>
                        )}
                    </ul>
                </div>
        }
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
        playerStates: game.players,
        playerId: game.playerId,
    };
};

export default connect(mapStateToProps)(PlayerMat);
