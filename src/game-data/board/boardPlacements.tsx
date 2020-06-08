import * as React from "react";
import { WorkerPlacement } from "./boardActionCreators";
import { Order, SummerVisitor, Vine, WinterVisitor } from "../../game-views/icons/Card";
import Coins from "../../game-views/icons/Coins";

export interface BoardAction {
    type: WorkerPlacement,
    title: React.ReactNode,
}

export const SummerActions: BoardAction[] = [
    {
        type: "drawVine",
        title: <>Draw <Vine /></>
    },
    {
        type: "playSummerVisitor",
        title: <>Play <SummerVisitor /></>
    },
    {
        type: "buySell",
        title: "Sell at least one grape or buy/sell one field"
    },
    {
        type: "giveTour",
        title: <>Give tour to gain <Coins>2</Coins></>
    },
    {
        type: "buildStructure",
        title: "Build one structure"
    },
    {
        type: "plantVine",
        title: <>Plant <Vine /></>
    }
];

export const WinterActions: BoardAction[] = [
    {
        type: "playWinterVisitor",
        title: <>Play <WinterVisitor /></>
    },
    {
        type: "drawOrder",
        title: <>Draw <Order /></>
    },
    {
        type: "harvestField",
        title: "Harvest one field"
    },
    {
        type: "makeWine",
        title: "Make up to two wine tokens"
    },
    {
        type: "trainWorker",
        title: "Train worker",
    },
    {
        type: "fillOrder",
        title: <>Fill <Order /></>
    }
];

export const AllSeasonActions: BoardAction[] = [
    {
        type: "gainCoin",
        title: <>Gain <Coins>1</Coins></>
    },
];
