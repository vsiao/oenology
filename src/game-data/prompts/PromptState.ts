
export type PromptState =
    | null
    | ChooseActionPromptState
    | { type: "chooseField" }
    | MakeWinePromptState
    | ChooseWinePromptState;

export interface Choice {
    id: string;
    label: React.ReactNode;
    disabledReason?: string;
}
export interface ChooseActionPromptState {
    type: "chooseAction";
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
