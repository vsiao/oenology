import { ReactNode } from "react";
import GameState, { BoardPlacement, BoardType } from "../GameState";
import { numActionSpaces } from "./sharedSelectors";

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

export interface PlacementChoice {
    label: ReactNode;
    bonus?: PlacementBonus;
    disabledReason?: string | undefined;
    idx: number | undefined; // undefined if not on an action space (e.g. with grande)
}

export interface PlacementAction {
    type: BoardPlacement,
    label: (state: GameState) => React.ReactNode;
    choiceAt: (i: number, state: GameState) => PlacementChoice;
}

export const placementAction = (
    type: BoardPlacement,
    choice: (placementIdx: number, data: {
        state: GameState;
        boardType: BoardType;
        numSpots: number;
    }) => {
        label: React.ReactNode;
        bonus?: PlacementBonus;
        disabledReason?: string | undefined;
    }
): PlacementAction => {
    const data = (state: GameState) => ({
        boardType: state.boardType ?? "base",
        numSpots: numActionSpaces(state),
        state,
    });
    const choiceAt = (idx: number, state: GameState) => {
        return { ...choice(idx, data(state)), idx };
    };

    return {
        type,
        label: state => choice(-1, data(state)).label,
        choiceAt,
    };
}
