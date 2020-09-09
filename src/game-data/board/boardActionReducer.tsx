import GameState, { WorkerPlacement, StructureState } from "../GameState";
import {
    promptForAction,
    promptToBuildStructure,
    promptToChooseOrderCard,
    promptToChooseVineCard,
    promptToChooseVisitor,
    promptToHarvest,
    promptToMakeWine,
    promptToUproot
} from "../prompts/promptReducers";
import { setPendingAction, endTurn } from "../shared/turnReducers";
import { needGrapesDisabledReason, buyFieldDisabledReason, buildStructureDisabledReason } from "../shared/sharedSelectors";
import { drawCards } from "../shared/cardReducers";
import { gainCoins, markStructureUsed, trainWorker, payCoins, gainVP } from "../shared/sharedReducers";
import { boardActions } from "./boardPlacements";
import * as React from "react";
import Coins from "../../game-views/icons/Coins";

export const giveTour = (withBonus: boolean, state: GameState) => {
    const player = state.players[state.currentTurn.playerId];
    const tastingBonus = player.structures["tastingRoom"] === StructureState.Built &&
        Object.values(player.cellar).some(cellar => cellar.some(t => !!t));
    return gainCoins(
        withBonus ? 3 : 2,
        tastingBonus ? markStructureUsed("tastingRoom", gainVP(1, state)) : state
    );
};

export const boardAction = (
    placement: WorkerPlacement,
    state: GameState,
    seed: string,
    placementIdx?: number
): GameState => {
    const bonus = boardActions[placement].choiceAt(placementIdx, state).bonus;
    const hasBonus = !!bonus;
    const player = state.players[state.currentTurn.playerId];

    switch (placement) {
        case "buildOrGiveTour":
            return promptForAction(setPendingAction({ type: "buildOrGiveTour", hasBonus }, state), {
                choices: [
                    {
                        id: "BOARD_GIVE_TOUR",
                        label: <>Give tour to gain <Coins>{hasBonus ? 3 : 2}</Coins></>,
                    },
                    {
                        id: "BOARD_BUILD",
                        label: <>Build one structure{hasBonus ? <> at a <Coins>1</Coins> discount</> : null}</>,
                        disabledReason: buildStructureDisabledReason(
                            state,
                            hasBonus ? { kind: "discount", amount: 1 } : undefined
                        ),
                    }
                ]
            });
        case "buildStructure":
            return promptToBuildStructure(
                setPendingAction({ type: "buildStructure", hasBonus }, state),
                hasBonus ? { kind: "discount", amount: 1 } : undefined
            );
        case "buySell":
            return promptForAction(setPendingAction({ type: "buySell", hasBonus }, state), {
                choices: [
                    ...state.boardType === "base"
                        ? [{
                            id: "BOARD_SELL_GRAPES",
                            label: "Sell grape(s)",
                            disabledReason: needGrapesDisabledReason(state),
                        }]
                        : [],
                    {
                        id: "BOARD_BUY_FIELD",
                        label: "Buy a field",
                        disabledReason: buyFieldDisabledReason(state),
                    },
                    {
                        id: "BOARD_SELL_FIELD",
                        label: "Sell a field",
                        disabledReason: Object.values(state.players[player.id].fields)
                            .every(fields => fields.sold || fields.vines.length > 0)
                            ? "You don't have any fields to sell."
                            : undefined,
                    },
                ],
            });
        case "drawOrder": {
            return endTurn(drawCards(state, seed, { order: hasBonus ? 2 : 1 }));
        }
        case "drawVine": {
            return endTurn(drawCards(state, seed, { vine: hasBonus ? 2 : 1 }));
        }
        case "fillOrder":
            return promptToChooseOrderCard(setPendingAction({ type: "fillOrder", hasBonus }, state));
        case "gainCoin":
            return endTurn(gainCoins(1, state));
        case "giveTour":
            return endTurn(giveTour(hasBonus, state));
        case "harvestField": {
            return promptToHarvest(
                setPendingAction({
                    type: "harvestField",
                    hasBonus: bonus === "plusOne",
                }, bonus === "gainCoin" ? gainCoins(1, state) : state),
                hasBonus ? 2 : 1
            );
        }
        case "influence":
            return state; // TODO

        case "makeWine": {
            return promptToMakeWine(
                setPendingAction({ type: "makeWine", hasBonus }, state),
                /* upToN */ hasBonus ? 3 : 2
            );
        }
        case "plantVine":
            return promptToChooseVineCard(
                setPendingAction({ type: "plantVine", hasBonus }, state)
            );
        case "playSummerVisitor": {
            return promptToChooseVisitor(
                "summer",
                setPendingAction({
                    type: "playVisitor",
                    hasBonus: bonus === "playSummerVisitor",
                    placementIdx,
                }, bonus === "gainCoin" ? gainCoins(1, state) : state)
            );
        }
        case "playWinterVisitor": {
            return promptToChooseVisitor(
                "winter",
                setPendingAction({
                    type: "playVisitor",
                    hasBonus: bonus === "playWinterVisitor",
                    placementIdx,
                }, bonus === "gainCoin" ? gainCoins(1, state) : state)
            );
        }
        case "sellWine":
            return state; // TODO

        case "trade":
            return state; // TODO

        case "trainWorker": {
            return endTurn(trainWorker(payCoins(hasBonus ? 3 : 4, state)));
        }
        case "yokeHarvest":
            return promptToHarvest(
                setPendingAction({ type: "harvestField", hasBonus }, markStructureUsed("yoke", state))
            );
        case "yokeUproot":
            return promptToUproot(
                setPendingAction({ type: "uproot", hasBonus }, markStructureUsed("yoke", state))
            );
        default:
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const exhaustivenessCheck: never = placement;
            return state;
    }
};