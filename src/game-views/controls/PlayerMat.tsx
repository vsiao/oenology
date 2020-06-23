import "./PlayerMat.css";
import * as React from "react";
import { connect } from "react-redux";
import cx from "classnames";
import { CardId, CurrentTurn, PlayerState, WorkerType } from "../../game-data/GameState";
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
    currentTurn: CurrentTurn;
    playerState: PlayerState;
    pendingWorkerType: WorkerType;
    setPendingWorkerType: (workerType: WorkerType) => void;
}

const PlayerMat: React.FunctionComponent<Props> = props => {
    const { playerState, setPendingWorkerType } = props;
    const workers = playerState.workers;
    const defaultAvailableWorkerIndex = workers.reduce(
        (previousValue, worker, currentIndex) =>
            worker.available ? currentIndex : previousValue,
        null as number | null
    );
    const [highlightedIndex, setHighlightedIndex] = React.useState(defaultAvailableWorkerIndex);
    React.useEffect(() => {
        if (
            (highlightedIndex === null && defaultAvailableWorkerIndex !== null) ||
            (highlightedIndex !== null && !workers[highlightedIndex].available)
        ) {
            setHighlightedIndex(defaultAvailableWorkerIndex);
            if (defaultAvailableWorkerIndex !== null) {
                setPendingWorkerType(workers[defaultAvailableWorkerIndex].type);
            }
        }
    }, [highlightedIndex, defaultAvailableWorkerIndex, workers, setPendingWorkerType]);

    return <div className={`PlayerMat PlayerMat--${playerState.color}`}>
        <ActionPrompt />
        <div className="PlayerMat-header">
            <Residuals className="PlayerMat-residualPayments">0</Residuals>
            <Coins className="PlayerMat-coins">{playerState.coins}</Coins>
            <VictoryPoints className="PlayerMat-victoryPoints">0</VictoryPoints>
            <ul className="PlayerMat-workers">
                {workers.map((worker, i) =>
                    <li key={i} className={cx({
                        "PlayerMat-worker": true,
                        "PlayerMat-worker--grande": worker.type === "grande",
                        "PlayerMat-worker--available": worker.available,
                        "PlayerMat-worker--highlighted": highlightedIndex !== null && highlightedIndex === i
                    })}
                        onClick={worker.available ? () => {
                            setPendingWorkerType(worker.type);
                            setHighlightedIndex(i);
                        } : undefined}
                    >
                        <Worker
                            workerType={worker.type}
                            color={playerState.color}
                            isTemp={worker.isTemp}
                            disabled={!worker.available}
                        />
                    </li>
                )}
            </ul>
        </div>
        <ul className="PlayerMat-cards">
            {playerState.cardsInHand.map(card => renderCard(card, props))}
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

const mapStateToProps = (state: AppState, ownProps: { playerId: string; }) => {
    return {
        currentTurn: state.game.currentTurn,
        playerState: state.game.players[ownProps.playerId]
    };
};

export default connect(mapStateToProps)(PlayerMat);
