import { Action } from "redux";
import { PromptAction } from "./prompts/promptActionTypes";
import { PickWinterVisitorAction } from "./visitors/winter/winterVisitorActionCreators";
import { PickSummerVisitorAction } from "./visitors/summer/summerVisitorActionCreators";
import { PlaceWorkerAction } from "./board/boardActionCreators";

export type GameAction =
    | PromptAction
    | PickSummerVisitorAction
    | PickWinterVisitorAction
    | PlaceWorkerAction;
