export type PromptAction =
    | ChooseAction
    | MakeWineAction
    | PickWineAction;

interface ChooseAction {
    type: "CHOOSE_ACTION";
    choice: number;
}

interface MakeWineAction {
    type: "MAKE_WINE";
    upToN: number;
}

interface PickWineAction {
    type: "PICK_WINE";
    wine: { value: number }; // FIXME
}
