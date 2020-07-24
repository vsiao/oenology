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
import { needGrapesDisabledReason, buyFieldDisabledReason } from "../shared/sharedSelectors";
import { drawCards } from "../shared/cardReducers";
import { gainCoins, markStructureUsed, trainWorker, payCoins, gainVP } from "../shared/sharedReducers";

export const boardAction = (
    placement: WorkerPlacement,
    state: GameState,
    seed: string,
    hasBonus: boolean
): GameState => {
    const player = state.players[state.currentTurn.playerId];

    switch (placement) {
        case "buildStructure":
            return promptToBuildStructure(
                setPendingAction({ type: "buildStructure", hasBonus }, state),
                hasBonus ? { kind: "discount", amount: 1 } : undefined
            );
        case "buySell":
            return promptForAction(setPendingAction({ type: "buySell", hasBonus }, state), {
                choices: [
                    {
                        id: "BOARD_SELL_GRAPES",
                        label: "Sell grape(s)",
                        disabledReason: needGrapesDisabledReason(state),
                    },
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
        case "giveTour": {
            const tastingBonus = player.structures["tastingRoom"] === StructureState.Built &&
                Object.values(player.cellar).some(cellar => cellar.some(t => !!t));
            return endTurn(
                gainCoins(
                    hasBonus ? 3 : 2,
                    tastingBonus ? markStructureUsed("tastingRoom", gainVP(1, state)) : state
                )
            );
        }
        case "harvestField": {
            return promptToHarvest(
                setPendingAction({ type: "harvestField", hasBonus }, state),
                hasBonus ? 2 : 1
            );
        }
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
                setPendingAction({ type: "playVisitor", hasBonus }, state)
            );
        }
        case "playWinterVisitor": {
            return promptToChooseVisitor(
                "winter",
                setPendingAction({ type: "playVisitor", hasBonus }, state)
            );
        }
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