import { PromptAction } from "./promptActionTypes";

export const chooseAction = (choice: number): PromptAction => {
    return { type: "CHOOSE_ACTION", choice };
};
