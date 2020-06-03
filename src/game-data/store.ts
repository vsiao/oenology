import { createStore } from "redux";
import GameState, { PlayerState } from "./GameState";
import { GameAction } from "./actionCreators";

const initPlayer = (id: string): PlayerState => {
    return {
        id,
        availableWorkers: {},
        crushPad: {
            red: [false, false, false, false, false, false, false, false, false],
            white: [false, false, false, false, false, false, false, false, false],
        },
        cellar: {
            red: [false, false, false, false, false, false, false, false, false],
            white: [false, false, false, false, false, false, false, false, false],
            rose: [false, false, false, false, false, false],
            sparkling: [false, false, false],
        },
    };
};
const initGame = (): GameState => {
    return {
        players: {
            stfy: initPlayer("stfy"),
            viny: initPlayer("viny"),
        }
    };
};

const oenologyGame = (state: GameState | undefined, action: GameAction) => {
    if (state === undefined) {
        return initGame();
    }
    switch (action.type) {
        case "CANCEL_VISITOR":
            return state;
        case "DRAW_CARDS":
            return state;
        case "GAIN_COINS":
            return state;
        case "GAIN_VP":
            return state;
        case "PAY_COINS":
            return state;
        case "TRAIN_WORKER":
            return state;
    }
};

const store = createStore(oenologyGame);
export default store;
