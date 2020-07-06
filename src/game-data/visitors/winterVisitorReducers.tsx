import * as React from "react";
import { default as VP } from "../../game-views/icons/VictoryPoints";
import Coins from "../../game-views/icons/Coins";
import Worker from "../../game-views/icons/Worker";
import Card, { SummerVisitor, Vine, Order } from "../../game-views/icons/Card";
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
import GameState, { PlayVisitorPendingAction, WorkerPlacementTurn, WineColor, TokenMap } from "../GameState";
import {
    promptForAction,
    promptToMakeWine,
    promptToBuildStructure,
    promptToChooseWine,
    promptToChooseOrderCard,
    promptToFillOrder,
    promptToHarvest,
    promptToChooseCard,
    promptToChooseGrape,
} from "../prompts/promptReducers";
import { GameAction } from "../gameActions";
import { WinterVisitorId } from "./visitorCards";
import {
    fillOrderDisabledReason,
    moneyDisabledReason,
    needGrapesDisabledReason,
    trainWorkerDisabledReason,
    needWineDisabledReason,
    numCardsDisabledReason,
    harvestFieldDisabledReason,
    needCardOfTypeDisabledReason,
} from "../shared/sharedSelectors";
import WineGlass from "../../game-views/icons/WineGlass";
import Residuals from "../../game-views/icons/Residuals";
import { OrderId } from "../orderCards";
import { structures } from "../structures";
import Grape from "../../game-views/icons/Grape";
import { endVisitor, setPendingAction } from "../shared/turnReducers";
import { discardCards, drawCards, removeCardsFromHand, addCardsToHand } from "../shared/cardReducers";
import {
    ageCellar,
    ageSingle,
    discardWines,
    fillOrder,
    harvestField,
    makeWineFromGrapes,
    placeGrapes,
    harvestFields,
    discardGrapes,
} from "../shared/grapeWineReducers";
import { Choice } from "../prompts/PromptState";

export const winterVisitorReducers: Record<
    WinterVisitorId,
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
                state = buildStructure(state, action.structureId);
                const numBuilt = Object.values(state.players[state.currentTurn.playerId].structures)
                    .filter(built => built).length;
                return endVisitor(numBuilt >= 6 ? gainVP(2, state) : state);
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
                        return promptToChooseWine(state, { limit: 1 });
                    default:
                        return state;
                }
            case "CHOOSE_WINE":
                return endVisitor(gainVP(2, discardWines(state, action.wines)));
            default:
                return state;
        }
    },
    guestSpeaker: (state, action, pendingAction) => {
        const gspeakerAction = pendingAction as PlayVisitorPendingAction & {
            // list of players who have yet to compelte their main action (train worker or pass)
            mainActions: string[];
        };
        const endMainAction = (state2: GameState, playerId: string) => {
            const mainActions = gspeakerAction.mainActions.filter((id) => id !== playerId);
            state2 = setPendingAction({ ...gspeakerAction, mainActions }, state2);
            return mainActions.length === 0 ? endVisitor(state2) : state2;
        };
        switch (action.type) {
            case "CHOOSE_CARDS":
                state = setPendingAction(
                    { ...gspeakerAction, mainActions: Object.keys(state.players), },
                    state
                );
                if (state.playerId === null) {
                    return state;
                }
                const playerName = <strong>{state.players[state.currentTurn.playerId].name}</strong>;

                return promptForAction(
                    state,
                    {
                        playerId: state.playerId,
                        choices: [
                            {
                                id: "GSPEAKER_TRAIN",
                                label: <>
                                    Pay <Coins>1</Coins> to train 1 <Worker />
                                    {state.playerId !== state.currentTurn.playerId
                                        ? <>({playerName} gains <VP>1</VP>)</>
                                        : null}
                                </>,
                                disabledReason: trainWorkerDisabledReason(state, 1),
                            },
                            { id: "GSPEAKER_PASS", label: <>Pass</>, },
                        ],
                    }
                );
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "GSPEAKER_TRAIN":
                        state = trainWorker(payCoins(1, state, action.playerId), {
                            playerId: action.playerId,
                        });
                        return endMainAction(
                            state.playerId !== state.currentTurn.playerId
                                ? gainVP(1, state)
                                : state,
                            action.playerId
                        );
                    case "GSPEAKER_PASS":
                        return endMainAction(state, action.playerId);
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    // governor: (state, action, pendingAction) => {
    //     switch (action.type) {
    //         case "CHOOSE_CARDS":
    //         default:
    //             return state;
    //     }
    // },
    harvestExpert: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARDS":
                return promptToHarvest(state);
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "HEXPERT_DRAW":
                        return endVisitor(drawCards(state, action._key!, { vine: 1 }));
                    case "HEXPERT_BUILD":
                        return endVisitor(buildStructure(payCoins(1, state), "yoke"));
                    default:
                        return state;
                }
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
    jackOfAllTrades: (state, action, pendingAction) => {
        type ChoiceId = "JACK_HARVEST" | "JACK_MAKE" | "JACK_FILL";
        interface JackAction extends PlayVisitorPendingAction {
            usedChoices: { [K in ChoiceId]?: true };
        }
        const promptJackAction = (state2: GameState, jackAction: JackAction): GameState => {
            return promptForAction(
                state2,
                {
                    choices: [
                        {
                            id: "JACK_HARVEST",
                            label: <>Harvest 1 field</>,
                            disabledReason: harvestFieldDisabledReason(state2),
                        },
                        {
                            id: "JACK_MAKE",
                            label: <>Make up to 2 <WineGlass /></>,
                            disabledReason: needGrapesDisabledReason(state2),
                        },
                        {
                            id: "JACK_FILL",
                            label: <>Fill 1 <Order /></>,
                            disabledReason: fillOrderDisabledReason(state2),
                        },
                    ].filter(choice => !jackAction.usedChoices[choice.id as ChoiceId]),
                }
            );
        };
        const maybeEndVisitor = (state2: GameState): GameState => {
            const jackAction =
                (state2.currentTurn as WorkerPlacementTurn).pendingAction as JackAction;

            return Object.keys(jackAction.usedChoices).length === 2
                ? endVisitor(state2)
                : promptJackAction(state2, jackAction);
        };

        switch (action.type) {
            case "CHOOSE_CARDS":
                const card = action.cards![0];
                switch (card.type) {
                    case "visitor":
                        const jackAction: JackAction = { ...pendingAction, usedChoices: {}, };
                        return promptJackAction(setPendingAction(jackAction, state), jackAction);
                    case "order":
                        return promptToFillOrder(state, card.id);
                    default:
                        return state;
                }
            case "CHOOSE_ACTION":
                const jackAction = pendingAction as JackAction;
                state = setPendingAction({
                    ...jackAction,
                    usedChoices: {
                        ...jackAction.usedChoices,
                        [action.choice]: true,
                    },
                }, state);
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
                        return promptToChooseWine(state, { minValue: 4, limit: 1 });
                    default:
                        return state;
                }
            case "CHOOSE_WINE":
                return endVisitor(gainVP(3, discardWines(state, action.wines)));
            default:
                return state;
        }
    },
    laborer: (state, action, pendingAction) => {
        type ChoiceId = "LABORER_HARVEST" | "LABORER_MAKE";
        interface LaborerAction extends PlayVisitorPendingAction {
            usedChoices: { [K in ChoiceId]?: true };
        }
        const promptLaborerAction = (state2: GameState, { usedChoices }: LaborerAction): GameState => {
            const alreadyChose = Object.keys(usedChoices).length > 0;
            const maybeLoseVp = alreadyChose ? <> (lose <VP>1</VP>)</> : null;
            return promptForAction(state2, {
                choices: ([
                    {
                        id: "LABORER_HARVEST",
                        label: <>Harvest up to 2 fields{maybeLoseVp}</>,
                        disabledReason: harvestFieldDisabledReason(state2),
                    },
                    {
                        id: "LABORER_MAKE",
                        label: <>Make up to 3 <WineGlass />{maybeLoseVp}</>,
                        disabledReason: needGrapesDisabledReason(state2),
                    },
                ] as Choice[])
                    .filter(choice => !usedChoices[choice.id as ChoiceId])
                    .concat(alreadyChose ? { id: "LABORER_PASS", label: <>Pass</>, } : []),
            });
        };
        const maybeEndVisitor = (state2: GameState): GameState => {
            const laborerAction =
                (state2.currentTurn as WorkerPlacementTurn).pendingAction as LaborerAction;

            return Object.keys(laborerAction.usedChoices).length === 2
                ? endVisitor(state2)
                : promptLaborerAction(state2, laborerAction);
        };

        switch (action.type) {
            case "CHOOSE_CARDS": {
                const laborerAction: LaborerAction = { ...pendingAction, usedChoices: {} };
                return promptLaborerAction(setPendingAction(laborerAction, state), laborerAction);
            }
            case "CHOOSE_ACTION":
                const laborerAction = pendingAction as LaborerAction;
                if (action.choice !== "LABORER_PASS") {
                    state = setPendingAction({
                        ...laborerAction,
                        usedChoices: {
                            ...laborerAction.usedChoices,
                            [action.choice]: structures,
                        },
                    }, Object.keys(laborerAction.usedChoices).length > 0 ? loseVP(1, state) : state);
                }
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
                return endVisitor(fillOrder(action.wines, state, /* bonusVP */ true));
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
                                    label: <>Upgrade cellar at <Coins>2</Coins> discount</>,
                                    disabledReason: player.structures.largeCellar
                                        ? "Your cellar is fully upgraded."
                                        : moneyDisabledReason(state, cost),
                                },
                                {
                                    id: "MVINTNER_FILL",
                                    label: <>Age 1 <WineGlass /> and fill 1 <Order /></>,
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
                    case "MVINTNER_UPGRADE":
                        return endVisitor(buildStructure(payCoins(cost, state), upgradeCellar));
                    case "MVINTNER_FILL":
                        return promptToChooseWine(state, { limit: 1 });
                    default:
                        return state;
                }
            case "CHOOSE_WINE":
                if (!vintnerAction.orderId) {
                    // Haven't started filling an order yet: age the chosen wine
                    const wine = action.wines[0];
                    const idx = wine.value - 1;
                    return promptToChooseOrderCard(updatePlayer(state, player.id, {
                        cellar: {
                            ...player.cellar,
                            [wine.color]: ageSingle(
                                player.cellar[wine.color].map((w, i) => w && i !== idx) as TokenMap,
                                idx
                            )
                        },
                    }));
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
                return endVisitor(fillOrder(action.wines, state, /* bonusVP */ true));
            default:
                return state;
        }
    },
    mentor: (state, action, pendingAction) => {
        interface MentorPendingAction extends PlayVisitorPendingAction {
            // list of players who have yet to complete their main action (make wine, or pass)
            mainActions: string[];
            // number of reactionary choices left for the current turn player
            // ie. to choose what to draw for each opponent who makes wine
            reactions: number;
        }
        const mentorAction = pendingAction as MentorPendingAction;
        const maybeEndVisitor = (state2: GameState) => {
            const { mainActions, reactions } = (state2.currentTurn as WorkerPlacementTurn)
                .pendingAction as MentorPendingAction;
            return mainActions.length === 0 && reactions === 0 ? endVisitor(state2) : state2;
        };
        const endMainAction = (state2: GameState, playerId: string) => {
            const mainActions = mentorAction.mainActions.filter((id) => id !== playerId);
            return maybeEndVisitor(setPendingAction({ ...mentorAction, mainActions }, state2));
        };

        switch (action.type) {
            case "CHOOSE_CARDS":
                state = setPendingAction(
                    { ...mentorAction, mainActions: Object.keys(state.players), reactions: 0, },
                    state
                );
                if (state.playerId === null) {
                    return state;
                }
                const playerName = <strong>{state.players[state.currentTurn.playerId].name}</strong>;

                return promptForAction(
                    state,
                    {
                        playerId: state.playerId,
                        choices: [
                            {
                                id: "MENTOR_MAKE",
                                label: (
                                    <>
                                        Make up to 2 <WineGlass />
                                        {state.playerId !== state.currentTurn.playerId
                                            ? <>({playerName} draws 1 <Vine /> or 1 <SummerVisitor />)</>
                                            : null}
                                    </>
                                ),
                                disabledReason: needGrapesDisabledReason(state, state.playerId),
                            },
                            { id: "MENTOR_PASS", label: <>Pass</>, },
                        ],
                    }
                );
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "MENTOR_MAKE":
                        state = promptToMakeWine(state, /* upToN */ 2, action.playerId);
                        return action.playerId !== state.currentTurn.playerId
                            ? promptForAction(
                                setPendingAction(
                                    { ...mentorAction, reactions: mentorAction.reactions + 1 },
                                    state
                                ),
                                {
                                    choices: [
                                        { id: "MENTOR_DRAW_VINE", label: <>Draw 1 <Vine /></>, },
                                        { id: "MENTOR_DRAW_VISITOR", label: <>Draw 1 <SummerVisitor /></>, },
                                    ],
                                }
                            )
                            : state;

                    case "MENTOR_PASS":
                        return endMainAction(state, action.playerId);

                    case "MENTOR_DRAW_VINE":
                    case "MENTOR_DRAW_VISITOR":
                        return maybeEndVisitor(
                            drawCards(
                                setPendingAction(
                                    { ...mentorAction, reactions: mentorAction.reactions - 1 },
                                    state
                                ),
                                action._key!,
                                action.choice === "MENTOR_DRAW_VINE"
                                    ? { vine: 1 }
                                    : { summerVisitor: 1 }
                            )
                        );
                    default:
                        return state;
                }
            case "MAKE_WINE":
                return endMainAction(
                    makeWineFromGrapes(state, action.ingredients, action.playerId),
                    action.playerId
                );
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
                            disabledReason:
                                state.players[state.currentTurn.playerId].residuals < 2
                                    ? "You don't have enough residual payments."
                                    : undefined,
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
                        return promptToChooseGrape(state, 1);
                    case "PROMOTER_WINE":
                        return promptToChooseWine(state, { limit: 1 });
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
    queen: (state, action) => {
        const { tableOrder } = state;
        const i = tableOrder.indexOf(state.currentTurn.playerId);
        const playerId = tableOrder[(i + tableOrder.length - 1) % tableOrder.length];
        const playerName = <strong>{state.players[state.currentTurn.playerId].name}</strong>;

        switch (action.type) {
            case "CHOOSE_CARDS":
                const cards = action.cards!;
                if (cards.length === 1) {
                    return promptForAction(state, {
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
                    });
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
                return promptToChooseWine(state, { limit: 1 });
            case "CHOOSE_WINE":
                const wine = action.wines[0];
                const stateAfterDiscard = discardWines(state, [wine]);

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
                            label: <>Gain <VP>1</VP> for each opponent who has a total of 6 <Worker /></>,
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "UTEACHER_LOSE":
                        return endVisitor(trainWorker(loseVP(1, state)));
                    case "UTEACHER_GAIN":
                        const numOpponents = Object.values(state.players)
                            .filter(p => p.workers.length >= 6).length;
                        return endVisitor(gainVP(numOpponents, state));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
};
