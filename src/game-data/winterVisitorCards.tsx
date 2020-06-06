import GameState from "./GameState";
import {
    cancelVisitor,
    gainCoins,
    gainVP,
    promptForNChoices,
    promptToDiscardWine,
    drawCards,
    payCoins,
    trainWorker,
    promptToMakeWine,
} from "./actionCreators";
import { visitorCard } from "./visitorCard";
import * as React from "react";
import { default as VP } from "../game-views/icons/VictoryPoints";
import Coins from "../game-views/icons/Coins";
import Worker from "../game-views/icons/Worker";
import { SummerVisitor, Vine, Order } from "../game-views/icons/Card";

const canTrainWorker = (gameState: GameState, cost = 4) => {
    return true;
};
const mostValuableWine = (gameState: GameState) => {
    return 8;
};
const numCoins = (gameState: GameState) => {
    return 0;
};
const numTrainedWorkers = (gameState: GameState) => {
    return 3;
};
const numGrapes = (gameState: GameState) => {
    return 2;
};

export type WinterVisitorId = keyof typeof winterVisitorCards;

export const winterVisitorCards = {
    judge: visitorCard(
        "Judge",
        <>Draw 2 <SummerVisitor /> OR discard 1 wine of value 4 or more to gain <VP>3</VP>.</>,
        (dispatch, getState) => {
            dispatch(
                promptForNChoices(1, [
                    {
                        description: "Draw 2 summer visitor cards",
                        isValid: true,
                        action: () => dispatch(drawCards("summerVisitor", 2))
                    },
                    {
                        description: "Discard 1 wine of value 4 or more to gain 3VP",
                        isValid: true,
                        action: () => {
                            dispatch(promptToDiscardWine())
                                .then(wineToDiscard => {
                                    if (wineToDiscard === null) {
                                        dispatch(cancelVisitor());
                                        return;
                                    }
                                    dispatch(gainVP(3));
                                });
                        }
                    }
                ])
            )
        },
    ),
    politician: visitorCard(
        "Politician",
        <>If you have less than <VP>0</VP>, gain <Coins>6</Coins>. Otherwise, draw 1 <Vine />, 1 <SummerVisitor />, and 1 <Order />.</>,
        (dispatch, getState) => {
            if (numCoins(getState()) < 0) {
                dispatch(gainCoins(6));
            } else {
                dispatch(drawCards("vine", 1));
                dispatch(drawCards("summerVisitor", 1));
                dispatch(drawCards("order", 1));
            }
        }
    ),
    professor: visitorCard(
        "Professor",
        <>Pay <Coins>2</Coins> to train 1 <Worker /> OR gain <VP>2</VP> if you have a total of 6 <Worker />.</>,
        (dispatch, getState) => {
            dispatch(
                promptForNChoices(1, [
                    {
                        description: "Pay 2 coins to train 1 worker",
                        isValid: canTrainWorker(getState(), /* cost */ 2),
                        action: () => {
                            dispatch(payCoins(2));
                            dispatch(trainWorker());
                        },
                    },
                    {
                        description: "Gain 2 VP if you have a total of 6 workers",
                        isValid: numTrainedWorkers(getState()) === 6,
                        action: () => dispatch(gainVP(2)),
                    },
                ])
            );
        },
    ),
    taster: visitorCard(
        "Taster",
        <>Discard 1 wine to gain <Coins>4</Coins>. If it is the most valuable wine in any player's cellar (no ties), gain <VP>2</VP>.</>,
        (dispatch, getState) => {
            dispatch(promptToDiscardWine())
                .then(wineToDiscard => {
                    if (wineToDiscard === null) { 
                        dispatch(cancelVisitor());
                        return;
                    }
                    dispatch(gainCoins(4));
                    if (wineToDiscard > mostValuableWine(getState())) {
                        dispatch(gainVP(2));
                    }
                });
        },
    ),
    teacher: visitorCard(
        "Teacher",
        <>Make up to 2 wine OR pay <Coins>2</Coins> to train 1 <Worker />.</>,
        (dispatch, getState) => {
            dispatch(
                promptForNChoices(1, [
                    {
                        description: "Make up to 2 wine tokens",
                        isValid: numGrapes(getState()) > 0,
                        action: () => promptToMakeWine(2)
                    },
                    {
                        description: "Pay 2 coins to train 1 worker",
                        isValid: canTrainWorker(getState(), /* cost */ 2),
                        action: () => {
                            dispatch(payCoins(2));
                            dispatch(trainWorker());
                        },
                    },
                ])
            );
        },
    ),
};
