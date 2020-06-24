import GameState from "../GameState";
import { GameAction } from "../gameActions";
import { summerVisitorReducers } from "./summerVisitorReducers";
import { winterVisitorReducers } from "./winterVisitorReducers";
import { pushActivityLog } from "../shared/sharedReducers";
import { removeCardsFromHand } from "../shared/cardReducers";
import { setPendingAction } from "../shared/turnReducers";

const visitorReducers = {
    ...summerVisitorReducers,
    ...winterVisitorReducers,
};

export const visitor = (state: GameState, action: GameAction) => {
    const { currentTurn } = state;
    if (
        currentTurn.type !== "workerPlacement" ||
        currentTurn.pendingAction === null ||
        currentTurn.pendingAction.type !== "playVisitor"
    ) {
        throw new Error("Unexpected state for visitor reducer")
    }

    let pendingAction = currentTurn.pendingAction;
    if (
        action.type === "CHOOSE_CARDS" &&
        action.cards &&
        action.cards[0].type === "visitor" &&
        currentTurn.pendingAction.visitorId === undefined
    ) {
        const card = action.cards[0];
        pendingAction = { ...pendingAction, visitorId: card.id };
        state = pushActivityLog(
            { type: "visitor", playerId: currentTurn.playerId, visitorId: card.id },
            removeCardsFromHand([card], setPendingAction(pendingAction, state))
        );
    }
    return visitorReducers[pendingAction.visitorId!](state, action, pendingAction);
};
