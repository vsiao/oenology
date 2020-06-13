import * as React from "react";
import GameState, { CardType, WakeUpPosition, FieldId, TokenMap, StructureId } from "../GameState";
import { SummerVisitorId, WinterVisitorId } from "../visitors/visitorCards";
import { promptForAction } from "../prompts/promptReducers";
import { SummerVisitor, WinterVisitor } from "../../game-views/icons/Card";
import { fieldYields } from "./sharedSelectors";
import { WineIngredients } from "../prompts/promptActions";
import { structures } from "../structures";

export const discardWine = (state: GameState, playerId: string, wine: unknown) => {
    return state;
};

const devaluedIndex = (value: number, tokens: TokenMap) => {
    for (value--; value >= 0; --value) {
        if (!tokens[value]) {
            return value;
        }
    }
    return -1;
};

export const harvestField = (state: GameState, fieldId: FieldId): GameState => {
    const player = state.players[state.currentTurn.playerId];
    const yields = fieldYields(player.fields[fieldId]);
    return placeGrapes(state, yields);
};

export const placeGrapes = (
    state: GameState,
    values: { red: number; white: number; }
): GameState => {
    const player = state.players[state.currentTurn.playerId];

    // devalue grapes if crush pad already contains the same value
    const red = devaluedIndex(values.red, player.crushPad.red);
    const white = devaluedIndex(values.white, player.crushPad.white);
    return {
        ...state,
        players: {
            ...state.players,
            [player.id]: {
                ...player,
                crushPad: {
                    red: player.crushPad.red.map((r, i) => i === red || r) as TokenMap,
                    white: player.crushPad.white.map((w, i) => i === white || w) as TokenMap,
                },
            },
        },
    };
};

export const makeWineFromGrapes = (state: GameState, wine: WineIngredients[]): GameState => {
    const player = state.players[state.currentTurn.playerId];

    let { cellar, crushPad } = player;
    wine.forEach(({ type, grapes }) => {
        const value = grapes.reduce((v, g) => v + g.value, 0);
        const newWineIdx = devaluedIndex(value, cellar[type]);
        cellar = {
            ...cellar,
            [type]: cellar[type].map((w, i) => w || i === newWineIdx)
        };
        crushPad = {
            red: crushPad.red.map((r, i) =>
                r && grapes.every(({ color, value }) => color !== "red" || value !== i + 1)
            ) as TokenMap,
            white: crushPad.white.map((w, i) =>
                w && grapes.every(({ color, value }) => color !== "white" || value !== i + 1)
            ) as TokenMap,
        };
    });

    return {
        ...state,
        players: {
            ...state.players,
            [player.id]: {
                ...player,
                crushPad,
                cellar,
            },
        },
    };
};

export const buildStructure = (state: GameState, structureId: StructureId): GameState => {
    const player = state.players[state.currentTurn.playerId];
    const structure = structures[structureId];
    return {
        ...state,
        players: {
            ...state.players,
            [player.id]: {
                ...player,
                coins: player.coins - structure.cost,
                structures: {
                    ...player.structures,
                    [structureId]: true
                }
            },
        },
    };
};

const splitDeck = <T extends unknown>(deck: T[], n: number | undefined): [T[], T[]] => {
    return [n ? deck.slice(0, n) : [], n ? deck.slice(n) : deck];
};
export const drawCards = (
    state: GameState,
    numCards: { [K in CardType]?: number },
    playerId = state.currentTurn.playerId,
): GameState => {
    const drawPiles = state.drawPiles;
    const [drawnVines, vine] = splitDeck(drawPiles.vine, numCards.vine);
    const [drawnSummerVisitors, summerVisitor] = splitDeck(drawPiles.summerVisitor, numCards.summerVisitor);
    const [drawnOrders, order] = splitDeck(drawPiles.order, numCards.order);
    const [drawnWinterVisitors, winterVisitor] = splitDeck(drawPiles.winterVisitor, numCards.winterVisitor);

    return {
        ...state,
        drawPiles: { vine, summerVisitor, order, winterVisitor },
        players: {
            ...state.players,
            [playerId]: {
                ...state.players[playerId],
                cardsInHand: [
                    ...state.players[playerId].cardsInHand,
                    ...drawnVines.map(id => ({ type: "vine" as const, id })),
                    ...drawnSummerVisitors.map(id => ({ type: "summerVisitor" as const, id })),
                    ...drawnOrders.map(id => ({ type: "order" as const, id })),
                    ...drawnWinterVisitors.map(id => ({ type: "winterVisitor" as const, id })),
                ],
            }
        }
    };
};

export const endTurn = (state: GameState): GameState => {
    const { currentTurn, wakeUpOrder } = state;
    const compactWakeUpOrder = wakeUpOrder.filter(pos => pos !== null) as WakeUpPosition[];
    const activeWakeUpOrder = compactWakeUpOrder.filter(pos => !pos.passed);

    switch (currentTurn.type) {
        case "papaSetUp":
            return state;

        case "wakeUpOrder":
            return state;

        case "workerPlacement": {
            state = discardPendingCard(state);

            if (compactWakeUpOrder.every(p => p.passed)) {
                // If everyone passed, it's the end of the season
                if (currentTurn.season === "summer") {
                    return promptToDrawFallVisitor({
                        ...state,
                        // preserve wake-up order; just reset "passed" state
                        wakeUpOrder: wakeUpOrder.map(pos => {
                            return pos === null ? null : { ...pos, passed: false };
                        }) as GameState["wakeUpOrder"],
                        currentTurn: {
                            type: "fallVisitor",
                            playerId: compactWakeUpOrder[0].playerId,
                        }
                    });
                } else {
                    // TODO end of year stuff, and then reset wakeUpOrder
                    return {
                        ...state,
                        wakeUpOrder: wakeUpOrder.map(pos => {
                            return pos === null ? null : { ...pos, passed: false };
                        }) as GameState["wakeUpOrder"],
                        currentTurn: {
                            type: "workerPlacement",
                            playerId: compactWakeUpOrder[0].playerId,
                            season: "summer",
                            pendingAction: null,
                        },
                        players: Object.fromEntries(
                            Object.entries(state.players).map(([playerId, playerState]) => {
                                return [playerId, {
                                    ...playerState,
                                    // Mark all trained workers as available again
                                    trainedWorkers: playerState.trainedWorkers.map(w => ({
                                        ...w,
                                        available: true,
                                    })),
                                    crushPad: {
                                        red: age(playerState.crushPad.red),
                                        white: age(playerState.crushPad.white),
                                    },
                                    cellar: {
                                        red: age(playerState.cellar.red),
                                        white: age(playerState.cellar.white),
                                        blush: age(playerState.cellar.blush),
                                        sparkling: age(playerState.cellar.sparkling),
                                    },
                                }];
                            })
                        ),
                    };
                }
            }
            const i = activeWakeUpOrder.findIndex(pos => pos.playerId === currentTurn.playerId);
            const nextPlayerId = activeWakeUpOrder[(i + 1) % activeWakeUpOrder.length].playerId;

            return {
                ...state,
                currentTurn: {
                    type: "workerPlacement",
                    playerId: nextPlayerId,
                    pendingAction: null,
                    season: currentTurn.season,
                },
            };
        }

        case "fallVisitor":
            const i = compactWakeUpOrder.findIndex(pos => pos.playerId === currentTurn.playerId);
            if (i === compactWakeUpOrder.length - 1) {
                // end of season
                return {
                    ...state,
                    currentTurn: {
                        type: "workerPlacement",
                        playerId: compactWakeUpOrder[0].playerId,
                        season: "winter",
                        pendingAction: null,
                    },
                };
            } else {
                const nextPlayerId = compactWakeUpOrder[(i + 1) % compactWakeUpOrder.length].playerId;
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

const age = (tokens: TokenMap): TokenMap => {
    const newTokenMap = new Array(9).fill(false) as TokenMap;
    for (let i = tokens.length - 1; i >= 0; --i) {
        if (!tokens[i]) {
            continue;
        }
        if (i === tokens.length - 1 || newTokenMap[i + 1]) {
            // can't age
            newTokenMap[i] = true;
        } else {
            newTokenMap[i + 1] = true;
        }
    }
    return newTokenMap;
};

const discardPendingCard = (state: GameState): GameState => {
    const { currentTurn, players, discardPiles } = state;
    if (
        currentTurn.type !== "workerPlacement" ||
        currentTurn.pendingAction === null
    ) {
        return state;
    }
    const player = players[currentTurn.playerId];

    switch (currentTurn.pendingAction.type) {
        case "playVisitor":
            const visitorId = currentTurn.pendingAction.visitorId;
            return {
                ...state,
                // Filter out visitor card from current player's hand
                players: {
                    ...players,
                    [player.id]: {
                        ...player,
                        cardsInHand: player.cardsInHand.filter(({ id }) => id !== visitorId),
                    },
                },
                // And add it to the front of the appropriate discard pile
                discardPiles: {
                    ...discardPiles,
                    ...(currentTurn.season === "summer"
                        ? { summerVisitor: [visitorId as SummerVisitorId, ...discardPiles.summerVisitor] }
                        : { winterVisitor: [visitorId as WinterVisitorId, ...discardPiles.winterVisitor] })
                },
            };
        case "plantVine":
            const vineId = currentTurn.pendingAction.vineId!;
            return {
                ...state,
                players: {
                    ...players,
                    [player.id]: {
                        ...player,
                        cardsInHand: player.cardsInHand.filter(({ id }) => id !== vineId),
                    },
                },
                discardPiles: {
                    ...discardPiles,
                    vine: [vineId, ...discardPiles.vine],
                },
            };
        default:
            return state;
    }
};

const promptToDrawFallVisitor = (state: GameState) => {
    return promptForAction(state, [
        { id: "FALL_DRAW_SUMMER", label: <>Draw 1 <SummerVisitor /></> },
        { id: "FALL_DRAW_WINTER", label: <>Draw 1 <WinterVisitor /></> },
    ]);
};

const editVP = (numVP: number, state: GameState, playerId = state.currentTurn.playerId) => {
    const playerState = state.players[playerId];
    return {
        ...state,
        players: {
            ...state.players,
            [playerId]: {
                ...playerState,
                victoryPoints: playerState.victoryPoints + numVP,
            },
        },
    };
};
export const gainVP = editVP;
export const loseVP = (numVP: number, state: GameState, playerId = state.currentTurn.playerId) =>
    editVP(-numVP, state, playerId);

const editCoins = (numCoins: number, state: GameState, playerId = state.currentTurn.playerId) => {
    const playerState = state.players[playerId];
    return {
        ...state,
        players: {
            ...state.players,
            [playerId]: {
                ...playerState,
                coins: playerState.coins + numCoins,
            },
        },
    };
};
export const gainCoins = editCoins;
export const payCoins = (numCoins: number, state: GameState, playerId = state.currentTurn.playerId) =>
    editCoins(-numCoins, state, playerId);

export const trainWorker = (state: GameState, playerId = state.currentTurn.playerId): GameState => {
    return {
        ...state,
        players: {
            ...state.players,
            [playerId]: {
                ...state.players[playerId],
                trainedWorkers: [
                    ...state.players[playerId].trainedWorkers,
                    { type: "normal", available: false },
                ],
            },
        },
    };
};
