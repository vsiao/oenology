import { Action } from "redux";
import { FieldId, GrapeColor, WineColor } from "../GameState";

export type PromptAction =
    | ChooseAction
    | MakeWineAction
    | ChooseFieldAction
    | ChooseWineAction;

interface ChooseAction extends Action<"CHOOSE_ACTION"> {
    choice: string;
}
export const chooseAction = (choice: string): PromptAction => {
    return { type: "CHOOSE_ACTION", choice };
};

export interface GrapeSpec {
    color: GrapeColor;
    value: number;
}
export interface WineIngredients {
    type: WineColor;
    grapes: GrapeSpec[];
}
interface MakeWineAction extends Action<"MAKE_WINE"> {
    ingredients: WineIngredients[];
}
export const makeWine = (ingredients: WineIngredients[]): PromptAction => {
    return { type: "MAKE_WINE", ingredients };
};

interface ChooseFieldAction extends Action<"CHOOSE_FIELD"> {
    fieldId: FieldId;
}
export const chooseField = (fieldId: FieldId): PromptAction => {
    return { type: "CHOOSE_FIELD", fieldId };
};

interface ChooseWineAction extends Action<"CHOOSE_WINE"> {
    wine: { value: number }; // FIXME
}
