import { WinterVisitorId } from "./winterVisitorCards";
import { default as VP } from "../../../game-views/icons/VictoryPoints";
import Coins from "../../../game-views/icons/Coins";
import Worker from "../../../game-views/icons/Worker";
import { SummerVisitor } from "../../../game-views/icons/Card";
import * as React from "react";
import { drawCards, gainVP, endTurn, gainCoins, discardWine } from "../../shared/sharedReducers";
import GameState from "../../GameState";
import { promptForAction, clearPrompt, promptToPickWine, promptToMakeWine } from "../../prompts/promptReducers";
import { GameAction } from "../../gameActions";

const numCoins = (gameState: GameState) => {
    return 0;
};
const mostValuableWine = (gameState: GameState) => {
    return 8;
};

const winterVisitorReducers: Record<
    WinterVisitorId,
    (state: GameState, action: GameAction) => GameState
> = {
    judge: (state, action) => {
        switch (action.type) {
            case "PICK_WINTER_VISITOR":
                return promptForAction(state, [
                    <>Draw 2 <SummerVisitor /></>,
                    <>Discard 1 wine of value 4 or more to gain <VP>3</VP></>,
                ]);
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case 0:
                        return endTurn(
                            drawCards(
                                clearPrompt(state),
                                state.currentTurn.playerId,
                                { summerVisitor: 2 }
                            )
                        );
                    case 1:
                        return promptToPickWine(clearPrompt(state), /* minValue */ 4);
                    default:
                        return state;
                }
            case "PICK_WINE":
                return endTurn(gainVP(state, state.currentTurn.playerId, 3));
            default:
                return state;
        }
    },
    politician: (state, action) => {
        switch (action.type) {
            case "PICK_WINTER_VISITOR":
                if (numCoins(state) < 0) {
                    return endTurn(gainCoins(state, state.currentTurn.playerId, 6));
                } else {
                    return endTurn(
                        drawCards(state, state.currentTurn.playerId, {
                            vine: 1,
                            summerVisitor: 1,
                            order: 1,
                        })
                    );
                }
            default:
                return state;
        }
    },
    professor: (state, action) => {
        switch (action.type) {
            case "PICK_WINTER_VISITOR":
                return promptForAction(state, [
                    <>Pay <Coins>2</Coins> to train 1 <Worker /></>,
                    <>Gain <VP>2</VP> if you have a total of 6 <Worker /></>,
                ]);
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case 0:
                        return state; // TODO
                    case 1:
                        return endTurn(gainVP(state, state.currentTurn.playerId, 2));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    taster: (state, action) => {
        switch (action.type) {
            case "PICK_WINTER_VISITOR":
                return promptToPickWine(state);
            case "PICK_WINE":
                const currentTurnPlayerId = state.currentTurn.playerId;
                const stateAfterDiscard = discardWine(state, currentTurnPlayerId, action.wine);
                if (action.wine.value > mostValuableWine(stateAfterDiscard)) {
                    return endTurn(gainVP(stateAfterDiscard, currentTurnPlayerId, 2))
                } else {
                    return endTurn(stateAfterDiscard);
                }
            default:
                return state;
        }
    },
    teacher: (state, action) => {
        switch (action.type) {
            case "PICK_WINTER_VISITOR":
                return promptForAction(state, [
                    <>Make up to 2 wine</>,
                    <>Pay <Coins>2</Coins> to train 1 <Worker /></>,
                ]);
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case 0:
                        return promptToMakeWine(state, 2);
                    case 1:
                        return state; // TODO
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
}

export const winterVisitor = (state: GameState, action: GameAction) => {
    if (
        state.currentTurn.type !== "workerPlacement" ||
        state.currentTurn.pendingAction === null ||
        state.currentTurn.pendingAction.type !== "playWinterVisitor"
    ) {
        // Not currently playing a winter visitor; short-circuit
        return state;
    }
    switch (action.type) {
        case "PICK_WINTER_VISITOR": {
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
            return winterVisitorReducers[visitorId](state, action);
        }
        default:
            const visitorId = state.currentTurn.pendingAction.visitorId;
            if (visitorId === undefined) {
                return state;
            }
            return winterVisitorReducers[visitorId](state, action);
    }
};
