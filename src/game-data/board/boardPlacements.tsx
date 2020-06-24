import * as React from "react";
import { WorkerPlacement } from "./boardActions";
import { Order, SummerVisitor, Vine, WinterVisitor } from "../../game-views/icons/Card";
import Coins from "../../game-views/icons/Coins";
import Worker from "../../game-views/icons/Worker";
import GameState from "../GameState";
import { hasGrapes, needGrapesDisabledReason, trainWorkerDisabledReason, harvestFieldDisabledReason, plantVineDisabledReason, needCardOfTypeDisabledReason, fillOrderDisabledReason, buildStructureDisabledReason } from "../shared/sharedSelectors";
import { structures, StructureId } from "../structures";
import { default as VP } from "../../game-views/icons/VictoryPoints";
import WineGlass from "../../game-views/icons/WineGlass";

export interface BoardAction {
    type: WorkerPlacement,
    title: React.ReactNode,
    bonus: React.ReactNode;
    disabledReason?: (state: GameState) => string | undefined;
}

export const summerActions: BoardAction[] = [
    {
        type: "drawVine",
        title: <>Draw <Vine /></>,
        bonus: <Vine />,
    },
    {
        type: "playSummerVisitor",
        title: <>Play <SummerVisitor /></>,
        bonus: <SummerVisitor />,
        disabledReason: state => needCardOfTypeDisabledReason(state, "summerVisitor"),
    },
    {
        type: "buySell",
        title: "Sell grape(s) or buy/sell one field",
        bonus: <VP>1</VP>,
        disabledReason: state => {
            return hasGrapes(state) ||
                Object.values(state.players[state.currentTurn.playerId].fields)
                    .some(f => f.sold || f.vines.length === 0)
                    ? undefined
                    : "You don't have anything to buy or sell.";
        },
    },
    {
        type: "giveTour",
        title: <>Give tour to gain <Coins>2</Coins></>,
        bonus: <Coins>1</Coins>,
    },
    {
        type: "buildStructure",
        title: "Build one structure",
        bonus: <Coins>1</Coins>,
        disabledReason: state => {
            const isFirst = state.workerPlacements.buildStructure.length === 0;
            return buildStructureDisabledReason(
                state,
                isFirst ? { kind: "discount", amount: 1 } : undefined
            );
        },
    },
    {
        type: "plantVine",
        title: <>Plant <Vine /></>,
        bonus: <Vine />,
        disabledReason: plantVineDisabledReason,
    }
];

export const winterActions: BoardAction[] = [
    {
        type: "playWinterVisitor",
        title: <>Play <WinterVisitor /></>,
        bonus: <WinterVisitor />,
        disabledReason: state => needCardOfTypeDisabledReason(state, "winterVisitor"),
    },
    {
        type: "drawOrder",
        title: <>Draw <Order /></>,
        bonus: <Order />,
    },
    {
        type: "harvestField",
        title: "Harvest one field",
        bonus: <>+1</>,
        disabledReason: harvestFieldDisabledReason,
    },
    {
        type: "makeWine",
        title: <>Make up to two <WineGlass /></>,
        bonus: <>+1</>,
        disabledReason: needGrapesDisabledReason,
    },
    {
        type: "trainWorker",
        title: <>Pay <Coins>4</Coins> to train <Worker /></>,
        bonus: <Coins>1</Coins>,
        disabledReason: state => {
            const isFirst = state.workerPlacements.buildStructure.length === 0;
            return trainWorkerDisabledReason(state, isFirst ? 3 : 4)
        },
    },
    {
        type: "fillOrder",
        title: <>Fill <Order /></>,
        bonus: <VP>1</VP>,
        disabledReason: fillOrderDisabledReason,
    }
];
