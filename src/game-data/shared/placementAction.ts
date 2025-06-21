import { ReactNode } from "react";
import GameState, { BoardType, WorkerPlacement } from "../GameState";

export type PlacementBonus =
    | "gainCoin"
    | "gainVP"
    | "drawOrder"
    | "drawVine"
    | "plantVine"
    | "influence"
    | "playSummerVisitor"
    | "playWinterVisitor"
    | "plusOne";

interface PlacementChoice {
    label: ReactNode;
    bonus?: PlacementBonus;
    disabledReason?: string | undefined;
    idx: number | undefined; // undefined if not on an action space (e.g. with grande)
}

export interface PlacementAction {
    type: WorkerPlacement,
    label: (state: GameState) => React.ReactNode;
    choices: (state: GameState) => PlacementChoice[];
    choiceAt: (i: number | undefined, state: GameState) => PlacementChoice;
}

export const numSpots = (state: GameState) => Math.ceil(state.tableOrder.length / 2);

export const placementAction = (
    type: WorkerPlacement,
    choice: (placementIdx: number | undefined, data: {
        state: GameState;
        boardType: BoardType;
        numSpots: number;
    }) => {
        label: React.ReactNode;
        bonus?: PlacementBonus;
        disabledReason?: string | undefined;
    }
): PlacementAction => {
    const firstEmptyIndex = (state: GameState) => {
        const placements = state.workerPlacements[type];
        const firstEmpty = placements.findIndex(w => !w); // find first empty
        const i = firstEmpty < 0 ? placements.length : firstEmpty;
        return i >= numSpots(state)
            ? undefined // must use grande to place
            : i;
    };
    const data = (state: GameState) => ({
        boardType: state.boardType ?? "base",
        numSpots: numSpots(state),
        state,
    });
    const choiceAt = (idx: number | undefined, state: GameState) => {
        return { ...choice(idx, data(state)), idx };
    };

    return {
        type,
        label: state => choice(-1, data(state)).label,
        choiceAt,
        choices: state => {
            const d = data(state);
            const firstChoice = choiceAt(firstEmptyIndex(state), state);
            const placements = state.workerPlacements[type];
            if (firstChoice?.bonus) {
                // return all possible bonus placements
                return new Array(numSpots(state)).fill(null)
                    .map((_, idx) => ({ ...choice(idx, d), idx }))
                    .filter(({ bonus }, i) => !placements[i] && !!bonus);
            } else {
                return [firstChoice];
            }
        },
    };
}
