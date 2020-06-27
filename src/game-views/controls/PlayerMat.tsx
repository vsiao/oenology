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

interface Props {
    playerState: PlayerState | undefined;
}

const PlayerMat: React.FunctionComponent<Props> = props => {
    const { playerState } = props;

    return <div className={cx("PlayerMat", playerState && `PlayerMat--${playerState.color}`)}>
        <ActionPrompt />
        <div className="PlayerMat-header">
            {playerState && <>
                <Residuals className="PlayerMat-residualPayments">0</Residuals>
                <Coins className="PlayerMat-coins">{playerState.coins}</Coins>
                <VictoryPoints className="PlayerMat-victoryPoints">0</VictoryPoints>
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
            {playerState && playerState.cardsInHand.map(card => renderCard(card, props))}
        </ul>
    </div>;
};
const renderCard = (card: CardId, props: Props) => {
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
        playerState: game.playerId ? game.players[game.playerId] : undefined,
    };
};

export default connect(mapStateToProps)(PlayerMat);
