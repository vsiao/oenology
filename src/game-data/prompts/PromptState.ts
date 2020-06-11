
export type PromptState =
    | null
    | ChooseActionPromptState
    | MakeWinePromptState
    | PickWinePromptState;

export interface Choice {
    id: string;
    label: React.ReactNode;
}
export interface ChooseActionPromptState {
    type: "chooseAction";
    choices: Choice[];
}

export interface MakeWinePromptState {
    type: "makeWine";
    upToN: number;
}

export interface PickWinePromptState {
    type: "pickWine";
    minValue: number;
}
