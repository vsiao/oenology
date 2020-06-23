import Coins from "../../game-views/icons/Coins";
import * as React from "react";
import GameState, { PlayVisitorPendingAction } from "../GameState";
import { promptForAction, promptToChooseField, promptToBuildStructure, promptToChooseVineCard, promptToMakeWine } from "../prompts/promptReducers";
import { GameAction } from "../gameActions";
import { SummerVisitorId } from "./visitorCards";
import {
    buildStructure,
    drawCards,
    endTurn,
    gainCoins,
    gainVP,
    harvestField,
    loseVP,
    payCoins,
    placeGrapes,
    promptForWakeUpOrder,
    setPendingAction,
    passToNextSeason,
    removeCardsFromHand,
    plantVineInField,
    makeWineFromGrapes
} from "../shared/sharedReducers";
import { harvestFieldDisabledReason, moneyDisabledReason, needGrapesDisabledReason } from "../shared/sharedSelectors";
import { Vine, Order, WinterVisitor, SummerVisitor } from "../../game-views/icons/Card";
import Grape from "../../game-views/icons/Grape";
import { default as VP } from "../../game-views/icons/VictoryPoints";
import { maxStructureCost, structures } from "../structures";
import { VineId, vineCards } from "../vineCards";
import WineGlass from "../../game-views/icons/WineGlass";

export const summerVisitorReducers: Record<
    SummerVisitorId,
    (state: GameState, action: GameAction, pendingAction: PlayVisitorPendingAction) => GameState
> = {
    agriculturist: (state, action, pendingAction) => {
        const agriculturistAction = pendingAction as PlayVisitorPendingAction & { vineId: VineId };

        switch (action.type) {
            case "CHOOSE_CARD":
                switch (action.card.type) {
                    case "visitor":
                        return promptToChooseVineCard(state);
                    case "vine":
                        return promptToChooseField(
                            setPendingAction(
                                { ...agriculturistAction, vineId: action.card.id },
                                removeCardsFromHand([action.card], state)
                            )
                        );
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                state = plantVineInField(agriculturistAction.vineId, action.fieldId, state);
                const vinesById: { [vineId in VineId]?: boolean } = {};
                state.players[state.currentTurn.playerId].fields[action.fieldId].vines.forEach(
                    v => vinesById[v] = true
                );
                return endTurn(Object.keys(vinesById).length >= 3 ? gainVP(2, state) : state);
            default:
                return state;
        }
    },
    banker: (state, action, pendingAction) => {
        const bankerAction = pendingAction as PlayVisitorPendingAction & {
            // list of players who have yet to decide whether to lose VP / gain coins
            mainActions: string[];
        };
        const maybeEndTurn = (state2: GameState, playerId: string) => {
            const mainActions = bankerAction.mainActions.filter(id => id !== playerId);
            state2 = setPendingAction({ ...bankerAction, mainActions }, state2);
            return mainActions.length === 0 ? endTurn(state2) : state2;
        };
        switch (action.type) {
            case "CHOOSE_CARD":
                const currentTurnPlayerId = state.currentTurn.playerId
                state = setPendingAction({
                    ...bankerAction,
                    mainActions: Object.keys(state.players).filter(id => id !== currentTurnPlayerId),
                }, gainCoins(5, state));
                return currentTurnPlayerId === state.playerId
                    ? state
                    : promptForAction(state, {
                        playerId: state.playerId!,
                        choices: [
                            { id: "BANKER_GAIN", label: <>Lose <VP>1</VP> to gain <Coins>3</Coins>.</> },
                            { id: "BANKER_PASS", label: <>Pass</> },
                        ],
                    });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "BANKER_GAIN":
                        return maybeEndTurn(
                            gainCoins(3, loseVP(1, state, action.playerId), action.playerId),
                            action.playerId
                        );
                    case "BANKER_PASS":
                        return maybeEndTurn(state, action.playerId);
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    broker: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
                return promptForAction(state, {
                    choices: [
                        { id: "BROKER_GAIN", label: <>Pay <Coins>9</Coins> to gain <VP>3</VP></>, },
                        { id: "BROKER_LOSE", label: <>Lose <VP>2</VP> to gain <Coins>6</Coins></>, },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "BROKER_GAIN":
                        return endTurn(gainVP(3, payCoins(9, state)));
                    case "BROKER_LOSE":
                        return endTurn(gainCoins(6, loseVP(2, state)));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    buyer: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "BUYER_PLACE",
                            label: <>Pay <Coins>2</Coins> to place a <Grape>1</Grape> on your crush pad</>,
                            disabledReason: moneyDisabledReason(state, 2),
                        },
                        {
                            id: "BUYER_DISCARD",
                            label: <>Discard 1 <Grape /> to gain <Coins>2</Coins> and <VP>1</VP></>,
                            disabledReason: needGrapesDisabledReason(state),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "BUYER_PLACE":
                        return endTurn(payCoins(2, placeGrapes(state, { red: 1, white: 1 })));
                    case "BUYER_DISCARD":
                        return endTurn(state); // TODO
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    // contractor: s => endTurn(s),
    cultivator: (state, action, pendingAction) => {
        const cultivatorAction = pendingAction as PlayVisitorPendingAction & { vineId: VineId };

        switch (action.type) {
            case "CHOOSE_CARD":
                switch (action.card.type) {
                    case "visitor":
                        return promptToChooseVineCard(state);
                    case "vine":
                        return promptToChooseField(
                            setPendingAction(
                                { ...cultivatorAction, vineId: action.card.id },
                                removeCardsFromHand([action.card], state)
                            )
                        );
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                return endTurn(plantVineInField(cultivatorAction.vineId, action.fieldId, state));
            default:
                return state;
        }
    },
    // entertainer: s => endTurn(s),
    grower: (state, action, pendingAction) => {
        const growerAction = pendingAction as PlayVisitorPendingAction & { vineId: VineId };

        switch (action.type) {
            case "CHOOSE_CARD":
                switch (action.card.type) {
                    case "visitor":
                        return promptToChooseVineCard(state);
                    case "vine":
                        return promptToChooseField(
                            setPendingAction(
                                { ...growerAction, vineId: action.card.id },
                                removeCardsFromHand([action.card], state)
                            )
                        );
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                state = plantVineInField(growerAction.vineId, action.fieldId, state);
                const numVinesPlanted = Object.values(state.players[state.currentTurn.playerId].fields)
                    .reduce((numVines, field) => numVines + field.vines.length, 0)
                return endTurn(numVinesPlanted >= 6 ? gainVP(2, state) : state);
            default:
                return state;
        }
    },
    // handyman: s => endTurn(s),
    landscaper: (state, action, pendingAction) => {
        const landscaperAction = pendingAction as PlayVisitorPendingAction & { vineId: VineId };
        switch (action.type) {
            case "CHOOSE_CARD":
                switch (action.card.type) {
                    case "visitor":
                        return promptForAction(state, {
                            choices: [
                                { id: "LANDSCAPER_DRAW_PLANT", label: <>Draw 1 <Vine /> and plant up to 1 <Vine /></> },
                                {
                                    id: "LANDSCAPER_SWITCH",
                                    label: <>Switch 2 <Vine /> on your fields</>,
                                    disabledReason: "Not implemented yet", // TODO
                                },
                            ],
                        });
                    case "vine":
                        return promptToChooseField(
                            setPendingAction(
                                { ...landscaperAction, vineId: action.card.id },
                                removeCardsFromHand([action.card], state)
                            )
                        );
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "LANDSCAPER_DRAW_PLANT":
                        return promptToChooseVineCard(drawCards(state, { vine: 1 })); // TODO allow passing
                    case "LANDSCAPER_SWITCH":
                        return endTurn(state); // TODO
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                return endTurn(plantVineInField(landscaperAction.vineId, action.fieldId, state));
            default:
                return state;
        }
    },
    // negotiator: s => endTurn(s),
    noviceGuide: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
                return promptForAction(state, {
                    choices: [
                        { id: "NGUIDE_GAIN", label: <>Gain <Coins>3</Coins></>, },
                        { id: "NGUIDE_MAKE", label: <>Make up to 2 <WineGlass /></>, },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "NGUIDE_GAIN":
                        return endTurn(gainCoins(3, state));
                    case "NGUIDE_MAKE":
                        return promptToMakeWine(state, /* upToN */ 2);
                    default:
                        return state;
                }
            case "MAKE_WINE":
                return endTurn(makeWineFromGrapes(state, action.ingredients));
            default:
                return state;
        }
    },
    organizer: (state, action, pendingAction) => {
        const organizerAction = pendingAction as PlayVisitorPendingAction & { currentWakeUpPos: number };

        switch (action.type) {
            case "CHOOSE_CARD":
                return promptForWakeUpOrder(
                    setPendingAction({
                        ...organizerAction,
                        currentWakeUpPos: state.wakeUpOrder.findIndex(
                            pos => pos && pos.playerId === state.currentTurn.playerId
                        ),
                    }, state),
                );
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "WAKE_UP_1":
                    case "WAKE_UP_2":
                    case "WAKE_UP_3":
                    case "WAKE_UP_4":
                    case "WAKE_UP_DRAW_SUMMER":
                    case "WAKE_UP_DRAW_WINTER":
                    case "WAKE_UP_6":
                    case "WAKE_UP_7":
                        return passToNextSeason({
                            ...state,
                            // Clear the previous wake-up position
                            wakeUpOrder: state.wakeUpOrder.map(
                                (pos, i) => i === organizerAction.currentWakeUpPos ? null : pos
                            ) as GameState["wakeUpOrder"],
                        });
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    overseer: (state, action, pendingAction) => {
        const overseerAction = pendingAction as PlayVisitorPendingAction & { vineId: VineId };

        switch (action.type) {
            case "CHOOSE_CARD":
                switch (action.card.type) {
                    case "visitor":
                        return promptToBuildStructure(state);
                    case "vine":
                        return promptToChooseField(
                            setPendingAction({ ...overseerAction, vineId: action.card.id }, state)
                        );
                    default:
                        return state;
                }
            case "BUILD_STRUCTURE":
                return promptToChooseVineCard(
                    buildStructure(payCoins(structures[action.structureId].cost, state), action.structureId)
                );
            case "CHOOSE_FIELD":
                state = plantVineInField(overseerAction.vineId, action.fieldId, state);
                const { red, white } = vineCards[overseerAction.vineId].yields;
                return endTurn((red || 0) + (white || 0) === 4 ? gainVP(1, state) : state);
            default:
                return state;
        }
    },
    patron: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
                return promptForAction(state, {
                    choices: [
                        { id: "PATRON_GAIN", label: <>Gain <Coins>4</Coins></> },
                        { id: "PATRON_DRAW", label: <>Draw 1 <Order /> and 1 <WinterVisitor /></> },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "PATRON_GAIN":
                        return endTurn(gainCoins(4, state));
                    case "PATRON_DRAW":
                        return endTurn(drawCards(state, { order: 1, winterVisitor: 1, }));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    // planner: s => endTurn(s),
    // planter: s => endTurn(s),
    // producer: s => endTurn(s),
    surveyor: (state, action) => {
        const fields = Object.values(state.players[state.currentTurn.playerId].fields);
        let numEmptyAndOwned = 0;
        let numPlantedAndOwned = 0;
        fields.forEach(f => {
            if (f.sold) {
                return;
            }
            if (f.vines.length === 0) {
                numEmptyAndOwned++;
            } else {
                numPlantedAndOwned++;
            }
        });
        switch (action.type) {
            case "CHOOSE_CARD":
                return promptForAction(state, {
                    choices: [
                        { id: "SURVEYOR_EMPTY", label: <>Gain <Coins>2</Coins> for each empty field you own</>, },
                        { id: "SURVEYOR_PLANTED", label: <>Gain <VP>1</VP> for each planted field you own</>, },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "SURVEYOR_EMPTY":
                        return endTurn(gainCoins(numEmptyAndOwned, state));
                    case "SURVEYOR_PLANTED":
                        return endTurn(gainVP(numPlantedAndOwned, state));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    sponsor: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
                return promptForAction(state, {
                    choices: [
                        { id: "SPONSOR_DRAW", label: <>Draw 2 <Vine /></>, },
                        { id: "SPONSOR_GAIN", label: <>Gain <Coins>3</Coins></>, },
                        { id: "SPONSOR_BOTH", label: <>Lose <VP>1</VP> to do both</>, },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "SPONSOR_DRAW":
                        return endTurn(drawCards(state, { vine: 2 }));
                    case "SPONSOR_GAIN":
                        return endTurn(gainCoins(3, state));
                    case "SPONSOR_BOTH":
                        return endTurn(gainCoins(3, drawCards(loseVP(1, state), { vine: 2 })));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    swindler: (state, action, pendingAction) => {
        const swindlerAction = pendingAction as PlayVisitorPendingAction & {
            // list of players who have yet to decide whether to give coins
            mainActions: string[];
        };
        const maybeEndTurn = (state2: GameState, playerId: string) => {
            const mainActions = swindlerAction.mainActions.filter(id => id !== playerId);
            state2 = setPendingAction({ ...swindlerAction, mainActions }, state2);
            return mainActions.length === 0 ? endTurn(state2) : state2;
        };
        switch (action.type) {
            case "CHOOSE_CARD":
                const currentTurnPlayerId = state.currentTurn.playerId;
                state = setPendingAction({
                    ...swindlerAction,
                    mainActions: Object.keys(state.players).filter(id => id !== currentTurnPlayerId),
                }, state);
                const playerName = <strong>{state.currentTurn.playerId}</strong>;
                return currentTurnPlayerId === state.playerId
                    ? state
                    : promptForAction(state, {
                        playerId: state.playerId!,
                        choices: [
                            {
                                id: "SWINDLER_GIVE",
                                label: <>Give {playerName} <Coins>2</Coins>.</>,
                                disabledReason: moneyDisabledReason(state, 2, state.playerId!),
                            },
                            { id: "SWINDLER_PASS", label: <>Pass ({playerName} gains <VP>1</VP>)</> },
                        ],
                    });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "SWINDLER_GIVE":
                        return maybeEndTurn(
                            gainCoins(2, payCoins(2, state, action.playerId)),
                            action.playerId
                        );
                    case "SWINDLER_PASS":
                        return maybeEndTurn(gainVP(1, state), action.playerId);
                    default:
                        return state;
                }
            default:
                return state;
        }

    },
    tourGuide: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
                return promptForAction(state, {
                    choices: [
                        { id: "TOUR_GAIN_4", label: <>Gain <Coins>4</Coins></> },
                        {
                            id: "TOUR_HARVEST",
                            label: <>Harvest 1 field</>,
                            disabledReason: harvestFieldDisabledReason(state),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "TOUR_GAIN_4":
                        return endTurn(gainCoins(4, state));
                    case "TOUR_HARVEST":
                        return promptToChooseField(state);
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                return endTurn(harvestField(state, action.fieldId));
            default:
                return state;
        }
    },
    uncertifiedArchitect: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
                return promptForAction(state, {
                    choices: [
                        { id: "UARCHITECT_LOSE_1_VP", label: <>Lose <VP>1</VP> to build a <Coins>2</Coins> or <Coins>3</Coins> structure</> },
                        { id: "UARCHITECT_LOSE_2_VP", label: <>Lose <VP>2</VP> to build any structure</> }
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "UARCHITECT_LOSE_1_VP":
                        return promptToBuildStructure(loseVP(1, state), { kind: "voucher", upToCost: 3 });
                    case "UARCHITECT_LOSE_2_VP":
                        return promptToBuildStructure(loseVP(2, state), { kind: "voucher", upToCost: maxStructureCost });
                    default:
                        return state;
                }
            case "BUILD_STRUCTURE":
                return endTurn(buildStructure(state, action.structureId));
            default:
                return state;
        }
    },
    uncertifiedBroker: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
                return promptForAction(state, {
                    choices: [
                        { id: "UBROKER_LOSE_VP", label: <>Lose <VP>3</VP> to gain <Coins>9</Coins></> },
                        {
                            id: "UBROKER_GAIN_VP",
                            label: <>Pay <Coins>6</Coins> to gain <VP>2</VP></>,
                            disabledReason: moneyDisabledReason(state, 6),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "UBROKER_LOSE_VP":
                        return endTurn(gainCoins(9, loseVP(3, state)));
                    case "UBROKER_GAIN_VP":
                        return endTurn(gainVP(2, payCoins(6, state)));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    vendor: (state, action, pendingAction) => {
        const vendorAction = pendingAction as PlayVisitorPendingAction & {
            // list of players who have yet to decide whether to draw
            mainActions: string[]
        };
        const maybeEndTurn = (state2: GameState, playerId: string) => {
            const mainActions = vendorAction.mainActions.filter(id => id !== playerId);
            state2 = setPendingAction({ ...vendorAction, mainActions }, state2);
            return mainActions.length === 0 ? endTurn(state2) : state2;
        };
        switch (action.type) {
            case "CHOOSE_CARD":
                const currentTurnPlayerId = state.currentTurn.playerId
                state = setPendingAction({
                    ...vendorAction,
                    mainActions: Object.keys(state.players).filter(id => id !== currentTurnPlayerId),
                }, drawCards(state, { vine: 1, order: 1, winterVisitor: 1, }));
                return currentTurnPlayerId === state.playerId
                    ? state
                    : promptForAction(state, {
                        playerId: state.playerId!,
                        choices: [
                            { id: "VENDOR_DRAW", label: <>Draw 1 <SummerVisitor /></> },
                            { id: "VENDOR_PASS", label: <>Pass</> },
                        ],
                    });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "VENDOR_DRAW":
                        return maybeEndTurn(
                            drawCards(state, { summerVisitor: 1 }, action.playerId),
                            action.playerId
                        );
                    case "VENDOR_PASS":
                        return maybeEndTurn(state, action.playerId);
                    default:
                        return state;
                }
            default:
                return state;
        }

    },
    // volunteerCrew: s => endTurn(s),
};
