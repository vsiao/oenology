import { VisitorId } from "./visitorCards";

export interface PickVisitorAction {
    type: "PICK_VISITOR";
    visitorId: VisitorId;
}
export const pickVisitor = (visitorId: VisitorId): PickVisitorAction => {
    return {
        type: "PICK_VISITOR",
        visitorId,
    };
};
