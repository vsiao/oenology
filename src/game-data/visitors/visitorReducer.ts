import GameState from "../GameState";
import { GameAction } from "../gameActions";
import { summerVisitorReducers, rhineSummerVisitorReducers } from "./summerVisitorReducers";
import { winterVisitorReducers, rhineWinterVisitorReducers } from "./winterVisitorReducers";
import { pushActivityLog } from "../shared/sharedReducers";
import { removeCardsFromHand } from "../shared/cardReducers";
import { setPendingAction, endTurn } from "../shared/turnReducers";

const visitorReducers = {
    ...summerVisitorReducers,
    ...rhineSummerVisitorReducers,
    ...winterVisitorReducers,
    ...rhineWinterVisitorReducers,
};

export const visitor = (state: GameState, action: GameAction) => {
    const { currentTurn } = state;
    if (
        currentTurn.type !== "workerPlacement" ||
        !currentTurn.pendingAction ||
        currentTurn.pendingAction.type !== "playVisitor"
    ) {
        throw new Error("Unexpected state for visitor reducer")
    }

    let pendingAction = currentTurn.pendingAction;
    if (
        action.type === "CHOOSE_CARDS" &&
        currentTurn.pendingAction.visitorId === undefined
    ) {
        if (!action.cards) {
            // pass on bonus visitor card
            return endTurn(state);
        }
        if (action.cards[0].type !== "visitor") {
            throw new Error("Unexpected state: chose a non-visitor card");
        }
        const card = action.cards[0];
        pendingAction = { ...pendingAction, visitorId: card.id };
        state = pushActivityLog(
            { type: "visitor", playerId: currentTurn.playerId, visitorId: card.id },
            removeCardsFromHand([card], setPendingAction(pendingAction, state))
        );
    }
    return visitorReducers[pendingAction.visitorId!](state, action, pendingAction);
};
