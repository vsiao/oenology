import * as React from "react";
import { default as VP } from "../../game-views/icons/VictoryPoints";
import Coins from "../../game-views/icons/Coins";
import Worker from "../../game-views/icons/Worker";
import Card, { SummerVisitor, Vine, Order, WinterVisitor } from "../../game-views/icons/Card";
import {
    buildStructure,
    gainVP,
    gainCoins,
    trainWorker,
    payCoins,
    gainResiduals,
    loseResiduals,
    loseVP,
    updatePlayer,
} from "../shared/sharedReducers";
import GameState, { PlayVisitorPendingAction, WorkerPlacementTurn, WineColor, WorkerPlacement, CardType } from "../GameState";
import {
    promptForAction,
    promptToMakeWine,
    promptToBuildStructure,
    promptToChooseWine,
    promptToChooseOrderCard,
    promptToFillOrder,
    promptToHarvest,
    promptToChooseCard,
    promptToChooseGrapes,
    promptToChooseVisitor,
    promptToDiscard,
    promptToChooseGrape,
} from "../prompts/promptReducers";
import { GameAction } from "../gameActions";
import { visitorCards, winterVisitorCards, rhineWinterVisitorCards } from "./visitorCards";
import {
    fillOrderDisabledReason,
    moneyDisabledReason,
    needGrapesDisabledReason,
    trainWorkerDisabledReason,
    needWineDisabledReason,
    numCardsDisabledReason,
    harvestFieldDisabledReason,
    needCardOfTypeDisabledReason,
    residualPaymentsDisabledReason,
    cardTypesInPlay,
} from "../shared/sharedSelectors";
import WineGlass from "../../game-views/icons/WineGlass";
import Residuals from "../../game-views/icons/Residuals";
import { OrderId } from "../orderCards";
import { structures } from "../structures";
import Grape from "../../game-views/icons/Grape";
import { endVisitor, setPendingAction, makeEndVisitorAction, makeChoose2Visitor } from "../shared/turnReducers";
import { discardCards, drawCards, removeCardsFromHand, addCardsToHand } from "../shared/cardReducers";
import {
    ageCellar,
    discardWines,
    fillOrder,
    harvestField,
    makeWineFromGrapes,
    placeGrapes,
    harvestFields,
    discardGrapes,
    ageSingleWine,
} from "../shared/grapeWineReducers";
import { boardAction } from "../board/boardActionReducer";
import { boardActionsBySeason } from "../board/boardPlacements";

export const winterVisitorReducers: Record<
    keyof typeof winterVisitorCards,
    (state: GameState, action: GameAction, pendingAction: PlayVisitorPendingAction) => GameState
> = {
    assessor: (state, action) => {
        const player = state.players[state.currentTurn.playerId];
        const numCards = player.cardsInHand.length;
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        { id: "ASSESSOR_GAIN", label: <>Gain <Coins>1</Coins> for each card in your hand</>, },
                        {
                            id: "ASSESSOR_DISCARD",
                            label: <>Discard your hand to gain <VP>2</VP></>,
                            disabledReason: numCards < 1 ? "You don't have any cards." : undefined,
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "ASSESSOR_GAIN":
                        return endVisitor(gainCoins(numCards, state));
                    case "ASSESSOR_DISCARD":
                        return endVisitor(gainVP(2, discardCards(player.cardsInHand, state)));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    benefactor: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const cards = action.cards!;
                switch (cards.length) {
                    case 1:
                        return promptForAction(state, {
                            choices: [
                                { id: "BENEFACTOR_DRAW", label: <>Draw 1 <Vine /> and 1 <SummerVisitor /></>, },
                                {
                                    id: "BENEFACTOR_DISCARD",
                                    label: <>Discard 2 visitor cards to gain <VP>2</VP></>,
                                    disabledReason:
                                        needCardOfTypeDisabledReason(state, "visitor", { numCards: 2 }),
                                },
                            ],
                        });
                    case 2:
                        return endVisitor(gainVP(2, discardCards(cards, state)));
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "BENEFACTOR_DRAW":
                        return endVisitor(drawCards(state, action._key!, { vine: 1, summerVisitor: 1 }));
                    case "BENEFACTOR_DISCARD":
                        return promptToChooseCard(state, {
                            title: "Discard 2 visitors",
                            cards: state.players[state.currentTurn.playerId].cardsInHand
                                .filter(({ type }) => type === "visitor")
                                .map(id => ({ id })),
                            numCards: 2,
                        });
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    bottler: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptToMakeWine(state, /* upToN */ 3);
            case "MAKE_WINE":
                const wineByType: { [type in WineColor]?: boolean } = {};
                action.ingredients.forEach(w => wineByType[w.type] = true);
                const numTypes = Object.keys(wineByType).length;
                return endVisitor(gainVP(numTypes, makeWineFromGrapes(state, action.ingredients)));
            default:
                return state;
        }
    },
    craftsman: (state, action) => {
        const player = state.players[state.currentTurn.playerId];
        const upgradeCellar = player.structures.mediumCellar ? "largeCellar" : "mediumCellar";
        const cost = structures[upgradeCellar].cost;

        const [chooseAction, maybeEndVisitor] = makeChoose2Visitor(s => [
            { id: "CRAFTSMAN_DRAW", label: <>Draw 1 <Order /></>, },
            {
                id: "CRAFTSMAN_BUILD",
                label: <>Upgrade cellar at regular cost</>,
                disabledReason: player.structures.largeCellar
                    ? "Your cellar is fully upgraded."
                    : moneyDisabledReason(s, cost),
            },
            { id: "CRAFTSMAN_GAIN", label: <>Gain <VP>1</VP></>, },
        ]);

        switch (action.type) {
            case "CHOOSE_CARDS":
                return chooseAction(state);

            case "CHOOSE_ACTION":
                state = chooseAction(state, action.choice);
                switch (action.choice) {
                    case "CRAFTSMAN_DRAW":
                        return maybeEndVisitor(drawCards(state, action._key!, { order: 1 }));
                    case "CRAFTSMAN_BUILD":
                        return maybeEndVisitor(buildStructure(payCoins(cost, state), upgradeCellar));
                    case "CRAFTSMAN_GAIN":
                        return maybeEndVisitor(gainVP(1, state));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    crushExpert: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        { id: "CRUSHEX_GAIN", label: <>Gain <Coins>3</Coins> and draw 1 <Order /></>, },
                        {
                            id: "CRUSHEX_MAKE",
                            label: <>Make up to 3 <WineGlass /></>,
                            disabledReason: needGrapesDisabledReason(state),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "CRUSHEX_GAIN":
                        return endVisitor(drawCards(gainCoins(3, state), action._key!, { order: 1 }));
                    case "CRUSHEX_MAKE":
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
    crusher: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        { id: "CRUSHER_GAIN", label: <>Gain <Coins>3</Coins> and draw 1 <SummerVisitor /></>, },
                        {
                            id: "CRUSHER_DRAW",
                            label: <>Draw 1 <Order /> and make up to 2 <WineGlass /></>,
                            disabledReason: needGrapesDisabledReason(state),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "CRUSHER_GAIN":
                        return endVisitor(gainCoins(3, drawCards(state, action._key!, { summerVisitor: 1 })));
                    case "CRUSHER_DRAW":
                        return promptToMakeWine(drawCards(state, action._key!, { order: 1 }), /* upToN */ 2);
                    default:
                        return state;
                }
            case "MAKE_WINE":
                return endVisitor(makeWineFromGrapes(state, action.ingredients));
            default:
                return state;
        }
    },
    designer: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptToBuildStructure(state);
            case "BUILD_STRUCTURE":
                const { cost } = structures[action.structureId];
                state = buildStructure(payCoins(cost, state), action.structureId);
                const numBuilt = Object.values(state.players[state.currentTurn.playerId].structures)
                    .filter(built => built).length;
                return endVisitor(numBuilt >= 6 ? gainVP(2, state) : state);
            default:
                return state;
        }
    },
    exporter: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptForAction(state, {
                            choices: [
                                {
                                    id: "EXPORTER_MAKE",
                                    label: <>Make up to 2 <WineGlass /></>,
                                    disabledReason: needGrapesDisabledReason(state)
                                },
                                {
                                    id: "EXPORTER_FILL",
                                    label: <>Fill 1 <Order /></>,
                                    disabledReason: fillOrderDisabledReason(state)
                                },
                                {
                                    id: "EXPORTER_DISCARD",
                                    label: <>Discard 1 <Grape /> to gain <VP>2</VP></>,
                                    disabledReason: needGrapesDisabledReason(state)
                                }
                            ]
                        });
                    case "order":
                        return promptToFillOrder(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "EXPORTER_MAKE":
                        return promptToMakeWine(state, /* upToN */ 2);
                    case "EXPORTER_FILL":
                        return promptToChooseOrderCard(state);
                    case "EXPORTER_DISCARD":
                        return promptToChooseGrape(state);
                    default:
                        return state;
                }
            case "MAKE_WINE":
                return endVisitor(makeWineFromGrapes(state, action.ingredients));
            case "CHOOSE_WINE":
                return endVisitor(fillOrder(action.wines, state));
            case "CHOOSE_GRAPE":
                return endVisitor(gainVP(2, discardGrapes(state, action.grapes)));
            default:
                return state;
        }
    },
    governess: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "GOVERNESS_TRAIN",
                            label: <>Pay <Coins>3</Coins> to train 1 <Worker /></>,
                            disabledReason: trainWorkerDisabledReason(state, 3),
                        },
                        {
                            id: "GOVERNESS_DISCARD",
                            label: <>Discard 1 <WineGlass /> to gain <VP>2</VP></>,
                            disabledReason: needWineDisabledReason(state),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "GOVERNESS_TRAIN":
                        return endVisitor(trainWorker(payCoins(3, state), { availableThisYear: true }));
                    case "GOVERNESS_DISCARD":
                        return promptToChooseWine(state);
                    default:
                        return state;
                }
            case "CHOOSE_WINE":
                return endVisitor(gainVP(2, discardWines(state, action.wines)));
            default:
                return state;
        }
    },
    guestSpeaker: (state, action) => {
        const endVisitorAction = makeEndVisitorAction("allPlayers", (s, playerId) => {
            const playerName = <strong>{s.players[s.currentTurn.playerId].name}</strong>;
            return promptForAction(s, {
                playerId,
                choices: [
                    {
                        id: "GSPEAKER_TRAIN",
                        label: <>
                            Pay <Coins>1</Coins> to train 1 <Worker />
                            {playerId !== s.currentTurn.playerId
                                ? <> ({playerName} gains <VP>1</VP>)</>
                                : null}
                        </>,
                        disabledReason: trainWorkerDisabledReason(s, 1, playerId),
                    },
                    { id: "GSPEAKER_PASS", label: <>Pass</>, },
                ],
            });
        });
        switch (action.type) {
            case "CHOOSE_CARDS":
                return endVisitorAction(state);
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "GSPEAKER_TRAIN":
                        state = trainWorker(payCoins(1, state, action.playerId), {
                            playerId: action.playerId,
                        });
                        return endVisitorAction(
                            action.playerId !== state.currentTurn.playerId
                                ? gainVP(1, state)
                                : state,
                            action.playerId
                        );
                    case "GSPEAKER_PASS":
                        return endVisitorAction(state, action.playerId);
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    governor: (state, action, pendingAction) => {
        interface GovernorAction extends PlayVisitorPendingAction {
            actionOrder: string[];
        }
        const endVisitorAction = (state2: GameState, playerId?: string) => {
            const governorAction = (state2.currentTurn as WorkerPlacementTurn)
                .pendingAction! as GovernorAction;
            const actionOrder = governorAction.actionOrder;
            const i = playerId === undefined
                ? -1
                : actionOrder.findIndex(id => id === playerId);
            if (i === actionOrder.length - 1) {
                return endVisitor(state2);
            }
            const nextPlayerId = actionOrder[i + 1];
            const hasSummerVisitors = state2.players[nextPlayerId].cardsInHand
                .some(card => card.type === "visitor" && visitorCards[card.id].season === "summer");

            state2 = setPendingAction({
                ...governorAction,
                lastActionPlayerId: governorAction.actionPlayerId,
                actionPlayerId: nextPlayerId,
            }, state2);

            if (hasSummerVisitors) {
                return promptToChooseVisitor("summer", state2, {
                    playerId: nextPlayerId,
                    title: "Choose 1 card to give",
                });
            } else {
                return promptForAction(state2, {
                    playerId: nextPlayerId,
                    choices: [
                        {
                            id: "GOVERNOR_GIVE",
                            label: <>Give 1 <SummerVisitor /></>,
                            disabledReason: needCardOfTypeDisabledReason(state2, "summerVisitor", {
                                playerId: nextPlayerId
                            }),
                        },
                        {
                            id: "GOVERNOR_PASS",
                            label: <>
                                Pass (
                                    <strong>{state.players[state.currentTurn.playerId].name}</strong>
                                    {" "}gains <VP>1</VP>
                                )
                            </>,
                        },
                    ],
                });
            }
        };
        switch (action.type) {
            case "CHOOSE_CARDS":
                if (action.playerId === state.currentTurn.playerId) {
                    return promptForAction(state, {
                        title: "Choose opponents",
                        upToN: 3,
                        choices: Object.values(state.players)
                            .filter(p => p.id !== state.currentTurn.playerId)
                            .map(p => ({
                                id: p.id,
                                label: <strong>{p.name}</strong>
                            })),
                    })
                } else {
                    return endVisitorAction(
                        addCardsToHand(
                            action.cards!,
                            removeCardsFromHand(action.cards!, state, action.playerId)
                        ),
                        action.playerId
                    );
                }
            case "CHOOSE_ACTION_MULTI":
                const opponents = action.choices;
                const actionOrder = state.wakeUpOrder
                    .filter(pos => pos && opponents.includes(pos.playerId))
                    .map(pos => pos!.playerId);
                return endVisitorAction(
                    setPendingAction({ ...pendingAction, actionOrder }, state)
                );
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "GOVERNOR_GIVE":
                        throw new Error("Unexpected state: should prompt to choose card directly");
                    case "GOVERNOR_PASS":
                        return endVisitorAction(gainVP(1, state), action.playerId);
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    harvestExpert: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptToHarvest(state);
            case "CHOOSE_FIELD":
                return promptForAction(harvestField(state, action.fields[0]), {
                    choices: [
                        { id: "HEXPERT_DRAW", label: <>Draw 1 <Vine /></>, },
                        {
                            id: "HEXPERT_BUILD",
                            label: <>Pay <Coins>1</Coins> to build a Yoke</>,
                            disabledReason: state.players[state.currentTurn.playerId].structures.yoke
                                ? "You already built a yoke."
                                : moneyDisabledReason(state, 1),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "HEXPERT_DRAW":
                        return endVisitor(drawCards(state, action._key!, { vine: 1 }));
                    case "HEXPERT_BUILD":
                        return endVisitor(buildStructure(payCoins(1, state), "yoke"));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    harvester: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptToHarvest(state, 2);
            case "CHOOSE_FIELD":
                return promptForAction(harvestFields(state, action.fields), {
                    choices: [
                        { id: "HARVESTER_COINS", label: <>Gain <Coins>2</Coins></>, },
                        { id: "HARVESTER_VP", label: <>Gain <VP>1</VP></>, },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "HARVESTER_COINS":
                        return endVisitor(gainCoins(2, state));
                    case "HARVESTER_VP":
                        return endVisitor(gainVP(1, state));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    jackOfAllTrades: (state, action) => {
        const [chooseAction, maybeEndVisitor] = makeChoose2Visitor(s => [
            {
                id: "JACK_HARVEST",
                label: <>Harvest 1 field</>,
                disabledReason: harvestFieldDisabledReason(s),
            },
            {
                id: "JACK_MAKE",
                label: <>Make up to 2 <WineGlass /></>,
                disabledReason: needGrapesDisabledReason(s),
            },
            {
                id: "JACK_FILL",
                label: <>Fill 1 <Order /></>,
                disabledReason: fillOrderDisabledReason(s),
            },
        ]);

        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return chooseAction(state);
                    case "order":
                        return promptToFillOrder(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                state = chooseAction(state, action.choice);
                switch (action.choice) {
                    case "JACK_HARVEST":
                        return promptToHarvest(state);
                    case "JACK_MAKE":
                        return promptToMakeWine(state, /* upToN */ 2);
                    case "JACK_FILL":
                        return promptToChooseOrderCard(state);
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                return maybeEndVisitor(harvestField(state, action.fields[0]));
            case "MAKE_WINE":
                return maybeEndVisitor(makeWineFromGrapes(state, action.ingredients));
            case "CHOOSE_WINE":
                return maybeEndVisitor(fillOrder(action.wines, state));
            default:
                return state;
        }
    },
    judge: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        { id: "JUDGE_DRAW", label: <>Draw 2 <SummerVisitor /></>, },
                        {
                            id: "JUDGE_DISCARD",
                            label: <>Discard 1 <WineGlass /> of value 4 or more to gain <VP>3</VP></>,
                            disabledReason: needWineDisabledReason(state, 4)
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "JUDGE_DRAW":
                        return endVisitor(drawCards(state, action._key!, { summerVisitor: 2 }));
                    case "JUDGE_DISCARD":
                        return promptToChooseWine(state, { minValue: 4 });
                    default:
                        return state;
                }
            case "CHOOSE_WINE":
                return endVisitor(gainVP(3, discardWines(state, action.wines)));
            default:
                return state;
        }
    },
    laborer: (state, action) => {
        const [chooseAction, maybeEndVisitor] = makeChoose2Visitor((s, numChosen) => {
            const maybeLoseVp = numChosen > 0 ? <> (lose <VP>1</VP>)</> : null;
            return [
                {
                    id: "LABORER_HARVEST",
                    label: <>Harvest up to 2 fields{maybeLoseVp}</>,
                    disabledReason: harvestFieldDisabledReason(s),
                },
                {
                    id: "LABORER_MAKE",
                    label: <>Make up to 3 <WineGlass />{maybeLoseVp}</>,
                    disabledReason: needGrapesDisabledReason(s),
                },
                ...(numChosen > 0
                    ? [{ id: "LABORER_PASS", label: <>Pass</>, }]
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
                    /* loseVPOnMulti */ action.choice !== "LABORER_PASS"
                );
                switch (action.choice) {
                    case "LABORER_HARVEST":
                        return promptToHarvest(state, 2);
                    case "LABORER_MAKE":
                        return promptToMakeWine(state, /* upToN */ 3);
                    case "LABORER_PASS":
                        return endVisitor(state);
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                return maybeEndVisitor(harvestFields(state, action.fields));
            case "MAKE_WINE":
                return maybeEndVisitor(makeWineFromGrapes(state, action.ingredients));
            default:
                return state;
        }
    },
    manager: (state, action, pendingAction) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const { spring, summer, fall } = boardActionsBySeason(state);
                return promptForAction(state, {
                    choices: [...spring, ...summer, ...fall]
                        .map(a => ({
                            id: a.type,
                            label: a.label(state, -1),
                            disabledReason: a.disabledReason(state, -1),
                        }))
                });
            case "CHOOSE_ACTION":
                return boardAction(
                    action.choice as WorkerPlacement,
                    {
                        ...state,
                        currentTurn: {
                            ...state.currentTurn as WorkerPlacementTurn,
                            managerPendingAction: pendingAction,
                        },
                    },
                    action._key!
                );
            default:
                return state;
        }
    },
    marketer: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptForAction(state, {
                            choices: [
                                { id: "MARKETER_DRAW", label: <>Draw 2 <SummerVisitor /> and gain <Coins>1</Coins></>, },
                                {
                                    id: "MARKETER_FILL",
                                    label: <>Fill 1 <Order /> and gain <VP>1</VP> extra</>,
                                    disabledReason: fillOrderDisabledReason(state),
                                },
                            ],
                        });
                    case "order":
                        return promptToFillOrder(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "MARKETER_DRAW":
                        return endVisitor(gainCoins(1, drawCards(state, action._key!, { summerVisitor: 2 })));
                    case "MARKETER_FILL":
                        return promptToChooseOrderCard(state);
                    default:
                        return state;
                }
            case "CHOOSE_WINE":
                return endVisitor(fillOrder(action.wines, state, { bonusVP: true }));
            default:
                return state;
        }
    },
    masterVintner: (state, action, pendingAction) => {
        const player = state.players[state.currentTurn.playerId];
        const upgradeCellar = player.structures.mediumCellar ? "largeCellar" : "mediumCellar";
        const cost = structures[upgradeCellar].cost - 2;
        const vintnerAction = pendingAction as PlayVisitorPendingAction & { orderId: OrderId; };

        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptForAction(state, {
                            choices: [
                                {
                                    id: "MVINTNER_UPGRADE",
                                    label: <>Upgrade cellar at a <Coins>2</Coins> discount</>,
                                    disabledReason: player.structures.largeCellar
                                        ? "Your cellar is fully upgraded."
                                        : moneyDisabledReason(state, cost),
                                },
                                {
                                    id: "MVINTNER_FILL",
                                    label: <>Age 1 <WineGlass /> and fill 1 <Order /></>,
                                    disabledReason: needWineDisabledReason(state) ||
                                        needCardOfTypeDisabledReason(state, "order"),
                                },
                            ],
                        });
                    case "order":
                        return promptToFillOrder(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "MVINTNER_UPGRADE":
                        return endVisitor(buildStructure(payCoins(cost, state), upgradeCellar));
                    case "MVINTNER_FILL":
                        return promptToChooseWine(state);
                    default:
                        return state;
                }
            case "CHOOSE_WINE":
                if (!vintnerAction.orderId) {
                    // Haven't started filling an order yet: age the chosen wine
                    const wine = action.wines[0];
                    return promptToChooseOrderCard(ageSingleWine(wine, state));
                } else {
                    return endVisitor(fillOrder(action.wines, state));
                }
            default:
                return state;
        }
    },
    merchant: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptForAction(state, {
                            choices: [
                                {
                                    id: "MERCHANT_PLACE",
                                    label: <>Pay <Coins>3</Coins> to place <Grape color="red">1</Grape> and <Grape color="white">1</Grape></>,
                                    disabledReason: moneyDisabledReason(state, 3),
                                },
                                {
                                    id: "MERCHANT_FILL",
                                    label: <>Fill 1 <Order /> and gain <VP>1</VP> extra</>,
                                    disabledReason: fillOrderDisabledReason(state),
                                },
                            ],
                        });
                    case "order":
                        return promptToFillOrder(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "MERCHANT_PLACE":
                        return endVisitor(placeGrapes(payCoins(3, state), { red: 1, white: 1 }));
                    case "MERCHANT_FILL":
                        return promptToChooseOrderCard(state);
                    default:
                        return state;
                }
            case "CHOOSE_WINE":
                return endVisitor(fillOrder(action.wines, state, { bonusVP: true }));
            default:
                return state;
        }
    },
    mentor: (state, action, pendingAction) => {
        const endVisitorAction = makeEndVisitorAction("allPlayers", (s, playerId) => {
            const playerName = <strong>{s.players[s.currentTurn.playerId].name}</strong>;
            return promptForAction(s, {
                playerId,
                choices: [
                    {
                        id: "MENTOR_MAKE",
                        label: (
                            <>
                                Make up to 2 <WineGlass />
                                {playerId !== s.currentTurn.playerId
                                    ? <>({playerName} draws 1 <Vine /> or 1 <SummerVisitor />)</>
                                    : null}
                            </>
                        ),
                        disabledReason: needGrapesDisabledReason(s, playerId),
                    },
                    { id: "MENTOR_PASS", label: <>Pass</>, },
                ],
            });
        });
        switch (action.type) {
            case "CHOOSE_CARDS":
                return endVisitorAction(state);
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "MENTOR_MAKE":
                        return promptToMakeWine(state, /* upToN */ 2, action.playerId);

                    case "MENTOR_PASS":
                        return endVisitorAction(state, action.playerId);

                    case "MENTOR_DRAW_VINE":
                    case "MENTOR_DRAW_VISITOR":
                        return endVisitorAction(
                            drawCards(
                                state,
                                action._key!,
                                action.choice === "MENTOR_DRAW_VINE"
                                    ? { vine: 1 }
                                    : { summerVisitor: 1 }
                            ),
                            pendingAction.lastActionPlayerId
                        );
                    default:
                        return state;
                }
            case "MAKE_WINE":
                state = makeWineFromGrapes(state, action.ingredients, action.playerId);
                if (action.playerId === state.currentTurn.playerId) {
                    return endVisitorAction(state, action.playerId);
                }
                return promptForAction(
                    setPendingAction(
                        {
                            ...pendingAction,
                            lastActionPlayerId: action.playerId,
                            actionPlayerId: state.currentTurn.playerId,
                        },
                        state
                    ),
                    {
                        description: <p>
                            <strong>{state.players[action.playerId].name}</strong> made some wine.
                        </p>,
                        choices: [
                            { id: "MENTOR_DRAW_VINE", label: <>Draw 1 <Vine /></>, },
                            { id: "MENTOR_DRAW_VISITOR", label: <>Draw 1 <SummerVisitor /></>, },
                        ],
                    }
                );
            default:
                return state;
        }
    },
    motivator: (state, action) => {
        const endVisitorAction = makeEndVisitorAction("activePlayers", (s, playerId) => {
            const playerName = s.players[s.currentTurn.playerId].name;
            const placedGrande = Object.values(s.workerPlacements)
                .some(placements =>
                    placements.some(w => w && w.playerId === playerId && w.type === "grande")
                );
            return promptForAction(s, {
                playerId,
                choices: [
                    {
                        id: "MOTIVATOR_RETRIEVE",
                        label: <>
                            Retrieve <Worker workerType="grande" color={s.players[playerId].color} />
                            {playerId !== s.currentTurn.playerId
                                ? <> (<strong>{playerName}</strong> gains <VP>1</VP>)</>
                                : null}
                        </>,
                        disabledReason: placedGrande ? undefined : "You haven't placed your grande worker.",
                    },
                    {
                        id: "MOTIVATOR_PASS",
                        label: <>Pass</>,
                    },
                ],
            });
        });
        switch (action.type) {
            case "CHOOSE_CARDS":
                return endVisitorAction(state);

            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "MOTIVATOR_RETRIEVE":
                        const player = state.players[action.playerId];
                        state = {
                            ...(player.id !== state.currentTurn.playerId ? gainVP(1, state) : state),
                            workerPlacements: Object.fromEntries(
                                Object.entries(state.workerPlacements).map(([placement, workers]) => [
                                    placement,
                                    workers.map(w =>
                                        w && w.playerId === player.id && w.type === "grande" ? null : w
                                    ),
                                ])
                            ) as GameState["workerPlacements"],
                        };
                        return endVisitorAction(
                            updatePlayer(state, player.id, {
                                workers: player.workers.map(w =>
                                    w.type === "grande" ? { ...w, available: true } : w
                                )
                            }),
                            player.id
                        );
                    case "MOTIVATOR_PASS":
                        return endVisitorAction(state, action.playerId);
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    noble: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        { id: "NOBLE_GAIN", label: <>Pay <Coins>1</Coins> to gain <Residuals>1</Residuals></>, },
                        {
                            id: "NOBLE_LOSE",
                            label: <>Lose <Residuals>2</Residuals> to gain <VP>2</VP></>,
                            disabledReason: residualPaymentsDisabledReason(state, 2),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "NOBLE_GAIN":
                        return endVisitor(gainResiduals(1, payCoins(1, state)));
                    case "NOBLE_LOSE":
                        return endVisitor(gainVP(2, loseResiduals(2, state)));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    oenologist: (state, action) => {
        const player = state.players[state.currentTurn.playerId];

        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "OENOLOGIST_AGE",
                            label: <>Age all <WineGlass /> in your cellar twice</>,
                            disabledReason: needWineDisabledReason(state),
                        },
                        {
                            id: "OENOLOGIST_UPGRADE",
                            label: <>Pay <Coins>3</Coins> to upgrade your cellar to the next level</>,
                            disabledReason: player.structures.largeCellar
                                ? "Your cellar is fully upgraded."
                                : moneyDisabledReason(state, 3),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "OENOLOGIST_AGE":
                        return endVisitor(updatePlayer(state, player.id, {
                            cellar: ageCellar(player.cellar, player.structures, 2),
                        }));
                    case "OENOLOGIST_UPGRADE":
                        return endVisitor(buildStructure(
                            payCoins(3, state),
                            player.structures.mediumCellar ? "largeCellar" : "mediumCellar"
                        ));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    politician: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const { playerId } = state.currentTurn;
                if (state.players[playerId].victoryPoints < 0) {
                    return endVisitor(gainCoins(6, state));
                } else {
                    return endVisitor(
                        drawCards(state, action._key!, { vine: 1, summerVisitor: 1, order: 1 })
                    );
                }
            default:
                return state;
        }
    },
    professor: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const playerState = state.players[state.currentTurn.playerId];
                return promptForAction(state, {
                    choices: [
                        {
                            id: "PROFESSOR_TRAIN",
                            label: <>Pay <Coins>2</Coins> to train 1 <Worker /></>,
                            disabledReason: trainWorkerDisabledReason(state, 2),
                        },
                        {
                            id: "PROFESSOR_GAIN",
                            label: <>Gain <VP>2</VP> if you have a total of 6 <Worker /></>,
                            disabledReason:
                                playerState.workers.length < 6
                                    ? "You don't have enough workers."
                                    : undefined,
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "PROFESSOR_TRAIN":
                        return endVisitor(trainWorker(payCoins(2, state)));
                    case "PROFESSOR_GAIN":
                        return endVisitor(gainVP(2, state));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    promoter: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "PROMOTER_GRAPE",
                            label: <>Discard <Grape /></>,
                            disabledReason: needGrapesDisabledReason(state)
                        },
                        {
                            id: "PROMOTER_WINE",
                            label: <>Discard <WineGlass /></>,
                            disabledReason: needWineDisabledReason(state)
                        }
                    ]
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "PROMOTER_GRAPE":
                        return promptToChooseGrape(state);
                    case "PROMOTER_WINE":
                        return promptToChooseWine(state);
                    default:
                        return state;
                }
            case "CHOOSE_GRAPE":
                return endVisitor(gainVP(1, gainResiduals(1, discardGrapes(state, action.grapes))));
            case "CHOOSE_WINE":
                return endVisitor(gainVP(1, gainResiduals(1, discardWines(state, action.wines))));
            default:
                return state;
        }
    },
    queen: (state, action, pendingAction) => {
        const { tableOrder } = state;
        const i = tableOrder.indexOf(state.currentTurn.playerId);
        const playerId = tableOrder[(i + tableOrder.length - 1) % tableOrder.length];
        const playerName = <strong>{state.players[state.currentTurn.playerId].name}</strong>;

        switch (action.type) {
            case "CHOOSE_CARDS":
                const cards = action.cards!;
                if (cards.length === 1) {
                    return promptForAction(
                        setPendingAction({
                            ...pendingAction,
                            actionPlayerId: playerId,
                        }, state),
                        {
                            playerId,
                            choices: [
                                { id: "QUEEN_LOSE", label: <>Lose <VP>1</VP></>, },
                                {
                                    id: "QUEEN_GIVE",
                                    label: <>Give {playerName} 2 <Card /></>,
                                    disabledReason: numCardsDisabledReason(state, 2, playerId),
                                },
                                {
                                    id: "QUEEN_PAY",
                                    label: <>Pay {playerName} <Coins>3</Coins></>,
                                    disabledReason: moneyDisabledReason(state, 3, playerId),
                                },
                            ],
                        }
                    );
                } else {
                    return endVisitor(
                        addCardsToHand(cards, removeCardsFromHand(cards, state, playerId))
                    );
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "QUEEN_LOSE":
                        return endVisitor(loseVP(1, state, playerId));
                    case "QUEEN_GIVE":
                        return promptToChooseCard(state, {
                            title: <span>Give 2 cards to {playerName}</span>,
                            cards: state.players[playerId].cardsInHand.map(id => ({ id })),
                            numCards: 2,
                            playerId,
                        });
                    case "QUEEN_PAY":
                        return endVisitor(gainCoins(3, payCoins(3, state, playerId)));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    reaper: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptToHarvest(state, 3);
            case "CHOOSE_FIELD":
                state = harvestFields(state, action.fields);
                return endVisitor(action.fields.length === 3 ? gainVP(2, state) : state);
            default:
                return state;
        }
    },
    scholar: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        { id: "SCHOLAR_DRAW", label: <>Draw 2 <Order /></>, },
                        {
                            id: "SCHOLAR_TRAIN",
                            label: <>Pay <Coins>3</Coins> to train <Worker /></>,
                            disabledReason: trainWorkerDisabledReason(state, 3),
                        },
                        {
                            id: "SCHOLAR_BOTH",
                            label: <>Do both (lose <VP>1</VP>)</>,
                            disabledReason: trainWorkerDisabledReason(state, 3),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "SCHOLAR_DRAW":
                        return endVisitor(drawCards(state, action._key!, { order: 2 }));
                    case "SCHOLAR_TRAIN":
                        return endVisitor(trainWorker(payCoins(3, state)));
                    case "SCHOLAR_BOTH":
                        return endVisitor(
                            trainWorker(payCoins(3,
                                drawCards(loseVP(1, state), action._key!, { order: 2 })
                            ))
                        );
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    supervisor: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptToMakeWine(state, /* upToN */ 2);
            case "MAKE_WINE":
                const numSparkling = action.ingredients
                    .filter(({ type }) => type === "sparkling").length;
                return endVisitor(gainVP(numSparkling, makeWineFromGrapes(state, action.ingredients)));
            default:
                return state;
        }
    },
    taster: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptToChooseWine(state);
            case "CHOOSE_WINE":
                const wine = action.wines[0];
                const stateAfterDiscard = gainCoins(4, discardWines(state, [wine]));

                const mostValuableWine = Object.values(stateAfterDiscard.players)
                    .map((player) =>
                        Object.values(player.cellar)
                            .map((wines) => wines.lastIndexOf(true) + 1)
                            .reduce((v1, v2) => Math.max(v1, v2))
                    )
                    .reduce((v1, v2) => Math.max(v1, v2));

                if (wine.value > mostValuableWine) {
                    return endVisitor(gainVP(2, stateAfterDiscard));
                } else {
                    return endVisitor(stateAfterDiscard);
                }
            default:
                return state;
        }
    },
    teacher: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "TEACHER_MAKE",
                            label: <>Make up to 2 <WineGlass /></>,
                            disabledReason: needGrapesDisabledReason(state),
                        },
                        {
                            id: "TEACHER_TRAIN",
                            label: <>Pay <Coins>2</Coins> to train 1 <Worker /></>,
                            disabledReason: trainWorkerDisabledReason(state, 2),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "TEACHER_MAKE":
                        return promptToMakeWine(state, /* upToN */ 2);
                    case "TEACHER_TRAIN":
                        return endVisitor(trainWorker(payCoins(2, state)));
                    default:
                        return state;
                }
            case "MAKE_WINE":
                return endVisitor(makeWineFromGrapes(state, action.ingredients));
            default:
                return state;
        }
    },
    uncertifiedOenologist: (state, action) => {
        const player = state.players[state.currentTurn.playerId];

        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "UOENOLOGIST_AGE",
                            label: <>Age all <WineGlass /> in your cellar twice</>,
                        },
                        {
                            id: "UOENOLOGIST_UPGRADE",
                            label: <>Lose <VP>1</VP> to upgrade your cellar to the next level</>,
                            disabledReason: player.structures.largeCellar
                                ? "Your cellar is fully upgraded."
                                : undefined,
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "UOENOLOGIST_AGE":
                        return endVisitor(updatePlayer(state, player.id, {
                            cellar: ageCellar(player.cellar, player.structures, 2),
                        }));
                    case "UOENOLOGIST_UPGRADE":
                        return endVisitor(buildStructure(
                            loseVP(1, state),
                            player.structures.mediumCellar ? "largeCellar" : "mediumCellar"
                        ));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    uncertifiedTeacher: (state, action) => {
        const opponentsWith6 = Object.values(state.players)
            .filter(p => p.id !== state.currentTurn.playerId && p.workers.length >= 6)
            .length;
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "UTEACHER_LOSE",
                            label: <>Lose <VP>1</VP> to train 1 <Worker /></>,
                            disabledReason: trainWorkerDisabledReason(state, 0),
                        },
                        {
                            id: "UTEACHER_GAIN",
                            label: <>Gain <VP>1</VP> for each opponent who has at least 6 <Worker /></>,
                            disabledReason: opponentsWith6 > 0
                                ? undefined
                                : "There aren't any opponents with 6 workers.",
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "UTEACHER_LOSE":
                        return endVisitor(trainWorker(loseVP(1, state)));
                    case "UTEACHER_GAIN":
                        return endVisitor(gainVP(opponentsWith6, state));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    zymologist: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptToMakeWine(
                    state,
                    /* upToN */ 2,
                    state.currentTurn.playerId,
                    /* asZymologist */ true
                );
            case "MAKE_WINE":
                return endVisitor(makeWineFromGrapes(state, action.ingredients));
            default:
                return state;
        }
    },
};

export const rhineWinterVisitorReducers: Record<
    keyof typeof rhineWinterVisitorCards,
    (state: GameState, action: GameAction, pendingAction: PlayVisitorPendingAction) => GameState
> = {
    advertiser: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "ADVERTISER_GRAPE",
                            label: <>Discard 1 <Grape /> to gain <VP>1</VP> and <Residuals>1</Residuals></>,
                            disabledReason: needGrapesDisabledReason(state),
                        },
                        {
                            id: "ADVERTISER_WINE",
                            label: <>Discard 1 <WineGlass /> to gain <VP>1</VP> and <Residuals>1</Residuals></>,
                            disabledReason: needWineDisabledReason(state),
                        },
                        {
                            id: "ADVERTISER_DRAW",
                            label: <>Lose <Residuals>2</Residuals> to draw 3 <Order /></>,
                            disabledReason: residualPaymentsDisabledReason(state, 2),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "ADVERTISER_GRAPE":
                        return promptToChooseGrape(state);
                    case "ADVERTISER_WINE":
                        return promptToChooseWine(state);
                    case "ADVERTISER_DRAW":
                        return endVisitor(
                            drawCards(loseResiduals(2, state), action._key!, { order: 3 })
                        );
                    default:
                        return state;
                }
            case "CHOOSE_GRAPE":
                return endVisitor(gainVP(1, gainResiduals(1, discardGrapes(state, action.grapes))));
            case "CHOOSE_WINE":
                return endVisitor(gainVP(1, gainResiduals(1, discardWines(state, action.wines))));
            default:
                return state;
        }
    },
    bargainer: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return endVisitor(drawCards(state, action._key!, { order: 3 }));
            default:
                return state;
        }
    },
    brideToBe: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        { id: "BRIDETB_GAIN", label: <>Gain <Coins>3</Coins></> },
                        {
                            id: "BRIDETB_MAKE",
                            label: <>Make 1 <WineGlass color="sparkling" /></>,
                            disabledReason: needGrapesDisabledReason(state) ||
                                (state.players[state.currentTurn.playerId].structures.largeCellar
                                    ? undefined
                                    : "You need a Large Cellar."),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "BRIDETB_GAIN":
                        return endVisitor(gainCoins(3, state));
                    case "BRIDETB_MAKE":
                        return promptToChooseGrapes(state, { asBrideToBe: true });
                    default:
                        return state;
                }
            case "CHOOSE_GRAPE":
                const grapes = action.grapes;
                const cellarValue = Math.min(9, grapes[0].value + grapes[1].value);
                return endVisitor(
                    makeWineFromGrapes(state, [{ type: "sparkling", grapes, cellarValue }])
                );
            default:
                return state;
        }
    },
    bureaucrat: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const vp = state.players[state.currentTurn.playerId].victoryPoints;
                const fewestVP = Object.values(state.players)
                    .filter(p => p.id !== state.currentTurn.playerId)
                    .every(p => p.victoryPoints > vp);

                return promptForAction(state, {
                    choices: [
                        {
                            id: "BUREAUCRAT_GAIN",
                            label: <>Gain <Coins>5</Coins></>,
                            disabledReason: fewestVP ? undefined : "You have too many victory points.",
                        },
                        {
                            id: "BUREAUCRAT_DRAW",
                            label: <>Pay <Coins>1</Coins> to draw 1 <Vine />, 1 <WinterVisitor />, and 1 <Order /></>,
                            disabledReason: fewestVP
                                ? "You don't have enough victory points."
                                : moneyDisabledReason(state, 1),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "BUREAUCRAT_GAIN":
                        return endVisitor(gainCoins(5, state));
                    case "BUREAUCRAT_DRAW":
                        return endVisitor(
                            drawCards(payCoins(1, state), action._key!, { vine: 1, winterVisitor: 1, order: 1 })
                        );
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    cellarman: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptForAction(state, {
                            choices: [
                                {
                                    id: "CELLARMAN_PAY",
                                    label: <>
                                        Pay <Coins>4</Coins> to gain <Grape color="red">1</Grape> and <Grape color="white">1</Grape>
                                    </>,
                                    disabledReason: moneyDisabledReason(state, 4),
                                },
                                {
                                    id: "CELLARMAN_FILL",
                                    label: <>Fill 1 <Order /> and then gain <Coins>3</Coins>.</>,
                                    disabledReason: fillOrderDisabledReason(state),
                                },
                            ],
                        });
                    case "order":
                        return promptToFillOrder(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "CELLARMAN_PAY":
                        return endVisitor(placeGrapes(payCoins(4, state), { red: 1, white: 1 }));
                    case "CELLARMAN_FILL":
                        return promptToChooseOrderCard(state);
                    default:
                        return state;
                }
            case "CHOOSE_WINE":
                return endVisitor(gainCoins(3, fillOrder(action.wines, state)));
            default:
                return state;
        }
    },
    cellarmaster: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptToChooseWine(state);
            case "CHOOSE_WINE":
                const wine = action.wines[0];
                const stateAfterDiscard = gainCoins(4, discardWines(state, [wine]));

                const mostValuableWine = Object.values(stateAfterDiscard.players)
                    .map((player) =>
                        Object.values(player.cellar)
                            .map((wines) => wines.lastIndexOf(true) + 1)
                            .reduce((v1, v2) => Math.max(v1, v2))
                    )
                    .reduce((v1, v2) => Math.max(v1, v2));

                if (wine.value >= mostValuableWine) {
                    return endVisitor(gainVP(2, stateAfterDiscard));
                } else {
                    return endVisitor(stateAfterDiscard);
                }
            default:
                return state;
        }
    },
    // chemist: (state, action) => {
    //     switch (action.type) {
    //         case "CHOOSE_CARDS":
    //             const card = action.cards![0];
    //             switch (card.type) {
    //                 case "visitor":
    //                     return promptForAction(state, {
    //                         choices: [
    //                             {
    //                                 id: "CHEMIST_PLANT",
    //                                 label: <>Plant 2 <Vine /></>,
    //                                 disabledReason: plantVinesDisabledReason(state),
    //                             },
    //                             {
    //                                 id: "CHEMIST_HARVEST",
    //                                 label: <>Harvest devalued grapes to gain <VP>1</VP></>,
    //                                 disabledReason: harvestFieldDisabledReason(state),
    //                             }
    //                         ]
    //                     })
    //             }
    //     }
    // },
    craftsman: winterVisitorReducers.craftsman,
    duchess: (state, action, pendingAction) => {
        const duchessAction = pendingAction as PlayVisitorPendingAction & {
            secondFill: boolean;
        };
        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptForAction(state, {
                            choices: [
                                {
                                    id: "DUCHESS_GAIN",
                                    label: <>Pay <Coins>1</Coins> to gain <Residuals>1</Residuals></>,
                                    disabledReason: moneyDisabledReason(state, 1),
                                },
                                {
                                    id: "DUCHESS_LOSE",
                                    label: <>Lose <Residuals>2</Residuals> to fill 2 <Order /></>,
                                    disabledReason: fillOrderDisabledReason(state) ||
                                        needCardOfTypeDisabledReason(state, "order", { numCards: 2 }),
                                },
                            ],
                        });
                    case "order":
                        return promptToFillOrder(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "DUCHESS_GAIN":
                        return endVisitor(gainResiduals(1, payCoins(1, state)));
                    case "DUCHESS_LOSE":
                        return promptToChooseOrderCard(loseResiduals(2, state));
                    default:
                        return state;
                }
            case "CHOOSE_WINE":
                state = fillOrder(action.wines, state);

                if (!duchessAction.secondFill) {
                    return promptToChooseOrderCard(
                        setPendingAction({ ...duchessAction, secondFill: true }, state)
                    );
                }
                return endVisitor(state);
            default:
                return state;
        }
    },
    eliteOenologist: (state, action) => {
        const player = state.players[state.currentTurn.playerId];
        const upgradeCellar = player.structures.mediumCellar ? "largeCellar" : "mediumCellar";
        const cost = structures[upgradeCellar].cost - 4;

        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "EOENOLOGIST_AGE",
                            label: <>Age all <WineGlass /> in your cellar twice</>,
                            disabledReason: needWineDisabledReason(state),
                        },
                        {
                            id: "EOENOLOGIST_UPGRADE",
                            label: <>Upgrade your cellar at a <Coins>4</Coins> discount</>,
                            disabledReason: player.structures.largeCellar
                                ? "Your cellar is fully upgraded."
                                : moneyDisabledReason(state, cost),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "EOENOLOGIST_AGE":
                        return endVisitor(updatePlayer(state, player.id, {
                            cellar: ageCellar(player.cellar, player.structures, 2),
                        }));
                    case "EOENOLOGIST_UPGRADE":
                        return endVisitor(buildStructure(
                            payCoins(cost, state),
                            player.structures.mediumCellar ? "largeCellar" : "mediumCellar"
                        ));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    endorser: (state, action) => {
        const promptGainOrDraw = (state2: GameState): GameState => {
            return promptForAction(state2, {
                choices: [
                    { id: "ENDORSER_GAIN", label: <>Gain <VP>1</VP> and <Residuals>1</Residuals></>, },
                    { id: "ENDORSER_DRAW", label: <>Draw 3 <Order /></>, },
                ],
            });
        };
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "ENDORSER_GRAPE",
                            label: <>Discard 1 <Grape /></>,
                            disabledReason: needGrapesDisabledReason(state),
                        },
                        {
                            id: "ENDORSER_WINE",
                            label: <>Discard 1 <WineGlass /></>,
                            disabledReason: needWineDisabledReason(state),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "ENDORSER_GRAPE":
                        return promptToChooseGrape(state);
                    case "ENDORSER_WINE":
                        return promptToChooseWine(state);
                    case "ENDORSER_GAIN":
                        return endVisitor(gainResiduals(1, gainVP(1, state)));
                    case "ENDORSER_DRAW":
                        return endVisitor(drawCards(state, action._key!, { order: 3 }));
                    default:
                        return state;
                }
            case "CHOOSE_GRAPE":
                return promptGainOrDraw(discardGrapes(state, action.grapes));
            case "CHOOSE_WINE":
                return promptGainOrDraw(discardWines(state, action.wines));
            default:
                return state;
        }
    },
    enthusiast: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptForAction(state, {
                            choices: [
                                { id: "ENTHUSIAST_DRAW", label: <>Draw 2 <SummerVisitor /></>, },
                                {
                                    id: "ENTHUSIAST_FILL",
                                    label: <>Fill 1 <Order /> and draw 1 <Order /></>,
                                    disabledReason: fillOrderDisabledReason(state),
                                },
                            ],
                        });
                    case "order":
                        return promptToFillOrder(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "ENTHUSIAST_DRAW":
                        return endVisitor(drawCards(state, action._key!, { summerVisitor: 2 }));
                    case "ENTHUSIAST_FILL":
                        return promptToChooseOrderCard(state);
                    default:
                        return state;
                }
            case "CHOOSE_WINE":
                return endVisitor(
                    drawCards(fillOrder(action.wines, state), action._key!, { order: 1 })
                );
            default:
               return state;
        }
    },
    estateAgent: (state, action, pendingAction) => {
        const numFields = Object.values(state.players[state.currentTurn.playerId].fields)
            .filter(f => !f.sold)
            .length;
        const eaAction = pendingAction as PlayVisitorPendingAction & { numDrawn: number; };
        const maybeEndVisitor = (state2: GameState) => {
            if (eaAction.numDrawn === numFields) {
                return endVisitor(state2);
            }
            const numDrawn = (eaAction.numDrawn ?? 0) + 1;
            return promptForAction(
                setPendingAction({ ...eaAction, numDrawn }, state2),
                {
                    title: `Draw a card (${numDrawn} of ${numFields})`,
                    choices: cardTypesInPlay(state2).map(type => ({
                        id: "EAGENT_DRAW",
                        data: type,
                        label: <>Draw <Card type={type} /></>,
                    })),
                }
            );
        };
        switch (action.type) {
            case "CHOOSE_CARDS":
                return maybeEndVisitor(state);
            case "CHOOSE_ACTION":
                if (action.choice !== "EAGENT_DRAW") {
                    return state;
                }
                return maybeEndVisitor(
                    drawCards(state, action._key!, {
                        [action.data as CardType]: 1,
                    })
                );
            default:
                return state;
        }
    },
    grapeVendor: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptToChooseGrape(state);
            case "CHOOSE_GRAPE":
                const value = action.grapes[0].value;
                return promptForAction(discardGrapes(state, action.grapes), {
                    choices: [
                        {
                            id: "GVENDOR_GAIN",
                            data: value,
                            label: <>Gain <Coins>{value}</Coins></>,
                        },
                        {
                            id: "GVENDOR_DRAW",
                            data: Math.ceil(value / 2),
                            label: <>Draw {Math.ceil(value / 2)} <WinterVisitor /></>,
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                const bonusGain = state.players[state.currentTurn.playerId].structures.tastingRoom ? 4 : 0;
                switch (action.choice) {
                    case "GVENDOR_GAIN":
                        return endVisitor(gainCoins(action.data as number + bonusGain, state));
                    case "GVENDOR_DRAW":
                        return endVisitor(
                            drawCards(state, action._key!, { winterVisitor: action.data as number })
                        );
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    grapeWhisperer: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptToHarvest(state, 2);
            case "CHOOSE_FIELD":
                return endVisitor(gainCoins(2, harvestFields(state, action.fields)));
            default:
                return state;
        }
    },
    harvestExpert: winterVisitorReducers.harvestExpert,
    hiredHand: (state, action) => {
        const [chooseAction, maybeEndVisitor] = makeChoose2Visitor(s => [
            {
                id: "HHAND_HARVEST",
                label: <>Harvest 1 field</>,
                disabledReason: harvestFieldDisabledReason(s),
            },
            {
                id: "HHAND_MAKE",
                label: <>Make up to 2 <WineGlass /></>,
                disabledReason: needGrapesDisabledReason(s),
            },
            { id: "HHAND_GAIN", label: <>Gain <Coins>2</Coins></>, },
            {
                id: "HHAND_FILL",
                label: <>Fill 1 <Order /></>,
                disabledReason: fillOrderDisabledReason(s),
            },
        ]);

        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return chooseAction(state);
                    case "order":
                        return promptToFillOrder(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                state = chooseAction(state, action.choice);
                switch (action.choice) {
                    case "HHAND_HARVEST":
                        return promptToHarvest(state);
                    case "HHAND_MAKE":
                        return promptToMakeWine(state, /* upToN */ 2);
                    case "HHAND_GAIN":
                        return maybeEndVisitor(gainCoins(2, state));
                    case "HHAND_FILL":
                        return promptToChooseOrderCard(state);
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                return maybeEndVisitor(harvestField(state, action.fields[0]));
            case "MAKE_WINE":
                return maybeEndVisitor(makeWineFromGrapes(state, action.ingredients));
            case "CHOOSE_WINE":
                return maybeEndVisitor(fillOrder(action.wines, state));
            default:
                return state;
        }
    },
    laborer: winterVisitorReducers.laborer,
    lecturer: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "LECTURER_MAKE",
                            label: <>Make up to 3 <WineGlass /></>,
                            disabledReason: needGrapesDisabledReason(state),
                        },
                        {
                            id: "LECTURER_TRAIN",
                            label: <>Pay <Coins>3</Coins> to train 1 <Worker /></>,
                            disabledReason: trainWorkerDisabledReason(state, 3),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "LECTURER_MAKE":
                        return promptToMakeWine(state, /* upToN */ 3);
                    case "LECTURER_TRAIN":
                        return endVisitor(trainWorker(payCoins(3, state)));
                    default:
                        return state;
                }
            case "MAKE_WINE":
                return endVisitor(makeWineFromGrapes(state, action.ingredients));
            default:
                return state;
        }
    },
    lovebirds: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "LOVEBIRDS_GAIN",
                            label: <>Gain <Coins>1</Coins> and draw 1 <SummerVisitor /></>,
                        },
                        {
                            id: "LOVEBIRDS_MAKE",
                            label: <>Draw 1 <Order /> and make up to 2 <WineGlass /></>,
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "LOVEBIRDS_GAIN":
                        return endVisitor(
                            drawCards(gainCoins(1, state), action._key!, { summerVisitor: 1 })
                        );
                    case "LOVEBIRDS_MAKE":
                        return promptToMakeWine(
                            drawCards(state, action._key!, { order: 1 }),
                            /* upToN */ 2
                        );
                    default:
                        return state;
                }
            case "MAKE_WINE":
                return endVisitor(makeWineFromGrapes(state, action.ingredients));
            default:
                return state;
        }
    },
    premiumBuyer: (state, action) => {
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
                return endVisitor(fillOrder(action.wines, state, { asPremiumBuyer: true }));
            default:
                return state;
        }
    },
    researcher: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        { id: "RESEARCHER_DRAW", label: <>Draw 2 <Order /></>, },
                        {
                            id: "RESEARCHER_TRAIN",
                            label: <>Pay <Coins>3</Coins> to train 1 <Worker /></>,
                            disabledReason: trainWorkerDisabledReason(state, 3),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "RESEARCHER_DRAW":
                        return endVisitor(drawCards(state, action._key!, { order: 2 }));
                    case "RESEARCHER_TRAIN":
                        return endVisitor(trainWorker(payCoins(3, state)));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    rhineSailor: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                if (action.cards!.length === 1) {
                    return promptToDiscard(3, state);
                } else {
                    return endVisitor(
                        gainCoins(1, drawCards(discardCards(action.cards!, state), action._key!, { winterVisitor: 3 }))
                    );
                }
            default:
                return state;
        }
    },
    schoolTeacher: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "STEACHER_TRAIN",
                            label: <>Pay <Coins>4</Coins> to train 1 <Worker /> to use this year</>,
                            disabledReason: trainWorkerDisabledReason(state, 4),
                        },
                        {
                            id: "STEACHER_DISCARD",
                            label: <>Discard 1 <WineGlass /> to gain <VP>2</VP></>,
                            disabledReason: needWineDisabledReason(state),
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "STEACHER_TRAIN":
                        return endVisitor(
                            trainWorker(payCoins(4, state), { availableThisYear: true })
                        );
                    case "STEACHER_DISCARD":
                        return promptToChooseWine(state);
                    default:
                        return state;
                }
            case "CHOOSE_WINE":
                return endVisitor(gainVP(2, discardWines(state, action.wines)));
            default:
                return state;
        }
    },
    shipper: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptForAction(state, {
                            choices: [
                                {
                                    id: "SHIPPER_MAKE",
                                    label: <>Make up to 3 <WineGlass /></>,
                                    disabledReason: needGrapesDisabledReason(state),
                                },
                                {
                                    id: "SHIPPER_FILL",
                                    label: <>Fill 1 <Order /></>,
                                    disabledReason: fillOrderDisabledReason(state),
                                },
                                { id: "SHIPPER_GAIN", label: <>Gain <Coins>3</Coins></>, },
                            ],
                        });
                    case "order":
                        return promptToFillOrder(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "SHIPPER_MAKE":
                        return promptToMakeWine(state, /* upToN */ 3);
                    case "SHIPPER_FILL":
                        return promptToChooseOrderCard(state);
                    case "SHIPPER_GAIN":
                        return endVisitor(gainCoins(3, state));
                    default:
                        return state;
                }
            case "MAKE_WINE":
                return endVisitor(makeWineFromGrapes(state, action.ingredients));
            case "CHOOSE_WINE":
                return endVisitor(fillOrder(action.wines, state));
            default:
                return state;
        }
    },
    skeptic: (state, action, pendingAction) => {
        const player = state.players[state.currentTurn.playerId];
        const upgradeCellar = player.structures.mediumCellar ? "largeCellar" : "mediumCellar";
        const cost = structures[upgradeCellar].cost - 3;
        const skepticAction = pendingAction as PlayVisitorPendingAction & { orderId: OrderId; };

        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        return promptForAction(state, {
                            choices: [
                                {
                                    id: "SKEPTIC_UPGRADE",
                                    label: <>Upgrade cellar at a <Coins>3</Coins> discount</>,
                                    disabledReason: player.structures.largeCellar
                                        ? "Your cellar is fully upgraded."
                                        : moneyDisabledReason(state, cost),
                                },
                                {
                                    id: "SKEPTIC_FILL",
                                    label: <>Age 2 <WineGlass /> and fill 1 <Order /></>,
                                    disabledReason: needWineDisabledReason(state) ||
                                        needCardOfTypeDisabledReason(state, "order"),
                                },
                            ],
                        });
                    case "order":
                        return promptToFillOrder(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "SKEPTIC_UPGRADE":
                        return endVisitor(buildStructure(payCoins(cost, state), upgradeCellar));
                    case "SKEPTIC_FILL":
                        return promptToChooseWine(state, { numWines: 2 });
                    default:
                        return state;
                }
            case "CHOOSE_WINE":
                if (!skepticAction.orderId) {
                    // Haven't started filling an order yet: age the chosen wines
                    action.wines
                        // Sort in reverse value order so we can age each wine individually
                        // eg. if you tried to age both 3 & 4 value wines but starting with
                        //     the 3 first, it would see the 4 and devalue right back to 3.
                        .sort((w1, w2) => w2.value - w1.value)
                        .forEach(wine => {
                            state = ageSingleWine(wine, state);
                        });
                    return promptToChooseOrderCard(state);
                } else {
                    return endVisitor(fillOrder(action.wines, state));
                }
            default:
                return state;
        }
    },
    supervisor: winterVisitorReducers.supervisor,
    uncertifiedOenologist: winterVisitorReducers.uncertifiedOenologist,
    winterAgent: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                const bonusDraw = Object.values(state.players)
                    .filter(p => p.id !== state.currentTurn.playerId)
                    .some(p => p.victoryPoints >= 5);
                return endVisitor(
                    drawCards(state, action._key!, { summerVisitor: 2, order: bonusDraw ? 1 : 0 })
                );
            default:
                return state;
        }
    },
    zymologist: winterVisitorReducers.zymologist,
};
