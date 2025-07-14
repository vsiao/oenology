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

export interface ActionSpace {
    label: ReactNode;
    bonus?: PlacementBonus;
    disabledReason?: string | undefined;
    idx: number | undefined; // undefined if not on an action space (e.g. with grande)
}

export interface PlacementAction {
    type: BoardPlacement,
    label: (state: GameState) => React.ReactNode;
    spaceAt: (i: number, state: GameState) => ActionSpace;
}

export const placementAction = (
    type: BoardPlacement,
    makeSpace: (placementIdx: number, data: {
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
    return {
        type,
        label: state => makeSpace(-1, data(state)).label,
        spaceAt: (idx, state) => ({ ...makeSpace(idx, data(state)), idx }),
    };
}
