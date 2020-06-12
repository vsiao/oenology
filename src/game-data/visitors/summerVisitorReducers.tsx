import Coins from "../../game-views/icons/Coins";
import * as React from "react";
import GameState from "../GameState";
import { promptForAction, promptToChooseField } from "../prompts/promptReducers";
import { GameAction } from "../gameActions";
import { SummerVisitorId } from "./visitorCards";
import { endTurn, gainCoins, drawCards, harvestField } from "../shared/sharedReducers";
import { harvestFieldDisabledReason } from "../shared/sharedSelectors";
import { Vine } from "../../game-views/icons/Card";

export const summerVisitorReducers: Record<
    SummerVisitorId,
    (state: GameState, action: GameAction) => GameState
> = {
    handyman: state => state,
    landscaper: (state, action) => {
        switch (action.type) {
            case "CHOOSE_VISITOR":
                return promptForAction(state, [
                    { id: "LANDSCAPER_DRAW_PLANT", label: <>Draw 1 <Vine /> and plant up to 1 <Vine /></> },
                    {
                        id: "LANDSCAPER_SWITCH",
                        label: <>Switch 2 <Vine /> on your fields</>,
                        disabledReason: "Not implemented yet", // TODO
                    },
                ]);
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "LANDSCAPER_DRAW_PLANT":
                        // TODO prompt to pick vine to plant, or pass
                        return endTurn(drawCards(state, state.currentTurn.playerId, { vine: 1 }));
                    case "LANDSCAPER_SWITCH":
                        return state; // TODO
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    negotiator: state => state,
    planner: state => state,
    producer: state => state,
    tourGuide: (state, action) => {
        switch (action.type) {
            case "CHOOSE_VISITOR":
                return promptForAction(state, [
                    { id: "TOUR_GAIN_4", label: <>Gain <Coins>4</Coins></> },
                    {
                        id: "TOUR_HARVEST",
                        label: <>Harvest 1 field</>,
                        disabledReason: harvestFieldDisabledReason(state),
                    },
                ])
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "TOUR_GAIN_4":
                        return endTurn(gainCoins(state, state.currentTurn.playerId, 4));
                    case "TOUR_HARVEST":
                        return promptToChooseField(state);
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                return endTurn(harvestField(state, action.fieldId));
            default:
                return state;
        }
    },
};
