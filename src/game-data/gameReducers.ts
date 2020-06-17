import GameState, { PlayerColor, PlayerState, CardsByType } from "./GameState";
import { GameAction } from "./gameActions";
import { board } from "./board/boardReducer";
import { visitor } from "./visitors/visitorReducer";
import { prompt } from "./prompts/promptReducers";
import { vineCards, VineId } from "./vineCards";
import { summerVisitorCards, SummerVisitorId, winterVisitorCards, WinterVisitorId } from "./visitors/visitorCards";
import { orderCards, OrderId } from "./orderCards";

export const game = (state: GameState | undefined, action: GameAction): GameState => {
    if (state === undefined) {
        return initGame();
    }
    return visitor(board(prompt(state, action), action), action);
};

const UNSHUFFLED_CARDS: CardsByType = {
    vine: Object.keys(vineCards) as VineId[],
    summerVisitor: Object.keys(summerVisitorCards) as SummerVisitorId[],
    order: Object.keys(orderCards) as OrderId[],
    winterVisitor: Object.keys(winterVisitorCards) as WinterVisitorId[],
};
export const initGame = (
    playerId: string | null = null,
    shuffledCards: CardsByType = UNSHUFFLED_CARDS
): GameState => {
    return {
        currentTurn: {
            type: "workerPlacement",
            playerId: "viny",
            pendingAction: null,
            season: "summer"
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
            // linz: initPlayer("linz", "yellow"),
            // poofytoo: initPlayer("poofytoo", "green"),
            // srir: initPlayer("srir", "blue"),
            // thedrick: initPlayer("thedrick", "red"),
        },
        tableOrder: ["stfy", "viny"],
        grapeIndex: 1,
        wakeUpOrder: [null, { playerId: "stfy" }, { playerId: "viny" }, null, null, null, null],
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
        trainedWorkers: [
            { type: "grande", available: true },
            { type: "normal", available: true },
            { type: "normal", available: true },
        ],
        cardsInHand: [
        ],
        fields: {
            field5: { id: "field5", value: 5, vines: [], sold: false },
            field6: { id: "field6", value: 6, vines: [], sold: false },
            field7: { id: "field7", value: 7, vines: [], sold: false },
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
