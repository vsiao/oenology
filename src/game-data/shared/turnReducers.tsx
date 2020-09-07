import * as React from "react";
import GameState, {
    CardType,
    PlayVisitorPendingAction,
    PlayerState,
    StructureState,
    WakeUpPosition,
    WorkerPlacementTurn,
    WorkerPlacementTurnPendingAction,
    Season,
} from "../GameState";
import { ageAllTokens, ageCellar } from "./grapeWineReducers";
import { buildStructure, pushActivityLog, updatePlayer, gainVP, gainCoins, trainWorker, loseVP } from "./sharedReducers";
import { promptForAction, promptToChooseVisitor, promptToPlaceWorker, displayGameOverPrompt, promptToDiscard } from "../prompts/promptReducers";
import { addToDiscard, drawCards } from "./cardReducers";
import Card, { SummerVisitor, WinterVisitor, Order, Vine } from "../../game-views/icons/Card";
import Coins from "../../game-views/icons/Coins";
import VictoryPoints from "../../game-views/icons/VictoryPoints";
import Worker from "../../game-views/icons/Worker";
import { needCardOfTypeDisabledReason, GAME_OVER_VP, cardTypesInPlay } from "./sharedSelectors";
import { papaCards, mamaCards, MamaId, PapaId, MamaCard, PapaCard } from "../mamasAndPapas";
import { StructureId, structures } from "../structures";
import { boardActionsBySeason } from "../board/boardPlacements";
import { Choice } from "../prompts/PromptState";
import { wakeUpBonuses, WakeUpBonus } from "../board/wakeUpOrder";
import GrapeToken from "../../game-views/icons/GrapeToken";

export const endTurn = (state: GameState): GameState => {
    if (state.undoState?.type === "undoable") {
        state = {
            ...state,
            undoState: {
                ...state.undoState,
                // Mark the current turn as ended. The action is still undoable,
                // but only by the next turn's player.
                isLastActionByCurrentTurnPlayer: false,
            },
        };
    }
    switch (state.currentTurn.type) {
        case "mamaPapa":
            return endMamaPapaTurn(state);

        case "wakeUpOrder":
            return endWakeUpTurn(state);

        case "workerPlacement":
            return endWorkerPlacementTurn(state);

        case "passToNextSeason":
            return endWorkerPlacementTurn(state);

        case "fallVisitor":
            return endFallVisitorTurn(state);

        case "endOfYearDiscard":
            return endEOYDiscardTurn(state);
    }
};

//
// Set-up turns
// ----------------------------------------------------------------------------

export const beginMamaPapaTurn = (
    state: GameState,
    playerId = state.tableOrder[state.grapeIndex]
): GameState => {
    state = { ...state, currentTurn: { type: "mamaPapa", playerId }, };
    const { mamas, papas } = state.players[state.currentTurn.playerId];

    if (mamas.length > 1) {
        return promptChooseMamaPapa(state, mamas, papas);
    }
    return promptMamaDraw(state, 0, 0);
};

const promptChooseMamaPapa = (state: GameState, mamas: MamaId[], papas: PapaId[]): GameState => {
    const renderPapaDescription = (papa: PapaCard) => {
        return <p>
            Papa <strong>{papa.name}</strong> offers {
                papa.coins
                    ? <><Coins>{papa.coins}</Coins> and</>
                    : null
            } a choice: {renderPapaChoice(papa.choiceA)} or gain <Coins>{papa.choiceB}</Coins>{
                papa.coins ? " extra" : null
            }.
        </p>;
    };
    return promptForAction<MamaPapaChoiceData>(state, {
        title: "Choose your Mama & Papa",
        description: <>
            {renderMamaDescription(mamaCards[mamas[0]])}
            {renderMamaDescription(mamaCards[mamas[1]])}
            {renderPapaDescription(papaCards[papas[0]])}
            {renderPapaDescription(papaCards[papas[1]])}
        </>,
        choices: ([[0, 0], [0, 1], [1, 0], [1, 1]] as const).map(([mamaChoice, papaChoice]) => {
            const mama = mamaCards[mamas[mamaChoice]];
            const papa = papaCards[papas[papaChoice]];
            return {
                id: "MAMA_PAPA",
                data: { mamaChoice, papaChoice },
                label: <><strong>{mama.name}</strong> and <strong>{papa.name}</strong></>,
            };
        })
    });
};

const renderMamaCards = (mama: MamaCard) => {
    return Object.entries(mama.cards).map(([type, num]) =>
        new Array<CardType>(num || 0).fill(type as CardType).map((t, i) =>
            <Card key={i} type={t} />
        ));
};
const renderMamaDescription = (mama: MamaCard) => {
    return <p>
        Mama <strong>{mama.name}</strong> offers {renderMamaCards(mama)}
        {mama.coins ? <> and <Coins>{mama.coins}</Coins></> : null}.
    </p>;
};
const promptMamaDraw = (state: GameState, mamaChoice: number, papaChoice: number): GameState => {
    const mama = mamaCards[state.players[state.currentTurn.playerId].mamas[mamaChoice]];

    return promptForAction<MamaPapaChoiceData>(state, {
        title: "Choose your inheritance",
        description: renderMamaDescription(mama),
        choices: [{
            id: "MAMA",
            data: { mamaChoice, papaChoice },
            label: <>Draw {renderMamaCards(mama)} {
                mama.coins ? <> and gain <Coins>{mama.coins}</Coins></> : null
            }</>,
        }],
    });
};

const promptToChooseInheritance = (
    state: GameState,
    mamaChoice: number,
    papaChoice: number
): GameState => {
    const papa = papaCards[state.players[state.currentTurn.playerId].papas[papaChoice]];
    const data: MamaPapaChoiceData = { mamaChoice, papaChoice };

    return promptForAction<MamaPapaChoiceData>(state, {
        title: "Choose your inheritance",
        description: <p>
            Papa <strong>{papa.name}</strong> offers {
                papa.coins
                    ? <><Coins>{papa.coins}</Coins> and a choice:</>
                    : <>a choice:</>
            }
        </p>,
        choices: [
            { id: "PAPA_A", data, label: renderPapaChoice(papa.choiceA), },
            {
                id: "PAPA_B",
                data,
                label: papa.coins
                    ? <>Gain an extra <Coins>{papa.choiceB}</Coins></>
                    : <>Gain <Coins>{papa.choiceB}</Coins></>,
            },
        ],
    });
};

export interface MamaPapaChoiceData {
    mamaChoice: number;
    papaChoice: number;
}

export const chooseMamaPapa = (
    choice: string,
    { mamaChoice = 0, papaChoice = 0 }: Partial<MamaPapaChoiceData> = {},
    seed: string,
    state: GameState
): GameState => {
    const { mamas, papas } = state.players[state.currentTurn.playerId];
    const mamaId = mamas[mamaChoice];
    const papaId = papas[papaChoice];
    const mama = mamaCards[mamaId];
    const papa = papaCards[papaId];

    switch (choice) {
        case "MAMA_PAPA":
            return promptMamaDraw(state, mamaChoice, papaChoice);

        case "MAMA":
            state = drawCards(gainCoins(mama.coins, state), seed, mama.cards);
            return promptToChooseInheritance(state, mamaChoice, papaChoice);

        case "PAPA_A":
            state = gainCoins(papa.coins, state);
            switch (papa.choiceA) {
                case "victoryPoint":
                    return endTurn(gainVP(1, state));
                case "worker":
                    return endTurn(trainWorker(state, { availableThisYear: true, }));
                default:
                    return endTurn(buildStructure(state, papa.choiceA));
            }
        case "PAPA_B":
            return endTurn(gainCoins(papa.coins + papa.choiceB, state));
        default:
            return state;
    }
};

const renderPapaChoice = (choice: StructureId | "victoryPoint" | "worker"): React.ReactNode => {
    switch (choice) {
        case "victoryPoint":
            return <>Gain <VictoryPoints>1</VictoryPoints></>;
        case "worker":
            return <>Train 1 <Worker /></>;
        default:
            return <>Build <strong>{structures[choice].name}</strong></>;
    }
};

export const endMamaPapaTurn = (state: GameState): GameState => {
    const { tableOrder } = state;
    const nextIndex = (tableOrder.indexOf(state.currentTurn.playerId) + 1) % tableOrder.length;

    if (nextIndex === state.grapeIndex) {
        return state.boardType === "base"
            ? beginNewYear(state)
            : beginWakeUpTurn(state.tableOrder[state.grapeIndex], state);
    }
    return beginMamaPapaTurn(state, tableOrder[nextIndex]);
};

//
// Wake-up turns
// ----------------------------------------------------------------------------

const beginNewYear = (state: GameState): GameState => {
    const year = state.year + 1;
    return pushActivityLog(
        { type: "season", season: `Spring (Year ${year})` },
        state.boardType === "base"
            ? beginWakeUpTurn(state.tableOrder[state.grapeIndex], {
                ...state,
                season: "spring",
                year,
            })
            : startPlannerTurn(
                "spring",
                state.wakeUpOrder.find(pos => pos !== null)!.playerId,
                state
            )
    );
};

const beginWakeUpTurn = (playerId: string, state: GameState): GameState => {
    return promptForWakeUpOrder(state.boardType === "base" ? "summer" : "spring", {
        ...state,
        currentTurn: { type: "wakeUpOrder", playerId, },
    });
};

export const chooseWakeUp = (
    season: Season,
    wakeUpData: WakeUpChoiceData,
    state: GameState
): GameState => {
    const playerId = state.currentTurn.playerId;
    state = {
        ...state,
        wakeUpOrder: state.wakeUpOrder.map((pos, i) =>
            i === wakeUpData.idx
                ? { playerId, season }
                : pos
        ) as GameState["wakeUpOrder"],
    };
    return gainWakeUpBonus(wakeUpData, state);
};

export const gainWakeUpBonus = (
    wakeUpData: WakeUpChoiceData,
    state: GameState,
): GameState => {
    const playerId = state.currentTurn.playerId;
    const idx = state.wakeUpOrder.findIndex(pos => pos?.playerId === playerId);
    const season = state.wakeUpOrder[idx]!.season;
    const playerState = state.players[playerId];
    const bonus = wakeUpBonuses(state.boardType!)[season][idx];
    const seed = state.lastActionKey!;

    switch (bonus) {
        case "ageGrapes":
            return updatePlayer(state, playerId, {
                crushPad: {
                    red: ageAllTokens(playerState.crushPad.red),
                    white: ageAllTokens(playerState.crushPad.white),
                },
            });
        case "drawCard":
            return drawCards(state, seed, { [wakeUpData.cardType!]: 1 });
        case "drawOrder":
            return drawCards(state, seed, { order: 1 });
        case "drawStructure":
            return state; // drawCards(state, seed, { structure: 1 });
        case "drawSummerVisitor":
            return drawCards(state, seed, { summerVisitor: 1 });
        case "drawVine":
            return drawCards(state, seed, { vine: 1 });
        case "drawVisitor":
            const cardType = wakeUpData.cardType ??
                (wakeUpData.visitor === "summer" ? "summerVisitor" : "winterVisitor");
            return drawCards(state, seed, { [cardType]: 1 });
        case "drawWinterVisitor":
            return drawCards(state, seed, { winterVisitor: 1 });
        case "firstPlayer":
            return { ...state, grapeIndex: state.tableOrder.findIndex(id => id === playerId) };
        case "gainCoin":
            return gainCoins(1, state, playerId);
        case "gainVP":
            return gainVP(1, state, playerId);
        case "influence":
            return state; // TODO
        case "nothing":
            return state;
        case "tempWorker":
            return updatePlayer(state, playerId, {
                workers: [
                    ...playerState.workers,
                    { type: "normal", id: 999, available: true, isTemp: true }
                ],
            });
    }
};

export const endWakeUpTurn = (state: GameState): GameState => {
    const { grapeIndex, tableOrder, wakeUpOrder } = state;
    const nextWakeUpIndex = (tableOrder.indexOf(state.currentTurn.playerId) + 1) % tableOrder.length;

    if (nextWakeUpIndex === grapeIndex) {
        const firstPlayerId = wakeUpOrder.filter((pos) => pos)[0]!.playerId;
        return state.boardType === "base"
            // In the base game, "wake-up" turns occur in the spring.
            // When spring concludes, we begin summer worker placement turns.
            ? startWorkerPlacementTurn(
                firstPlayerId,
                pushActivityLog({ type: "season", season: `Summer (Year ${state.year})` }, {
                    ...state,
                    season: "summer"
                })
            )
            // In Tuscany, the first year starts after wake-up
            : beginNewYear(state);
    }
    return beginWakeUpTurn(tableOrder[nextWakeUpIndex], state);
};

export interface WakeUpChoiceData {
    idx: number;
    cardType?: CardType;
    visitor?: "summer" | "winter";
}
export const promptForWakeUpOrder = (forSeason: Season, state: GameState) => {
    const renderBonusLabel = (bonus: WakeUpBonus): React.ReactNode => {
        switch (bonus) {
            case "ageGrapes":
                return <>Age grapes</>;
            case "drawCard":
                throw new Error("Unexpected state"); // handled below
            case "drawOrder":
                return <>Draw <Order /></>;
            case "drawStructure":
                return <>Draw XCXC</>;
            case "drawSummerVisitor":
                return <>Draw <SummerVisitor /></>;
            case "drawVine":
                return <>Draw <Vine /></>;
            case "drawVisitor":
                throw new Error("Unexpected state"); // handled below
            case "drawWinterVisitor":
                return <>Draw <WinterVisitor /></>;
            case "firstPlayer":
                return <>Gain <GrapeToken /></>;
            case "gainCoin":
                return <>Gain <Coins>1</Coins></>;
            case "gainVP":
                return <>Gain <VictoryPoints>1</VictoryPoints></>;
            case "influence":
                return "STAR_TOKEN";
            case "nothing":
                return <>No bonus</>;
            case "tempWorker":
                return <>Gain <Worker isTemp={true} /> for this year</>;
        }
    };

    const bonuses = wakeUpBonuses(state.boardType ?? "base")[forSeason];
    return promptForAction<WakeUpChoiceData>(state, {
        title: "Choose wake-up order",
        choices: bonuses
            .map((bonus, idx) => {
                if (bonus === "drawVisitor") {
                    return (["summerVisitor", "winterVisitor"] as const).map(cardType => ({
                        id: "WAKE_UP",
                        data: { idx, cardType },
                        label: <>{idx + 1}: Draw <Card type={cardType} /></>,
                    }));
                } else if (bonus === "drawCard") {
                    return cardTypesInPlay(state).map(cardType => ({
                        id: "WAKE_UP",
                        data: { idx, cardType },
                        label: <>{idx + 1}: Draw <Card type={cardType} /></>,
                    }));
                }
                return [{
                    id: "WAKE_UP",
                    data: { idx },
                    label: forSeason === "spring"
                        ? <>{idx === 0 ? <><GrapeToken /></> : idx + 1}</>
                        : <>{idx + 1}: {renderBonusLabel(bonus)}</>,
                }];
            })
            .flat()
            .map(choice => ({
                ...choice,
                disabledReason: state.wakeUpOrder[choice.data.idx]
                    ? `Taken by ${state.players[state.wakeUpOrder[choice.data.idx]!.playerId].name}`
                    : forSeason === "spring" && choice.data.idx === 0
                        ? "Grape token required choose first wake-up position"
                        : undefined,
            })),
    });
};

//
// Worker placement turns
// ----------------------------------------------------------------------------

const startPlannerTurn = (
    season: Season,
    playerId: string,
    state: GameState
): GameState => {
    state = {
        ...state,
        season,
        currentTurn: { type: "workerPlacement", playerId, isPlannerTurn: true },
    };
    const plannerAction = boardActionsBySeason(state)[season].find(action =>
        state.workerPlacements[action.type].some(w => w && w.playerId === playerId)
    );

    if (!plannerAction) {
        return endPlannerTurn(state);
    }
    const workerIdx = state.workerPlacements[plannerAction.type]
        .findIndex(w => w?.playerId === playerId);
    const placement = plannerAction.choiceAt(workerIdx, state);

    return promptForAction(state, {
        description: <p>
            You placed a worker with the <strong>
                {state.workerPlacements[plannerAction.type][workerIdx]!.source}
            </strong>.
        </p>,
        choices: [
            {
                id: "PLANNER_ACT",
                data: { placement: plannerAction.type, idx: workerIdx },
                label: placement.label,
                disabledReason: placement.disabledReason,
            },
            { id: "PLANNER_PASS", label: "Pass" },
        ],
    });
};

const endPlannerTurn = (state: GameState): GameState => {
    const { currentTurn, wakeUpOrder } = state;
    const compactWakeUpOrder = wakeUpOrder.filter((pos) => pos !== null) as WakeUpPosition[];
    const i = compactWakeUpOrder.findIndex((pos) => pos.playerId === currentTurn.playerId);
    const season = state.season;

    if (i === compactWakeUpOrder.length - 1) {
        // Begin season
        return startWorkerPlacementTurn(compactWakeUpOrder[0].playerId, state);
    } else {
        const nextPlayerId =
            compactWakeUpOrder[(i + 1) % compactWakeUpOrder.length].playerId;
        return startPlannerTurn(season, nextPlayerId, state);
    }
};

const startWorkerPlacementTurn = (
    playerId: string,
    state: GameState
) => {
    state = {
        ...state,
        currentTurn: { type: "workerPlacement", playerId },
    };
    const player = state.players[playerId];
    if (player.workers.every(w => !w.available)) {
        // player is out of workers, auto-pass them
        return passToNextSeason(state);
    }
    return promptToPlaceWorker(state);
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
    const currentTurn = state.currentTurn as WorkerPlacementTurn;
    if (currentTurn.isPlannerTurn) {
        return endPlannerTurn(state);
    } else if (currentTurn.managerPendingAction) {
        // Restore Manager state; end the visitor
        return endVisitor(
            setPendingAction(currentTurn.managerPendingAction, {
                ...state,
                currentTurn: { ...currentTurn, managerPendingAction: undefined }
            })
        );
    }
    const { boardType, season, wakeUpOrder } = state;
    const compactWakeUpOrder = wakeUpOrder.filter((pos) => pos !== null) as WakeUpPosition[];

    if (compactWakeUpOrder.every(p => p.season !== season)) {
        switch (season) {
            case "spring":
                return startPlannerTurn("summer", compactWakeUpOrder[0].playerId, state);
            case "summer":
                return boardType === "base"
                    ? pushActivityLog(
                        { type: "season", season: `Fall (Year ${state.year})` },
                        startFallVisitorTurn(compactWakeUpOrder[0].playerId, state)
                    )
                    : startPlannerTurn("fall", compactWakeUpOrder[0].playerId, state);
            case "fall":
                return startPlannerTurn("winter", compactWakeUpOrder[0].playerId, state);
            case "winter":
                return endYear(state);
        }
    }
    const activeWakeUpOrder = compactWakeUpOrder
        .filter((pos) => pos.playerId === currentTurn.playerId || pos.season === season);
    const i = activeWakeUpOrder.findIndex((pos) => pos.playerId === currentTurn.playerId);
    const nextPlayerId = activeWakeUpOrder[(i + 1) % activeWakeUpOrder.length].playerId;

    return startWorkerPlacementTurn(nextPlayerId, state);
};

export const makeEndVisitorAction = (
    type: "allPlayers" | "activePlayers" | "opponents",
    prompt: (state: GameState, playerId: string) => GameState
): (state: GameState, playerId?: string) => GameState => {
    return (state, playerId) => {
        const actionOrder = state.wakeUpOrder.filter(pos => {
            if (!pos) {
                return false
            }
            switch (type) {
                case "opponents":
                    return pos.playerId !== state.currentTurn.playerId;
                case "activePlayers":
                    return pos.season === state.season;
                default:
                    return true;
            }
        });
        const i = playerId === undefined
            ? -1
            : actionOrder.findIndex(pos => pos && pos.playerId === playerId);

        if (i === actionOrder.length - 1) {
            return endVisitor(state);
        }
        const nextPlayerId = actionOrder[i + 1]!.playerId;
        const pendingAction = (state.currentTurn as WorkerPlacementTurn)
            .pendingAction! as PlayVisitorPendingAction;
        return prompt(
            setPendingAction({
                ...pendingAction,
                lastActionPlayerId: pendingAction.actionPlayerId,
                actionPlayerId: nextPlayerId,
            }, state),
            nextPlayerId
        );
    };
};

export const makeChoose2Visitor = (
    choices: (state: GameState, numChosen: number) => Choice[]
): [
    // chooseAction
    (state: GameState, choice?: string, loseVPOnMulti?: boolean) => GameState,
    // maybeEndVisitor
    (state: GameState) => GameState,
 ] => {
    const prompt = (state: GameState, usedChoices: { [choice: string]: boolean }) =>
        promptForAction(state, {
            choices: choices(state, Object.keys(usedChoices).length)
                .filter(choice => !usedChoices[choice.id]),
        });

    return [
        (state, choice, loseVPOnMulti) => {
            const pendingAction = (state.currentTurn as WorkerPlacementTurn)
                .pendingAction! as PlayVisitorPendingAction;
            const usedChoices = choice === undefined ? {} : {
                ...pendingAction.usedChoices,
                [choice]: true,
            };
            state = setPendingAction(
                { ...pendingAction, usedChoices },
                loseVPOnMulti && Object.keys(usedChoices).length >= 2
                    ? loseVP(1, state)
                    : state
            );
            return choice === undefined ? prompt(state, usedChoices) : state;
        },
        state => {
            const usedChoices = ((state.currentTurn as WorkerPlacementTurn)
                .pendingAction! as PlayVisitorPendingAction).usedChoices!;
            const numUsedChoices = Object.keys(usedChoices).length;
            if (numUsedChoices >= 2) {
                return endVisitor(state);
            }
            return prompt(state, usedChoices);
        },
    ];
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
        state.season === "summer" ? "summerVisitor" : "winterVisitor"
    ) === undefined;
    if (pendingAction.hasBonus && hasCard) {
        return promptToChooseVisitor(
            state.season as "summer" | "winter",
            setPendingAction({
                type: "playVisitor",
                hasBonus: false,
                placementIdx: pendingAction.placementIdx,
            }, state),
            { optional: true }
        );
    }
    return endTurn(state);
};

//
// Pass-to-next-season turns
// ----------------------------------------------------------------------------

export const passToNextSeason = (state: GameState): GameState => {
    const playerId = state.currentTurn.playerId;
    const seasons: Season[] = state.boardType === "base"
        ? ["summer", "winter"]
        : ["spring", "summer", "fall", "winter"];
    const nextSeason = seasons[
        (seasons.findIndex(s => s === state.season) + 1) % seasons.length
    ];
    const wakeUpOrder = state.wakeUpOrder.slice() as GameState["wakeUpOrder"];
    const idx = wakeUpOrder.findIndex(pos => pos?.playerId === playerId);
    wakeUpOrder[idx] = { ...wakeUpOrder[idx]!, season: nextSeason };

    state = pushActivityLog({ type: "pass", playerId }, { ...state, wakeUpOrder });

    if (state.boardType === "base") {
        return endTurn(state);
    }

    const bonus = wakeUpBonuses(state.boardType!)[nextSeason][idx];
    switch (bonus) {
        case "drawCard":
            return promptForAction<WakeUpChoiceData>(state, {
                choices: cardTypesInPlay(state).map(cardType => ({
                    id: "DRAW_CARD",
                    data: { idx, cardType },
                    label: <>Draw <Card type={cardType} /></>,
                })),
            });
        case "drawVisitor":
            return promptForAction<WakeUpChoiceData>(state, {
                choices: (["summerVisitor", "winterVisitor"] as const).map(cardType => ({
                    id: "DRAW_CARD",
                    data: { idx, cardType },
                    label: <>Draw <Card type={cardType} /></>,
                })),
            });
        case "influence": // TODO
        default:
            return endTurn(gainWakeUpBonus({ idx }, state));
    }
};

//
// Fall visitor turns
// ----------------------------------------------------------------------------

const startFallVisitorTurn = (playerId: string, state: GameState): GameState => {
    const canDrawTwo = state.players[playerId].structures.cottage;
    return promptForAction({
        ...state,
        season: "fall",
        currentTurn: { type: "fallVisitor", playerId, },
    }, {
        description: <p><em>Fall season: Draw 1 Visitor card (2 with Cottage).</em></p>,
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
        return startPlannerTurn(
            "winter",
            compactWakeUpOrder[0].playerId,
            pushActivityLog({ type: "season", season: `Winter (Year ${state.year})` }, state)
        );
    } else {
        const nextPlayerId =
            compactWakeUpOrder[(i + 1) % compactWakeUpOrder.length].playerId;
        return startFallVisitorTurn(nextPlayerId, state);
    }
};

//
// End-of-year turns
// ----------------------------------------------------------------------------

const endYear = (state: GameState): GameState => {
    if (Object.values(state.players).some(p => p.victoryPoints >= GAME_OVER_VP)) {
        // End of game
        return displayGameOverPrompt(
            pushActivityLog(
                { type: "season", season: "Game Over!" },
                { ...state, undoState: null }
            )
        );
    }
    state = pushActivityLog({ type: "season", season: `End of Year ${state.year}` }, state);

    const { wakeUpOrder } = state;
    const compactWakeUpOrder = wakeUpOrder.filter((pos) => pos !== null) as WakeUpPosition[];

    Object.values(state.players).forEach(p => state = gainCoins(p.residuals, state, p.id));

    return beginEOYDiscardTurn(compactWakeUpOrder[0].playerId, {
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
                        // Retrieve workers
                        workers: playerState.workers
                            .filter(w => !w.isTemp)
                            .map(w => ({ ...w, available: true })),
                        // Age grape and wine tokens
                        crushPad: {
                            red: ageAllTokens(playerState.crushPad.red),
                            white: ageAllTokens(playerState.crushPad.white),
                        },
                        cellar: ageCellar(playerState.cellar, playerState.structures),
                        // Reset field harvested state
                        fields: {
                            field5: { ...playerState.fields.field5, harvested: false },
                            field6: { ...playerState.fields.field6, harvested: false },
                            field7: { ...playerState.fields.field7, harvested: false },
                        },
                        structures: Object.fromEntries(
                            Object.entries(playerState.structures).map(([structure, structureState]) => (
                                [structure, structureState === StructureState.Unbuilt ? structureState : StructureState.Built]
                            ))
                        ) as PlayerState["structures"]
                    },
                ];
            })
        ),
    });
};

const END_OF_YEAR_HAND_LIMIT = 7;
const beginEOYDiscardTurn = (playerId: string, state: GameState): GameState => {
    state = {
        ...state,
        currentTurn: { type: "endOfYearDiscard", playerId },
    };
    const cards = state.players[playerId].cardsInHand;
    if (cards.length <= END_OF_YEAR_HAND_LIMIT) {
        return endEOYDiscardTurn(state);
    }
    const numCards = cards.length - END_OF_YEAR_HAND_LIMIT;
    return promptToDiscard(numCards, state);
};

const endEOYDiscardTurn = (state: GameState): GameState => {
    const { currentTurn, wakeUpOrder } = state;
    const compactWakeUpOrder = wakeUpOrder.filter((pos) => pos !== null) as WakeUpPosition[];
    const i = compactWakeUpOrder.findIndex((pos) => pos.playerId === currentTurn.playerId);

    if (i === compactWakeUpOrder.length - 1) {
        // Begin a new year
        const tableOrder = state.tableOrder;
        const grapeIndex = (tableOrder.length + state.grapeIndex - 1) % tableOrder.length;
        return beginNewYear({
            ...state,
            grapeIndex,
            wakeUpOrder: wakeUpOrder.map((pos) => null) as GameState["wakeUpOrder"],
        });
    } else {
        const nextPlayerId =
            compactWakeUpOrder[(i + 1) % compactWakeUpOrder.length].playerId;
        return beginEOYDiscardTurn(nextPlayerId, state);
    }
};

