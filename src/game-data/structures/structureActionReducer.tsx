import { action, WorkerAction } from "../board/workerPlacements";
import GameState, { StructurePlacement } from "../GameState";
import { promptToHarvest, promptToUproot } from "../prompts/promptReducers";
import { markStructureUsed } from "../shared/sharedReducers";
import { harvestFieldDisabledReason, structureUsedDisabledReason, uprootDisabledReason } from "../shared/sharedSelectors";
import { setPendingAction } from "../shared/turnReducers";

export const structureAction = (
    placement: StructurePlacement,
    state: GameState,
    seed: string,
    placementIdx?: number
): GameState => {
    switch (placement) {
        case "yokeHarvest":
            return promptToHarvest(
                setPendingAction({ type: "harvestField", hasBonus: false }, markStructureUsed("yoke", state))
            );
        case "yokeUproot":
            return promptToUproot(
                setPendingAction({ type: "uproot", hasBonus: false }, markStructureUsed("yoke", state))
            );
        default:
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const exhaustivenessCheck: never = placement;
            return state;
    }
}

export const structureActions: Record<StructurePlacement, WorkerAction> = {
    yokeHarvest: action(
        "yokeHarvest",
        (i, { state }) => ({
            label: "Yoke: Harvest one field",
            disabledReason: structureUsedDisabledReason(state, "yoke") ||
                harvestFieldDisabledReason(state),
        })
    ),
    yokeUproot: action(
        "yokeUproot",
        (i, { state }) => ({
            label: "Yoke: Uproot",
            disabledReason: structureUsedDisabledReason(state, "yoke") ||
                uprootDisabledReason(state),
        })
    ),
};