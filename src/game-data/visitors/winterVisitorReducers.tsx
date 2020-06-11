import * as React from "react";
import { default as VP } from "../../game-views/icons/VictoryPoints";
import Coins from "../../game-views/icons/Coins";
import Worker from "../../game-views/icons/Worker";
import { SummerVisitor } from "../../game-views/icons/Card";
import { drawCards, gainVP, endTurn, gainCoins, discardWine } from "../shared/sharedReducers";
import GameState from "../GameState";
import { promptForAction, promptToChooseWine, promptToMakeWine } from "../prompts/promptReducers";
import { GameAction } from "../gameActions";
import { WinterVisitorId } from "./visitorCards";

const mostValuableWine = (gameState: GameState) => {
    return 8;
};

export const winterVisitorReducers: Record<
    WinterVisitorId,
    (state: GameState, action: GameAction) => GameState
> = {
    judge: (state, action) => {
        switch (action.type) {
            case "PICK_VISITOR":
                return promptForAction(state, [
                    { id: "JUDGE_DRAW", label: <>Draw 2 <SummerVisitor /></> },
                    { id: "JUDGE_DISCARD", label: <>Discard 1 wine of value 4 or more to gain <VP>3</VP></> },
                ]);
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "JUDGE_DRAW":
                        return endTurn(
                            drawCards(state, state.currentTurn.playerId, { summerVisitor: 2 })
                        );
                    case "JUDGE_DISCARD":
                        return promptToChooseWine(state, /* minValue */ 4);
                    default:
                        return state;
                }
            case "CHOOSE_WINE":
                return endTurn(gainVP(state, state.currentTurn.playerId, 3));
            default:
                return state;
        }
    },
    politician: (state, action) => {
        switch (action.type) {
            case "PICK_VISITOR":
                const { playerId } = state.currentTurn;
                if (state.players[playerId].victoryPoints < 0) {
                    return endTurn(gainCoins(state, playerId, 6));
                } else {
                    return endTurn(
                        drawCards(state, playerId, {
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
            case "PICK_VISITOR":
                return promptForAction(state, [
                    { id: "PROFESSOR_TRAIN", label: <>Pay <Coins>2</Coins> to train 1 <Worker /></> },
                    { id: "PROFESSOR_GAIN", label: <>Gain <VP>2</VP> if you have a total of 6 <Worker /></> },
                ]);
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "PROFESSOR_TRAIN":
                        return state; // TODO
                    case "PROFESSOR_GAIN":
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
            case "PICK_VISITOR":
                return promptToChooseWine(state);
            case "CHOOSE_WINE":
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
            case "PICK_VISITOR":
                return promptForAction(state, [
                    { id: "TEACHER_MAKE", label: <>Make up to 2 wine</> },
                    { id: "TEACHER_TRAIN", label: <>Pay <Coins>2</Coins> to train 1 <Worker /></> },
                ]);
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "TEACHER_MAKE":
                        return promptToMakeWine(state, 2);
                    case "TEACHER_TRAIN":
                        return state; // TODO
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
}
