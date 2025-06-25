import { ReactNode } from "react";
import GameState, { StructurePlacement } from "../GameState";
import { promptToHarvest, promptToUproot } from "../prompts/promptReducers";
import { harvestFieldDisabledReason, structureUsedDisabledReason, uprootDisabledReason } from "../shared/sharedSelectors";
import { setPendingAction } from "../shared/turnReducers";
import type { PlacementChoice } from "../shared/placementAction";

export const structureAction = (
    placement: StructurePlacement,
    state: GameState,
    seed: string,
    placementIdx?: number
): GameState => {
    switch (placement) {
        case "yokeHarvest":
            return promptToHarvest(
                setPendingAction({ type: "harvestField", hasBonus: false }, state)
            );
        case "yokeUproot":
            return promptToUproot(
                setPendingAction({ type: "uproot", hasBonus: false }, state)
            );
        default:
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const exhaustivenessCheck: never = placement;
            return state;
    }
}

interface StructureAction {
    type: StructurePlacement;
    label: (state: GameState) => ReactNode;
    choiceAt: (i: number, state: GameState) => PlacementChoice;
}

const structurePlacement = (type: StructurePlacement, makeSpace: (state: GameState) =>{
    label: ReactNode;
    disabledReason?: string | undefined;
}): StructureAction => {
    return {
        type,
        label: state => makeSpace(state).label,
        choiceAt: (i, state) => ({ ...makeSpace(state), idx: 0 }),
    };
}

export const structureActions: Record<StructurePlacement, StructureAction> = {
    yokeHarvest: structurePlacement("yokeHarvest", state => ({
        label: "Yoke: Harvest one field",
        disabledReason: structureUsedDisabledReason(state, "yoke") ||
            harvestFieldDisabledReason(state),
    })),
    yokeUproot: structurePlacement("yokeUproot", state => ({
        label: "Yoke: Uproot one vine",
        disabledReason: structureUsedDisabledReason(state, "yoke") ||
            uprootDisabledReason(state),
    })),
};