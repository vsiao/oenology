import GameState, { BoardPlacement, CardType, WorkerPlacement, WorkerPlacementTurn } from "../GameState";
import { numActionSpaces } from "../shared/sharedSelectors";
import { endTurn, passToNextSeason } from "../shared/turnReducers";
import { drawCards } from "../shared/cardReducers";
import { boardAction } from "./boardActionReducer";
import { beginPlaceWorker } from "../shared/workerReducers";
import { boardActions, isBoardAction } from "./boardPlacements";
import { structureAction, structureActions } from "../structures/structureActionReducer";
import { InternalGameAction } from "./currentTurnReducer";

/**
 * Handles pre- and post-placement actions for a worker placement turn.
 * Mostly that encapsulates checking special worker conditions and activating their powers
 * after the main placement action has been completed.
 */
export const workerPlacement = (state: GameState, action: InternalGameAction): GameState => {
    const currentTurn = state.currentTurn as WorkerPlacementTurn;
    const playerId = currentTurn.playerId;
    switch (action.type) {
        case "PLACE_WORKER": {
            const { placement, workerType, idx, _key } = action;
            state = { ...state, lastPlaceWorkerActionKey: _key, pendingWorker: null };
            if (!placement) {
                return passToNextSeason(state);
            }
            return beginPlaceWorker(workerType, placement, idx ?? null, state, _key!);
        }
        case "WORKER_PLACED": {
            const { workerType, placement, idx: placementIdx } = action;
            state = { ...state, currentTurn: { ...currentTurn, placement: [placement, placementIdx] } };

            const placementAction = isBoardAction(placement)
                ? boardActions[placement]
                : structureActions[placement];
            const actionSpace = placementAction.spaceAt(placementIdx, state);
            const workerName = state.specialWorkers?.[workerType];

            switch (workerName) {
                case "Mafioso":
                    if (placementIdx < numActionSpaces(state) && actionSpace.bonus === undefined) {
                        state = {
                            ...state,
                            currentTurn: { ...state.currentTurn as WorkerPlacementTurn, specialWorkerBonus: "Mafioso" }
                        };
                    }
                    break;
                case "Merchant":
                    if (
                        isBoardAction(placement) &&
                        state.wakeUpOrder.every(p => !p || p?.playerId === playerId || p?.season !== state.season)
                    ) {
                        state = {
                            ...state,
                            currentTurn: { ...state.currentTurn as WorkerPlacementTurn, specialWorkerBonus: "Merchant" }
                        };
                    }
                    break;
                case "Messenger":
                    const isFutureMessengerPlacement = isBoardAction(placement) &&
                        state.workerPlacements[placement][placementIdx]!.source === "Messenger";
                    if (isFutureMessengerPlacement) {
                        // The Messenger will be resolved in a future season
                        return endTurn(state);
                    }
                    break;
            }
            return handlePlacementAction(placement, state, action.key, placementIdx);
        }
        case "CHOOSE_ACTION":
            const [placement, idx] = currentTurn.placement!;
            switch (action.choice) {
                case "MAFIOSO_ACT": {
                    return handlePlacementAction(placement, state, action._key!, idx);
                }
                case "MERCHANT_DRAW_CARD":
                    return endTurn(drawCards(state, state.lastActionKey, { [action.data as CardType]: 1 }));

                case "PLANNER_ACT": {
                    const { placement, idx } = action.data as { placement: BoardPlacement; idx: number };
                    state = { ...state, currentTurn: { ...currentTurn, placement: [placement, idx] } };
                    return handlePlacementAction(placement, state, action._key!, idx);
                }
                case "PASS":
                case "PLANNER_PASS":
                    return endTurn(state);
                
                default:
                    return state;
            }
        case "WORKER_TRAINED":
            return endTurn(state);
        default:
            return state;
    }
};

const handlePlacementAction = (
    type: WorkerPlacement,
    state: GameState,
    key: string,
    placementIdx: number
): GameState => {
    if (isBoardAction(type)) {
        const worker = state.workerPlacements[type][placementIdx];
        if (worker && state.specialWorkers?.[worker.type] === "Storyteller") {
            state = {
                ...state,
                currentTurn: {
                    ...state.currentTurn as WorkerPlacementTurn,
                    specialWorkerBonus: "Storyteller",
                },
            };
        }
        const bonus = boardActions[type].spaceAt(placementIdx, state).bonus;
        return boardAction(type, state, key, bonus);
    } else {
        return structureAction(type, state, key);
    }
}