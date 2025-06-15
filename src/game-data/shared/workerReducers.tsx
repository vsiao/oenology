import GameState, {
    WorkerPlacement,
    WorkerType,
    WorkerPlacementTurn,
} from "../GameState";
import { endTurn, setPendingAction } from "./turnReducers";
import { promptForAction } from "../prompts/promptReducers";
import Worker from "../../game-views/icons/Worker";
import React from "react";
import Coins from "../../game-views/icons/Coins";
import { loseVP, payCoins, pushActivityLog, updatePlayer, withoutActivityLog } from "./sharedReducers";
import { currentTurn } from "../board/currentTurnReducer";
import { moneyDisabledReason } from "./sharedSelectors";
import VictoryPoints from "../../game-views/icons/VictoryPoints";

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
            !worker.isTemp && worker.type === "normal" ? currentIndex : previousValue,
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

export const placeWorker = (
    type: WorkerType,
    placement: WorkerPlacement,
    placementIdx: number | null,
    state: GameState,
    source: "Planner" | "Administrator" | "Messenger" | null = null
): [GameState, number] => {
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
    return [
        {
            ...updatePlayer(state, player.id, {
                workers: player.workers.map(
                    (w, i) => i === workerIndex ? { ...w, available: false } : w
                ),
            }),
            workerPlacements: {
                ...state.workerPlacements,
                [placement]: placements,
            },
        },
        placementIdx
    ];
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