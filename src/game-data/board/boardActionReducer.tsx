import GameState, { WorkerPlacement, StructureState, CardType, GrapeColor, WorkerPlacementTurn } from "../GameState";
import {
    promptForAction,
    promptToBuildStructure,
    promptToChooseOrderCard,
    promptToChooseVineCard,
    promptToChooseVisitor,
    promptToHarvest,
    promptToMakeWine,
    promptToUproot,
    promptToChooseGrape,
    promptToDiscard,
    promptToChooseWine
} from "../prompts/promptReducers";
import { setPendingAction, endTurn } from "../shared/turnReducers";
import { needGrapesDisabledReason, buyFieldDisabledReason, buildStructureDisabledReason, numCardsDisabledReason, moneyDisabledReason, cardTypesInPlay } from "../shared/sharedSelectors";
import { drawCards, discardCards } from "../shared/cardReducers";
import { gainCoins, markStructureUsed, trainWorker, payCoins, gainVP, loseVP } from "../shared/sharedReducers";
import { boardActions } from "./boardPlacements";
import * as React from "react";
import Coins from "../../game-views/icons/Coins";
import Card from "../../game-views/icons/Card";
import VictoryPoints from "../../game-views/icons/VictoryPoints";
import Grape from "../../game-views/icons/Grape";
import { GameAction } from "../gameActions";
import { discardGrapes, placeGrapes } from "../shared/grapeWineReducers";
import { promptToInfluence } from "./influenceReducers";

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
            return promptToInfluence(state, hasBonus ? "withBonus" : "optional");

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
            return hasBonus
                ? promptToInfluence(state, "thenSellWine")
                : promptToSellWine(state);

        case "trade":
            return promptToTrade(state, hasBonus);

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

export const promptToSellWine = (state: GameState) => {
    return promptToChooseWine(
        setPendingAction({ type: "sellWine", hasBonus: false }, state),
        { numWines: 1 }
    );
};

//
// Trade action
// ----------------------------------------------------------------------------

const promptToTrade = (state: GameState, hasBonus: boolean) => {
    return promptForAction(setPendingAction({ type: "trade", hasBonus }, state), {
        choices: [
            {
                id: "TRADE_DISCARD",
                label: <>Discard 2 <Card /></>,
                disabledReason: numCardsDisabledReason(state, 2),
            },
            {
                id: "TRADE_PAY",
                label: <>Pay <Coins>3</Coins></>,
                disabledReason: moneyDisabledReason(state, 3),
            },
            {
                id: "TRADE_LOSE",
                label: <>Lose <VictoryPoints>1</VictoryPoints></>,
            },
            {
                id: "TRADE_DISCARD_GRAPE",
                label: <>Discard <Grape /></>,
            },
        ],
    });
};

const promptToGain = (state: GameState) => {
    return promptForAction(state, {
        choices: [
            { id: "TRADE_DRAW", label: <>Draw 2 <Card /></>, },
            { id: "TRADE_GAIN_COINS", label: <>Gain <Coins>3</Coins></>, },
            { id: "TRADE_GAIN_VP", label: <>Gain <VictoryPoints>1</VictoryPoints></>, },
            { id: "TRADE_GAIN_GRAPE", label: <>Gain <Grape>1</Grape></>, },
        ],
    })
};

const maybeEndTrade = (state: GameState): GameState => {
    if ((state.currentTurn as WorkerPlacementTurn).pendingAction?.hasBonus) {
        return promptToTrade(state, /* hasBonus */ false);
    }
    return endTurn(state);
};

export const trade = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case "CHOOSE_ACTION":
            switch (action.choice) {
                case "TRADE_DISCARD":
                    return promptToDiscard(2, state);
                case "TRADE_PAY":
                    return promptToGain(payCoins(3, state));
                case "TRADE_LOSE":
                    return promptToGain(loseVP(1, state));
                case "TRADE_DISCARD_GRAPE":
                    return promptToChooseGrape(state);

                case "TRADE_DRAW":
                    interface TradeDrawChoiceData {
                        cardType: CardType;
                        cardsDrawn: number;
                    }
                    const { cardType, cardsDrawn } = (action.data as TradeDrawChoiceData) ?? {
                        cardType: undefined,
                        cardsDrawn: 0,
                    };
                    if (cardType) {
                        state = drawCards(state, action._key!, { [cardType]: 1 });
                    }
                    if (cardsDrawn >= 2) {
                        return maybeEndTrade(state);
                    }
                    return promptForAction<TradeDrawChoiceData>(state, {
                        title: `Draw a card (${cardsDrawn + 1} of 2)`,
                        choices: cardTypesInPlay(state).map(cardType => ({
                            id: "TRADE_DRAW",
                            data: { cardType, cardsDrawn: cardsDrawn + 1 },
                            label: <>Draw <Card type={cardType} /></>,
                        })),
                    });
                case "TRADE_GAIN_COINS":
                    return maybeEndTrade(gainCoins(3, state));
                case "TRADE_GAIN_VP":
                    return maybeEndTrade(gainVP(1, state));
                case "TRADE_GAIN_GRAPE":
                    if (action.data) {
                        return maybeEndTrade(placeGrapes(state, { [action.data as GrapeColor]: 1 }));
                    }
                    return promptForAction<GrapeColor>(state, {
                        choices: (["red", "white"] as const).map(color => ({
                            id: "TRADE_GAIN_GRAPE",
                            data: color,
                            label: <>Gain <Grape color={color}>1</Grape></>,
                        })),
                    });
                default:
                    return state;
            }
        case "CHOOSE_CARDS":
            return promptToGain(discardCards(action.cards!, state));
        case "CHOOSE_GRAPE":
            return promptToGain(discardGrapes(state, action.grapes));
        default:
            return state;
    }
};