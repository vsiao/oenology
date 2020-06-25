import { Coupon } from "../structures";
import { CardId } from "../GameState";
import { OrderId } from "../orderCards";
import { VisitorId } from "../visitors/visitorCards";

export type PromptState =
    | ChooseActionPromptState
    | ChooseCardPromptState
    | ChooseWinePromptState
    | FillOrderPromptState
    | ChooseFieldPromptState
    | MakeWinePromptState
    | BuildStructurePromptState;

export interface Choice<DataT = unknown> {
    id: string;
    label: React.ReactNode;
    data?: DataT;
    disabledReason?: string;
}
export interface ChooseActionPromptState {
    type: "chooseAction";
    title: string;
    playerId: string;
    contextVisitor?: VisitorId;
    choices: Choice[];
}

export interface ChooseCardPromptState {
    type: "chooseCard";
    title: string;
    cards: CardId[];
    optional?: boolean;
}

export interface ChooseWinePromptState {
    type: "chooseWine";
    minValue: number;
    limit: number;
}

export interface FillOrderPromptState {
    type: "fillOrder";
    orderIds: OrderId[];
}

export type ChooseFieldPurpose = "harvest" | "plant" | "buy" | "sell";
export interface ChooseFieldPromptState {
    type: "chooseField";
    purpose: ChooseFieldPurpose;
}

export interface MakeWinePromptState {
    type: "makeWine";
    upToN: number;
}

export interface BuildStructurePromptState {
    type: "buildStructure";
    coupon?: Coupon;
}
