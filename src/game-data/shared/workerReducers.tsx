import GameState, {
    WorkerPlacement,
    WorkerType,
    WorkerPlacementTurn,
    PlayerWorker,
    PlacedWorker,
    StructureState,
    BoardPlacement,
    PlaceWorkerPendingAction,
} from "../GameState";
import { setPendingAction } from "./turnReducers";
import { promptForAction } from "../prompts/promptReducers";
import Worker from "../../game-views/icons/Worker";
import React from "react";
import Coins from "../../game-views/icons/Coins";
import { gainCoins, gainVP, loseVP, payCoins, pushActivityLog, updatePlayer, withoutActivityLog } from "./sharedReducers";
import { currentTurn } from "../board/currentTurnReducer";
import { moneyDisabledReason, numActionSpaces } from "./sharedSelectors";
import VictoryPoints from "../../game-views/icons/VictoryPoints";
import { boardActions, boardActionsBySeason, isBoardAction, seasonByBoardAction } from "../board/boardPlacements";
import { Choice } from "../prompts/PromptState";
import { visitorCards } from "../visitors/visitorCards";
import Card from "../../game-views/icons/Card";
import { ChooseAction } from "../prompts/promptActions";
import Alea from "alea";
import { PublishedGameAction } from "../gameActions";
import { addCardsToHand, removeCardsFromHand } from "./cardReducers";

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
        playerId = state.currentTurn.playerId,
    }: {
        availableThisYear?: boolean;
        playerId?: string;
    } = {}
): GameState => {
    state = setPendingAction({
        type: "trainWorker",
        cost: [cost, costType],
        actionPlayerId: playerId,
        availableThisYear,
        fromAction: (state.currentTurn as WorkerPlacementTurn).pendingAction ?? null,
        hasBonus: false,
    }, state);

    const player = state.players[playerId];
    const specialWorkers = state.specialWorkers;
    if (specialWorkers && canTrainSpecialWorker(state, playerId)) {
        // Prompt to train a special worker
        return promptForAction<WorkerType>(state, {
            playerId,
            choices: [
                {
                    id: "TRAIN_WORKER",
                    data: "normal",
                    label: <>Train <Worker /> {costType === "coins" ? <Coins>{cost}</Coins> : <VictoryPoints>{cost}</VictoryPoints>}</>,
                },
                ...(["special1", "special2"] as const).map(type => ({
                    id: "TRAIN_WORKER",
                    data: type,
                    label: <>Train <Worker type={type} /> <strong>{specialWorkers[type]}</strong> {
                        costType === "coins"
                            ? <Coins>{cost + 1}</Coins>
                            : <><VictoryPoints>{cost}</VictoryPoints> <Coins>1</Coins></>
                    }</>,
                    disabledReason: player.workers.every(w => w.type !== type)
                        ? moneyDisabledReason(state, cost + 1, playerId)
                        : "You already have a special worker of this type."
                }))
            ]
        });
    }
    // Train a normal worker
    state = gainWorker(state, [cost, costType], {
        workerType: "normal",
        playerId,
        availableThisYear,
    });
    return currentTurn(state, { type: "WORKER_TRAINED", playerId });
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

const hasOpponentSoldato = (state: GameState, placement: BoardPlacement, playerId: string): boolean => {
    return opponentsWithSoldato(state, placement).length > 0;
};

const opponentsWithSoldato = (state: GameState, placement: BoardPlacement): string[] => {
    const boardPlacements = state.workerPlacements[placement];
    return state.tableOrder.filter(opponentId =>
        opponentId !== state.currentTurn.playerId &&
        boardPlacements.some(w => w &&
            state.specialWorkers?.[w.type] === "Soldato" &&
            w.playerId === opponentId
        )
    );
}

export const openSpaceOrDisabledReason = (
    state: GameState,
    workerType: WorkerType,
    placement: WorkerPlacement,
    requestedSpace: number | null,
): number | string => {
    if (placement === "gainCoin") {
        const boardPlacements = [...state.workerPlacements.gainCoin, null];
        return boardPlacements.findIndex(p => p === null);
    } else if (isBoardAction(placement)) {
        const allSeasons = ["spring", "summer", "fall", "winter"] as const;
        const placementSeason = seasonByBoardAction(state, placement);
        const isPastSeason = allSeasons.indexOf(placementSeason) < allSeasons.indexOf(state.season);
        // Placement is in a future season; don't check action restrictions
        const isUnrestrictedAction = allSeasons.indexOf(placementSeason) > allSeasons.indexOf(state.season);

        const isUnrestrictedByPlayerCount = state.specialWorkers?.[workerType] === "Traveler" && isPastSeason;
        const numAvailableSpaces = isUnrestrictedByPlayerCount ? 3 : numActionSpaces(state);

        const placements = state.workerPlacements[placement];
        const boardPlacements = [
            // Action spaces on the board
            ...new Array(3).fill(null).map((_, i) => placements[i] ?? null),
            // Any grande workers that overflow
            ...placements.slice(3),
            // ...and one more open slot for good measure
            null
        ];
        const isPlaceable = (w: PlacedWorker | null, i: number) =>
            // Space must be available for current player count
            (i < numAvailableSpaces || i >= 3) &&
            // Action must be not be restricted (or skipped due to future placement)
            (isUnrestrictedAction
                || !boardActions[placement].spaceAt(i, state).disabledReason) &&
            // Space must be empty or bumpable by the Chef
            (w === null ||
                (w.playerId !== state.currentTurn.playerId &&
                    state.specialWorkers?.[workerType] === "Chef" &&
                    state.specialWorkers?.[w.type] !== "Chef"));

        let space = requestedSpace;
        if (space === null || !isPlaceable(boardPlacements[space], space)) {
            space = boardPlacements.findIndex(isPlaceable);
        }
        if (space === -1) {
            // No space implies the action itself is not possible; return the reason
            return boardActions[placement].spaceAt(-1, state).disabledReason!;
        }
        const canOverflow = workerType === "grande" ||
            state.specialWorkers?.[workerType] === "Mama Grande" ||
            hasOpponentSoldato(state, placement, state.currentTurn.playerId);
        if (space >= 3 && !canOverflow) {
            return "All spaces are occupied. Try using a grande worker.";
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

export const beginPlaceWorker = (
    type: WorkerType,
    placement: WorkerPlacement,
    requestedSpace: number | null,
    state: GameState,
    key: string
): GameState => {
    const playerId = state.currentTurn.playerId;
    const player = state.players[playerId];
    const worker = availableWorkerOfType(state, type);
    state = updatePlayer(state, playerId, {
        workers: player.workers.map(
            (w, i) => w === worker ? { ...w, available: false } : w
        ),
    })
    state = pushActivityLog({ type: "placeWorker", playerId }, state);
    const space = openSpaceOrDisabledReason(state, type, placement, requestedSpace);
    if (typeof space === "string") {
        throw new Error(`Cannot place worker: ${space}`);
    }
    state = setPendingAction(
        {
            type: "placeWorker",
            fromAction: (state.currentTurn as WorkerPlacementTurn).pendingAction ?? null,
            workerType: type,
            placement,
            space,
        },
        state
    );
    const workerName = state.specialWorkers?.[type];
    const allSeasons = ["spring", "summer", "fall", "winter"] as const;
    const isFutureMessengerPlacement =
        isBoardAction(placement) &&
            placement !== "gainCoin" &&
            workerName === "Messenger" &&
            allSeasons.indexOf(state.season) < allSeasons.indexOf(seasonByBoardAction(state, placement))
    const placedWorker: PlacedWorker = {
        type,
        id: worker.id,
        playerId,
        color: player.color,
        isTemp: !!worker.isTemp,
        source: isFutureMessengerPlacement ? "Messenger" : null,
    };
    if (isBoardAction(placement)) {
        const placements = state.workerPlacements[placement].slice();
        placements[space] = placedWorker;
        state = {
            ...state,
            workerPlacements: {
                ...state.workerPlacements,
                [placement]: placements,
            },
        };
        // Perform special worker placement abilities
        switch (workerName) {
            case "Chef":
                // openSpaceOrDisabledReason already checks validity (i.e. not another Chef);
                // if `space` is occupied we can directly bump that worker out
                if (placements[space]) {
                    state = pushActivityLog({
                        type: "chefBump",
                        playerId,
                        placement,
                        bumpedWorker: placements[space],
                    }, state)
                    state = retrieveWorker(placement, space, state, placements[space].playerId);
                }
                break;

            case "Innkeeper":
                const bonus = boardActions[placement].spaceAt(space, state).bonus;
                const visitorsAtPlacement: Choice<string>[] = state.tableOrder.map(otherPlayerId =>
                    (["summer", "winter"] as const).filter(season =>
                        otherPlayerId !== playerId &&
                        placements.some(w => w?.playerId === otherPlayerId) &&
                            state.players[otherPlayerId].cardsInHand.some(c =>
                                c.type === "visitor" &&
                                visitorCards[c.id].season === season
                            )
                    ).map(season => ({
                        id: "INNKEEPER_TAKE",
                        data: `${otherPlayerId}_${season}`,
                        label: <>
                            <Card type={`${season}Visitor`} /> from
                            {" "}<strong>{state.players[otherPlayerId].name}</strong>
                        </>,
                        disabledReason: moneyDisabledReason(
                            state,
                            1 + (placement === "trainWorker"
                                ? (bonus === "gainCoin" ? 3 : 4)
                                : 0)
                        ),
                    }))
                ).flat();
                if (visitorsAtPlacement.length > 0) {
                    return promptForAction(state, {
                        title: "Innkeeper",
                        description: <p>You may pay an opponent <Coins>1</Coins> to take a visitor.</p>,
                        choices: visitorsAtPlacement.concat({
                            id: "INNKEEPER_PASS",
                            label: <>Pass</>
                        })
                    });
                }
                break;

            case "Mama Grande":
                if (placements.some(w => w?.playerId === playerId && w.type === "grande")) {
                    state = gainVP(1, state, { playerId, source: "bonus" });
                }
                break;

            case "Professore":
                const actionsThisSeason = boardActionsBySeason(state)[state.season];
                const regularWorkersThisSeason: Choice<string>[] = actionsThisSeason.map(({ type }) =>
                    state.workerPlacements[type]
                        .map((w, i) => w?.type === "normal" && w.playerId === playerId && {
                            id: "PROFESSORE_RETRIEVE",
                            data: `${type}_${i}`,
                            label: <>
                                <Worker {...w} />
                                &nbsp;{boardActions[type].spaceAt(i, state).label}
                            </>
                        })
                        .filter(p => !!p)
                ).flat();
                if (regularWorkersThisSeason.length > 0) {
                    return promptForAction(state, {
                        title: "Professore",
                        description: <p>You may retrieve a regular worker from this season.</p>,
                        choices: regularWorkersThisSeason.concat([{
                            id: "PROFESSORE_PASS",
                            label: <>Pass</>,
                        }]),
                    });
                }
        }
        const soldatoCost = opponentsWithSoldato(state, placement).length;
        if (soldatoCost > 0) {
            // Must pay 1 lire to each opponent with a Soldato on this action
            return promptForAction(state, {
                title: "Soldato",
                description: <p>You must pay <Coins>1</Coins> to each <strong>Soldato</strong>.</p>,
                choices: [
                    {
                        id: "SOLDATO_PAY",
                        label: <>Pay <Coins>{soldatoCost}</Coins></>,
                        disabledReason: moneyDisabledReason(state, soldatoCost, playerId),
                    }
                ],
            });
        }
    } else {
        // place worker on yoke
        state = updatePlayer(state, player.id, {
            structures: {
                ...player.structures,
                yoke: placedWorker
            }
        });
    }
    return currentTurn(state, {
        type: "WORKER_PLACED",
        workerType: pendingAction.workerType,
        placement: pendingAction.placement,
        idx: pendingAction.space,
        key,
    });
};

export const placeWorkerChoice = (
    state: GameState,
    action: ChooseAction & PublishedGameAction,
    pendingAction: PlaceWorkerPendingAction
): GameState => {
    switch (action.choice) {
        case "INNKEEPER_TAKE": {
            const playerId = state.currentTurn.playerId;
            const [otherPlayerId, season] = (action.data as string).split("_");
            const otherPlayer = state.players[otherPlayerId];
            const visitorCardsOfSeason = otherPlayer.cardsInHand.filter(c =>
                c.type === "visitor" && visitorCards[c.id].season === season
            );
            const random = Alea(action._key);
            const card = visitorCardsOfSeason[Math.floor(random() * visitorCardsOfSeason.length)];
            state = withoutActivityLog(() => payCoins(1, gainCoins(1, state, otherPlayerId)));
            state = removeCardsFromHand([card], state, otherPlayerId);
            state = addCardsToHand([card], state, playerId)
            state = pushActivityLog({
                type: "innkeeperTake",
                playerId,
                cardType: `${season as "winter" | "summer"}Visitor`,
                fromPlayerId: otherPlayerId,
            }, state);
            break;
        }
        case "INNKEEPER_PASS":
        case "PROFESSORE_PASS":
            break;

        case "PROFESSORE_RETRIEVE": {
            const [retrievePlacement, retrieveIdx] = (action.data as string).split("_");
            state = retrieveWorker(retrievePlacement as WorkerPlacement, parseInt(retrieveIdx, 10), state);
            break;
        }
        case "SOLDATO_PAY":
            const soldatoOpponents = opponentsWithSoldato(state, pendingAction.placement as BoardPlacement);
            for (const opponentId of soldatoOpponents) {
                state = payCoins(1, gainCoins(1, state, opponentId));
            }
            break;
    }
    return endPlaceWorker(state, action._key!);
};

export const retrieveWorker = (
    placement: WorkerPlacement,
    index: number,
    state: GameState,
    playerId = state.currentTurn.playerId
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
        const player = state.players[playerId]
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
    const player = state.players[playerId];
    const idx = player.workers.findIndex(
        w => ((type === "temp" && w.isTemp) || w.type === type) && w.id === id
    );
    return updatePlayer(state, player.id, {
        workers: player.workers.map((w, i) =>
            i === idx ? { ...w, available: true } : w
        ),
    })
};