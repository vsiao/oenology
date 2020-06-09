import GameState, { PlayerColor, PlayerState, CardsByType } from "./GameState";
import { GameAction } from "./gameActions";
import { board } from "./board/boardReducer";
import { summerVisitor } from "./visitors/summer/summerVisitorReducers";
import { winterVisitor } from "./visitors/winter/winterVisitorReducers";

export const game = (state: GameState | undefined, action: GameAction): GameState => {
    if (state === undefined) {
        return initGame();
    }
    return board(summerVisitor(winterVisitor(state, action), action), action);
};

const EMPTY_CARD_PILES: CardsByType = {
    vine: [],
    summerVisitor: [],
    order: [],
    winterVisitor: [],
};
export const initGame = (
    playerId: string | null = null,
    shuffledCards: CardsByType = EMPTY_CARD_PILES
): GameState => {
    return {
        currentTurn: {
            type: "workerPlacement",
            playerId: "viny",
            pendingAction: null,
        },
        drawPiles: shuffledCards,
        discardPiles: EMPTY_CARD_PILES,
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
            vine: [],
            summerVisitor: ["tourGuide"],
            order: [],
            winterVisitor: ["judge", "politician"],
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
