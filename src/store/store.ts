import { createStore, applyMiddleware } from "redux";
import createSagaMiddleWare from "redux-saga";
import GameState, { PlayerState, PlayerColor } from "../game-data/GameState";
import { board } from "../game-data/board/boardReducer";
import { winterVisitorCards, WinterVisitorId } from "../game-data/visitors/winter/winterVisitorCards";
import { winterVisitor } from "../game-data/visitors/winter/winterVisitorReducers";
import { summerVisitorCards, SummerVisitorId } from "../game-data/visitors/summer/summerVisitorCards";
import { summerVisitor } from "../game-data/visitors/summer/summerVisitorReducers";
import { vineCards, VineId } from "../game-data/vineCards";
import { orderCards, OrderId } from "../game-data/orderCards";
import { AppAction } from "./actionTypes";
import { publishToFirebase, subscribeToFirebase } from "./firebase";
import { local } from "./localActionReducers";

const initPlayer = (id: string, color: PlayerColor): PlayerState => {
    return {
        id,
        color,
        coins: 0,
        victoryPoints: 0,
        availableWorkers: {
            grande: true,
            other: 2,
        },
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
                type: "playSummerVisitor"
            },
        },
        players: {
            stfy: initPlayer("stfy", "purple"),
            viny: initPlayer("viny", "orange"),
            // linz: initPlayer("linz", "yellow"),
            // poofytoo: initPlayer("poofytoo", "green"),
            // srir: initPlayer("srir", "blue"),
            // thedrick: initPlayer("thedrick", "red"),
        },
        playerId: null,
        actionPrompt: null,
    };
};

const oenologyGame = (state: GameState | undefined, action: AppAction) => {
    if (state === undefined) {
        return initGame();
    }
    if (action.localOnly) {
        return local(state, action);
    }
    if (!action.published) {
        // Wait for game action to be published to firebase before applying
        return state;
    }
    return board(summerVisitor(winterVisitor(state, action), action), action);
};

const sagaMiddleware = createSagaMiddleWare();
const store = createStore(oenologyGame, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(publishToFirebase);
const unsubscribe = store.subscribe(() => {
    // Wait for playerId to be initialized before applying game logs
    if (store.getState().playerId) {
        subscribeToFirebase(action => store.dispatch(action));
        unsubscribe();
    }
});

export default store;
