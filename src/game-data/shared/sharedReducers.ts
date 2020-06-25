import GameState, {
    FieldId,
    PlayerState,
} from "../GameState";
import { ActivityLogEvent } from "../ActivityLog";
import { StructureId } from "../structures";
import { VineId } from "../vineCards";
import { addToDiscard } from "./cardReducers";

export const pushActivityLog = (event: ActivityLogEvent, state: GameState): GameState => {
    return { ...state, activityLog: [...state.activityLog, event], };
};

export const plantVineInField = (vineId: VineId, fieldId: FieldId, state: GameState): GameState => {
    const player = state.players[state.currentTurn.playerId];
    const field = player.fields[fieldId];
    const vines: VineId[] = [...field.vines, vineId];
    return pushActivityLog(
        { type: "plant", playerId: player.id, vineId },
        addToDiscard(
            [{ type: "vine", id: vineId }],
            updatePlayer(state, player.id, {
                fields: {
                    ...player.fields,
                    [field.id]: { ...field, vines },
                },
            })
        )
    );
};

export const buildStructure = (state: GameState, structureId: StructureId): GameState => {
    const player = state.players[state.currentTurn.playerId];
    return pushActivityLog(
        { type: "build", playerId: player.id, structureId },
        updatePlayer(state, player.id, {
            structures: {
                ...player.structures,
                [structureId]: true,
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
    return pushActivityLog(
        { type: "residuals", playerId, delta: numResiduals },
        updatePlayer(state, playerId, { residuals: playerState.residuals + numResiduals })
    );
};
export const gainResiduals = editResiduals;
export const loseResiduals = (numResiduals: number, state: GameState, playerId = state.currentTurn.playerId) =>
    editResiduals(-numResiduals, state, playerId);

export const trainWorker = (state: GameState, playerId = state.currentTurn.playerId): GameState => {
    return pushActivityLog(
        { type: "trainWorker", playerId },
        updatePlayer(state, playerId, {
            workers: [
                ...state.players[playerId].workers,
                { type: "normal", available: false },
            ],
        })
    );
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
