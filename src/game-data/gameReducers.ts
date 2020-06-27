import GameState, { PlayerColor, PlayerState, CardsByType } from "./GameState";
import { GameAction, StartGameAction } from "./gameActions";
import { board } from "./board/boardReducer";
import { prompt } from "./prompts/promptReducers";
import { CHEAT_drawCard } from "./shared/cardReducers";
import { promptForWakeUpOrder } from "./shared/turnReducers";

export const game = (state: GameState, action: GameAction, userId: string): GameState => {
    switch (action.type) {
        case "START_GAME":
            return promptForWakeUpOrder(
                initGame(userId, action.players, action.shuffledCards)
            );
        case "CHEAT_DRAW_CARD":
            return CHEAT_drawCard(action.id, action.playerId, state);
    }
    return board(prompt(state, action), action);
};

export const initGame = (
    userId: string,
    players: StartGameAction["players"],
    shuffledCards: CardsByType
): GameState => {
    return {
        currentTurn: {
            type: "wakeUpOrder",
            playerId: players.length === 0 ? "" : players[0][0],
        },
        drawPiles: shuffledCards,
        discardPiles: {
            vine: [],
            summerVisitor: [],
            order: [],
            winterVisitor: [],
        },
        players: Object.fromEntries(
            players.map(([id, color]) => [id, initPlayer(id, color)])
        ),
        tableOrder: players.map(([id, _]) => id),
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
        playerId: players.some(([id, _]) => id === userId) ? userId : null,
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
