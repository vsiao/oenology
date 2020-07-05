import GameState, {
    FieldId,
    PlayerState,
    WorkerPlacementTurn,
    StructureState,
} from "../GameState";
import { ActivityLogEvent } from "../ActivityLog";
import { StructureId } from "../structures";
import { VineId } from "../vineCards";
import { addCardsToHand } from "./cardReducers";
import { VineInField } from "../prompts/promptActions";

export const pushActivityLog = (event: ActivityLogEvent, state: GameState): GameState => {
    return { ...state, activityLog: [...state.activityLog, event], };
};

export const plantVineInField = (
    fieldId: FieldId,
    state: GameState,
    playerId = state.currentTurn.playerId
): GameState => {
    const vineId = ((state.currentTurn as WorkerPlacementTurn).pendingAction as any).vineId as VineId;
    if (!vineId) {
        throw new Error("Unexpected state: should've chosen a vine before planting");
    }
    const player = state.players[playerId];
    const field = player.fields[fieldId];
    if (player.structures["windmill"] === StructureState.Built) {
        state = markStructureUsed("windmill", gainVP(1, state, playerId), playerId);
    }
    return pushActivityLog(
        { type: "plant", playerId: player.id, vineId },
        updatePlayer(state, player.id, {
            fields: {
                ...player.fields,
                [field.id]: { ...field, vines: [...field.vines, vineId] },
            }
        })
    );
};

export const uprootVineFromField = (vine: VineInField, state: GameState): GameState => {
    const player = state.players[state.currentTurn.playerId];
    const field = player.fields[vine.field];
    const vines = [...field.vines];
    const vineIndex = vines.indexOf(vine.id);
    if (vineIndex === -1) {
        throw new Error("Unxpected state: vine not found in field");
    }
    vines.splice(vineIndex, 1);

    return pushActivityLog(
        { type: "uproot", playerId: player.id, vineId: vine.id, },
        addCardsToHand(
            [{ type: "vine", id: vine.id }],
            updatePlayer(state, player.id, {
                fields: {
                    ...player.fields,
                    [field.id]: { ...field, vines },
                }
            })
        )
    );
};

export const buildStructure = (
    state: GameState,
    structureId: StructureId,
    playerId = state.currentTurn.playerId
): GameState => {
    const player = state.players[playerId];
    return pushActivityLog(
        { type: "build", playerId: player.id, structureId },
        updatePlayer(state, player.id, {
            structures: {
                ...player.structures,
                [structureId]: StructureState.Built,
            },
        })
    );
};

const editVP = (numVP: number, state: GameState, playerId = state.currentTurn.playerId) => {
    const playerState = state.players[playerId];
    return pushActivityLog(
        { type: "vp", playerId, delta: numVP },
        updatePlayer(state, playerId, { victoryPoints: playerState.victoryPoints + numVP, })
    );
};
export const gainVP = editVP;
export const loseVP = (numVP: number, state: GameState, playerId = state.currentTurn.playerId) =>
    editVP(-numVP, state, playerId);

const editCoins = (numCoins: number, state: GameState, playerId = state.currentTurn.playerId) => {
    if (numCoins === 0) {
        return state;
    }
    const playerState = state.players[playerId];
    return pushActivityLog(
        { type: "coins", playerId, delta: numCoins },
        updatePlayer(state, playerId, { coins: playerState.coins + numCoins, })
    );
};
export const gainCoins = editCoins;
export const payCoins = (numCoins: number, state: GameState, playerId = state.currentTurn.playerId) =>
    editCoins(-Math.max(0, numCoins), state, playerId);

const editResiduals = (
    numResiduals: number,
    state: GameState,
    playerId = state.currentTurn.playerId
) => {
    const playerState = state.players[playerId];
    const delta = Math.min(playerState.residuals + numResiduals, 5) - playerState.residuals;
    if (delta === 0) {
        return state;
    }
    return pushActivityLog(
        { type: "residuals", playerId, delta },
        updatePlayer(state, playerId, {
            residuals: playerState.residuals + delta
        })
    );
};
export const gainResiduals = editResiduals;
export const loseResiduals = (numResiduals: number, state: GameState, playerId = state.currentTurn.playerId) =>
    editResiduals(-numResiduals, state, playerId);

export const trainWorker = (
    state: GameState,
    { playerId = state.currentTurn.playerId, availableThisYear = false }: {
        playerId?: string;
        availableThisYear?: boolean;
    } = {}
): GameState => {
    return pushActivityLog(
        { type: "trainWorker", playerId },
        updatePlayer(state, playerId, {
            workers: [
                ...state.players[playerId].workers,
                { type: "normal", available: availableThisYear },
            ],
        })
    );
};

export const markStructureUsed = (structureId: StructureId, state: GameState, playerId = state.currentTurn.playerId): GameState => {
    const player = state.players[playerId];

    return updatePlayer(state, playerId, {
        structures: {
            ...player.structures,
            [structureId]: StructureState.Used,
        },
    });
};

export const updatePlayer = (state: GameState, playerId: string, updates: Partial<PlayerState>): GameState => {
    const player = state.players[playerId];
    return {
        ...state,
        players: {
            ...state.players,
            [player.id]: {
                ...player,
                ...updates
            },
        },
    };
};
