import { Action } from "redux";
import { FieldId, GrapeColor, WineColor, CardId } from "../GameState";
import { StructureId } from "../structures";
import { WineSpec } from "../orderCards";
import { Choice } from "./PromptState";

export type PromptAction =
    | ChooseAction
    | ChooseCardsAction
    | ChooseFieldAction
    | ChooseWineAction
    | BuildStructureAction
    | MakeWineAction;

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
