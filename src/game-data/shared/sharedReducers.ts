import GameState, {
    FieldId,
    PlayerState,
    WorkerPlacementTurn,
    StructureState,
    WorkerPlacement,
    WorkerType,
    PlayVisitorPendingAction,
} from "../GameState";
import { ActivityLogEvent } from "../ActivityLog";
import { StructureId } from "../structures";
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
    const vineId = ((state.currentTurn as WorkerPlacementTurn).pendingAction as PlayVisitorPendingAction).vineId;
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

export const uprootVinesFromFields = (vines: VineInField[], state: GameState): GameState => {
    vines.forEach(v => state = uprootVineFromField(v, state));
    return state;
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
    if (numVP === 0) {
        return state;
    }
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
    const workers = state.players[playerId].workers;
    const lastWorkerId = workers.reduce(
        (previousValue, worker, currentIndex) =>
            !worker.isTemp && worker.type === "normal" ? currentIndex : previousValue,
        -1
    );
    return pushActivityLog(
        { type: "trainWorker", playerId },
        updatePlayer(state, playerId, {
            workers: [
                ...workers,
                { type: "normal", id: lastWorkerId + 1, available: availableThisYear },
            ],
        })
    );
};

export const placeWorker = (
    type: WorkerType,
    placement: WorkerPlacement,
    placementIdx: number | undefined,
    state: GameState,
    source?: "Planner" | "Administrator"
): GameState => {
    const player = state.players[state.currentTurn.playerId];
    const workerIndex = player.workers.reduce(
        (previousValue, worker, currentIndex) =>
            worker.available && worker.type === type
                ? currentIndex
                : previousValue,
        null as number | null
    );
    if (workerIndex === null) {
        throw new Error("Unexpected state: no available workers");
    }
    state = pushActivityLog({ type: "placeWorker", playerId: player.id, }, state);
    const placements = state.workerPlacements[placement].slice();
    placementIdx = placementIdx ?? placements.findIndex(w => w === null);
    if (placementIdx < 0) {
        placementIdx = placements.length;
    }
    placements[placementIdx] = {
        type,
        id: player.workers[workerIndex].id,
        playerId: state.currentTurn.playerId,
        color: player.color,
        isTemp: !!player.workers[workerIndex].isTemp,
        source,
    };
    return {
        ...updatePlayer(state, player.id, {
            workers: player.workers.map(
                (w, i) => i === workerIndex ? { ...w, available: false } : w
            ),
        }),
        workerPlacements: {
            ...state.workerPlacements,
            [placement]: placements,
        },
    };
};

export const retrieveWorker = (
    placement: WorkerPlacement,
    index: number,
    state: GameState
): GameState => {
    let retrievedWorker: { type: WorkerType | "temp", id: number } | null = null;
    state = {
        ...state,
        workerPlacements: {
            ...state.workerPlacements,
            [placement]: state.workerPlacements[placement].map((w, i) => {
                if (!w || i !== index) {
                    return w;
                }
                retrievedWorker = {
                    type: w.isTemp ? "temp" : w.type,
                    id: w.id,
                };
                return null;
            }),
        },
    };
    if (!retrievedWorker) {
        throw new Error(`Failed to retrieve worker from ${placement} ${index}`);
    }
    const { type, id } = retrievedWorker;
    const player = state.players[state.currentTurn.playerId];
    const idx = player.workers.findIndex(
        w => ((type === "temp" && w.isTemp) || w.type === type) && w.id === id
    );
    return updatePlayer(state, player.id, {
        workers: player.workers.map((w, i) =>
            i === idx ? { ...w, available: true } : w
        ),
    })
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
