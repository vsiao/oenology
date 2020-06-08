import { Action } from "redux";
import { PromptAction } from "./prompts/promptActionTypes";
import { PickWinterVisitorAction } from "./visitors/winter/winterVisitorActionCreators";
import { PickSummerVisitorAction } from "./visitors/summer/summerVisitorActionCreators";

export type GameAction =
    | PromptAction
    | TrainWorkerAction
    | PickSummerVisitorAction
    | PickWinterVisitorAction
    | PlantVineAction;

interface TrainWorkerAction extends Action<"TRAIN_WORKER"> { }
export const trainWorker = (): TrainWorkerAction => {
    return { type: "TRAIN_WORKER" };
};

interface PlantVineAction extends Action<"PLANT_VINE"> {
    vine: string;
}
export const plantVine = (vine: string): PlantVineAction => {
    return { type: "PLANT_VINE", vine };
};
