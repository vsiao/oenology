import { WinterVisitorId } from "./winterVisitorCards"

export interface PickWinterVisitorAction {
    type: "PICK_WINTER_VISITOR";
    visitorId: WinterVisitorId;
}
export const pickWinterVisitor = (visitorId: WinterVisitorId): PickWinterVisitorAction => {
    return {
        type: "PICK_WINTER_VISITOR",
        visitorId,
    };
};
