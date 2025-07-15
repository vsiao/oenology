import GameState, { BoardPlacement, CardType, WorkerPlacement, WorkerPlacementTurn } from "../GameState";
import {
    gainCoins,
    payCoins,
    pushActivityLog,
    withoutActivityLog,
} from "../shared/sharedReducers";
import { promptForAction } from "../prompts/promptReducers";
import { numActionSpaces } from "../shared/sharedSelectors";
import { endTurn, passToNextSeason } from "../shared/turnReducers";
import { drawCards, addCardsToHand, removeCardsFromHand } from "../shared/cardReducers";
import { boardAction } from "./boardActionReducer";
import { beginPlaceWorker, retrieveWorker } from "../shared/workerReducers";
import { boardActions, boardActionsBySeason, isBoardAction } from "./boardPlacements";
import { structureAction, structureActions } from "../structures/structureActionReducer";
import React from "react";
import Worker from "../../game-views/icons/Worker";
import { Choice } from "../prompts/PromptState";
import { visitorCards } from "../visitors/visitorCards";
import { InternalGameAction } from "./currentTurnReducer";
import Alea from "alea";

export const workerPlacement = (state: GameState, action: InternalGameAction): GameState => {
    const currentTurn = state.currentTurn as WorkerPlacementTurn;
    const playerId = currentTurn.playerId;
    switch (action.type) {
        case "PLACE_WORKER": {
            const { placement, workerType, idx, _key } = action;
            state = { ...state, lastPlaceWorkerActionKey: _key, pendingWorker: null };
            if (!placement) {
                return passToNextSeason(state);
            }
            return beginPlaceWorker(workerType, placement, idx ?? null, state, _key!);
        }
        case "WORKER_PLACED": {
            const { workerType, placement, idx: placementIdx } = action;
            state = { ...state, currentTurn: { ...currentTurn, placement: [placement, placementIdx] } };

            const placementAction = isBoardAction(placement)
                ? boardActions[placement]
                : structureActions[placement];
            const actionSpace = placementAction.spaceAt(placementIdx, state);
            const workerName = state.specialWorkers?.[workerType];

            switch (workerName) {
                case "Mafioso":
                    if (placementIdx < numActionSpaces(state) && actionSpace.bonus === undefined) {
                        state = {
                            ...state,
                            currentTurn: { ...state.currentTurn as WorkerPlacementTurn, specialWorkerBonus: "Mafioso" }
                        };
                    }
                    break;
                case "Merchant":
                    if (
                        isBoardAction(placement) &&
                        state.wakeUpOrder.every(p => !p || p?.playerId === playerId || p?.season !== state.season)
                    ) {
                        state = {
                            ...state,
                            currentTurn: { ...state.currentTurn as WorkerPlacementTurn, specialWorkerBonus: "Merchant" }
                        };
                    }
                    break;
                case "Messenger":
                    const isFutureMessengerPlacement = isBoardAction(placement) &&
                        state.workerPlacements[placement][placementIdx]!.source === "Messenger";
                    if (isFutureMessengerPlacement) {
                        // The Messenger will be resolved in a future season
                        return endTurn(state);
                    }
                    break;
                case "Professore":
                    const actionsThisSeason = boardActionsBySeason(state)[state.season];
                    const regularWorkersThisSeason: Choice<string>[] = actionsThisSeason.map(({ type }) =>
                        state.workerPlacements[type]
                            .map((w, i) => w?.type === "normal" && w.playerId === playerId && {
                                id: "PROFESSORE_RETRIEVE",
                                data: `${type}_${i}`,
                                label: <>
                                    <Worker {...w} />
                                    &nbsp;{boardActions[type].spaceAt(i, state).label}
                                </>
                            })
                            .filter(p => !!p)
                    ).flat();
                    if (regularWorkersThisSeason.length > 0) {
                        return promptForAction(state, {
                            title: "Professore",
                            description: <p>You may retrieve a regular worker from this season.</p>,
                            choices: regularWorkersThisSeason.concat([{
                                id: "PROFESSORE_PASS",
                                label: <>Pass</>,
                            }]),
                        });
                    }
            }
            return handlePlacementAction(placement, state, action.key, placementIdx);
        }
        case "CHOOSE_ACTION":
            switch (action.choice) {
                case "MAFIOSO_ACT": {
                    const [placement, idx] = currentTurn.placement!;
                    return handlePlacementAction(placement, state, action._key!, idx);
                }
                case "MERCHANT_DRAW_CARD":
                    return endTurn(drawCards(state, state.lastActionKey, { [action.data as CardType]: 1 }));

                case "INNKEEPER_TAKE": {
                    const [otherPlayerId, season] = (action.data as string).split("_");
                    const otherPlayer = state.players[otherPlayerId];
                    const visitorCardsOfSeason = otherPlayer.cardsInHand.filter(c =>
                        c.type === "visitor" && visitorCards[c.id].season === season
                    );
                    const random = Alea(action._key);
                    const card = visitorCardsOfSeason[Math.floor(random() * visitorCardsOfSeason.length)];
                    state = withoutActivityLog(() => payCoins(1, gainCoins(1, state, otherPlayerId)));
                    state = removeCardsFromHand([card], state, otherPlayerId);
                    state = addCardsToHand([card], state, playerId)
                    state = pushActivityLog({
                        type: "innkeeperTake",
                        playerId,
                        cardType: `${season as "winter" | "summer"}Visitor`,
                        fromPlayerId: otherPlayerId,
                    }, state);
                    const [placement, idx] = currentTurn.placement!;
                    return handlePlacementAction(placement, state, action._key!, idx);
                }
                case "PLANNER_ACT": {
                    const { placement, idx } = action.data as { placement: BoardPlacement; idx: number };
                    state = { ...state, currentTurn: { ...currentTurn, placement: [placement, idx] } };
                    const bonus = boardActions[placement].spaceAt(idx, state).bonus;
                    return boardAction(placement, state, action._key!, bonus);
                }
                case "PASS":
                case "PLANNER_PASS":
                    return endTurn(state);
                
                case "INNKEEPER_PASS":
                case "PROFESSORE_PASS": {
                    const [placement, idx] = currentTurn.placement!;
                    return handlePlacementAction(placement, state, action._key!, idx);
                }
                case "PROFESSORE_RETRIEVE": {
                    const [retrievePlacement, retrieveIdx] = (action.data as string).split("_");
                    state = retrieveWorker(retrievePlacement as WorkerPlacement, parseInt(retrieveIdx, 10), state);
                    const [placement, idx] = currentTurn.placement!;
                    return handlePlacementAction(placement, state, action._key!, idx);
                }
                default:
                    return state;
            }
        case "WORKER_TRAINED":
            return endTurn(state);
        default:
            return state;
    }
};

const handlePlacementAction = (
    type: WorkerPlacement,
    state: GameState,
    key: string,
    placementIdx: number
): GameState => {
    if (isBoardAction(type)) {
        const bonus = boardActions[type].spaceAt(placementIdx, state).bonus;
        return boardAction(type, state, key, bonus);
    } else {
        return structureAction(type, state, key);
    }
}