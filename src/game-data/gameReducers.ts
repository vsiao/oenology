import Alea from "alea";
import GameState, { PlayerState, StructureState, CardsByType, GrapeColor, WineColor, FieldId } from "./GameState";
import { GameAction, GameActionChanged, PlayerInit, StartGameAction } from "./gameActions";
import { board } from "./board/boardReducer";
import { prompt } from "./prompts/promptReducers";
import { CHEAT_drawCard, shuffle, unshuffledDecks } from "./shared/cardReducers";
import { beginMamaPapaTurn } from "./shared/turnReducers";
import { mamaCards, papaCards, MamaId, PapaId } from "./mamasAndPapas";
import { gainWine, placeGrapes } from "./shared/grapeWineReducers";
import { controllingPlayerIds, isControllingPlayer } from "./shared/sharedSelectors";
import { GameOptions } from "../store/AppState";
import { buildStructure, gainResiduals, updatePlayer } from "./shared/sharedReducers";
import { StructureId } from "./structures";
import { VineId } from "./vineCards";

export const game = (state: GameState, action: GameAction, userId: string): GameState => {
    // Actions aren't applied until they are published by firebase and have a server key assigned
    if (!action._key) {
        return state;
    }
    const actionKey = action._key;

    if (action.type === "START_GAME") {
        return beginMamaPapaTurn(initGame(userId, action, actionKey));
    }
    if (action.type === "GAME_ACTION_CHANGED") {
        return updatePlayedTime(state, action);
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

        case "APPLY_CHEAT_CODE":
            const [cmd, ...parts] = action.code.split(":");
            switch (cmd) {
                case "d": // draw
                    return CHEAT_drawCard(parts[0], action.playerId, state);
                case "g": // grape; eg. `g:red:5`
                    return placeGrapes(state, {
                        [parts[0] as GrapeColor]: parseInt(parts[1], 10),
                    });
                case "p": // plant; eg. `p:field5:cab1`
                    const fieldId = parts[0] as FieldId;
                    const vineId = parts[1] as VineId;
                    const fields = state.players[action.playerId].fields;
                    return updatePlayer(state, action.playerId, {
                        fields: {
                            ...fields,
                            [fieldId]: { ...fields[fieldId], vines: [...fields[fieldId].vines, vineId] },
                        },
                    });
                case "r": // residual
                    return gainResiduals(1, state, action.playerId)
                case "w": // wine; eg. `w:sparkling:7`
                    return gainWine(
                        { color: parts[0] as WineColor, value: parseInt(parts[1], 10) },
                        state
                    );
                case "s": // structure
                    return buildStructure(state, parts[0] as StructureId, action.playerId);
            }
    }

    const controllingIds = controllingPlayerIds(state);
    const actionDurationMs = action.ts! - state.actionsApplied[state.lastActionKey].ts;
    state = {
        ...state,
        // Increment played time for all controlling players
        players: Object.fromEntries(
            Object.entries(state.players).map(([playerId, player]) => [
                playerId,
                controllingIds.some(p => p === playerId)
                    ? { ...player, playedTimeMs: player.playedTimeMs + actionDurationMs }
                    : player
            ])
        ),
        // Actions are undoable by default when performed by the current player.
        // In certain cases (ending a turn, drawing a card), this state will be cleared.
        undoState: {
            type: "undoable",
            prevState: state,
            isLastActionByCurrentTurnPlayer: state.playerId === action.playerId,
        },
        actionsApplied: {
            ...state.actionsApplied,
            [state.lastActionKey]: {
                ...state.actionsApplied[state.lastActionKey],
                nextActionKey: actionKey,
            },
            [actionKey]: {
                controllingPlayers: controllingIds,
                ts: action.ts!,
            },
        },
        lastActionKey: actionKey,
    };
    return board(prompt(state, action), action);
};

const initGame = (userId: string, action: StartGameAction, key: string): GameState => {
    const { ts } = action as GameAction;
    const random = Alea(key);
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
        actionsApplied: {
            [key]: {
                controllingPlayers: [],
                ts: ts!,
            },
        },
        lastActionKey: key,
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

const updatePlayedTime = (state: GameState, action: GameActionChanged): GameState => {
    const appliedAction = state.actionsApplied[action.key];
    if (!appliedAction) {
        // Tried to update an action that we aren't keeping track of; ignore
        return state;
    }
    const dt = action.ts - appliedAction.ts;

    // Timestamp changes affect players in control before and after this action.
    // Moving a timestamp forward should shift time taken from players in control
    // after the action to the players in control before the action.
    const prevPlayers = appliedAction.controllingPlayers;
    const nextPlayers = appliedAction.nextActionKey
        ? state.actionsApplied[appliedAction.nextActionKey].controllingPlayers
        : [];

    const adjustments: Record<string, number> = {};
    for (const pid of prevPlayers) {
        adjustments[pid] = dt;
    }
    for (const pid of nextPlayers) {
        if (adjustments.hasOwnProperty(pid)) {
            // existence implies this player was in control both before and after this
            // action, so no adjustment is needed
            delete adjustments[pid];
        } else {
            adjustments[pid] = -dt;
        }
    }

    return {
        ...state,
        players: Object.fromEntries(
            Object.entries(state.players).map(([playerId, player]) => [
                playerId,
                adjustments.hasOwnProperty(playerId)
                    ? { ...player, playedTimeMs: player.playedTimeMs + adjustments[playerId] }
                    : player
            ])
        ),
    };
};
