import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import GameState, { CardType } from "./GameState";

export type GameAction =
    | CancelVisitorAction
    | DrawCardsAction
    | GainCoinsAction
    | GainVPAction
    | PayCoinsAction
    | TrainWorkerAction;

interface CancelVisitorAction extends Action<"CANCEL_VISITOR"> {}
export const cancelVisitor = (): CancelVisitorAction => {
    return { type: "CANCEL_VISITOR" };
};

interface DrawCardsAction extends Action<"DRAW_CARDS"> {
    cardType: CardType;
    n: number;
}
export const drawCards = (cardType: CardType, n: number): DrawCardsAction => {
    return { type: "DRAW_CARDS", cardType, n };
}

interface GainCoinsAction extends Action<"GAIN_COINS"> {
    n: number;
}
export const gainCoins = (n: number): GainCoinsAction => {
    return { type: "GAIN_COINS", n };
};

interface GainVPAction extends Action<"GAIN_VP"> {
    n: number;
}
export const gainVP = (n: number): GainVPAction => {
    return { type: "GAIN_VP", n };
};

interface PayCoinsAction extends Action<"PAY_COINS"> {
    n: number;
}
export const payCoins = (n: number): PayCoinsAction => {
    return { type: "PAY_COINS", n };
};

interface Choice {
    description: string;
    isValid: boolean;
    action: () => void;
}
interface PromptForNChoicesAction extends ThunkAction<Promise<void>, GameState, undefined, Action<string>> {}
export const promptForNChoices = (n: number, choices: Choice[]): PromptForNChoicesAction => {
    return (dispatch) => {
        return Promise.resolve();
    };
};

interface PromptToDiscardWineAction extends ThunkAction<Promise<number | null>, GameState, undefined, Action<string>> {}
export const promptToDiscardWine = (): PromptToDiscardWineAction => {
    return (dispatch) => {
        return Promise.resolve(9);
    };
};

interface PromptToMakeWineAction extends ThunkAction<Promise<void>, GameState, undefined, Action<string>> {}
export const promptToMakeWine = (upToN: number): PromptToMakeWineAction => {
    return (dispatch) => {
        return Promise.resolve();
    }
};

interface TrainWorkerAction extends Action<"TRAIN_WORKER"> {}
export const trainWorker = (): TrainWorkerAction => {
    return { type: "TRAIN_WORKER" };
};
