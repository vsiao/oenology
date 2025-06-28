import GameState, {
    WorkerPlacement,
    WorkerType,
    WorkerPlacementTurn,
    PlayerWorker,
    PlacedWorker,
    StructureState,
} from "../GameState";
import { endTurn, setPendingAction } from "./turnReducers";
import { promptForAction } from "../prompts/promptReducers";
import Worker from "../../game-views/icons/Worker";
import React from "react";
import Coins from "../../game-views/icons/Coins";
import { loseVP, payCoins, pushActivityLog, updatePlayer, withoutActivityLog } from "./sharedReducers";
import { currentTurn } from "../board/currentTurnReducer";
import { moneyDisabledReason, numActionSpaces } from "./sharedSelectors";
import VictoryPoints from "../../game-views/icons/VictoryPoints";
import { isBoardAction } from "../board/boardPlacements";

export const canTrainSpecialWorker = (state: GameState, playerId = state.currentTurn.playerId) => {
    const player = state.players[playerId];
    const canTrainSpecial1 = player.workers.every(w => w.type !== "special1");
    const canTrainSpecial2 = player.workers.every(w => w.type !== "special2");
    return canTrainSpecial1 || canTrainSpecial2;
};

export const trainMaybeSpecialWorker = (
    state: GameState,
    [cost, costType]: [number, "coins" | "vp"],
    {
        availableThisYear = false,
        andThen,
        playerId = state.currentTurn.playerId,
    }: {
        availableThisYear?: boolean;
        andThen?: "endTurn";
        playerId?: string;
    } = {}
): GameState => {
    const player = state.players[playerId];
    const specialWorkers = state.specialWorkers;
    if (specialWorkers && canTrainSpecialWorker(state, playerId)) {
        // Prompt to train a special worker
        state = promptForAction<WorkerType>(state, {
            playerId,
            choices: [
                {
                    id: "TRAIN_WORKER",
                    data: "normal",
                    label: <>Train <Worker /> {costType === "coins" ? <Coins>{cost}</Coins> : <VictoryPoints>{cost}</VictoryPoints>}</>,
                },
                ...(["special1", "special2"] as const).map(workerType => ({
                    id: "TRAIN_WORKER",
                    data: workerType,
                    label: <>Train <Worker workerType={workerType} /> <strong>{specialWorkers[workerType]}</strong> {
                        costType === "coins"
                            ? <Coins>{cost + 1}</Coins>
                            : <><VictoryPoints>{cost}</VictoryPoints> <Coins>1</Coins></>
                    }</>,
                    disabledReason: player.workers.every(w => w.type !== workerType)
                        ? moneyDisabledReason(state, cost + 1, playerId)
                        : "You already have a special worker of this type."
                }))
            ]
        });
        return setPendingAction({
            type: "trainWorker",
            cost: [cost, costType],
            actionPlayerId: playerId,
            availableThisYear,
            fromAction: (state.currentTurn as WorkerPlacementTurn).pendingAction,
            hasBonus: false,
        }, state)
    }
    // Train a normal worker
    state = gainWorker(state, [cost, costType], {
        workerType: "normal",
        playerId,
        availableThisYear,
    });
    switch (andThen) {
        case "endTurn":
            return endTurn(state);
        default:
            return currentTurn(state, { type: "WORKER_TRAINED", playerId });
    }
};

export const gainWorker = (
    state: GameState,
    [cost, costType]: [number, "coins" | "vp"],
    {
        workerType,
        playerId = state.currentTurn.playerId,
        availableThisYear = false,
    }: {
        workerType: WorkerType;
        playerId?: string;
        availableThisYear?: boolean;
    }
) => {
    // In Tuscany, workers can be trained by a player even if they're already passed out
    // of a current year if opponents play a winter visitor. We train the worker
    // directly into the available pool since their other workers are already retrieved.
    const isPassedOutOfYear = state.wakeUpOrder.find(pos => pos?.playerId === playerId)?.season === "endOfYear";

    const workers = state.players[playerId].workers;
    const lastWorkerId = workers.reduce(
        (previousValue, worker, currentIndex) =>
            !worker.isTemp ? currentIndex : previousValue,
        -1
    );
    if (costType === "vp") {
        state = withoutActivityLog(() => loseVP(cost, state, { playerId, source: "visitor" }));
    }
    state = withoutActivityLog(() =>
        payCoins(
            (costType === "coins" ? cost : 0) + (workerType !== "normal" ? 1 : 0),
            state,
            playerId
        )
    );
    const workerName = workerType === "special1" || workerType === "special2"
        ? state.specialWorkers![workerType]!
        : null;
    return pushActivityLog(
        {
            type: "trainWorker",
            cost: [cost, costType],
            playerId,
            workerType,
            workerName,
        },
        updatePlayer(state, playerId, {
            workers: [
                ...workers,
                { type: workerType, id: lastWorkerId + 1, available: isPassedOutOfYear || availableThisYear },
            ],
        })
    );
}

export const availableWorkerOfType = (state: GameState, type: WorkerType): PlayerWorker => {
    const player = state.players[state.currentTurn.playerId];
    const index = player.workers.reduce(
        (prev, worker, i) => worker.available && worker.type === type ? i : prev,
        null as number | null
    );
    if (index === null) {
        throw new Error("Unexpected state: no available workers");
    }
    return player.workers[index];
};

export const openSpaceOrDisabledReason = (
    state: GameState,
    workerType: WorkerType,
    placement: WorkerPlacement,
    requestedSpace: number | null
): number | string => {
    if (isBoardAction(placement)) {
        const placements = state.workerPlacements[placement];
        const numSpaces = numActionSpaces(state);
        const boardPlacements = new Array(numSpaces).fill(null).map((_, i) => placements[i] ?? null)
            .concat(placements.slice(numSpaces).filter((w): w is PlacedWorker => !!w));

        let space = requestedSpace;
        if (space === null) {
            space = boardPlacements.findIndex(w => w === null);
        } else if (space < numSpaces && boardPlacements[space] !== null) {
            if (state.specialWorkers?.[workerType] === "Chef") {
                // Chef can place in any space, even if occupied
                return space;
            }
            space = boardPlacements.findIndex(w => w === null);
        }
        if (space < 0) {
            space = boardPlacements.length;
        }
        if (placement !== "gainCoin" && space >= numSpaces && workerType !== "grande") {
            return `can't place worker ${workerType} in ${space} (max ${numSpaces - 1})`;
        }
        return space;
    } else {
        const player = state.players[state.currentTurn.playerId];
        switch (player.structures.yoke) {
            case StructureState.Built:
                return 0;
            case StructureState.Unbuilt:
                return "can't place worker on unbuilt yoke";
            case StructureState.Used:
                return "unexpected state (should have placed worker)";
            default:
                return "yoke has already been used";
        }
    }
};

export const placeWorker = (
    type: WorkerType,
    placement: WorkerPlacement,
    requestedSpace: number | null,
    state: GameState,
    source: "Planner" | "Administrator" | "Messenger" | "pending" | null = null
): [GameState, number] => {
    const player = state.players[state.currentTurn.playerId];
    const worker = availableWorkerOfType(state, type);
    state = updatePlayer(state, player.id, {
        workers: player.workers.map(
            (w, i) => w === worker ? { ...w, available: false } : w
        ),
    })
    state = pushActivityLog({ type: "placeWorker", playerId: player.id, }, state);
    const space = openSpaceOrDisabledReason(state, type, placement, requestedSpace);
    if (typeof space === "string") {
        throw new Error(`Cannot place worker: ${space}`);
    }
    const placedWorker: PlacedWorker = {
        type,
        id: worker.id,
        playerId: state.currentTurn.playerId,
        color: player.color,
        isTemp: !!worker.isTemp,
        source,
    };
    if (isBoardAction(placement)) {
        const placements = state.workerPlacements[placement].slice();
        placements[space] = placedWorker;
        return [
            {
                ...state,
                workerPlacements: {
                    ...state.workerPlacements,
                    [placement]: placements,
                },
            },
            space 
        ];
    } else {
        // place worker on yoke
        return [
            updatePlayer(state, player.id, {
                structures: {
                    ...player.structures,
                    yoke: placedWorker
                }
            }),
            0
        ];
    }
};

export const retrieveWorker = (
    placement: WorkerPlacement,
    index: number,
    state: GameState
): GameState => {
    let retrievedWorker: { type: WorkerType | "temp", id: number } | null = null;
    if (isBoardAction(placement)) {
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
    } else {
        const player = state.players[state.currentTurn.playerId]
        const yokeState = player.structures.yoke;
        if (typeof yokeState === "object") {
            retrievedWorker = yokeState;
            state = updatePlayer(state, player.id, {
                structures: {
                    ...player.structures,
                    yoke: StructureState.Built,
                },
            });
        }
    }
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