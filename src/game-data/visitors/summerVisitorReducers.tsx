import Coins from "../../game-views/icons/Coins";
import * as React from "react";
import GameState, {
    CardType,
    GrapeColor,
    PlayVisitorPendingAction,
    StructureState,
    WineColor,
    WorkerPlacement,
    WorkerPlacementTurn,
} from "../GameState";
import {
    promptForAction,
    promptToBuildStructure,
    promptToChooseVineCard,
    promptToHarvest,
    promptToMakeWine,
    promptToPlant,
    promptToChooseCard,
    promptToUproot,
    promptToChooseWine,
    promptToSwitchVines,
    promptToPlaceWorker,
    promptToFillOrder,
    promptToChooseOrderCard,
    promptToDiscard,
    promptToChooseGrape,
    promptToChooseGrapes,
} from "../prompts/promptReducers";
import { GameAction } from "../gameActions";
import { summerVisitorCards, rhineSummerVisitorCards } from "./visitorCards";
import {
    buildStructure,
    gainCoins,
    gainVP,
    loseVP,
    payCoins,
    plantVineInField,
    uprootVineFromField,
    uprootVinesFromFields,
    gainResiduals,
    updatePlayer,
    placeWorker,
    loseResiduals,
    retrieveWorker,
} from "../shared/sharedReducers";
import {
    buildStructureDisabledReason,
    harvestFieldDisabledReason,
    moneyDisabledReason,
    needGrapesDisabledReason,
    plantVinesDisabledReason,
    numCardsDisabledReason,
    uprootDisabledReason,
    needWineDisabledReason,
    needCardOfTypeDisabledReason,
    structureDisabledReason,
    switchVines,
    fieldYields,
    cardTypesInPlay,
    residualPaymentsDisabledReason,
    workerPlacementSeasons,
    needsGrandeDisabledReason,
} from "../shared/sharedSelectors";
import Card, { Vine, Order, WinterVisitor, SummerVisitor } from "../../game-views/icons/Card";
import Grape from "../../game-views/icons/Grape";
import { default as VP } from "../../game-views/icons/VictoryPoints";
import { maxStructureCost, structures, Coupon, StructureId } from "../structures";
import { VineId, vineCards } from "../vineCards";
import WineGlass from "../../game-views/icons/WineGlass";
import {
    WakeUpChoiceData,
    chooseWakeUp,
    endVisitor,
    passToNextSeason,
    promptForWakeUpOrder,
    setPendingAction,
    makeEndVisitorAction,
    makeChoose2Visitor,
} from "../shared/turnReducers";
import { drawCards, discardCards } from "../shared/cardReducers";
import { placeGrapes, makeWineFromGrapes, harvestField, discardGrapes, discardWines, fillOrder, gainWine, harvestFields } from "../shared/grapeWineReducers";
import Residuals from "../../game-views/icons/Residuals";
import Worker from "../../game-views/icons/Worker";
import { allPlacements, seasonalActions } from "../board/boardPlacements";
import { Choice } from "../prompts/PromptState";

export const summerVisitorReducers: Record<
    keyof typeof summerVisitorCards,
    (state: GameState, action: GameAction, pendingAction: PlayVisitorPendingAction) => GameState
> = {
    agriculturist: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptToChooseVineCard(state);
                    case "vine":
                        return promptToPlant(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                state = plantVineInField(action.fields[0], state);
                const vinesByName: { [vineName: string]: boolean; } = {};
                state.players[state.currentTurn.playerId].fields[action.fields[0]].vines.forEach(
                    v => vinesByName[vineCards[v].name] = true
                );
                return endVisitor(Object.keys(vinesByName).length >= 3 ? gainVP(2, state) : state);
            default:
                return state;
        }
    },
    architect: (state, action) => {
        const coupon = { kind: "discount", amount: 3, } as const;
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "ARCHITECT_BUILD",
                            label: <>Build a structure at a <Coins>3</Coins> discount</>,
                            disabledReason: buildStructureDisabledReason(state, coupon),
                        },
                        {
                            id: "ARCHITECT_GAIN",
                            label: <>Gain <VP>1</VP> for each <Coins>4</Coins> structure you have built</>,
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "ARCHITECT_BUILD":
                        return promptToBuildStructure(state, coupon);
                    case "ARCHITECT_GAIN":
                        const player = state.players[state.currentTurn.playerId];
                        const num4Built = Object.entries(structures).filter(([id, { cost }]) =>
                            cost === 4 && player.structures[id as StructureId]
                        ).length;
                        return endVisitor(gainVP(num4Built, state));
                    default:
                        return state;
                }
            case "BUILD_STRUCTURE":
                const { cost } = structures[action.structureId];
                return endVisitor(
                    buildStructure(payCoins(cost - coupon.amount, state), action.structureId)
                );
            default:
                return state;
        }
    },
    artisan: (state, action, pendingAction) => {
        const artisanAction = pendingAction as PlayVisitorPendingAction & {
            secondPlant: boolean;
        };
        const buildCoupon: Coupon = { kind: "discount", amount: 1 };

        switch (action.type) {
            case "CHOOSE_CARDS":
                if (!action.cards) {
                    // pass on second plant
                    return endVisitor(state);
                }
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptForAction(state, {
                            choices: [
                                { id: "ARTISAN_GAIN", label: <>Gain <Coins>3</Coins></>, },
                                {
                                    id: "ARTISAN_BUILD",
                                    label: <>Build a structure at a <Coins>1</Coins> discount</>,
                                    disabledReason: buildStructureDisabledReason(state, buildCoupon),
                                },
                                {
                                    id: "ARTISAN_PLANT",
                                    label: <>Plant up to 2 <Vine /></>,
                                    disabledReason: plantVinesDisabledReason(state),
                                },
                            ],
                        });
                    case "vine":
                        return promptToPlant(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "ARTISAN_GAIN":
                        return endVisitor(gainCoins(3, state));
                    case "ARTISAN_BUILD":
                        return promptToBuildStructure(state, buildCoupon);
                    case "ARTISAN_PLANT":
                        return promptToChooseVineCard(state);
                    default:
                        return state;
                }
            case "BUILD_STRUCTURE":
                const structure = structures[action.structureId];
                return endVisitor(buildStructure(payCoins(structure.cost - 1, state), action.structureId));

            case "CHOOSE_FIELD":
                state = plantVineInField(action.fields[0], state);
                const canPlantAgain = !artisanAction.secondPlant &&
                    plantVinesDisabledReason(state) === undefined;

                return canPlantAgain
                    ? promptToChooseVineCard(
                        setPendingAction({ ...artisanAction, secondPlant: true }, state),
                        { optional: true }
                    )
                    : endVisitor(state);

            default:
                return state;
        }
    },
    auctioneer: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                switch (action.cards!.length) {
                    case 1:
                        return promptForAction(state, {
                            choices: [
                                {
                                    id: "AUCTIONEER_2",
                                    label: <>Discard 2 <Card /> to gain <Coins>4</Coins></>,
                                    disabledReason: numCardsDisabledReason(state, 2),
                                },
                                {
                                    id: "AUCTIONEER_4",
                                    label: <>Discard 4 <Card /> to gain <VP>3</VP></>,
                                    disabledReason: numCardsDisabledReason(state, 4),
                                },
                            ],
                        });
                    case 2:
                        return endVisitor(gainCoins(4, discardCards(action.cards!, state)));
                    case 4:
                        return endVisitor(gainVP(3, discardCards(action.cards!, state)));
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "AUCTIONEER_2":
                        return promptToDiscard(2, state);
                    case "AUCTIONEER_4":
                        return promptToDiscard(4, state);
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    banker: (state, action) => {
        const endVisitorAction = makeEndVisitorAction("opponents", (s, playerId) => {
            return promptForAction(s, {
                playerId,
                choices: [
                    { id: "BANKER_GAIN", label: <>Lose <VP>1</VP> to gain <Coins>3</Coins>.</> },
                    { id: "BANKER_PASS", label: <>Pass</> },
                ],
            });
        });
        switch (action.type) {
            case "CHOOSE_CARDS":
                return endVisitorAction(gainCoins(5, state));

            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "BANKER_GAIN":
                        return endVisitorAction(
                            gainCoins(3, loseVP(1, state, action.playerId), action.playerId),
                            action.playerId
                        );
                    case "BANKER_PASS":
                        return endVisitorAction(state, action.playerId);
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    blacksmith: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptToBuildStructure(state, { kind: "discount", amount: 2, });
            case "BUILD_STRUCTURE":
                const { cost } = structures[action.structureId];
                return endVisitor(
                    buildStructure(
                        payCoins(cost - 2, cost === 5 || cost === 6 ? gainVP(1, state) : state),
                        action.structureId
                    )
                );
            default:
                return state;
        }
    },
    broker: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "BROKER_GAIN",
                            label: <>Pay <Coins>9</Coins> to gain <VP>3</VP></>,
                            disabledReason: moneyDisabledReason(state, 9),
                        },
                        { id: "BROKER_LOSE", label: <>Lose <VP>2</VP> to gain <Coins>6</Coins></>, },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "BROKER_GAIN":
                        return endVisitor(gainVP(3, payCoins(9, state)));
                    case "BROKER_LOSE":
                        return endVisitor(gainCoins(6, loseVP(2, state)));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    buyer: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "BUYER_PLACE_RED",
                            label: <>Pay <Coins>2</Coins> to place a <Grape color="red">1</Grape> on your crush pad</>,
                            disabledReason: moneyDisabledReason(state, 2),
                        },
                        {
                            id: "BUYER_PLACE_WHITE",
                            label: <>Pay <Coins>2</Coins> to place a <Grape color="white">1</Grape> on your crush pad</>,
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
                    case "BUYER_PLACE_RED":
                        return endVisitor(payCoins(2, placeGrapes(state, { red: 1 })));
                    case "BUYER_PLACE_WHITE":
                        return endVisitor(payCoins(2, placeGrapes(state, { white: 1 })));
                    case "BUYER_DISCARD":
                        return promptToChooseGrape(state);
                    default:
                        return state;
                }
            case "CHOOSE_GRAPE":
                return endVisitor(gainVP(1, gainCoins(2, discardGrapes(state, action.grapes))));
            default:
                return state;
        }
    },
    contractor: (state, action) => {
        const [chooseAction, maybeEndVisitor] = makeChoose2Visitor(s => [
            { id: "CONTRACTOR_GAIN", label: <>Gain <VP>1</VP></>, },
            {
                id: "CONTRACTOR_BUILD",
                label: <>Build 1 structure</>,
                disabledReason: buildStructureDisabledReason(s),
            },
            {
                id: "CONTRACTOR_PLANT",
                label: <>Plant 1 <Vine /></>,
                disabledReason: plantVinesDisabledReason(s),
            },
        ]);

        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return chooseAction(state);
                    case "vine":
                        return promptToPlant(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                state = chooseAction(state, action.choice);
                switch (action.choice) {
                    case "CONTRACTOR_GAIN":
                        return maybeEndVisitor(gainVP(1, state));
                    case "CONTRACTOR_BUILD":
                        return promptToBuildStructure(state);
                    case "CONTRACTOR_PLANT":
                        return promptToChooseVineCard(state);
                    default:
                        return state;
                }
            case "BUILD_STRUCTURE":
                const structure = structures[action.structureId];
                return maybeEndVisitor(
                    buildStructure(payCoins(structure.cost, state), action.structureId)
                );
            case "CHOOSE_FIELD":
                return maybeEndVisitor(plantVineInField(action.fields[0], state));
            default:
                return state;
        }
    },
    cultivator: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptToChooseVineCard(state, { bypassFieldLimit: true });
                    case "vine":
                        return promptToPlant(state, card.id, { bypassFieldLimit: true });
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                return endVisitor(plantVineInField(action.fields[0], state));
            default:
                return state;
        }
    },
    entertainer: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const cards = action.cards!;
                switch (cards.length) {
                    case 1:
                        return promptForAction(state, {
                            choices: [
                                {
                                    id: "ENTERTAINER_DRAW",
                                    label: <>Pay <Coins>4</Coins> to draw 3 <WinterVisitor /></>,
                                    disabledReason: moneyDisabledReason(state, 4),
                                },
                                {
                                    id: "ENTERTAINER_DISCARD",
                                    label: <>Discard 1 <WineGlass /> and 3 visitor cards to gain <VP>3</VP></>,
                                    disabledReason: needWineDisabledReason(state) ||
                                        needCardOfTypeDisabledReason(state, "visitor", { numCards: 3 }),
                                },
                            ],
                        });
                    case 3:
                        return endVisitor(gainVP(3, discardCards(cards, state)));
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "ENTERTAINER_DRAW":
                        return endVisitor(drawCards(payCoins(4, state), action._key!, { winterVisitor: 3 }));
                    case "ENTERTAINER_DISCARD":
                        return promptToChooseWine(state);
                    default:
                        return state;
                }
            case "CHOOSE_WINE":
                return promptToChooseCard(discardWines(state, action.wines), {
                    title: "Discard 3 visitors",
                    cards: state.players[state.currentTurn.playerId].cardsInHand
                        .filter(({ type }) => type === "visitor")
                        .map(id => ({ id })),
                    numCards: 3,
                });
            default:
                return state;
        }
    },
    grower: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptToChooseVineCard(state);
                    case "vine":
                        return promptToPlant(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                state = plantVineInField(action.fields[0], state);
                const numVinesPlanted = Object.values(state.players[state.currentTurn.playerId].fields)
                    .reduce((numVines, field) => numVines + field.vines.length, 0);
                return endVisitor(numVinesPlanted >= 6 ? gainVP(2, state) : state);
            default:
                return state;
        }
    },
    handyman: (state, action) => {
        const coupon = { kind: "discount", amount: 2, } as const;

        const endVisitorAction = makeEndVisitorAction("allPlayers", (s, playerId) => {
            const playerName = s.players[s.currentTurn.playerId].name;
            return promptForAction(s, {
                playerId,
                choices: [
                    {
                        id: "HANDYMAN_BUILD",
                        label: <>
                            Build 1 structure at a <Coins>2</Coins> discount
                            {playerId !== s.currentTurn.playerId
                                ? <> (<strong>{playerName}</strong> gains <VP>1</VP>)</>
                                : null}
                        </>,
                        disabledReason: buildStructureDisabledReason(s, coupon, playerId),
                    },
                    {
                        id: "HANDYMAN_PASS",
                        label: <>Pass</>,
                    },
                ],
            });
        });
        switch (action.type) {
            case "CHOOSE_CARDS":
                return endVisitorAction(state);

            case "BUILD_STRUCTURE":
                const { cost } = structures[action.structureId];
                state = buildStructure(
                    payCoins(cost - coupon.amount, state, action.playerId),
                    action.structureId,
                    action.playerId
                );
                return endVisitorAction(
                    action.playerId !== state.currentTurn.playerId ? gainVP(1, state) : state,
                    action.playerId
                );

            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "HANDYMAN_BUILD":
                        return promptToBuildStructure(state, coupon, action.playerId);
                    case "HANDYMAN_PASS":
                        return endVisitorAction(state, action.playerId);
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    homesteader: (state, action, pendingAction) => {
        const homesteaderAction = pendingAction as PlayVisitorPendingAction & {
            doBoth: boolean;
            secondPlant: boolean;
        };
        const buildCoupon: Coupon = { kind: "discount", amount: 3 };

        switch (action.type) {
            case "CHOOSE_CARDS":
                if (!action.cards) {
                    // pass on second plant
                    return endVisitor(state);
                }
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptForAction(state, {
                            choices: [
                                {
                                    id: "HOMESTEADER_BUILD",
                                    label: <>Build 1 structure at a <Coins>3</Coins> discount</>,
                                    disabledReason: buildStructureDisabledReason(state, buildCoupon),
                                },
                                {
                                    id: "HOMESTEADER_PLANT",
                                    label: <>Plant up to 2 <Vine /></>,
                                    disabledReason: plantVinesDisabledReason(state),
                                },
                                {
                                    id: "HOMESTEADER_BOTH",
                                    label: <>Do both (lose <VP>1</VP>)</>,
                                    // Don't check if planting is possible yet because
                                    // building a structure may change that
                                    disabledReason: buildStructureDisabledReason(state, buildCoupon),
                                },
                            ],
                        });
                    case "vine":
                        return promptToPlant(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "HOMESTEADER_BUILD":
                        return promptToBuildStructure(state, buildCoupon);
                    case "HOMESTEADER_PLANT":
                        return promptToChooseVineCard(state);
                    case "HOMESTEADER_BOTH":
                        return promptToBuildStructure(
                            setPendingAction({ ...homesteaderAction, doBoth: true }, state),
                            buildCoupon
                        );
                    default:
                        return state;
                }
            case "BUILD_STRUCTURE":
                const structure = structures[action.structureId];
                state = buildStructure(payCoins(structure.cost - 3, state), action.structureId);

                return homesteaderAction.doBoth && plantVinesDisabledReason(state) === undefined
                    ? promptToChooseVineCard(loseVP(1, state))
                    : endVisitor(state);

            case "CHOOSE_FIELD":
                state = plantVineInField(action.fields[0], state);
                const canPlantAgain = !homesteaderAction.secondPlant &&
                    plantVinesDisabledReason(state) === undefined;

                return canPlantAgain
                    ? promptToChooseVineCard(
                        setPendingAction({ ...homesteaderAction, secondPlant: true }, state),
                        { optional: true }
                    )
                    : endVisitor(state);

            default:
                return state;
        }
    },
    horticulturist: (state, action, pendingAction) => {
        const horticulturistAction = pendingAction as PlayVisitorPendingAction & {
            isDiscarding?: boolean;
        };
        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptForAction(state, {
                            choices: [
                                {
                                    id: "HORTICULTURIST_PLANT",
                                    label: <>Plant 1 <Vine /></>,
                                    disabledReason: plantVinesDisabledReason(state, { bypassStructures: true })
                                },
                                {
                                    id: "HORTICULTURIST_UPROOT",
                                    label: <>Uproot and discard 2 <Vine /> to gain <VP>3</VP></>,
                                    disabledReason: uprootDisabledReason(state, { numVines: 2 })
                                }
                            ]
                        });
                    case "vine":
                        return horticulturistAction.isDiscarding
                            ? endVisitor(gainVP(3, discardCards(action.cards!, state)))
                            : promptToPlant(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "HORTICULTURIST_PLANT":
                        return promptToChooseVineCard(state, { bypassStructures: true });
                    case "HORTICULTURIST_UPROOT":
                        return promptToUproot(state, 2);
                    default:
                        return state;
                }
            case "CHOOSE_VINE":
                state = uprootVinesFromFields(action.vines, state);
                return promptToChooseCard(setPendingAction({
                    ...horticulturistAction,
                    isDiscarding: true
                }, state), {
                    title: "Discard 2 vines",
                    cards: state.players[state.currentTurn.playerId].cardsInHand
                        .filter(({ type }) => type === "vine")
                        .map(id => ({ id })),
                    numCards: 2
                });
            case "CHOOSE_FIELD":
                return endVisitor(plantVineInField(action.fields[0], state));
            default:
                return state;
        }
    },
    landscaper: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                if (!action.cards) {
                    return endVisitor(state); // pass on optional vine planting
                }
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptForAction(state, {
                            choices: [
                                { id: "LANDSCAPER_DRAW_PLANT", label: <>Draw 1 <Vine /> and plant up to 1 <Vine /></> },
                                {
                                    id: "LANDSCAPER_SWITCH",
                                    label: <>Switch 2 <Vine /> on your fields</>
                                },
                            ],
                        });
                    case "vine":
                        return promptToPlant(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "LANDSCAPER_DRAW_PLANT":
                        return promptToChooseVineCard(
                            drawCards(state, action._key!, { vine: 1 }),
                            { optional: true }
                        );
                    case "LANDSCAPER_SWITCH":
                        return promptToSwitchVines(state);
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                return endVisitor(plantVineInField(action.fields[0], state));
            case "CHOOSE_VINE":
                const player = state.players[state.currentTurn.playerId];
                return endVisitor(updatePlayer(state, player.id, {
                    fields: switchVines(action.vines, player.fields)
                }));
            default:
                return state;
        }
    },
    negotiator: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "NEGOTIATOR_GRAPE",
                            label: <>Discard 1 <Grape /> to gain <Residuals>1</Residuals></>,
                            disabledReason: needGrapesDisabledReason(state)
                        },
                        {
                            id: "NEGOTIATOR_WINE",
                            label: <>Discard 1 <WineGlass /> to gain <Residuals>2</Residuals></>,
                            disabledReason: needWineDisabledReason(state)
                        }
                    ]
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "NEGOTIATOR_GRAPE":
                        return promptToChooseGrape(state);
                    case "NEGOTIATOR_WINE":
                        return promptToChooseWine(state);
                    default:
                        return state;
                }
            case "CHOOSE_GRAPE":
                return endVisitor(gainResiduals(1, discardGrapes(state, action.grapes)));
            case "CHOOSE_WINE":
                return endVisitor(gainResiduals(2, discardWines(state, action.wines)));
            default:
                return state;
        }
    },
    noviceGuide: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        { id: "NGUIDE_GAIN", label: <>Gain <Coins>3</Coins></>, },
                        {
                            id: "NGUIDE_MAKE",
                            label: <>Make up to 2 <WineGlass /></>,
                            disabledReason: needGrapesDisabledReason(state),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "NGUIDE_GAIN":
                        return endVisitor(gainCoins(3, state));
                    case "NGUIDE_MAKE":
                        return promptToMakeWine(state, /* upToN */ 2);
                    default:
                        return state;
                }
            case "MAKE_WINE":
                return endVisitor(makeWineFromGrapes(state, action.ingredients));
            default:
                return state;
        }
    },
    organizer: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForWakeUpOrder(state);

            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "WAKE_UP":
                        return passToNextSeason(
                            chooseWakeUp(action.data as WakeUpChoiceData, action._key!, {
                                ...state,
                                // Clear the previous wake-up position
                                wakeUpOrder: state.wakeUpOrder.map(
                                    pos => pos && pos.playerId === state.currentTurn.playerId ? null : pos
                                ) as GameState["wakeUpOrder"],
                            })
                        );
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    overseer: (state, action, pendingAction) => {
        const overseerAction = pendingAction as PlayVisitorPendingAction & { vineId: VineId; };

        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptToBuildStructure(state);
                    case "vine":
                        return promptToPlant(state, card.id);
                    default:
                        return state;
                }
            case "BUILD_STRUCTURE":
                return promptToChooseVineCard(
                    buildStructure(payCoins(structures[action.structureId].cost, state), action.structureId)
                );
            case "CHOOSE_FIELD":
                state = plantVineInField(action.fields[0], state);
                const { red, white } = vineCards[overseerAction.vineId].yields;
                return endVisitor((red || 0) + (white || 0) === 4 ? gainVP(1, state) : state);
            default:
                return state;
        }
    },
    patron: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        { id: "PATRON_GAIN", label: <>Gain <Coins>4</Coins></> },
                        { id: "PATRON_DRAW", label: <>Draw 1 <Order /> and 1 <WinterVisitor /></> },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "PATRON_GAIN":
                        return endVisitor(gainCoins(4, state));
                    case "PATRON_DRAW":
                        return endVisitor(drawCards(state, action._key!, { order: 1, winterVisitor: 1, }));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    peddler: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                if (action.cards!.length === 1) {
                    return promptToDiscard(2, state);
                } else {
                    return endVisitor(
                        drawCards(discardCards(action.cards!, state), action._key!, {
                            vine: 1,
                            summerVisitor: 1,
                            order: 1,
                            winterVisitor: 1
                        })
                    );
                }
            default:
                return state;
        }
    },
    planner: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptToPlaceWorker(state);
            case "PLACE_WORKER":
                return endVisitor(placeWorker(action.workerType, action.placement!, state)[0]);
            default:
                return state;
        }
    },
    planter: (state, action, pendingAction) => {
        const planterAction = pendingAction as PlayVisitorPendingAction & {
            isDiscarding?: boolean;
            secondPlant?: boolean;
        };
        switch (action.type) {
            case "CHOOSE_CARDS":
                if (!action.cards) {
                    // pass on second plant
                    return endVisitor(gainCoins(1, state));
                }
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptForAction(state, {
                            choices: [
                                {
                                    id: "PLANTER_PLANT",
                                    label: <>Plant up to 2 <Vine /> and gain <Coins>1</Coins></>,
                                    disabledReason: plantVinesDisabledReason(state)
                                },
                                {
                                    id: "PLANTER_UPROOT",
                                    label: <>Uproot and discard 1 <Vine /> to gain <VP>2</VP></>,
                                    disabledReason: uprootDisabledReason(state)
                                }
                            ]
                        });
                    case "vine":
                        return planterAction.isDiscarding
                            ? endVisitor(gainVP(2, discardCards(action.cards!, state)))
                            : promptToPlant(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "PLANTER_PLANT":
                        return promptToChooseVineCard(state);
                    case "PLANTER_UPROOT":
                        return promptToUproot(state);
                    default:
                        return state;
                }
            case "CHOOSE_VINE":
                state = uprootVineFromField(action.vines[0], state);
                return promptToChooseCard(setPendingAction({
                    ...planterAction,
                    isDiscarding: true
                }, state), {
                    title: "Discard a vine",
                    cards: state.players[state.currentTurn.playerId].cardsInHand
                        .filter(({ type }) => type === "vine")
                        .map(id => ({ id }))
                });
            case "CHOOSE_FIELD":
                state = plantVineInField(action.fields[0], state);
                const canPlantAgain = !planterAction.secondPlant &&
                    plantVinesDisabledReason(state) === undefined;
                return canPlantAgain
                    ? promptToChooseVineCard(
                        setPendingAction({ ...planterAction, secondPlant: true }, state),
                        { optional: true }
                    )
                    : endVisitor(gainCoins(1, state));
            default:
                return state;
        }
    },
    producer: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const playerId = state.currentTurn.playerId;
                return promptForAction(state, {
                    upToN: 2,
                    title: "Retrieve up to 2 workers",
                    choices: allPlacements
                        .map(({ type, label }) => {
                            if (type === "playSummerVisitor") {
                                // Must retrieve from *other* actions
                                return [];
                            }
                            return state.workerPlacements[type]
                                .map((w, i) => w && w.playerId === playerId
                                    ? {
                                        id: `${type}_${i}`,
                                        label: <>
                                            <Worker color={w.color} workerType={w.type} isTemp={w.isTemp} />
                                            &nbsp;{label(state, i)}
                                        </>,
                                    } as Choice
                                    : null
                                )
                                .filter((c: Choice | null): c is Choice => !!c);
                        })
                        .flat(),
                });
            case "CHOOSE_ACTION_MULTI":
                action.choices.forEach(id => {
                    const parts = id.split("_");
                    const placement = parts[0] as WorkerPlacement;
                    const index = parseInt(parts[1], 10);

                    state = retrieveWorker(placement, index, state);
                });
                return endVisitor(payCoins(2, state));
            default:
                return state;
        }
    },
    sharecropper: (state, action, pendingAction) => {
        const sharecropperAction = pendingAction as PlayVisitorPendingAction & {
            isDiscarding?: boolean;
        };
        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptForAction(state, {
                            choices: [
                                {
                                    id: "SHARECROPPER_PLANT",
                                    label: <>Plant 1 <Vine /></>,
                                    disabledReason: plantVinesDisabledReason(state, { bypassStructures: true })
                                },
                                {
                                    id: "SHARECROPPER_UPROOT",
                                    label: <>Uproot and discard 1 <Vine /> to gain <VP>2</VP></>,
                                    disabledReason: uprootDisabledReason(state)
                                }
                            ]
                        });
                    case "vine":
                        return sharecropperAction.isDiscarding ?
                            endVisitor(gainVP(2, discardCards(action.cards!, state))) :
                            promptToPlant(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "SHARECROPPER_PLANT":
                        return promptToChooseVineCard(state, { bypassStructures: true });
                    case "SHARECROPPER_UPROOT":
                        return promptToUproot(state);
                    default:
                        return state;
                }
            case "CHOOSE_VINE":
                state = uprootVineFromField(action.vines[0], state);
                return promptToChooseCard(setPendingAction({
                    ...sharecropperAction,
                    isDiscarding: true
                }, state), {
                    title: "Discard a vine",
                    cards: state.players[state.currentTurn.playerId].cardsInHand
                        .filter(({ type }) => type === "vine")
                        .map(id => ({ id }))
                });
            case "CHOOSE_FIELD":
                return endVisitor(plantVineInField(action.fields[0], state));
            default:
                return state;
        }
    },
    sponsor: (state, action) => {
        const [chooseAction, maybeEndVisitor] = makeChoose2Visitor((s, numChosen) => {
            const maybeLoseVp = numChosen > 0 ? <> (lose <VP>1</VP>)</> : null;
            return [
                { id: "SPONSOR_DRAW", label: <>Draw 2 <Vine />{maybeLoseVp}</>, },
                { id: "SPONSOR_GAIN", label: <>Gain <Coins>3</Coins>{maybeLoseVp}</>, },
                ...(numChosen > 0
                    ? [{ id: "SPONSOR_PASS", label: <>Pass</>, }]
                    : [])
            ];
        });

        switch (action.type) {
            case "CHOOSE_CARDS":
                return chooseAction(state);

            case "CHOOSE_ACTION":
                state = chooseAction(
                    state,
                    action.choice,
                    /* loseVPOnMulti */ action.choice !== "SPONSOR_PASS"
                );
                switch (action.choice) {
                    case "SPONSOR_DRAW":
                        return maybeEndVisitor(drawCards(state, action._key!, { vine: 2 }));
                    case "SPONSOR_GAIN":
                        return maybeEndVisitor(gainCoins(3, state));
                    case "SPONSOR_PASS":
                        return endVisitor(state);
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    stonemason: (state, action) => {
        interface StonemasonAction extends PlayVisitorPendingAction {
            structuresBuilt: number;
        }
        const maybeEndVisitor = (state2: GameState): GameState => {
            const pendingAction = (state2.currentTurn as WorkerPlacementTurn)
                .pendingAction! as StonemasonAction;
            const structuresBuilt = (pendingAction.structuresBuilt ?? -1) + 1;
            if (structuresBuilt === 2) {
                return endVisitor(payCoins(8, state2));
            }
            return promptForAction(
                setPendingAction({ ...pendingAction, structuresBuilt }, state2),
                {
                    title: structuresBuilt === 0 ? "Build any 2 structures" : "Build another structure",
                    choices: Object.entries(state2.players[state2.currentTurn.playerId].structures)
                        .filter(([_, s]) => s === StructureState.Unbuilt)
                        .map(([id]) => {
                            const { name, cost } = structures[id as StructureId];
                            return {
                                id,
                                label: <>{name} <Coins>{cost}</Coins></>,
                                disabledReason: moneyDisabledReason(state2, 8) ||
                                    structureDisabledReason(state2, id as StructureId, {
                                        kind: "voucher",
                                        upToCost: maxStructureCost
                                    }),
                            };
                        }),
                }
            );
        };
        switch (action.type) {
            case "CHOOSE_CARDS":
                return maybeEndVisitor(state);
            case "CHOOSE_ACTION":
                return maybeEndVisitor(buildStructure(state, action.choice as StructureId));
            default:
                return state;
        }
    },
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
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        { id: "SURVEYOR_EMPTY", label: <>Gain <Coins>2</Coins> for each empty field you own</>, },
                        { id: "SURVEYOR_PLANTED", label: <>Gain <VP>1</VP> for each planted field you own</>, },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "SURVEYOR_EMPTY":
                        return endVisitor(gainCoins(2 * numEmptyAndOwned, state));
                    case "SURVEYOR_PLANTED":
                        return endVisitor(gainVP(numPlantedAndOwned, state));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    swindler: (state, action) => {
        const endVisitorAction = makeEndVisitorAction("opponents", (s, playerId) => {
            const playerName = <strong>{s.players[s.currentTurn.playerId].name}</strong>;
            return promptForAction(s, {
                playerId,
                choices: [
                    {
                        id: "SWINDLER_GIVE",
                        label: <>Give {playerName} <Coins>2</Coins>.</>,
                        disabledReason: moneyDisabledReason(s, 2, playerId),
                    },
                    { id: "SWINDLER_PASS", label: <>Pass ({playerName} gains <VP>1</VP>)</> },
                ],
            });
        });
        switch (action.type) {
            case "CHOOSE_CARDS":
                return endVisitorAction(state);

            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "SWINDLER_GIVE":
                        return endVisitorAction(
                            gainCoins(2, payCoins(2, state, action.playerId)),
                            action.playerId
                        );
                    case "SWINDLER_PASS":
                        return endVisitorAction(gainVP(1, state), action.playerId);
                    default:
                        return state;
                }
            default:
                return state;
        }

    },
    tourGuide: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
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
                        return endVisitor(gainCoins(4, state));
                    case "TOUR_HARVEST":
                        return promptToHarvest(state);
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                return endVisitor(harvestField(state, action.fields[0]));
            default:
                return state;
        }
    },
    uncertifiedArchitect: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
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
                return endVisitor(buildStructure(state, action.structureId));
            default:
                return state;
        }
    },
    uncertifiedBroker: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
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
                        return endVisitor(gainCoins(9, loseVP(3, state)));
                    case "UBROKER_GAIN_VP":
                        return endVisitor(gainVP(2, payCoins(6, state)));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    vendor: (state, action) => {
        const endVisitorAction = makeEndVisitorAction("opponents", (s, playerId) => {
            return promptForAction(s, {
                playerId,
                choices: [
                    { id: "VENDOR_DRAW", label: <>Draw 1 <SummerVisitor /></> },
                    { id: "VENDOR_PASS", label: <>Pass</> },
                ],
            });
        });
        switch (action.type) {
            case "CHOOSE_CARDS":
                state = drawCards(state, action._key!, { vine: 1, order: 1, winterVisitor: 1, });
                return endVisitorAction(state);

            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "VENDOR_DRAW":
                        return endVisitorAction(
                            drawCards(state, action._key!, { summerVisitor: 1 }, action.playerId),
                            action.playerId
                        );
                    case "VENDOR_PASS":
                        return endVisitorAction(state, action.playerId);
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    volunteerCrew: (state, action) => {
        const endVisitorAction = makeEndVisitorAction("allPlayers", (s, playerId) => {
            const playerName = s.players[s.currentTurn.playerId].name;
            return promptForAction(s, {
                playerId,
                choices: [
                    {
                        id: "VCREW_PLANT",
                        label: <>
                            Plant 1 <Vine />
                            {playerId !== s.currentTurn.playerId
                                ? <> (<strong>{playerName}</strong> gains <Coins>2</Coins>)</>
                                : null}
                        </>,
                        disabledReason: plantVinesDisabledReason(s, { playerId })
                    },
                    {
                        id: "VCREW_PASS",
                        label: <>Pass</>,
                    },
                ],
            });
        });
        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return endVisitorAction(state);
                    case "vine":
                        return promptToPlant(state, card.id, { playerId: action.playerId });
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "VCREW_PLANT":
                        return promptToChooseVineCard(state, { playerId: action.playerId });
                    case "VCREW_PASS":
                        return endVisitorAction(state, action.playerId);
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                state = plantVineInField(action.fields[0], state, action.playerId);
                return endVisitorAction(
                    action.playerId !== state.currentTurn.playerId ? gainCoins(2, state) : state,
                    action.playerId
                );
            default:
                return state;
        }
    },
    weddingParty: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    title: "Choose opponents",
                    upToN: 3,
                    choices: Object.values(state.players)
                        .filter(p => p.id !== state.currentTurn.playerId)
                        .map(p => ({
                            id: p.id,
                            label: <strong>{p.name}</strong>
                        })),
                });
            case "CHOOSE_ACTION_MULTI":
                action.choices.forEach(opponentId => {
                    state = gainCoins(2, payCoins(2, state), opponentId);
                });
                return endVisitor(gainVP(action.choices.length, state));
            default:
                return state;
        }
    },
    wineCritic: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        { id: "WCRITIC_DRAW", label: <>Draw 2 <WinterVisitor /></>, },
                        {
                            id: "WCRITIC_DISCARD",
                            label: <>Discard 1 <WineGlass /> of value 7 or more to gain <VP>4</VP></>,
                            disabledReason: needWineDisabledReason(state, /* minValue */ 7),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "WCRITIC_DRAW":
                        return endVisitor(drawCards(state, action._key!, { winterVisitor: 2 }));
                    case "WCRITIC_DISCARD":
                        return promptToChooseWine(state, { minValue: 7 });
                    default:
                        return state;
                }
            case "CHOOSE_WINE":
                return endVisitor(gainVP(4, discardWines(state, action.wines)));
            default:
                return state;
        }
    },
};

export const rhineSummerVisitorReducers: Record<
    keyof typeof rhineSummerVisitorCards,
    (state: GameState, action: GameAction, pendingAction: PlayVisitorPendingAction) => GameState
> = {
    accountant: (state, action) => {
        const endVisitorAction = makeEndVisitorAction("opponents", (s, playerId) => {
            return promptForAction(s, {
                playerId,
                choices: [
                    { id: "ACCOUNTANT_DRAW", label: <>Draw 1 <SummerVisitor /></> },
                    { id: "ACCOUNTANT_PASS", label: <>Pass</> },
                ],
            });
        });
        switch (action.type) {
            case "CHOOSE_CARDS":
                state = gainCoins(1, drawCards(state, action._key!, { vine: 1, summerVisitor: 1, winterVisitor: 1, }));
                return endVisitorAction(state);

            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "VENDOR_DRAW":
                        return endVisitorAction(
                            drawCards(state, action._key!, { summerVisitor: 1 }, action.playerId),
                            action.playerId
                        );
                    case "VENDOR_PASS":
                        return endVisitorAction(state, action.playerId);
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    administrator: (state, action, pendingAction) => {
        const placedWorker = state.workerPlacements.playSummerVisitor[pendingAction.placementIdx!]!
        switch (action.type) {
            case "CHOOSE_CARDS":
                const seasons = workerPlacementSeasons(state);
                const futureSeasons = seasons.slice(seasons.indexOf("summer") + 1);
                const isGrande = placedWorker.type === "grande";
                return promptForAction(state, {
                    choices: seasonalActions
                        .filter(a => futureSeasons.some(s => s === a.season))
                        .map(a => ({
                            id: a.type,
                            label: a.label(state),
                            disabledReason: isGrande
                                ? undefined
                                : needsGrandeDisabledReason(state, a.type),
                        })),
                });
            case "CHOOSE_ACTION":
                state = retrieveWorker(
                    "playSummerVisitor",
                    pendingAction.placementIdx!,
                    state
                );
                return endVisitor(
                    placeWorker(placedWorker.type, action.choice as WorkerPlacement, state)[0]
                );
            default:
                return state;
        }
    },
    agent: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                if (action.cards?.length === 1) {
                    return promptForAction(state, {
                        choices: [
                            {
                                id: "AGENT_DISCARD",
                                label: <>Discard 2 <Card /> to gain <Coins>5</Coins></>,
                                disabledReason: numCardsDisabledReason(state, 2),
                            },
                            {
                                id: "AGENT_DRAW_VISITOR",
                                label: <>Pay <Coins>2</Coins> to draw 2 <WinterVisitor /></>,
                                disabledReason: moneyDisabledReason(state, 2),
                            },
                            {
                                id: "AGENT_DRAW_VINE",
                                label: <>Pay <Coins>2</Coins> to draw 2 <Vine /></>,
                                disabledReason: moneyDisabledReason(state, 2),
                            },
                        ],
                    });
                } else {
                    return endVisitor(gainCoins(5, discardCards(action.cards!, state)));
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "AGENT_DISCARD":
                        return promptToDiscard(2, state);
                    case "AGENT_DRAW_VISITOR":
                        return endVisitor(
                            drawCards(payCoins(2, state), action._key!, { winterVisitor: 2 })
                        );
                    case "AGENT_DRAW_VINE":
                        return endVisitor(
                            drawCards(payCoins(2, state), action._key!, { vine: 2 })
                        );
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    ampelograph: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptToChooseVineCard(state, { bypassFieldLimit: true });
                    case "vine":
                        return promptToPlant(state, card.id, { bypassFieldLimit: true });
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                const fieldId = action.fields[0]
                state = plantVineInField(fieldId, state);
                const field = state.players[state.currentTurn.playerId].fields[fieldId];
                const yields = fieldYields(field);

                return endVisitor(
                    yields.red + yields.white <= field.value ? gainCoins(2, state) : state
                );
            default:
                return state;
        }
    },
    banker: summerVisitorReducers.banker,
    botanist: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        { id: "BOTANIST_GAIN_RED", label: <>Gain <Grape color="red">2</Grape></>, },
                        { id: "BOTANIST_GAIN_WHITE", label: <>Gain <Grape color="white">2</Grape></>, },
                        {
                            id: "BOTANIST_DISCARD",
                            label: <>Discard 1 <Grape /> to draw 4 <Vine /></>,
                            disabledReason: needGrapesDisabledReason(state),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "BOTANIST_GAIN_RED":
                        return endVisitor(placeGrapes(state, { red: 2 }));
                    case "BOTANIST_GAIN_WHITE":
                        return endVisitor(placeGrapes(state, { white: 2 }));
                    case "BOTANIST_DISCARD":
                        return promptToChooseGrape(state);
                    default:
                        return state;
                }
            case "CHOOSE_GRAPE":
                return endVisitor(
                    drawCards(discardGrapes(state, action.grapes), action._key!, { vine: 4 })
                );
            default:
                return state;
        }
    },
    cicerone: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        { id: "CICERONE_GAIN", label: <>Gain <Coins>4</Coins></>, },
                        {
                            id: "CICERONE_HARVEST",
                            label: <>Harvest 1 field</>,
                            disabledReason: harvestFieldDisabledReason(state),
                        },
                        {
                            id: "CICERONE_DRAW",
                            label: <>Discard 1 <Grape /> to draw 3 <Order /></>,
                            disabledReason: needGrapesDisabledReason(state),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "CICERONE_GAIN":
                        return endVisitor(gainCoins(4, state));
                    case "CICERONE_HARVEST":
                        return promptToHarvest(state);
                    case "CICERONE_DRAW":
                        return promptToChooseGrape(state);
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                return endVisitor(harvestField(state, action.fields[0]));
            case "CHOOSE_GRAPE":
                return endVisitor(
                    drawCards(discardGrapes(state, action.grapes), action._key!, { order: 3 })
                );
            default:
                return state;
        }
    },
    contractor: summerVisitorReducers.contractor,
    docent: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        { id: "DOCENT_GAIN", label: <>Gain <Coins>3</Coins></>, },
                        {
                            id: "DOCENT_MAKE",
                            label: <>Make up to 3 <WineGlass /></>,
                            disabledReason: needGrapesDisabledReason(state),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "DOCENT_GAIN":
                        return endVisitor(gainCoins(3, state));
                    case "DOCENT_MAKE":
                        return promptToMakeWine(state, /* upToN */ 3);
                    default:
                        return state;
                }
            case "MAKE_WINE":
                return endVisitor(makeWineFromGrapes(state, action.ingredients));
            default:
                return state;
        }
    },
    earlyBuyer: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptToChooseOrderCard(state);
                    case "order":
                        return promptToFillOrder(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_WINE":
                state = fillOrder(action.wines, state);
                return endVisitor(
                    state.players[state.currentTurn.playerId].victoryPoints <= 5
                        ? gainCoins(4, state)
                        : gainCoins(2, state)
                );
            default:
                return state;
        }
    },
    embezzler: (state, action) => {
        const promptToGainOrDraw = (state2: GameState) => {
            return promptForAction(state2, {
                choices: [
                    { id: "EMBEZZLER_GAIN", label: <>Gain <Coins>6</Coins></>, },
                    { id: "EMBEZZLER_DRAW", label: <>Draw 3 <Order /></>, },
                ],
            });
        };
        switch (action.type) {
            case "CHOOSE_CARDS":
                if (action.cards!.length === 1) {
                    return promptForAction(state, {
                        choices: [
                            { id: "EMBEZZLER_LOSE", label: <>Lose <VP>2</VP></>, },
                            {
                                id: "EMBEZZLER_DISCARD",
                                label: <>Discard 3 <Card /></>,
                                disabledReason: numCardsDisabledReason(state, 3),
                            },
                        ],
                    });
                } else {
                    return promptToGainOrDraw(discardCards(action.cards!, state));
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "EMBEZZLER_LOSE":
                        return promptToGainOrDraw(loseVP(2, state));
                    case "EMBEZZLER_DISCARD":
                        return promptToDiscard(3, state);
                    case "EMBEZZLER_GAIN":
                        return endVisitor(gainCoins(6, state));
                    case "EMBEZZLER_DRAW":
                        return endVisitor(drawCards(state, action._key!,  { order: 3 }));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    fortuneTeller: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return endVisitor(
                    drawCards(state, action._key!, {
                        winterVisitor: 2,
                        order: Object.values(state.players).some(p => p.victoryPoints >= 5) ? 1 : 0,
                    })
                );
            default:
                return state;
        }
    },
    freelancer: (state, action) => {
        const coupon: Coupon = { kind: "voucher", upToCost: maxStructureCost };

        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        ...cardTypesInPlay(state).map(type =>
                            ({ id: "FREELANCER_DRAW", data: type, label: <>Draw 1 <Card type={type} /></>, })
                        ),
                        {
                            id: "FREELANCER_BUILD",
                            label: <>Lose <VP>2</VP> to build 1 structure for free</>,
                            disabledReason: buildStructureDisabledReason(state, coupon),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "FREELANCER_DRAW":
                        return endVisitor(drawCards(state, action._key!, { [action.data as CardType]: 1 }));
                    case "FREELANCER_BUILD":
                        return promptToBuildStructure(state, coupon);
                    default:
                        return state;
                }
            case "BUILD_STRUCTURE":
                return endVisitor(buildStructure(state, action.structureId));
            default:
                return state;
        }
    },
    friendlyHelper: (state, action) => {
        const player = state.players[state.currentTurn.playerId];
        const upgradeCellar = player.structures.mediumCellar ? "largeCellar" : "mediumCellar";
        const cost = structures[upgradeCellar].cost - 3;

        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "FHELPER_UPGRADE",
                            label: <>Upgrade cellar at a <Coins>3</Coins> discount</>,
                            disabledReason: player.structures.largeCellar
                                ? "Your cellar is fully upgraded."
                                : moneyDisabledReason(state, cost),
                        },
                        ...(["red", "white"] as WineColor[]).map(color =>
                            ({
                                id: "FHELPER_GAIN",
                                data: color,
                                label: <>Gain <WineGlass color={color}>1</WineGlass></>,
                            })
                        ),
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "FHELPER_UPGRADE":
                        return endVisitor(buildStructure(payCoins(cost, state), upgradeCellar));
                    case "FHELPER_GAIN":
                        return endVisitor(
                            gainWine({ color: action.data as WineColor, value: 1 }, state)
                        );
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    grapeBuyer: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "GBUYER_GAIN1",
                            label: <>Pay <Coins>3</Coins> to gain <Grape color="white">1</Grape> and <Grape color="red">1</Grape></>,
                            disabledReason: moneyDisabledReason(state, 3),
                        },
                        {
                            id: "GBUYER_GAIN4",
                            label: <>Pay <Coins>5</Coins> to gain <Grape color="white">4</Grape> and <Grape color="red">4</Grape></>,
                            disabledReason: moneyDisabledReason(state, 5),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "GBUYER_GAIN1":
                        return endVisitor(placeGrapes(payCoins(3, state), { red: 1, white: 1 }));
                    case "GBUYER_GAIN4":
                        return endVisitor(placeGrapes(payCoins(5, state), { red: 4, white: 4 }));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    grapeMerchant: (state, action, pendingAction) => {
        const gMerchantAction = pendingAction as PlayVisitorPendingAction & {
            choice: "sell" | "gain";
        };
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "GMERCHANT_SELL",
                            label: <>Sell up to 3 <Grape /></>,
                            disabledReason: needGrapesDisabledReason(state),
                        },
                        {
                            id: "GMERCHANT_GAIN",
                            label: <>Discard 2 <Grape /> to gain <WineGlass color="blush">6</WineGlass></>,
                            disabledReason: needGrapesDisabledReason(state),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "GMERCHANT_SELL":
                        return promptToChooseGrapes(
                            setPendingAction({ ...gMerchantAction, choice: "sell" }, state),
                            { upToN: 3 }
                        );
                    case "GMERCHANT_GAIN":
                        return promptToChooseGrapes(
                            setPendingAction({ ...gMerchantAction, choice: "gain" }, state),
                            { numGrapes: 2 }
                        );
                    default:
                        return state;
                }
            case "CHOOSE_GRAPE":
                if (gMerchantAction.choice === "sell") {
                    const sellValue = 3 * action.grapes.reduce((sum, g) => sum += Math.ceil(g.value / 3), 0);
                    return endVisitor(
                        gainCoins(sellValue, discardGrapes(state, action.grapes))
                    );
                } else {
                    return endVisitor(
                        discardGrapes(gainWine({ color: "blush", value: 6 }, state), action.grapes)
                    );
                }
            default:
                return state;
        }
    },
    greenskeeper: (state, action, pendingAction) => {
        const greenskeeperAction = pendingAction as PlayVisitorPendingAction & {
            secondPlant: boolean;
        };
        switch (action.type) {
            case "CHOOSE_CARDS":
                if (!action.cards) {
                    // Passed on bonus vine plant
                    return endVisitor(state);
                }
                const card = action.cards[0];
                switch (card.type) {
                    case "visitor":
                        return promptToChooseVineCard(gainCoins(2, state));
                    case "vine":
                        return promptToPlant(state, card.id, {
                            bypassFieldLimit: pendingAction.hasBonus,
                        });
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                state = plantVineInField(action.fields[0], state);
                const canPlantAgain = !greenskeeperAction.secondPlant &&
                    plantVinesDisabledReason(state) === undefined &&
                    Object.values(state.players).some(p => p.victoryPoints >= 10);

                if (canPlantAgain) {
                    return promptToChooseVineCard(
                        setPendingAction({ ...greenskeeperAction, secondPlant: true }, state),
                        { optional: true, bypassFieldLimit: true }
                    );
                }
                return endVisitor(state);
            default:
                return state;
        }
    },
    miller: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const windmillBuilt = state.players[state.currentTurn.playerId].structures.windmill;
                const needWindmillDisabledReason = windmillBuilt ? undefined : "You haven't built a Windmill.";
                return promptForAction(state, {
                    choices: [
                        {
                            id: "MILLER_GAIN_RED",
                            label: <>Gain <Grape color="red">3</Grape></>,
                            disabledReason: needWindmillDisabledReason,
                        },
                        {
                            id: "MILLER_GAIN_WHITE",
                            label: <>Gain <Grape color="white">3</Grape></>,
                            disabledReason: needWindmillDisabledReason,
                        },
                        {
                            id: "MILLER_GAIN_VP",
                            label: <>Gain <VP>1</VP></>,
                            disabledReason: needWindmillDisabledReason,
                        },
                        {
                            id: "MILLER_BUILD",
                            label: <>Pay <Coins>2</Coins> to build a windmill</>,
                            disabledReason: windmillBuilt ? "You already built a Windmill." : undefined,
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "MILLER_GAIN_RED":
                        return endVisitor(placeGrapes(state, { red: 3 }));
                    case "MILLER_GAIN_WHITE":
                        return endVisitor(placeGrapes(state, { white: 3 }));
                    case "MILLER_GAIN_VP":
                        return endVisitor(gainVP(1, state));
                    case "MILLER_BUILD":
                        return endVisitor(buildStructure(payCoins(2, state), "windmill"));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    owner: (state, action) => {
        const [chooseAction, maybeEndVisitor] = makeChoose2Visitor(s => [
            {
                id: "OWNER_BUILD",
                label: <>Build 1 structure</>,
                disabledReason: buildStructureDisabledReason(s),
            },
            { id: "OWNER_DRAW", label: <>Draw 1 <Order /></>, },
            {
                id: "OWNER_PLANT",
                label: <>Plant 1 <Vine /></>,
                disabledReason: plantVinesDisabledReason(s),
            },
        ]);

        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return chooseAction(
                            state.players[state.currentTurn.playerId].structures.windmill
                                ? gainVP(1, state)
                                : state
                        );
                    case "vine":
                        return promptToPlant(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                state = chooseAction(state, action.choice);
                switch (action.choice) {
                    case "OWNER_BUILD":
                        return promptToBuildStructure(state);
                    case "OWNER_DRAW":
                        return maybeEndVisitor(drawCards(state, action._key!, { order: 1 }));
                    case "OWNER_PLANT":
                        return promptToChooseVineCard(state);
                    default:
                        return state;
                }
            case "BUILD_STRUCTURE":
                const { cost } = structures[action.structureId];
                return maybeEndVisitor(buildStructure(payCoins(cost, state), action.structureId));
            case "CHOOSE_FIELD":
                return maybeEndVisitor(plantVineInField(action.fields[0], state));
            default:
                return state;
        }
    },
    peasant: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        state = drawCards(state, action._key!, { order: 1 });

                        return promptForAction(state, {
                            choices: [
                                {
                                    id: "PEASANT_PLANT",
                                    label: <>Plant 1 <Vine /></>,
                                    disabledReason: plantVinesDisabledReason(state, {
                                        bypassStructures: true
                                    }),
                                },
                                { id: "PEASANT_GAIN", label: <>Gain <Coins>2</Coins></>, },
                            ],
                        });
                    case "vine":
                        return promptToPlant(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "PEASANT_PLANT":
                        return promptToChooseVineCard(state, { bypassStructures: true });
                    case "PEASANT_GAIN":
                        return endVisitor(gainCoins(2, state));
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                return endVisitor(plantVineInField(action.fields[0], state));
            default:
                return state;
        }
    },
    philanthropist: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        { id: "PHILANTHROPIST_GAIN", label: <>Gain <Coins>3</Coins></>, },
                        { id: "PHILANTHROPIST_DRAW", label: <>Draw 1 <Order /> and 1 <WinterVisitor /></>, },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "PHILANTHROPIST_GAIN":
                        return endVisitor(gainCoins(3, state));
                    case "PHILANTHROPIST_DRAW":
                        return endVisitor(drawCards(state, action._key!, {
                            order: 1,
                            winterVisitor: 1,
                        }));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    plantReorganizer: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptForAction(state, {
                            choices: cardTypesInPlay(state).map(type => ({
                                id: "PREORGANIZER_DRAW",
                                data: type,
                                label: <>Draw <Vine /><Card type={type} /></>,
                                disabledReason: uprootDisabledReason(state),
                            })),
                        });
                    case "vine":
                        return promptToPlant(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                if (action.choice !== "PREORGANIZER_DRAW") {
                    return state;
                }
                const type = action.data as CardType;
                return promptToUproot(drawCards(state, action._key!, {
                    [type]: 1,
                    vine: type === "vine" ? 2 : 1,
                }));
            case "CHOOSE_VINE":
                return promptToChooseVineCard(uprootVineFromField(action.vines[0], state));
            case "CHOOSE_FIELD":
                return endVisitor(plantVineInField(action.fields[0], state));
            default:
                return state;
        }
    },
    premiumWineDealer: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const cellar = state.players[state.currentTurn.playerId].cellar;
                return promptForAction(state, {
                    choices: [
                        { id: "PWDEALER_GAIN", label: <>Gain <Coins>3</Coins></>, },
                        {
                            id: "PWDEALER_SPARKLING",
                            label: <>Pay <Coins>9</Coins> to gain <WineGlass color="sparkling">7</WineGlass></>,
                            disabledReason: moneyDisabledReason(state, 9) ||
                                (cellar.sparkling[6] ? "You already have one." : undefined),
                        },
                        {
                            id: "PWDEALER_BLUSH",
                            label: <>Pay <Coins>9</Coins> to gain <WineGlass color="blush">7</WineGlass></>,
                            disabledReason: moneyDisabledReason(state, 9) ||
                                (cellar.blush[6] ? "You already have one." : undefined),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "PWDEALER_GAIN":
                        return endVisitor(gainCoins(3, state));
                    case "PWDEALER_SPARKLING":
                        return endVisitor(
                            gainWine({ color: "sparkling", value: 7 }, payCoins(9, state))
                        );
                    case "PWDEALER_BLUSH":
                        return endVisitor(
                            gainWine({ color: "blush", value: 7 }, payCoins(9, state))
                        );
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    reorganizer: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                if (action.cards!.length === 1) {
                    return promptToDiscard(2, state);
                } else {
                    return promptForAction(discardCards(action.cards!, state), {
                        choices: [
                            { id: "REORGANIZER_GAIN", label: <>Gain <Coins>5</Coins></>, },
                            {
                                id: "REORGANIZER_RED",
                                label: <>Gain <Grape color="red">2</Grape></>,
                            },
                            {
                                id: "REORGANIZER_WHITE",
                                label: <>Gain <Grape color="white">2</Grape></>,
                            },
                        ],
                    });
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "REORGANIZER_GAIN":
                        return endVisitor(gainCoins(5, state));
                    case "REORGANIZER_RED":
                        return endVisitor(placeGrapes(state, { red: 2 }));
                    case "REORGANIZER_WHITE":
                        return endVisitor(placeGrapes(state, { white: 2 }));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    sculptor: (state, action, pendingAction) => {
        const player = state.players[state.currentTurn.playerId];
        const sculptorAction = pendingAction as PlayVisitorPendingAction & {
            secondPlant?: boolean
        };
        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptForAction(state, {
                            choices: [
                                { id: "SCULPTOR_GAIN", label: <>Gain <Coins>1</Coins> per field you own</> },
                                {
                                    id: "SCULPTOR_LOSE",
                                    label: <>Lose <Residuals>1</Residuals> to gain <WineGlass color="blush">4</WineGlass></>,
                                    disabledReason: residualPaymentsDisabledReason(state, 1) || (
                                        player.structures.mediumCellar
                                            ? undefined
                                            : "You don't have a Medium Cellar."
                                    ),
                                },
                                {
                                    id: "SCULPTOR_PLANT",
                                    label: <>Plant up to 2 <Vine /></>,
                                    disabledReason: plantVinesDisabledReason(state),
                                },
                            ],
                        });
                    case "vine":
                        return promptToPlant(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "SCULPTOR_GAIN":
                        const numFieldsOwned = Object.values(player.fields)
                            .filter(f => !f.sold).length;
                        return endVisitor(gainCoins(numFieldsOwned, state));

                    case "SCULPTOR_LOSE":
                        return endVisitor(gainWine({ color: "blush", value: 4 }, loseResiduals(1, state)));

                    case "SCULPTOR_PLANT":
                        return promptToChooseVineCard(state);

                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                state = plantVineInField(action.fields[0], state);
                const canPlantAgain = !sculptorAction.secondPlant &&
                    plantVinesDisabledReason(state) === undefined;

                return canPlantAgain
                    ? promptToChooseVineCard(
                        setPendingAction({ ...sculptorAction, secondPlant: true }, state),
                        { optional: true }
                    )
                    : endVisitor(state);

            default:
                return state;
        }
    },
    sommelier: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const builtTRoom = state.players[state.currentTurn.playerId].structures.tastingRoom;
                return promptForAction(state, {
                    choices: [
                        {
                            id: "SOMMELIER_DISCARD",
                            label: <>Discard 1 <WineGlass /> to gain <VP>1</VP></>,
                            disabledReason: builtTRoom ? undefined : "You haven't built the Tasting Room",
                        },
                        {
                            id: "SOMMELIER_BUILD",
                            label: <>Pay <Coins>2</Coins> to build the Tasting Room</>,
                            disabledReason: moneyDisabledReason(state, 2) ||
                                (builtTRoom ? "You already built the Tasting Room." : undefined),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "SOMMELIER_DISCARD":
                        return promptToChooseWine(state);
                    case "SOMMELIER_BUILD":
                        return endVisitor(buildStructure(payCoins(2, state), "tastingRoom"));
                    default:
                        return state;
                }
            case "CHOOSE_WINE":
                return endVisitor(gainVP(1, discardWines(state, action.wines)));
            default:
                return state;
        }
    },
    supporter: (state, action) => {
        const [chooseAction, maybeEndVisitor] = makeChoose2Visitor(s => [
            { id: "SUPPORTER_VINE", label: <>Draw 1 <Vine /></>, },
            { id: "SUPPORTER_GAIN", label: <>Gain <Coins>2</Coins></>, },
            { id: "SUPPORTER_ORDER", label: <>Draw 1 <Order /></>, },
        ]);

        switch (action.type) {
            case "CHOOSE_CARDS":
                return chooseAction(state);
            case "CHOOSE_ACTION":
                state = chooseAction(state, action.choice);
                switch (action.choice) {
                    case "SUPPORTER_VINE":
                        return maybeEndVisitor(drawCards(state, action._key!, { vine: 1 }));
                    case "SUPPORTER_GAIN":
                        return maybeEndVisitor(gainCoins(2, state));
                    case "SUPPORTER_ORDER":
                        return maybeEndVisitor(drawCards(state, action._key!, { order: 1 }));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    traveller: (state, action) => {
        const bonusGain = state.players[state.currentTurn.playerId].structures.tastingRoom;
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        { id: "TRAVELLER_GAIN", label: <>Gain <Coins>3</Coins></>, },
                        {
                            id: "TRAVELLER_HARVEST",
                            label: <>Harvest up to 2 fields</>,
                            disabledReason: harvestFieldDisabledReason(state),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "TRAVELLER_GAIN":
                        return endVisitor(gainCoins(bonusGain ? 6 : 3, state));
                    case "TRAVELLER_HARVEST":
                        return promptToHarvest(state, 2);
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                return endVisitor(
                    gainCoins(bonusGain ? 3 : 0, harvestFields(state, action.fields))
                );
            default:
                return state;
        }
    },
    wineLover: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const tRoomBuilt = state.players[state.currentTurn.playerId].structures.tastingRoom;
                const needTRoomDisabledReason = tRoomBuilt ? undefined : "You haven't built a Tasting Room.";
                return promptForAction(state, {
                    choices: [
                        {
                            id: "WLOVER_RESIDUAL",
                            label: <>Gain <Residuals>1</Residuals></>,
                            disabledReason: needTRoomDisabledReason,
                        },
                        {
                            id: "WLOVER_RGRAPE",
                            label: <>Gain <Grape color="red">4</Grape></>,
                            disabledReason: needTRoomDisabledReason,
                        },
                        {
                            id: "WLOVER_WGRAPE",
                            label: <>Gain <Grape color="white">4</Grape></>,
                            disabledReason: needTRoomDisabledReason,
                        },
                        {
                            id: "WLOVER_BUILD",
                            label: <>Lose <Residuals>2</Residuals> to build a Tasting Room and gain <WineGlass>1</WineGlass></>,
                            disabledReason: residualPaymentsDisabledReason(state, 2) ||
                                (tRoomBuilt ? undefined : "You already have a a Tasting Room."),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "WLOVER_RESIDUAL":
                        return endVisitor(gainResiduals(1, state));
                    case "WLOVER_RGRAPE":
                        return endVisitor(placeGrapes(state, { red: 4 }));
                    case "WLOVER_WGRAPE":
                        return endVisitor(placeGrapes(state, { white: 4 }));
                    case "WLOVER_BUILD":
                        return promptForAction(
                            buildStructure(loseResiduals(2, state), "tastingRoom"),
                            {
                                choices: [
                                    { id: "WLOVER_RWINE", label: <>Gain <WineGlass color="red">1</WineGlass></>, },
                                    { id: "WLOVER_WWINE", label: <>Gain <WineGlass color="white">1</WineGlass></>, },
                                ],
                            }
                        );
                    case "WLOVER_RWINE":
                        return endVisitor(gainWine({ value: 1, color: "red" }, state));
                    case "WLOVER_WWINE":
                        return endVisitor(gainWine({ value: 1, color: "white" }, state));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    wineTrader: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        { id: "WTRADER_RGRAPE", label: <>Gain <Grape color="red">1</Grape></>, },
                        { id: "WTRADER_WGRAPE", label: <>Gain <Grape color="white">1</Grape></>, },
                        {
                            id: "WTRADER_RWINE",
                            label: <>Pay <Coins>6</Coins> to gain <WineGlass color="red">7</WineGlass></>,
                            disabledReason: moneyDisabledReason(state, 6),
                        },
                        {
                            id: "WTRADER_WWINE",
                            label: <>Pay <Coins>6</Coins> to gain <WineGlass color="white">7</WineGlass></>,
                            disabledReason: moneyDisabledReason(state, 6),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "WTRADER_RGRAPE":
                        return endVisitor(placeGrapes(state, { red: 1 }));
                    case "WTRADER_WGRAPE":
                        return endVisitor(placeGrapes(state, { white: 1 }));
                    case "WTRADER_RWINE":
                        return endVisitor(gainWine({ color: "red", value: 7 }, payCoins(6, state)));
                    case "WTRADER_WWINE":
                        return endVisitor(gainWine({ color: "white", value: 7 }, payCoins(6, state)));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    writer: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "WRITER_GAIN",
                            label: <>Discard 1 <WineGlass /> to gain <Residuals>2</Residuals></>,
                            disabledReason: needWineDisabledReason(state),
                        },
                        {
                            id: "WRITER_LOSE",
                            label: <>
                                Lose <Residuals>2</Residuals> to gain <Grape>4</Grape> or <WineGlass>4</WineGlass>
                            </>,
                            disabledReason: residualPaymentsDisabledReason(state, 2),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                const mediumCellarBuilt = state.players[state.currentTurn.playerId].structures.mediumCellar;
                switch (action.choice) {
                    case "WRITER_GAIN":
                        return promptToChooseWine(state);
                    case "WRITER_LOSE":
                        const mediumCellarDisabledReason = mediumCellarBuilt ? undefined : "Requires a Medium Cellar.";
                        return promptForAction(loseResiduals(2, state), {
                            choices: [
                                ...(["red", "white"] as GrapeColor[]).map(color => ({
                                    id: "WRITER_GRAPE",
                                    data: color,
                                    label: <>Gain <Grape color={color}>4</Grape></>,
                                })),
                                ...(["red", "white", "blush"] as WineColor[]).map(color => ({
                                    id: "WRITER_WINE",
                                    data: color,
                                    label: <>
                                        Gain <WineGlass color={color}>
                                            {color === "blush" || mediumCellarBuilt ? 4 : 3}
                                        </WineGlass>
                                    </>,
                                    disabledReason: color === "blush" ? mediumCellarDisabledReason : undefined,
                                }))
                            ],
                        });
                    case "WRITER_GRAPE":
                        return endVisitor(placeGrapes(state, { [action.data as GrapeColor]: 4 }));
                    case "WRITER_WINE":
                        return endVisitor(
                            gainWine({ color: action.data as WineColor, value: mediumCellarBuilt ? 4 : 3 }, state)
                        );
                    default:
                        return state;
                }
            case "CHOOSE_WINE":
                return endVisitor(gainResiduals(2, discardWines(state, action.wines)));
            default:
                return state;
        }
    },
};
