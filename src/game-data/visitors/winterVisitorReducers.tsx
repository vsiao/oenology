import * as React from "react";
import { default as VP } from "../../game-views/icons/VictoryPoints";
import Coins from "../../game-views/icons/Coins";
import Worker from "../../game-views/icons/Worker";
import { SummerVisitor, Vine, Order } from "../../game-views/icons/Card";
import {
    ageCellar,
    buildStructure,
    drawCards,
    gainVP,
    endTurn,
    gainCoins,
    discardWine,
    trainWorker,
    makeWineFromGrapes,
    payCoins,
    discardCards,
    setPendingAction,
    gainResiduals,
    loseResiduals,
    loseVP,
    harvestField,
} from "../shared/sharedReducers";
import GameState, { PlayVisitorPendingAction, WorkerPlacementTurn, WineColor } from "../GameState";
import {
    promptForAction,
    promptToChooseWine,
    promptToMakeWine,
    promptToChooseField,
    promptToBuildStructure,
} from "../prompts/promptReducers";
import { GameAction } from "../gameActions";
import { WinterVisitorId } from "./visitorCards";
import { trainWorkerDisabledReason, needGrapesDisabledReason, harvestFieldDisabledReason, moneyDisabledReason } from "../shared/sharedSelectors";
import WineGlass from "../../game-views/icons/WineGlass";
import Residuals from "../../game-views/icons/Residuals";

export const winterVisitorReducers: Record<
    WinterVisitorId,
    (state: GameState, action: GameAction, pendingAction: PlayVisitorPendingAction) => GameState
> = {
    assessor: (state, action) => {
        const player = state.players[state.currentTurn.playerId];
        const numCards = player.cardsInHand.length;
        switch (action.type) {
            case "CHOOSE_CARD":
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
                        return endTurn(gainCoins(numCards, state));
                    case "ASSESSOR_DISCARD":
                        return endTurn(gainVP(2, discardCards(player.cardsInHand, state)));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    bottler: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
                return promptToMakeWine(state, /* upToN */ 3);
            case "MAKE_WINE":
                const wineByType: { [type in WineColor]?: boolean } = {};
                action.ingredients.forEach(w => wineByType[w.type] = true);
                const numTypes = Object.keys(wineByType).length;
                return endTurn(gainVP(numTypes, makeWineFromGrapes(state, action.ingredients)));
            default:
                return state;
        }
    },
    crushExpert: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
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
                        return endTurn(drawCards(gainCoins(3, state), { order: 1 }));
                    case "CRUSHEX_MAKE":
                        return promptToMakeWine(state, /* upToN */ 3);
                    default:
                        return state;
                }
            case "MAKE_WINE":
                return endTurn(makeWineFromGrapes(state, action.ingredients));
            default:
                return state;
        }
    },
    crusher: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
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
                        return endTurn(gainCoins(3, drawCards(state, { summerVisitor: 1 })));
                    case "CRUSHER_DRAW":
                        return endTurn(
                            promptToMakeWine(drawCards(state, { order: 1 }), /* upToN */ 2)
                        );
                    default:
                        return state;
                }
            case "MAKE_WINE":
                return endTurn(makeWineFromGrapes(state, action.ingredients));
            default:
                return state;
        }
    },
    designer: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
                return promptToBuildStructure(state);
            case "BUILD_STRUCTURE":
                state = buildStructure(state, action.structureId);
                const numBuilt = Object.values(state.players[state.currentTurn.playerId].structures)
                    .filter(built => built).length;
                return endTurn(numBuilt >= 6 ? gainVP(2, state) : state);
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
            return mainActions.length === 0 ? endTurn(state2) : state2;
        };
        switch (action.type) {
            case "CHOOSE_CARD":
                return promptForAction(
                    setPendingAction({ ...gspeakerAction, mainActions: Object.keys(state.players), }, state),
                    {
                        choices: [
                            {
                                id: "GSPEAKER_TRAIN",
                                label: <>
                                    Pay <Coins>1</Coins> to train 1 <Worker />
                                    {state.playerId !== state.currentTurn.playerId
                                        ? <>(<strong>{state.currentTurn.playerId}</strong> gains <VP>1</VP>)</>
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
                        state = trainWorker(payCoins(1, state, action.playerId), action.playerId);
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
    //         case "CHOOSE_CARD":
    //         default:
    //             return state;
    //     }
    // },
    harvestExpert: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
                return promptForAction(state, {
                    choices: [
                        {
                            id: "HEXPERT_HARVEST",
                            label: <>Harvest 1 field</>,
                            disabledReason: harvestFieldDisabledReason(state),
                        },
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
                    case "HEXPERT_HARVEST":
                        return promptToChooseField(state);
                    case "HEXPERT_DRAW":
                        return endTurn(drawCards(state, { vine: 1 }));
                    case "HEXPERT_BUILD":
                        return endTurn(buildStructure(payCoins(1, state), "yoke"));
                    default:
                        return state;
                }
            case "CHOOSE_FIELD":
                return endTurn(harvestField(state, action.fieldId));
            default:
                return state;
        }
    },
    judge: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
                return promptForAction(state, {
                    choices: [
                        { id: "JUDGE_DRAW", label: <>Draw 2 <SummerVisitor /></>, },
                        {
                            id: "JUDGE_DISCARD",
                            label: <>Discard 1 <WineGlass /> of value 4 or more to gain <VP>3</VP></>,
                            disabledReason: undefined // TODO
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "JUDGE_DRAW":
                        return endTurn(drawCards(state, { summerVisitor: 2 }));
                    case "JUDGE_DISCARD":
                        return promptToChooseWine(state, /* minValue */ 4);
                    default:
                        return state;
                }
            case "CHOOSE_WINE":
                return endTurn(gainVP(3, state)); // TODO
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
        const maybeEndTurn = (state2: GameState) => {
            const { mainActions, reactions } = (state2.currentTurn as WorkerPlacementTurn)
                .pendingAction as MentorPendingAction;
            return mainActions.length === 0 && reactions === 0 ? endTurn(state2) : state2;
        };
        const endMainAction = (state2: GameState, playerId: string) => {
            const mainActions = mentorAction.mainActions.filter((id) => id !== playerId);
            return maybeEndTurn(setPendingAction({ ...mentorAction, mainActions }, state2));
        };

        switch (action.type) {
            case "CHOOSE_CARD":
                return promptForAction(
                    setPendingAction(
                        {
                            ...mentorAction,
                            mainActions: Object.keys(state.players),
                            reactions: 0,
                        },
                        state
                    ),
                    {
                        playerId: state.playerId!,
                        choices: [
                            {
                                id: "MENTOR_MAKE",
                                label: (
                                    <>
                                        Make up to 2 <WineGlass />
                                        {state.playerId !== state.currentTurn.playerId
                                            ? <>
                                                (<strong>{state.currentTurn.playerId}</strong> draws
                                                  1 <Vine /> or 1 <SummerVisitor />)
                                            </>
                                            : null}
                                    </>
                                ),
                                disabledReason: needGrapesDisabledReason(state, state.playerId!),
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
                        return maybeEndTurn(
                            drawCards(
                                setPendingAction(
                                    { ...mentorAction, reactions: mentorAction.reactions - 1 },
                                    state
                                ),
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
            case "CHOOSE_CARD":
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
                        return endTurn(gainResiduals(1, payCoins(1, state)));
                    case "NOBLE_LOSE":
                        return endTurn(gainVP(2, loseResiduals(2, state)));
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
            case "CHOOSE_CARD":
                return promptForAction(state, {
                    choices: [
                        { id: "OENOLOGIST_AGE", label: <>Age all <WineGlass /> in your cellar twice</>, },
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
                        return endTurn({
                            ...state,
                            players: {
                                ...state.players,
                                [player.id]: {
                                    ...player,
                                    cellar: ageCellar(player.cellar, 2),
                                },
                            },
                        });
                    case "EONOLOGIST_UPGRADE":
                        return buildStructure(
                            payCoins(3, state),
                            player.structures.mediumCellar ? "largeCellar" : "mediumCellar"
                        );
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    politician: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
                const { playerId } = state.currentTurn;
                if (state.players[playerId].victoryPoints < 0) {
                    return endTurn(gainCoins(6, state));
                } else {
                    return endTurn(drawCards(state, { vine: 1, summerVisitor: 1, order: 1 }));
                }
            default:
                return state;
        }
    },
    professor: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
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
                                playerState.trainedWorkers.length < 6
                                    ? "You don't have enough workers."
                                    : undefined,
                        },
                    ],
                });
            case "CHOOSE_ACTION":
                switch (action.choice) {
                    case "PROFESSOR_TRAIN":
                        return endTurn(trainWorker(payCoins(2, state)));
                    case "PROFESSOR_GAIN":
                        return endTurn(gainVP(2, state));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    scholar: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
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
                        return endTurn(drawCards(state, { order: 2 }));
                    case "SCHOLAR_TRAIN":
                        return endTurn(trainWorker(payCoins(3, state)));
                    case "SCHOLAR_BOTH":
                        return endTurn(trainWorker(payCoins(3, drawCards(state, { order: 2 }))));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    supervisor: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
                return promptToMakeWine(state, /* upToN */ 2);
            case "MAKE_WINE":
                const numSparkling = action.ingredients
                    .filter(({ type }) => type === "sparkling").length;
                return endTurn(gainVP(numSparkling, makeWineFromGrapes(state, action.ingredients)));
            default:
                return state;
        }
    },
    taster: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
                return promptToChooseWine(state);
            case "CHOOSE_WINE":
                const currentTurnPlayerId = state.currentTurn.playerId;
                const stateAfterDiscard = discardWine(state, currentTurnPlayerId, action.wine);

                const mostValuableWine = Object.values(stateAfterDiscard.players)
                    .map((player) =>
                        Object.values(player.cellar)
                            .map((wines) => wines.lastIndexOf(true) + 1)
                            .reduce((v1, v2) => Math.max(v1, v2))
                    )
                    .reduce((v1, v2) => Math.max(v1, v2));

                if (action.wine.value > mostValuableWine) {
                    return endTurn(gainVP(2, stateAfterDiscard));
                } else {
                    return endTurn(stateAfterDiscard);
                }
            default:
                return state;
        }
    },
    teacher: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
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
                        return endTurn(trainWorker(payCoins(2, state)));
                    default:
                        return state;
                }
            case "MAKE_WINE":
                return endTurn(makeWineFromGrapes(state, action.ingredients));
            default:
                return state;
        }
    },
    uncertifiedOenologist: (state, action) => {
        const player = state.players[state.currentTurn.playerId];

        switch (action.type) {
            case "CHOOSE_CARD":
                return promptForAction(state, {
                    choices: [
                        { id: "UOENOLOGIST_AGE", label: <>Age all <WineGlass /> in your cellar twice</>, },
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
                        return endTurn({
                            ...state,
                            players: {
                                ...state.players,
                                [player.id]: {
                                    ...player,
                                    cellar: ageCellar(player.cellar, 2),
                                },
                            },
                        });
                    case "UEONOLOGIST_UPGRADE":
                        return buildStructure(
                            loseVP(1, state),
                            player.structures.mediumCellar ? "largeCellar" : "mediumCellar"
                        );
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
    uncertifiedTeacher: (state, action) => {
        switch (action.type) {
            case "CHOOSE_CARD":
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
                        return endTurn(trainWorker(loseVP(1, state)));
                    case "UTEACHER_GAIN":
                        const numOpponents = Object.values(state.players)
                            .filter(p => p.trainedWorkers.length === 6).length;
                        return endTurn(gainVP(numOpponents, state));
                    default:
                        return state;
                }
            default:
                return state;
        }
    },
};
