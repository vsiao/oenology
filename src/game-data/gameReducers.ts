import GameState, { PlayerColor, PlayerState, CardsByType } from "./GameState";
import { GameAction } from "./gameActions";
import { board } from "./board/boardReducer";
import { prompt } from "./prompts/promptReducers";
import { CHEAT_drawCard, UNSHUFFLED_CARDS } from "./shared/cardReducers";
import { promptForWakeUpOrder } from "./shared/turnReducers";

export const game = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case "START_GAME":
            return promptForWakeUpOrder(initGame(state.playerId, action.shuffledCards));
        case "CHEAT_DRAW_CARD":
            return CHEAT_drawCard(action.id, action.playerId, state);
    }
    return board(prompt(state, action), action);
};

export const initGame = (
    playerId: string | null = null,
    shuffledCards: CardsByType = UNSHUFFLED_CARDS
): GameState => {
    return {
        currentTurn: {
            type: "wakeUpOrder",
            playerId: "stfy",
        },
        drawPiles: shuffledCards,
        discardPiles: {
            vine: [],
            summerVisitor: [],
            order: [],
            winterVisitor: [],
        },
        players: {
            stfy: initPlayer("stfy", "purple"),
            viny: initPlayer("viny", "orange"),
            // srir: initPlayer("srir", "blue"),
            // linz: initPlayer("linz", "yellow"),
            // poofytoo: initPlayer("poofytoo", "green"),
            // thedrick: initPlayer("thedrick", "red"),
        },
        tableOrder: ["stfy", "viny"],
        grapeIndex: 0,
        wakeUpOrder: [null, null, null, null, null, null, null],
        workerPlacements: {
            drawVine: [],
            giveTour: [],
            buildStructure: [],
            playSummerVisitor: [],
            buySell: [],
            plantVine: [],
            drawOrder: [],
            harvestField: [],
            trainWorker: [],
            playWinterVisitor: [],
            makeWine: [],
            fillOrder: [],
            gainCoin: [],
            yoke: []
        },
        activityLog: [],
        playerId,
        actionPrompts: [],
    };
};

const initPlayer = (id: string, color: PlayerColor): PlayerState => {
    return {
        id,
        color,
        coins: 0,
        residuals: 0,
        victoryPoints: 0,
        workers: [
            { type: "grande", available: true },
            { type: "normal", available: true },
            { type: "normal", available: true },
        ],
        cardsInHand: [
        ],
        fields: {
            field5: { id: "field5", value: 5, vines: [], sold: false, harvested: false },
            field6: { id: "field6", value: 6, vines: [], sold: false, harvested: false },
            field7: { id: "field7", value: 7, vines: [], sold: false, harvested: false },
        },
        crushPad: {
            red: [false, false, false, false, false, false, false, false, false],
            white: [false, false, false, false, false, false, false, false, false],
        },
        cellar: {
            red: [false, false, false, false, false, false, false, false, false],
            white: [false, false, false, false, false, false, false, false, false],
            blush: [false, false, false, false, false, false, false, false, false],
            sparkling: [false, false, false, false, false, false, false, false, false],
        },
        structures: {
            trellis: false,
            irrigation: false,
            yoke: false,
            windmill: false,
            cottage: false,
            tastingRoom: false,
            mediumCellar: false,
            largeCellar: false
        }
    };
};
