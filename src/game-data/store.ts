import { createStore } from "redux";
import GameState, { PlayerState, PlayerColor } from "./GameState";
import { GameAction } from "./actionCreators";

const initPlayer = (id: string, color: PlayerColor): PlayerState => {
    return {
        id,
        color,
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
            stfy: initPlayer("stfy", "purple"),
            viny: initPlayer("viny", "orange"),
            linz: initPlayer("linz", "yellow"),
            poofytoo: initPlayer("poofytoo", "green"),
            srir: initPlayer("srir", "blue"),
            thedrick: initPlayer("thedrick", "red"),
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
