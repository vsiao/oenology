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
} from "../shared/sharedReducers";
import GameState, { PlayVisitorPendingAction, WorkerPlacementTurn } from "../GameState";
import {
    promptForAction,
    promptToChooseWine,
    promptToMakeWine,
} from "../prompts/promptReducers";
import { GameAction } from "../gameActions";
import { WinterVisitorId } from "./visitorCards";
import { trainWorkerDisabledReason, needGrapesDisabledReason } from "../shared/sharedSelectors";
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
                                : undefined,
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
