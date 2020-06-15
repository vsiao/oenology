import { Coupon } from "../structures";

export type PromptState =
    | ChooseActionPromptState
    | { type: "chooseField"; }
    | MakeWinePromptState
    | ChooseWinePromptState
    | BuildStructurePromptState;

export interface Choice {
    id: string;
    label: React.ReactNode;
    disabledReason?: string;
}
export interface ChooseActionPromptState {
    type: "chooseAction";
    playerId: string;
    choices: Choice[];
}

export interface MakeWinePromptState {
    type: "makeWine";
    upToN: number;
}

export interface ChooseWinePromptState {
    type: "chooseWine";
    minValue: number;
}

export interface BuildStructurePromptState {
    type: "buildStructure";
    coupon?: Coupon;
}
