import { Coupon } from "../structures";
import { CardId, FieldId } from "../GameState";
import { OrderId } from "../orderCards";
import { VisitorId } from "../visitors/visitorCards";
import { VineInField } from "./promptActions";

export type PromptState =
    | ChooseActionPromptState
    | ChooseCardPromptState
    | ChooseGrapePromptState
    | ChooseWinePromptState
    | FillOrderPromptState
    | ChooseFieldPromptState
    | MakeWinePromptState
    | PlaceWorkerPromptState
    | BuildStructurePromptState
    | GameOverPromptState;

export interface Choice<DataT = unknown> {
    id: string;
    label: React.ReactNode;
    data?: DataT;
    disabledReason?: string;
}
export interface ChooseActionPromptState {
    type: "chooseAction";
    title: string;
    description: React.ReactNode;
    playerId: string;
    choices: Choice[];
    upToN?: number;
}

export interface ChooseCardPromptState {
    type: "chooseCard";
    title: React.ReactNode;
    style: "selector" | "oneClick";
    cards: {
        id: CardId;
        disabledReason?: string | undefined;
    }[];
    optional?: boolean;
    numCards: number;
}

export interface ChooseWinePromptState {
    type: "chooseWine";
    minValue: number;
}

export interface ChooseGrapePromptState {
    type: "chooseGrape";
    limit?: number;
}

export interface FillOrderPromptState {
    type: "fillOrder";
    orderIds: OrderId[];
}

export interface ChooseFieldPromptState {
    type: "chooseField";
    kind:
        | "oneClick" // plant; buy/sell field
        | "harvest" // multi-field selection
        | "uproot" // multi-vine selection
        | "switch"; // two-vine swap
    disabledReasons: Record<FieldId, string | undefined>;
    numSelections: number;
    submitDisabledReason?: (vines: VineInField[]) => string | undefined;
}

export interface MakeWinePromptState {
    type: "makeWine";
    upToN: number;
    asZymologist: boolean;
}

export interface PlaceWorkerPromptState {
    type: "placeWorker";
    // ##ForcePromptRemount
    // Occasionally a player may have two consecutive turns.
    // We want this prompt to remount in order to trigger animations
    // for a better sense of progress.
    key: string;
}

export interface BuildStructurePromptState {
    type: "buildStructure";
    coupon?: Coupon;
}

export interface GameOverPromptState {
    type: "gameOver";
}
