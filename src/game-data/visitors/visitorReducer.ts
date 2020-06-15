import GameState from "../GameState";
import { GameAction } from "../gameActions";
import { summerVisitorReducers } from "./summerVisitorReducers";
import { winterVisitorReducers } from "./winterVisitorReducers";
import { removeCardsFromHand, setPendingAction } from "../shared/sharedReducers";

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
    switch (action.type) {
        case "CHOOSE_VISITOR": {
            const visitorId = action.visitorId;
            const pendingAction = { ...state.currentTurn.pendingAction, visitorId };
            state = removeCardsFromHand(
                [{ type: "visitor", id: visitorId, }],
                setPendingAction(pendingAction, state)
            );
            return visitorReducers[visitorId](state, action, pendingAction);
        }
        default:
            const pendingAction = state.currentTurn.pendingAction;
            if (pendingAction.visitorId === undefined) {
                return state;
            }
            return visitorReducers[pendingAction.visitorId](state, action, pendingAction);
    }
};
