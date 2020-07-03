import GameState, { PlayerState, CardsByType, StructureState } from "./GameState";
import { GameAction, PlayerInit } from "./gameActions";
import { board } from "./board/boardReducer";
import { prompt } from "./prompts/promptReducers";
import { CHEAT_drawCard } from "./shared/cardReducers";
import { startMamaPapaTurn } from "./shared/turnReducers";

export const game = (state: GameState, action: GameAction, userId: string): GameState => {
    switch (action.type) {
        case "START_GAME":
            return startMamaPapaTurn(
                action.players[0].id,
                initGame(userId, action.players, action.shuffledCards)
            );
        case "CHEAT_DRAW_CARD":
            return CHEAT_drawCard(action.id, action.playerId, state);
    }
    return board(prompt(state, action), action);
};

const initGame = (
    userId: string,
    players: PlayerInit[],
    shuffledCards: CardsByType
): GameState => {
    return {
        currentTurn: {
            type: "mamaPapa",
            playerId: players[0].id,
        },
        drawPiles: shuffledCards,
        discardPiles: {
            vine: [],
            summerVisitor: [],
            order: [],
            winterVisitor: [],
        },
        players: Object.fromEntries(
            players.map(player => [player.id, initPlayer(player)])
        ),
        tableOrder: players.map(({ id }) => id),
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
            yokeHarvest: [],
            yokeUproot: []
        },
        activityLog: [],
        playerId: players.some(({ id }) => id === userId) ? userId : null,
        actionPrompts: [],
    };
};

const initPlayer = ({ id, name, color, mama, papa }: PlayerInit): PlayerState => {
    return {
        id,
        name,
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
            trellis: StructureState.Unbuilt,
            irrigation: StructureState.Unbuilt,
            yoke: StructureState.Unbuilt,
            windmill: StructureState.Unbuilt,
            cottage: StructureState.Unbuilt,
            tastingRoom: StructureState.Unbuilt,
            mediumCellar: StructureState.Unbuilt,
            largeCellar: StructureState.Unbuilt
        },
        mama,
        papa,
    };
};
