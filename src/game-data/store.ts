import { createStore } from "redux";
import GameState, { PlayerState, PlayerColor } from "./GameState";
import { GameAction } from "./actionCreators";
import { winterVisitorCards, WinterVisitorId } from "./visitors/winter/winterVisitorCards";
import { winterVisitor } from "./visitors/winter/winterVisitorReducers";
import { summerVisitorCards, SummerVisitorId } from "./visitors/summer/summerVisitorCards";
import { vineCards, VineId } from "./vineCards";
import { orderCards, OrderId } from "./orderCards";

const initPlayer = (id: string, color: PlayerColor): PlayerState => {
    return {
        id,
        color,
        coins: 0,
        victoryPoints: 0,
        availableWorkers: {},
        cardsInHand: {
            vine: Object.keys(vineCards) as VineId[],
            summerVisitor: Object.keys(summerVisitorCards) as SummerVisitorId[],
            order: Object.keys(orderCards) as OrderId[],
            winterVisitor: Object.keys(winterVisitorCards) as WinterVisitorId[],
        },
        crushPad: {
            red: [false, false, false, false, false, false, false, false, false],
            white: [false, false, false, false, false, false, false, false, false],
        },
        cellar: {
            red: [false, false, false, false, false, false, false, false, false],
            white: [false, false, false, false, false, false, false, false, false],
            rose: [false, false, false, false, false, false, false, false, false],
            sparkling: [false, false, false, false, false, false, false, false, false],
        },
    };
};
const initGame = (): GameState => {
    return {
        currentTurn: {
            type: "workerPlacement",
            playerId: "viny",
            pendingAction: {
                type: "playWinterVisitor"
            },
        },
        players: {
            stfy: initPlayer("stfy", "purple"),
            viny: initPlayer("viny", "orange"),
            linz: initPlayer("linz", "yellow"),
            poofytoo: initPlayer("poofytoo", "green"),
            srir: initPlayer("srir", "blue"),
            thedrick: initPlayer("thedrick", "red"),
        },
        actionPrompt: null,
    };
};

const oenologyGame = (state: GameState | undefined, action: GameAction) => {
    if (state === undefined) {
        return initGame();
    }
    state = winterVisitor(state, action);
    switch (action.type) {
        case "TRAIN_WORKER":
            return state;
        case "PLANT_VINE":
            return state;
        default:
            return state;
    }
};

const store = createStore(oenologyGame);
export default store;
