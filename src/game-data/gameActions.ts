import { PromptAction } from "./prompts/promptActionTypes";
import { PickWinterVisitorAction } from "./visitors/winter/winterVisitorActionCreators";
import { PickSummerVisitorAction } from "./visitors/summer/summerVisitorActionCreators";
import { PlaceWorkerAction } from "./board/boardActionCreators";
import { Action } from "redux";
import { summerVisitorCards, SummerVisitorId } from "./visitors/summer/summerVisitorCards";
import { winterVisitorCards, WinterVisitorId } from "./visitors/winter/winterVisitorCards";
import { orderCards, OrderId } from "./orderCards";
import { VineId, vineCards } from "./vineCards";

export type GameAction = (
    | StartGameAction
    | PromptAction
    | PickSummerVisitorAction
    | PickWinterVisitorAction
    | PlaceWorkerAction
) & {
    // Every action should first be pushed to firebase to be
    // applied on other clients. Then, only on success do we
    // apply to our own store.
    published?: true;
};

export interface ShuffledCards {
    vine: VineId[];
    summerVisitor: SummerVisitorId[];
    order: OrderId[];
    winterVisitor: WinterVisitorId[];
}
interface StartGameAction extends Action<"START_GAME"> {
    shuffledCards: ShuffledCards;
}
export const startGame = (): StartGameAction => {
    const vineIds: VineId[] = [];
    for (const [vineId, { count }] of Object.entries(vineCards)) {
        vineIds.push(...new Array<VineId>(count).fill(vineId as VineId));
    }
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