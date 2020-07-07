import Alea from "alea";
import GameState, { PlayerState, StructureState, CardsByType } from "./GameState";
import { GameAction, PlayerInit, StartGameAction } from "./gameActions";
import { board } from "./board/boardReducer";
import { prompt } from "./prompts/promptReducers";
import { CHEAT_drawCard, shuffle, unshuffledDecks } from "./shared/cardReducers";
import { startMamaPapaTurn } from "./shared/turnReducers";
import { mamaCards, papaCards, MamaId, PapaId } from "./mamasAndPapas";

export const game = (state: GameState, action: GameAction, userId: string): GameState => {
    switch (action.type) {
        case "START_GAME":
            return startMamaPapaTurn(
                action.players[0].id,
                initGame(userId, action)
            );
        case "CHEAT_DRAW_CARD":
            return CHEAT_drawCard(action.id, action.playerId, state);
    }
    return board(prompt(state, action), action);
};

const initGame = (userId: string, action: StartGameAction): GameState => {
    const random = Alea((action as GameAction)._key!);
    const players = action.players;
    const mamas = shuffle(Object.keys(mamaCards) as MamaId[], random);
    const papas = shuffle(Object.keys(papaCards) as PapaId[], random);

    // ##PreGameShuffle
    // Newer games use on-demand seeded PRNG shuffling. Older games
    // have pre-shuffled cards coded into the game log, which we honor here.
    const shuffledCards = action.shuffledCards;
    const emptyPiles: CardsByType = {
        vine: [],
        summerVisitor: [],
        order: [],
        winterVisitor: [],
    };

    return {
        year: 0,
        currentTurn: {
            type: "mamaPapa",
            playerId: players[0].id,
        },
        drawPiles: shuffledCards ?? emptyPiles,
        discardPiles: shuffledCards ? emptyPiles : unshuffledDecks(action.excludeCards || {}),
        players: Object.fromEntries(
            players.map((p, i) => [
                p.id,
                // #PreGameShuffle
                initPlayer(p, p.mama ?? mamas[i], p.papa ?? papas[i])
            ])
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

const initPlayer = (
    { id, name, color }: PlayerInit,
    mama: MamaId,
    papa: PapaId
): PlayerState => {
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
