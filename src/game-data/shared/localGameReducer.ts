import { LocalGameAction } from "../gameActions";
import GameState, { WorkerType } from "../GameState";
import { availableWorkerOfType, openSpaceOrDisabledReason } from "./workerReducers";

export const localGameAction = (state: GameState, action: LocalGameAction): GameState => {
    switch (action.type) {
        case "SET_WORKER_TYPE":
            return { ...state, selectedWorkerType: action.workerType };
        case "PLACE_PENDING_WORKER":
            if (state.actionPrompts[0]?.type !== "placeWorker") {
                return state;
            }
            const worker: {
                type: WorkerType;
                id: number;
                isTemp?: boolean;
            } = state.currentTurn.type === "workerPlacement" &&
                state.currentTurn.pendingAction?.type === "playVisitor" &&
                state.currentTurn.pendingAction.visitorId === "administrator"
                ? state.workerPlacements.playSummerVisitor[state.currentTurn.pendingAction.placementIdx!]!
                : availableWorkerOfType(state, state.selectedWorkerType);

            if (!action.placement) {
                return { ...state, pendingWorker: undefined };
            }
            const [placement, idx] = action.placement;
            const space = openSpaceOrDisabledReason(state, state.selectedWorkerType, placement, idx);
            if (typeof space === "string") {
                return { ...state, pendingWorker: undefined };
            }
            return {
                ...state,
                pendingWorker: action.placement
                    ? {
                        placement,
                        space,
                        type: worker.type,
                        id: worker.id,
                        playerId: state.currentTurn.playerId,
                        color: state.players[state.currentTurn.playerId].color,
                        isTemp: !!worker.isTemp,
                        source: "pending",
                    }
                    : undefined,
            }
        default:
            return state;
    }
}