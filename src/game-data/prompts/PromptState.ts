import { Coupon } from "../structures";
import { CardId } from "../GameState";
import { OrderId } from "../orderCards";

export type PromptState =
    | ChooseActionPromptState
    | ChooseCardPromptState
    | DiscardWinePromptState
    | FillOrderPromptState
    | { type: "chooseField"; }
    | MakeWinePromptState
    | BuildStructurePromptState;

export interface Choice {
    id: string;
    label: React.ReactNode;
    disabledReason?: string;
}
export interface ChooseActionPromptState {
    type: "chooseAction";
    title: string;
    playerId: string;
    choices: Choice[];
}

export interface ChooseCardPromptState {
    type: "chooseCard";
    title: string;
    cards: CardId[];
}

export interface DiscardWinePromptState {
    type: "discardWine";
    minValue: number;
    limit: number;
}

export interface FillOrderPromptState {
    type: "fillOrder";
    orderIds: OrderId[];
}

export interface MakeWinePromptState {
    type: "makeWine";
    upToN: number;
}

export interface BuildStructurePromptState {
    type: "buildStructure";
    coupon?: Coupon;
}
