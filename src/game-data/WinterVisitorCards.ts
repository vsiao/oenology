import GameState from "./GameState";
import {
    GameAction,
    cancelVisitor,
    gainCoins,
    gainVP,
    promptForNChoices,
    promptToDiscardWine,
    drawCards,
    payCoins,
    trainWorker,
    promptToMakeWine,
} from "./Actions";
import { ThunkDispatch } from "redux-thunk";

type GameDispatch = ThunkDispatch<GameState, undefined, GameAction>;

const canTrainWorker = (gameState: GameState, cost = 4) => {
    return true;
};
const mostValuableWine = (gameState: GameState) => {
    return 8;
};
const numTrainedWorkers = (gameState: GameState) => {
    return 3;
};
const numGrapes = (gameState: GameState) => {
    return 2;
};

interface VisitorCard {
    name: string;
    description: string;
    action: (dispatch: GameDispatch, getState: () => GameState) => void;
}

const winterVisitorCards: Record<string, VisitorCard> = {
    judge: {
        name: "Judge",
        description: "Draw 2 summer visitors OR discard 1 wine of value 4 or more to gain 3VP.",
        action: (dispatch, getState) => {
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
    },
    professor: {
        name: "Professor",
        description: "Pay 2 coins to train 1 worker OR gain 2VP if you have a total of 6 workers.",
        action: (dispatch, getState) => {
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
    },
    taster: {
        name: "Taster",
        description: `Discard 1 wine to gain 4 coins. If it is the most valuable wine in any player's cellar (no ties), gain 2VP.`,
        action: (dispatch, getState) => {
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
    },
    teacher: {
        name: "Teacher",
        description: "Make up to 2 wine OR pay 2 coins to train 1 worker.",
        action: (dispatch, getState) => {
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
    }
};

export default winterVisitorCards;
