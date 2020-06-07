
export type PromptState =
    | null
    | ChooseActionPrompt
    | MakeWinePrompt
    | PickWinePrompt;

export interface ChooseActionPrompt {
    type: "chooseAction";
    choices: React.ReactNode[];
}

export interface MakeWinePrompt {
    type: "makeWine";
    upToN: number;
}

export interface PickWinePrompt {
    type: "pickWine";
    minValue: number;
}
