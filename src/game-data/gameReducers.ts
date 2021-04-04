import Alea from "alea";
import GameState, { PlayerState, StructureState, CardsByType } from "./GameState";
import { GameAction, PlayerInit, StartGameAction } from "./gameActions";
import { board } from "./board/boardReducer";
import { prompt } from "./prompts/promptReducers";
import { CHEAT_drawCard, shuffle, unshuffledDecks } from "./shared/cardReducers";
import { beginMamaPapaTurn } from "./shared/turnReducers";
import { mamaCards, papaCards, MamaId, PapaId } from "./mamasAndPapas";
import { placeGrapes } from "./shared/grapeWineReducers";
import { controllingPlayerIds, isControllingPlayer } from "./shared/sharedSelectors";
import { GameOptions } from "../store/AppState";

export const game = (state: GameState, action: GameAction, userId: string): GameState => {
    if (action.type === "START_GAME") {
        return beginMamaPapaTurn(initGame(userId, action));
    }
    if (!isControllingPlayer(state, action.playerId)) {
        // It's not this player's turn. Reject the action.
        return state;
    }
    switch (action.type) {
        case "UNDO":
            if (state.undoState?.type !== "undoable") {
                // Somehow tried to undo more times than allowed. This might happen
                // when double-clicking; we can just ignore it.
                return state;
            }
            return state.undoState.prevState;

        case "CHEAT_DRAW_CARD":
            return CHEAT_drawCard(action.id, action.playerId, state);

        case "CHEAT_GAIN_GRAPE":
            return placeGrapes(state, { [action.grape.color]: action.grape.value });
    }

    const controllingIds = controllingPlayerIds(state);
    state = {
        ...state,
        // Actions are undoable by default when performed by the current player.
        // In certain cases (ending a turn, drawing a card), this state will be cleared.
        undoState: {
            type: "undoable",
            prevState: state,
            isLastActionByCurrentTurnPlayer: state.playerId === action.playerId,
        },
        // Increment played time for all controlling players
        players: Object.fromEntries(
            Object.entries(state.players).map(([playerId, player]) => [
                playerId,
                controllingIds.some(p => p === playerId)
                    ? { ...player, playedTimeMs: player.playedTimeMs + action.ts! - state.lastActionTimeMs }
                    : player
            ])
        ),
        lastActionTimeMs: action.ts!,
        lastActionKey: action._key,
    };
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
        season: "spring",
        boardType: action.options && action.options.tuscanyBoard ? "tuscanyA" : "base",
        currentTurn: {
            type: "mamaPapa",
            playerId: players[0].id,
        },
        drawPiles: shuffledCards ?? emptyPiles,
        discardPiles: shuffledCards
            ? emptyPiles
            : unshuffledDecks(action.excludeCards || {}, action.options || {}),
        players: Object.fromEntries(
            players.map((p, i) => [
                p.id,
                action.options && action.options.multiInheritance
                    ? initPlayer(p, action.options, [mamas[2*i], mamas[2*i+1]], [papas[2*i], papas[2*i+1]])
                    // #PreGameShuffle
                    : initPlayer(p, action.options, [p.mama ?? mamas[i]], [p.papa ?? papas[i]])
            ])
        ),
        tableOrder: players.map(({ id }) => id),
        grapeIndex: action.startingPlayer ?? Math.floor(random() * players.length),
        wakeUpOrder: [null, null, null, null, null, null, null],
        workerPlacements: {
            buildOrGiveTour: [],
            buildStructure: [],
            buySell: [],
            drawOrder: [],
            drawVine: [],
            fillOrder: [],
            gainCoin: [],
            giveTour: [],
            harvestField: [],
            influence: [],
            plantVine: [],
            playSummerVisitor: [],
            playWinterVisitor: [],
            makeWine: [],
            sellWine: [],
            trade: [],
            trainWorker: [],
            yokeHarvest: [],
            yokeUproot: []
        },
        activityLog: [],
        undoState: null,
        lastActionTimeMs: (action as GameAction).ts!,
        playerId: players.some(({ id }) => id === userId) ? userId : null,
        actionPrompts: [],
    };
};

const initPlayer = (
    { id, name, color }: PlayerInit,
    options: GameOptions | undefined,
    mamas: MamaId[],
    papas: PapaId[]
): PlayerState => {
    return {
        id,
        name,
        color,
        playedTimeMs: 0,
        coins: 0,
        residuals: 0,
        victoryPoints: 0,
        workers: [
            { type: "grande", id: 0, available: true },
            { type: "normal", id: 1, available: true },
            { type: "normal", id: 2, available: true },
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
        influence: options?.tuscanyBoard
            ? new Array(6).fill(null).map((_, i) => ({ id: `star_${color}${i}` }))
            : [],
        mamas,
        papas,
    };
};
