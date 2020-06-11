import { Action } from "redux";
import { FieldId } from "../GameState";

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

interface MakeWineAction extends Action<"MAKE_WINE"> {
}

interface ChooseFieldAction extends Action<"CHOOSE_FIELD"> {
    fieldId: FieldId;
}
export const chooseField = (fieldId: FieldId): PromptAction => {
    return { type: "CHOOSE_FIELD", fieldId };
};

interface ChooseWineAction extends Action<"CHOOSE_WINE"> {
    wine: { value: number }; // FIXME
}
