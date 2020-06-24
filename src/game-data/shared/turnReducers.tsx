import * as React from "react";
import GameState, { WorkerPlacementTurnPendingAction, WorkerPlacementTurn, FieldId, Field, WakeUpPosition } from "../GameState";
import { ageAll, ageCellar } from "./grapeWineReducers";
import { pushActivityLog } from "./sharedReducers";
import { promptForAction } from "../prompts/promptReducers";
import { addToDiscard } from "./cardReducers";
import { SummerVisitor, WinterVisitor, Vine, Order } from "../../game-views/icons/Card";
import Coins from "../../game-views/icons/Coins";
import VictoryPoints from "../../game-views/icons/VictoryPoints";
import Worker from "../../game-views/icons/Worker";

export const setPendingAction = <T extends WorkerPlacementTurnPendingAction>(
    pendingAction: T,
    state: GameState
): GameState => {
    return {
        ...state,
        currentTurn: {
            ...(state.currentTurn as WorkerPlacementTurn),
            pendingAction,
        },
    };
};

export const passToNextSeason = (
    state: GameState,
    playerId = state.currentTurn.playerId
): GameState => {
    const wakeUpOrder = state.wakeUpOrder.map((pos) => {
        if (!pos || pos.playerId !== playerId) {
            return pos;
        }
        return { ...pos, passed: true };
    }) as GameState["wakeUpOrder"];

    return endWorkerPlacementTurn(
        pushActivityLog({ type: "pass", playerId }, { ...state, wakeUpOrder })
    );
};

const startWorkerPlacementTurn = (
    season: "summer" | "winter",
    playerId: string,
    state: GameState
) => {
    state = {
        ...state,
        currentTurn: { type: "workerPlacement", playerId, pendingAction: null, season },
    };
    const player = state.players[playerId];
    if (player.workers.every(w => !w.available)) {
        // player is out of workers, auto-pass them
        return passToNextSeason(state, player.id);
    }
    return state;
};

const endWorkerPlacementTurn = (state: GameState): GameState => {
    const { currentTurn, wakeUpOrder } = state;
    const season = (state.currentTurn as WorkerPlacementTurn).season;
    const compactWakeUpOrder = wakeUpOrder.filter((pos) => pos !== null) as WakeUpPosition[];
    const activeWakeUpOrder = compactWakeUpOrder.filter((pos) => !pos.passed);

    if (compactWakeUpOrder.every((p) => p.passed)) {
        // If everyone passed, it's the end of the season
        if (season === "summer") {
            return pushActivityLog({ type: "season", season: "Fall" }, promptToDrawFallVisitor({
                ...state,
                // preserve wake-up order; just reset "passed" state
                wakeUpOrder: wakeUpOrder.map((pos) => {
                    return pos === null ? null : { ...pos, passed: false };
                }) as GameState["wakeUpOrder"],
                currentTurn: {
                    type: "fallVisitor",
                    playerId: compactWakeUpOrder[0].playerId,
                },
            }));
        } else {
            // End of year
            // TODO discard too many cards
            const tableOrder = state.tableOrder;
            const grapeIndex = (tableOrder.length + state.grapeIndex - 1) % tableOrder.length;
            return pushActivityLog({ type: "season", season: "Spring" }, promptForWakeUpOrder({
                ...state,
                grapeIndex,
                currentTurn: { type: "wakeUpOrder", playerId: tableOrder[grapeIndex] },
                wakeUpOrder: wakeUpOrder.map((pos) => null) as GameState["wakeUpOrder"],
                workerPlacements: (Object.fromEntries(
                    Object.entries(state.workerPlacements).map(([placement]) => [placement, []])
                ) as unknown) as GameState["workerPlacements"],
                players: Object.fromEntries(
                    Object.entries(state.players).map(([playerId, playerState]) => {
                        const newFieldsState: Record<FieldId, Field> = { ...playerState.fields };
                        (Object.keys(newFieldsState) as FieldId[]).forEach((fieldId) => {
                            newFieldsState[fieldId].harvested = false;
                        });
                        return [
                            playerId,
                            {
                                ...playerState,
                                coins: playerState.coins + playerState.residuals,
                                tempWorker: undefined,
                                workers: playerState.workers
                                    .filter(w => !w.isTemp)
                                    .map(w => ({ ...w, available: true })),
                                crushPad: {
                                    red: ageAll(playerState.crushPad.red),
                                    white: ageAll(playerState.crushPad.white),
                                },
                                cellar: ageCellar(playerState.cellar, playerState.structures),
                                fields: newFieldsState
                            },
                        ];
                    })
                ),
            }));
        }
    }
    const i = activeWakeUpOrder.findIndex((pos) => pos.playerId === currentTurn.playerId);
    const nextPlayerId = activeWakeUpOrder[(i + 1) % activeWakeUpOrder.length].playerId;

    return startWorkerPlacementTurn(season, nextPlayerId, state);
};

export const endTurn = (state: GameState): GameState => {
    const { currentTurn, wakeUpOrder } = state;
    const compactWakeUpOrder = wakeUpOrder.filter((pos) => pos !== null) as WakeUpPosition[];

    switch (currentTurn.type) {
        case "papaSetUp":
            return state;

        case "wakeUpOrder":
            return state;

        case "workerPlacement":
            return endWorkerPlacementTurn(movePendingCardToDiscard(state));

        case "fallVisitor":
            const i = compactWakeUpOrder.findIndex((pos) => pos.playerId === currentTurn.playerId);
            if (i === compactWakeUpOrder.length - 1) {
                // end of season
                return startWorkerPlacementTurn(
                    "winter",
                    compactWakeUpOrder[0].playerId,
                    pushActivityLog({ type: "season", season: "Winter" }, state)
                );
            } else {
                const nextPlayerId =
                    compactWakeUpOrder[(i + 1) % compactWakeUpOrder.length].playerId;
                return promptToDrawFallVisitor({
                    ...state,
                    currentTurn: {
                        ...state.currentTurn,
                        playerId: nextPlayerId,
                    },
                });
            }
    }
};

const movePendingCardToDiscard = (state: GameState): GameState => {
    const { currentTurn } = state;
    if (currentTurn.type !== "workerPlacement" || currentTurn.pendingAction === null) {
        return state;
    }
    switch (currentTurn.pendingAction.type) {
        case "playVisitor":
            const visitorId = currentTurn.pendingAction.visitorId!;
            return addToDiscard([{ type: "visitor", id: visitorId }], state);
        case "plantVine":
            const vineId = currentTurn.pendingAction.vineId!;
            return addToDiscard([{ type: "vine", id: vineId }], state);
        case "fillOrder":
            const orderId = currentTurn.pendingAction.orderId!;
            return addToDiscard([{ type: "order", id: orderId }], state);
        default:
            return state;
    }
};

export const chooseWakeUpIndex = (orderIndex: number, state: GameState) => {
    const { grapeIndex, tableOrder } = state;
    const playerId = state.currentTurn.playerId;
    const wakeUpOrder = state.wakeUpOrder.map((pos, i) =>
        i === orderIndex ? { playerId } : pos
    ) as GameState["wakeUpOrder"];

    state = { ...state, wakeUpOrder };

    if (state.currentTurn.type !== "wakeUpOrder") {
        // eg. organizer visitor
        return state;
    }
    const nextWakeUpIndex = (tableOrder.indexOf(playerId) + 1) % tableOrder.length;
    if (nextWakeUpIndex === grapeIndex) {
        const firstPlayerId = wakeUpOrder.filter((pos) => pos)[0]!.playerId;
        return startWorkerPlacementTurn(
            "summer",
            firstPlayerId,
            pushActivityLog({ type: "season", season: "Summer" }, state)
        );
    }
    return promptForWakeUpOrder({
        ...state,
        currentTurn: {
            type: "wakeUpOrder",
            playerId: tableOrder[nextWakeUpIndex],
        },
    });
};

export const promptForWakeUpOrder = (state: GameState) => {
    return promptForAction(state, {
        title: "Choose wake-up order",
        choices: [
            { id: "WAKE_UP_1", label: <>1: No bonus</> },
            { id: "WAKE_UP_2", label: <>2: Draw <Vine /></>, },
            { id: "WAKE_UP_3", label: <>3: Draw <Order /></>, },
            { id: "WAKE_UP_4", label: <>4: Gain <Coins>1</Coins></>, },
            { id: "WAKE_UP_5", label: <>5: Draw <SummerVisitor /> or <WinterVisitor /></>, },
            { id: "WAKE_UP_6", label: <>6: Gain <VictoryPoints>1</VictoryPoints></>, },
            { id: "WAKE_UP_7", label: <>7: <Worker /> this year</>, },
        ].map((choice, i) =>
            state.wakeUpOrder[i]
                ? { ...choice, disabledReason: `Taken by ${state.wakeUpOrder[i]!.playerId}` }
                : choice
        ),
    });
};

export const promptToDrawWakeUpVisitor = (state: GameState) => {
    return promptForAction(state, {
        choices: [
            { id: "WAKE_UP_DRAW_SUMMER", label: <>Draw 1 <SummerVisitor /></>, },
            { id: "WAKE_UP_DRAW_WINTER", label: <>Draw 1 <WinterVisitor /></>, },
        ],
    });
};

const promptToDrawFallVisitor = (state: GameState) => {
    return promptForAction(state, {
        choices: [
            { id: "FALL_DRAW_SUMMER", label: <>Draw 1 <SummerVisitor /></>, },
            { id: "FALL_DRAW_WINTER", label: <>Draw 1 <WinterVisitor /></>, },
        ],
    });
};
