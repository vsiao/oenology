import * as React from "react";
import GameState, { WorkerPlacementTurnPendingAction, WorkerPlacementTurn, WakeUpPosition, PlayVisitorPendingAction } from "../GameState";
import { ageAll, ageCellar } from "./grapeWineReducers";
import { pushActivityLog, updatePlayer, gainVP, gainCoins } from "./sharedReducers";
import { promptForAction, promptToChooseVisitor, promptToPlaceWorker, promptToChooseCard } from "../prompts/promptReducers";
import { addToDiscard, drawCards } from "./cardReducers";
import { SummerVisitor, WinterVisitor, Vine, Order } from "../../game-views/icons/Card";
import Coins from "../../game-views/icons/Coins";
import VictoryPoints from "../../game-views/icons/VictoryPoints";
import Worker from "../../game-views/icons/Worker";
import { needCardOfTypeDisabledReason } from "./sharedSelectors";

export const endTurn = (state: GameState): GameState => {
    switch (state.currentTurn.type) {
        case "papaSetUp":
            return state;

        case "wakeUpOrder":
            return endWakeUpTurn(state);

        case "workerPlacement":
            return endWorkerPlacementTurn(state);

        case "fallVisitor":
            return endFallVisitorTurn(state);

        case "endOfYearDiscard":
            return endEOYDiscardTurn(state);
    }
};

//
// Wake-up turns
// ----------------------------------------------------------------------------

export const chooseWakeUp = ({ idx, visitor }: WakeUpChoiceData, state: GameState): GameState => {
    const playerId = state.currentTurn.playerId;
    state = {
        ...state,
        wakeUpOrder: state.wakeUpOrder.map((pos, i) =>
            i === idx ? { playerId } : pos
        ) as GameState["wakeUpOrder"],
    };
    switch (idx) {
        case 0:
            return state;
        case 1:
            return drawCards(state, { vine: 1 });
        case 2:
            return drawCards(state, { order: 1 });
        case 3:
            return gainCoins(1, state);
        case 4:
            return drawCards(
                state,
                visitor === "summer" ? { summerVisitor: 1 } : { winterVisitor: 1 }
            );
        case 5:
            return gainVP(1, state);
        case 6:
            const player = state.players[playerId];
            return updatePlayer(state, player.id, {
                workers: [
                    ...player.workers,
                    { type: "normal", available: true, isTemp: true }
                ],
            });
        default:
            throw new Error(`Unexpected wake-up index ${idx}`);
    }
};

export const endWakeUpTurn = (state: GameState): GameState => {
    const { grapeIndex, tableOrder, wakeUpOrder } = state;
    const nextWakeUpIndex = (tableOrder.indexOf(state.currentTurn.playerId) + 1) % tableOrder.length;

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

export interface WakeUpChoiceData {
    idx: number;
    visitor?: "summer" | "winter";
}
export const promptForWakeUpOrder = (state: GameState) => {
    return promptForAction<WakeUpChoiceData>(state, {
        title: "Choose wake-up order",
        choices: [
            { id: "WAKE_UP", data: { idx: 0 }, label: <>1: No bonus</> },
            { id: "WAKE_UP", data: { idx: 1 }, label: <>2: Draw <Vine /></>, },
            { id: "WAKE_UP", data: { idx: 2 }, label: <>3: Draw <Order /></>, },
            { id: "WAKE_UP", data: { idx: 3 }, label: <>4: Gain <Coins>1</Coins></>, },
            {
                id: "WAKE_UP",
                data: { idx: 4, visitor: "summer" as const },
                label: <>5: Draw <SummerVisitor /></>,
            },
            {
                id: "WAKE_UP",
                data: { idx: 4, visitor: "winter" as const },
                label: <>5: Draw <WinterVisitor /></>,
            },
            { id: "WAKE_UP", data: { idx: 5 }, label: <>6: Gain <VictoryPoints>1</VictoryPoints></>, },
            { id: "WAKE_UP", data: { idx: 6 }, label: <>7: <Worker /> this year</>, },
        ].map(choice =>
            state.wakeUpOrder[choice.data.idx]
                ? { ...choice, disabledReason: `Taken by ${state.wakeUpOrder[choice.data.idx]!.playerId}` }
                : choice
        ),
    });
};

//
// Worker placement turns
// ----------------------------------------------------------------------------

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
    return promptToPlaceWorker(state);
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

const endWorkerPlacementTurn = (state: GameState): GameState => {
    const { currentTurn, wakeUpOrder } = state;
    const season = (currentTurn as WorkerPlacementTurn).season;
    const compactWakeUpOrder = wakeUpOrder.filter((pos) => pos !== null) as WakeUpPosition[];

    if (compactWakeUpOrder.every((p) => p.passed)) {
        // If everyone passed, it's the end of the season
        if (season === "summer") {
            return pushActivityLog(
                { type: "season", season: "Fall" },
                startFallVisitorTurn(compactWakeUpOrder[0].playerId, {
                    ...state,
                    // preserve wake-up order; just reset "passed" state
                    wakeUpOrder: wakeUpOrder.map((pos) => {
                        return pos === null ? null : { ...pos, passed: false };
                    }) as GameState["wakeUpOrder"],
                })
            );
        } else {
            // End of year
            return startEOYDiscardTurn(compactWakeUpOrder[0].playerId, {
                ...state,
                workerPlacements: (Object.fromEntries(
                    Object.entries(state.workerPlacements).map(([placement]) => [placement, []])
                ) as unknown) as GameState["workerPlacements"],
                players: Object.fromEntries(
                    Object.entries(state.players).map(([playerId, playerState]) => {
                        return [
                            playerId,
                            {
                                ...playerState,
                                // Collect residual payments
                                coins: playerState.coins + playerState.residuals,
                                // Retrieve workers
                                tempWorker: undefined,
                                workers: playerState.workers
                                    .filter(w => !w.isTemp)
                                    .map(w => ({ ...w, available: true })),
                                // Age grape and wine tokens
                                crushPad: {
                                    red: ageAll(playerState.crushPad.red),
                                    white: ageAll(playerState.crushPad.white),
                                },
                                cellar: ageCellar(playerState.cellar, playerState.structures),
                                // Reset field harvested state
                                fields: {
                                    field5: { ...playerState.fields.field5, harvested: false },
                                    field6: { ...playerState.fields.field6, harvested: false },
                                    field7: { ...playerState.fields.field7, harvested: false },
                                },
                            },
                        ];
                    })
                ),
            });
        }
    }
    const activeWakeUpOrder = compactWakeUpOrder
        .filter((pos) => pos.playerId === currentTurn.playerId || !pos.passed);
    const i = activeWakeUpOrder.findIndex((pos) => pos.playerId === currentTurn.playerId);
    const nextPlayerId = activeWakeUpOrder[(i + 1) % activeWakeUpOrder.length].playerId;

    return startWorkerPlacementTurn(season, nextPlayerId, state);
};

/**
 * Called when a visitor's action is finished resolving. Ending a visitor
 * is not necessarily the end of a turn because we may be playing multiple
 * visitors back-to-back.
 */
export const endVisitor = (state: GameState): GameState => {
    const currentTurn = state.currentTurn as WorkerPlacementTurn;
    const pendingAction = currentTurn.pendingAction as PlayVisitorPendingAction;

    state = addToDiscard([{ type: "visitor", id: pendingAction.visitorId! }], state);

    const hasCard = needCardOfTypeDisabledReason(
        state,
        currentTurn.season === "summer" ? "summerVisitor" : "winterVisitor"
    ) === undefined;
    if (pendingAction.canPlayAdditionalVisitor && hasCard) {
        return promptToChooseVisitor(
            currentTurn.season,
            setPendingAction({ type: "playVisitor", canPlayAdditionalVisitor: false }, state),
            /* bonus */ true
        );
    }
    return endTurn(state);
};

//
// Fall visitor turns
// ----------------------------------------------------------------------------

const startFallVisitorTurn = (playerId: string, state: GameState): GameState => {
    const canDrawTwo = state.players[playerId].structures.cottage;
    return promptForAction({
        ...state,
        currentTurn: { type: "fallVisitor", playerId, },
    }, {
        choices: canDrawTwo
            ? [
                { id: "FALL_DRAW_SUMMER_2", label: <>Draw 2 <SummerVisitor /></>, },
                { id: "FALL_DRAW_WINTER_2", label: <>Draw 2 <WinterVisitor /></>, },
                { id: "FALL_DRAW_BOTH", label: <>Draw 1 <SummerVisitor /> and 1 <WinterVisitor /></>, },
            ]
            : [
                { id: "FALL_DRAW_SUMMER", label: <>Draw 1 <SummerVisitor /></>, },
                { id: "FALL_DRAW_WINTER", label: <>Draw 1 <WinterVisitor /></>, },
            ],
    });
};

const endFallVisitorTurn = (state: GameState): GameState => {
    const { currentTurn, wakeUpOrder } = state;
    const compactWakeUpOrder = wakeUpOrder.filter((pos) => pos !== null) as WakeUpPosition[];
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
        return startFallVisitorTurn(nextPlayerId, state);
    }
};

//
// End-of-year discard turns
// ----------------------------------------------------------------------------

const END_OF_YEAR_HAND_LIMIT = 7;
const startEOYDiscardTurn = (playerId: string, state: GameState): GameState => {
    state = {
        ...state,
        currentTurn: { type: "endOfYearDiscard", playerId },
    };
    const cards = state.players[playerId].cardsInHand;
    if (cards.length <= END_OF_YEAR_HAND_LIMIT) {
        return endEOYDiscardTurn(state);
    }
    return promptToChooseCard(state, {
        title: "Discard down to 7 cards",
        cards: cards.map(id => ({ id })),
        numCards: cards.length - END_OF_YEAR_HAND_LIMIT,
    })
};

const endEOYDiscardTurn = (state: GameState): GameState => {
    const { currentTurn, wakeUpOrder } = state;
    const compactWakeUpOrder = wakeUpOrder.filter((pos) => pos !== null) as WakeUpPosition[];
    const i = compactWakeUpOrder.findIndex((pos) => pos.playerId === currentTurn.playerId);

    if (i === compactWakeUpOrder.length - 1) {
        // Begin a new year
        const tableOrder = state.tableOrder;
        const grapeIndex = (tableOrder.length + state.grapeIndex - 1) % tableOrder.length;
        return pushActivityLog(
            { type: "season", season: "Spring" },
            promptForWakeUpOrder({
                ...state,
                grapeIndex,
                currentTurn: { type: "wakeUpOrder", playerId: tableOrder[grapeIndex] },
                wakeUpOrder: wakeUpOrder.map((pos) => null) as GameState["wakeUpOrder"],
            })
        );
    } else {
        const nextPlayerId =
            compactWakeUpOrder[(i + 1) % compactWakeUpOrder.length].playerId;
        return startEOYDiscardTurn(nextPlayerId, state);
    }
}

