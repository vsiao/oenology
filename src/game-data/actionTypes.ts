import { PromptAction } from "./prompts/promptActionTypes";
import { PickWinterVisitorAction } from "./visitors/winter/winterVisitorActionCreators";
import { PickSummerVisitorAction } from "./visitors/summer/summerVisitorActionCreators";
import { PlaceWorkerAction } from "./board/boardActionCreators";

export type GameAction = (
    | PromptAction
    | PickSummerVisitorAction
    | PickWinterVisitorAction
    | PlaceWorkerAction
) & {
    // Every action should first be pushed to firebase to be
    // applied on other clients. Then, only on success do we
    // apply to our own store.
    published?: true
};
