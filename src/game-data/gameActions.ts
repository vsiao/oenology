import { PromptAction } from "./prompts/promptActions";
import { BoardAction } from "./board/boardActions";
import { Action } from "redux";
import {
    SummerVisitorId,
    WinterVisitorId,
    summerVisitorCards,
    winterVisitorCards,
    VisitorId,
} from "./visitors/visitorCards";
import { orderCards, OrderId } from "./orderCards";
import { VineId, vineCards } from "./vineCards";
import { CardsByType } from "./GameState";

export type GameAction = (
    | ChooseVineAction
    | ChooseVisitorAction
    | StartGameAction
    | PromptAction
    | BoardAction
) & {
    // Every action should first be pushed to firebase to be
    // applied on other clients. Then, only on success do we
    // apply to our own store.
    published?: true;
};

interface StartGameAction extends Action<"START_GAME"> {
    shuffledCards: CardsByType;
}
export const startGame = (): StartGameAction => {
    const vineIds = Object.keys(vineCards) as VineId[];
    const summerIds = Object.keys(summerVisitorCards) as SummerVisitorId[];
    const orderIds = Object.keys(orderCards) as OrderId[];
    const winterIds = Object.keys(winterVisitorCards) as WinterVisitorId[];

    inPlaceShuffle(vineIds);
    inPlaceShuffle(summerIds);
    inPlaceShuffle(orderIds);
    inPlaceShuffle(winterIds);

    return {
        type: "START_GAME",
        shuffledCards: {
            vine: vineIds,
            summerVisitor: summerIds,
            order: orderIds,
            winterVisitor: winterIds,
        },
    };
};

const inPlaceShuffle = (cards: unknown[]) => {
    // Fisher-Yates shuffle
    for (let i = cards.length - 1; i >= 0; --i) {
        const j = Math.floor(Math.random() * (i + 1)); // 0 <= x <= i
        const tmp = cards[i];
        cards[i] = cards[j];
        cards[j] = tmp;
    }
};

interface ChooseVineAction extends Action<"CHOOSE_VINE"> {
    vineId: VineId;
}
export const chooseVine = (vineId: VineId): ChooseVineAction => {
    return { type: "CHOOSE_VINE", vineId };
};

export interface ChooseVisitorAction extends Action<"CHOOSE_VISITOR"> {
    visitorId: VisitorId;
}
export const chooseVisitor = (visitorId: VisitorId): ChooseVisitorAction => {
    return { type: "CHOOSE_VISITOR", visitorId };
};
