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
        "Draw 2 summer visitors OR discard 1 wine of value 4 or more to gain 3VP.",
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
        "If you have less than 0VP, gain 6 coins. Otherwise, draw 1 vine, 1 summer visitor, and 1 order.",
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
        "Pay 2 coins to train 1 worker OR gain 2VP if you have a total of 6 workers.",
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
        `Discard 1 wine to gain 4 coins. If it is the most valuable wine in any player's cellar (no ties), gain 2VP.`,
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
        "Make up to 2 wine OR pay 2 coins to train 1 worker.",
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

export default winterVisitorCards;
