import { Action } from "redux";
import { FieldId, GrapeColor, WineColor, CardId, WorkerPlacement, WorkerType } from "../GameState";
import { StructureId } from "../structures";
import { WineSpec } from "../orderCards";
import { Choice } from "./PromptState";

export type PromptAction =
    | BuildStructureAction
    | ChooseAction
    | ChooseCardsAction
    | ChooseFieldAction
    | ChooseWineAction
    | MakeWineAction
    | PlaceWorkerAction;

export const isPromptAction = (action: Action): action is PromptAction => {
    switch (action.type) {
        case "BUILD_STRUCTURE":
        case "CHOOSE_ACTION":
        case "CHOOSE_CARDS":
        case "CHOOSE_FIELD":
        case "CHOOSE_WINE":
        case "MAKE_WINE":
        case "PLACE_WORKER":
            return true;
        default:
            return false;
    }
};

interface ChooseAction extends Action<"CHOOSE_ACTION"> {
    choice: string;
    data?: unknown;
    playerId: string;
}
export const chooseAction = ({ id, data }: Choice, playerId: string): PromptAction => {
    return {
        type: "CHOOSE_ACTION",
        choice: id,
        ...(data ? { data } : null),
        playerId
    };
};

interface ChooseCardsAction extends Action<"CHOOSE_CARDS"> {
    cards?: CardId[];
    playerId: string;
}
export const chooseCards = (cards: CardId[], playerId: string): PromptAction => {
    return { type: "CHOOSE_CARDS", cards, playerId };
};

export interface GrapeSpec {
    color: GrapeColor;
    value: number;
}
export interface WineIngredients {
    type: WineColor;
    grapes: GrapeSpec[];
    grapeValue: number;
    cellarValue: number;
}
interface MakeWineAction extends Action<"MAKE_WINE"> {
    ingredients: WineIngredients[];
    playerId: string;
}
export const makeWine = (ingredients: WineIngredients[], playerId: string): PromptAction => {
    return { type: "MAKE_WINE", ingredients, playerId };
};

interface ChooseFieldAction extends Action<"CHOOSE_FIELD"> {
    fieldId: FieldId;
    playerId: string;
}
export const chooseField = (fieldId: FieldId, playerId: string): PromptAction => {
    return { type: "CHOOSE_FIELD", fieldId, playerId };
};

interface ChooseWineAction extends Action<"CHOOSE_WINE"> {
    wines: WineSpec[];
    playerId: string;
}
export const chooseWine = (wines: WineSpec[], playerId: string): PromptAction => {
    return { type: "CHOOSE_WINE", wines, playerId };
};

interface BuildStructureAction extends Action<"BUILD_STRUCTURE"> {
    structureId: StructureId;
    playerId: string;
}
export const buildStructure = (structureId: StructureId, playerId: string): PromptAction => {
    return { type: "BUILD_STRUCTURE", structureId, playerId };
};

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
