import { Action } from "redux";
import { FieldId, GrapeColor, WineColor, CardId } from "../GameState";
import { StructureId } from "../structures";
import { WineSpec } from "../orderCards";

export type PromptAction =
    | ChooseAction
    | ChooseCardAction
    | ChooseFieldAction
    | ChooseWineAction
    | BuildStructureAction
    | MakeWineAction;

interface ChooseAction extends Action<"CHOOSE_ACTION"> {
    choice: string;
    playerId: string;
}
export const chooseAction = (choice: string, playerId: string): PromptAction => {
    return { type: "CHOOSE_ACTION", choice, playerId };
};

interface ChooseCardAction extends Action<"CHOOSE_CARD"> {
    card: CardId;
    playerId: string;
}
export const chooseCard = (card: CardId, playerId: string): PromptAction => {
    return { type: "CHOOSE_CARD", card, playerId };
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
