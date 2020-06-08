import { SummerVisitorId } from "./summerVisitorCards";

export interface PickSummerVisitorAction {
    type: "PICK_SUMMER_VISITOR";
    visitorId: SummerVisitorId;
}
export const pickSummerVisitor = (visitorId: SummerVisitorId): PickSummerVisitorAction => {
    return {
        type: "PICK_SUMMER_VISITOR",
        visitorId,
    };
};
