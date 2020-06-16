import "./PlayerMat.css";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import cx from "classnames";
import { GameAction, chooseVine, chooseVisitor } from "../../game-data/gameActions";
import { CardId, CurrentTurn, PlayerState, WorkerType } from "../../game-data/GameState";
import { orderCards } from "../../game-data/orderCards";
import { vineCards, VineId } from "../../game-data/vineCards";
import { visitorCards, VisitorId } from "../../game-data/visitors/visitorCards";
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
    onSelectVine: (id: VineId) => void;
    onSelectVisitor: (id: VisitorId) => void;
    pendingWorkerType: WorkerType;
    setPendingWorkerType: (workerType: WorkerType) => void;
}

const PlayerMat: React.FunctionComponent<Props> = props => {
    const { playerState, setPendingWorkerType } = props;
    const trainedWorkers = playerState.trainedWorkers;
    const defaultAvailableWorkerIndex = trainedWorkers.reduce(
        (previousValue, trainedWorker, currentIndex) =>
            trainedWorker.available ? currentIndex : previousValue,
        null as number | null
    );
    const [highlightedIndex, setHighlightedIndex] = React.useState(defaultAvailableWorkerIndex);
    React.useEffect(() => {
        if (
            (highlightedIndex === null && defaultAvailableWorkerIndex !== null) ||
            (highlightedIndex !== null && !trainedWorkers[highlightedIndex].available)
        ) {
            setHighlightedIndex(defaultAvailableWorkerIndex);
            if (defaultAvailableWorkerIndex !== null) {
                setPendingWorkerType(trainedWorkers[defaultAvailableWorkerIndex].type);
            }
        }
    }, [highlightedIndex, defaultAvailableWorkerIndex, trainedWorkers, setPendingWorkerType]);

    return <div className={`PlayerMat PlayerMat--${playerState.color}`}>
        <ActionPrompt />
        <div className="PlayerMat-header">
            <Residuals className="PlayerMat-residualPayments">0</Residuals>
            <Coins className="PlayerMat-coins">{playerState.coins}</Coins>
            <VictoryPoints className="PlayerMat-victoryPoints">0</VictoryPoints>
            <ul className="PlayerMat-workers">
                {trainedWorkers.map((worker, i) =>
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
                        <Worker workerType={worker.type} color={playerState.color} disabled={!worker.available} />
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
    const { currentTurn, playerState } = props;
    switch (card.type) {
        case "vine":
            const canPlayVine = currentTurn.playerId === playerState.id &&
                currentTurn.type === "workerPlacement" &&
                currentTurn.pendingAction !== null &&
                currentTurn.pendingAction.type === "plantVine";
            return <li key={card.id} className="PlayerMat-card">
                <VineCard
                    cardData={vineCards[card.id]}
                    onClick={canPlayVine ? () => props.onSelectVine(card.id) : undefined}
                />
            </li>;

        case "order":
            return <li key={card.id} className="PlayerMat-card">
                <OrderCard cardData={orderCards[card.id]} />
            </li>;

        case "visitor":
            const cardData = visitorCards[card.id];
            const canPlayVisitor = currentTurn.playerId === playerState.id &&
                currentTurn.type === "workerPlacement" &&
                currentTurn.pendingAction !== null &&
                currentTurn.pendingAction.type === "playVisitor" &&
                currentTurn.pendingAction.visitorId === undefined &&
                currentTurn.season === cardData.season;
            return <li key={card.id} className="PlayerMat-card">
                <VisitorCard
                    interactive={canPlayVisitor}
                    type={cardData.season}
                    cardData={cardData}
                    onClick={canPlayVisitor
                        ? () => props.onSelectVisitor(card.id)
                        : undefined}
                />
            </li>;
    }
};

const mapStateToProps = (state: AppState, ownProps: { playerId: string; }) => {
    return {
        currentTurn: state.game.currentTurn,
        playerState: state.game.players[ownProps.playerId]
    };
};
const mapDispatchToProps = (dispatch: Dispatch<GameAction>) => {
    return {
        onSelectVine: (id: VineId) => dispatch(chooseVine(id)),
        onSelectVisitor: (id: VisitorId) => dispatch(chooseVisitor(id)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlayerMat);
