import GameState, { PlayerColor, PlayerState } from "./GameState";
import { GameAction, ShuffledCards } from "./gameActions";
import { vineCards, VineId } from "./vineCards";
import { summerVisitorCards, SummerVisitorId } from "./visitors/summer/summerVisitorCards";
import { orderCards, OrderId } from "./orderCards";
import { winterVisitorCards, WinterVisitorId } from "./visitors/winter/winterVisitorCards";
import { board } from "./board/boardReducer";
import { summerVisitor } from "./visitors/summer/summerVisitorReducers";
import { winterVisitor } from "./visitors/winter/winterVisitorReducers";

export const game = (state: GameState | undefined, action: GameAction): GameState => {
    if (state === undefined) {
        return initGame();
    }
    return board(summerVisitor(winterVisitor(state, action), action), action);
};

export const initGame = (
    playerId: string | null = null,
    shuffledCards: ShuffledCards = { vine: [], summerVisitor: [], order: [], winterVisitor: [] }
): GameState => {
    return {
        currentTurn: {
            type: "workerPlacement",
            playerId: "viny",
            pendingAction: null,
        },
        decks: {
            vine: { drawPile: shuffledCards.vine, discardPile: [] },
            summerVisitor: { drawPile: shuffledCards.summerVisitor, discardPile: [] },
            order: { drawPile: shuffledCards.order, discardPile: [] },
            winterVisitor: { drawPile: shuffledCards.winterVisitor, discardPile: [] },
        },
        players: {
            stfy: initPlayer("stfy", "purple"),
            viny: initPlayer("viny", "orange"),
            // linz: initPlayer("linz", "yellow"),
            // poofytoo: initPlayer("poofytoo", "green"),
            // srir: initPlayer("srir", "blue"),
            // thedrick: initPlayer("thedrick", "red"),
        },
        wakeUpOrder: [null, { playerId: "stfy" }, null, null, null, null, { playerId: "viny" }],
        playerId,
        actionPrompt: null,
    };
};

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
