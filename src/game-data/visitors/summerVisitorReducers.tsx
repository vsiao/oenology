import Coins from "../../game-views/icons/Coins";
import * as React from "react";
import GameState from "../GameState";
import { promptForAction, clearPrompt } from "../prompts/promptReducers";
import { GameAction } from "../gameActions";
import { SummerVisitorId } from "./visitorCards";
import { endTurn, gainCoins } from "../shared/sharedReducers";

export const summerVisitorReducers: Record<
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
            case "PICK_VISITOR":
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
