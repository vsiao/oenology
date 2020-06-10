import GameState from "../GameState";
import { GameAction } from "../gameActions";
import { summerVisitorReducers } from "./summerVisitorReducers";
import { winterVisitorReducers } from "./winterVisitorReducers";

const visitorReducers = {
    ...summerVisitorReducers,
    ...winterVisitorReducers,
};

export const visitor = (state: GameState, action: GameAction) => {
    if (
        state.currentTurn.type !== "workerPlacement" ||
        state.currentTurn.pendingAction === null ||
        (state.currentTurn.pendingAction.type !== "playSummerVisitor" &&
            state.currentTurn.pendingAction.type !== "playWinterVisitor")
    ) {
        // Not currently playing a visitor; short-circuit
        return state;
    }
    switch (action.type) {
        case "PICK_VISITOR": {
            const visitorId = action.visitorId;
            state = {
                ...state,
                currentTurn: {
                    ...state.currentTurn,
                    pendingAction: {
                        ...state.currentTurn.pendingAction,
                        visitorId,
                    }
                },
            };
            return visitorReducers[visitorId](state, action);
        }
        default:
            const visitorId = state.currentTurn.pendingAction.visitorId;
            if (visitorId === undefined) {
                return state;
            }
            return visitorReducers[visitorId](state, action);
    }
};
