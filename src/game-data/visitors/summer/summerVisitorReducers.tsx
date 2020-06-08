import Coins from "../../../game-views/icons/Coins";
import * as React from "react";
import { endTurn, gainCoins,} from "../../reducers";
import GameState from "../../GameState";
import { promptForAction, clearPrompt } from "../../prompts/promptReducers";
import { GameAction } from "../../actionTypes";
import { SummerVisitorId } from "./summerVisitorCards";

const summerVisitorReducers: Record<
    SummerVisitorId,
    (state: GameState, action: GameAction) => GameState
> = {
    handyman: state => state,
    landscaper: state => state,
    negotiator: state => state,
    planner: state => state,
    producer: state => state,
    tourGuide: (state, action) => {
        switch (action.type) {
            case "PICK_SUMMER_VISITOR":
                return promptForAction(state, [
                    <>Gain <Coins>4</Coins></>,
                    <>Harvest 1 field</>
                ])
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case 0:
                        return endTurn(gainCoins(clearPrompt(state), state.currentTurn.playerId, 4));
                    case 1:
                        return state; // TODO
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
};

export const summerVisitor = (state: GameState, action: GameAction) => {
    if (
        state.currentTurn.type !== "workerPlacement" ||
        state.currentTurn.pendingAction === null ||
        state.currentTurn.pendingAction.type !== "playSummerVisitor"
    ) {
        // Not currently playing a summer visitor; short-circuit
        return state;
    }
    switch (action.type) {
        case "PICK_SUMMER_VISITOR": {
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
            return summerVisitorReducers[visitorId](state, action);
        }
        default:
            const visitorId = state.currentTurn.pendingAction.visitorId;
            if (visitorId === undefined) {
                return state;
            }
            return summerVisitorReducers[visitorId](state, action);
    }
};
