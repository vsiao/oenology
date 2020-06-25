import { Action } from "redux";
import { WorkerType } from "../GameState";

export type BoardAction =
    | PlaceWorkerAction

export type WorkerPlacement =
    | "drawVine"
    | "giveTour"
    | "buildStructure"
    | "playSummerVisitor"
    | "buySell"
    | "plantVine"
    | "drawOrder"
    | "harvestField"
    | "trainWorker"
    | "playWinterVisitor"
    | "makeWine"
    | "fillOrder"
    | "gainCoin"
    | "yoke";

interface PlaceWorkerAction extends Action<"PLACE_WORKER"> {
    placement: WorkerPlacement | null; // null means pass
    workerType: WorkerType;
    playerId: string;
}
export const placeWorker = (
    placement: WorkerPlacement | null,
    workerType: WorkerType,
    playerId: string
): PlaceWorkerAction => {
    return { type: "PLACE_WORKER", placement, workerType, playerId };
};
