import "./PlayerMat.css";
import cx from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import { CardId, PlacedWorker, PlayerColor, PlayerState, PlayerWorker, StructureState, WorkerPlacement, WorkerType } from "../../game-data/GameState";
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
import { Dispatch } from "redux";
import { GameAction, placeWorker, setWorkerType } from "../../game-data/gameActions";
import { useTooltip } from "../shared/useTooltip";

interface Props {
    shouldShowMamaPapas: boolean;
    shouldSelectWorkerType: boolean;
    shouldShowWorkerControls: boolean;
    playerStates: Record<string, PlayerState>;
    playerId: string | null;
    selectedWorkerType: WorkerType;
    specialWorkerNames: Partial<Record<WorkerType, string>>;
    yokeState: StructureState | PlacedWorker;
    setWorkerType: (workerType: WorkerType) => void;
    placeWorker: (playerId: string, placement: WorkerPlacement | null, workerType: WorkerType) => void;
}

const PlayerMat: React.FunctionComponent<Props> = ({
    shouldShowMamaPapas,
    shouldSelectWorkerType,
    shouldShowWorkerControls,
    playerStates,
    playerId,
    selectedWorkerType,
    specialWorkerNames,
    yokeState,
    setWorkerType,
    placeWorker,
}) => {
    const playerState = playerId !== null ? playerStates[playerId] : null;
    const workerTypes = ["grande", "special1", "special2", "normal"] as WorkerType[];

    return <div className={cx("PlayerMat", playerState && `PlayerMat--${playerState.color}`)}>
        <ActionPrompt />
        {
            playerState
                ? <div className="PlayerMat-playerContents">
                    <div className="PlayerMat-header">
                        {playerState && <>
                            <Residuals className="PlayerMat-residualPayments">{playerState.residuals}</Residuals>
                            <Coins className="PlayerMat-coins">{playerState.coins}</Coins>
                            <VictoryPoints className="PlayerMat-victoryPoints">{playerState.victoryPoints}</VictoryPoints>
                            <div className="PlayerMat-workerTypeSelector">
                                {workerTypes.map(workerType => {
                                    const workersOfType = playerState.workers.filter(w => w.type === workerType);
                                    if (workersOfType.length === 0) {
                                        return null;
                                    }
                                    const disabled = !shouldSelectWorkerType || workersOfType.every(w => !w.available);
                                    const selected = shouldSelectWorkerType && workerType === selectedWorkerType;
                                    return <WorkerTypeButton
                                        key={workerType}
                                        color={playerState.color}
                                        workerType={workerType}
                                        workerName={specialWorkerNames[workerType] ?? null}
                                        workersOfType={workersOfType}
                                        disabled={disabled}
                                        selected={selected}
                                        onClick={() => setWorkerType(workerType)}
                                    />;
                                })}
                            </div>
                            {shouldShowWorkerControls && <>
                                <ChoiceButton
                                    className="PlayerMat-choiceButton"
                                    onClick={() => placeWorker(playerId!, "gainCoin", selectedWorkerType)}
                                >
                                    Gain <Coins>1</Coins>
                                </ChoiceButton>
                                {yokeState !== StructureState.Unbuilt && <>
                                    <ChoiceButton
                                        className="PlayerMat-choiceButton"
                                        onClick={() => placeWorker(playerId!, "yokeHarvest", selectedWorkerType)}
                                        disabledReason={typeof yokeState === "object" ? "Already used" : undefined}
                                    >
                                        Yoke: Harvest
                                    </ChoiceButton>
                                    <ChoiceButton
                                        className="PlayerMat-choiceButton"
                                        onClick={() => placeWorker(playerId!, "yokeUproot", selectedWorkerType)}
                                        disabledReason={typeof yokeState === "object" ? "Already used" : undefined}
                                    >
                                        Yoke: Uproot
                                    </ChoiceButton>
                                </>}
                                <ChoiceButton
                                    className="PlayerMat-choiceButton"
                                    onClick={() => placeWorker(playerId!, null, selectedWorkerType)}
                                >
                                    Pass
                                </ChoiceButton>
                            </>}
                        </>}
                    </div>
                    <ul className="PlayerMat-cards">
                        {playerState && (shouldShowMamaPapas
                            ? renderMamaPapas(playerState)
                            : renderCards(playerState))}
                    </ul>
                </div>
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

const WorkerTypeButton: React.FC<{
    color: PlayerColor;
    workerType: WorkerType;
    workerName: string | null;
    workersOfType: PlayerWorker[];
    disabled: boolean;
    selected: boolean;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
}> = ({
    color,
    workerType,
    workerName,
    workersOfType,
    disabled,
    selected,
    onClick,
}) => {
    const [ref, maybeTooltip] = useTooltip(
        "top",
        workerName ?? (workerType === "grande" ? "Grande" : null)
    );
    return <button
        ref={ref as React.RefObject<HTMLButtonElement>}
        key={workerType}
        className={cx({
            "PlayerMat-workerTypeButton": true,
            "PlayerMat-workerTypeButton--selected": selected,
        })}
        disabled={disabled}
        onClick={disabled ? undefined : onClick}
    >
        {workersOfType.map((worker, i) =>
            <Worker
                key={i}
                type={worker.type}
                color={color}
                isTemp={worker.isTemp}
                disabled={!worker.available}
            />
        )}
        {maybeTooltip}
    </button>;
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
    const isAdministratorPlacement = game.currentTurn.type === "workerPlacement" &&
        game.currentTurn.pendingAction?.type === "playVisitor" &&
        game.currentTurn.pendingAction.visitorId === "administrator";
    const isPlannerPlacement = game.currentTurn.type === "workerPlacement" &&
        game.currentTurn.pendingAction?.type === "playVisitor" &&
        game.currentTurn.pendingAction.visitorId === "planner";
    return {
        shouldShowMamaPapas: game.currentTurn.type === "mamaPapa" &&
            !!game.playerId && game.players[game.playerId].cardsInHand.length === 0,
        playerStates: game.players,
        playerId: game.playerId,
        shouldSelectWorkerType: game.actionPrompts[0]?.type === "placeWorker" &&
            // Administrator moves the worker placed on the visitor
            !isAdministratorPlacement,
        shouldShowWorkerControls: game.actionPrompts[0]?.type === "placeWorker" &&
            // Administrator and Planner cannot be passed
            !isAdministratorPlacement && !isPlannerPlacement,
        specialWorkerNames: game.specialWorkers ?? {},
        selectedWorkerType: game.selectedWorkerType,
        yokeState: !!game.playerId
            ? game.players[game.playerId].structures.yoke
            : StructureState.Unbuilt,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<GameAction>) => {
    return {
        setWorkerType: (workerType: WorkerType) => dispatch(setWorkerType(workerType)),
        placeWorker: (playerId: string, placement: WorkerPlacement | null, workerType: WorkerType) =>
            dispatch(placeWorker(workerType, placement, null, playerId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlayerMat);
