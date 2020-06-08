
export type PromptState =
    | null
    | ChooseActionPromptState
    | MakeWinePromptState
    | PickWinePromptState;

export interface ChooseActionPromptState {
    type: "chooseAction";
    choices: React.ReactNode[];
}

export interface MakeWinePromptState {
    type: "makeWine";
    upToN: number;
}

export interface PickWinePromptState {
    type: "pickWine";
    minValue: number;
}
