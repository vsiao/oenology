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
        state.currentTurn.pendingAction.type !== "playVisitor"
    ) {
        // Not currently playing a visitor; short-circuit
        return state;
    }
    const pendingAction = state.currentTurn.pendingAction;
    if (pendingAction.visitorId === undefined) {
        return state;
    }
    return visitorReducers[pendingAction.visitorId](state, action, pendingAction);
};
