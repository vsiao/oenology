import * as React from "react";
import { WorkerPlacement } from "./boardActions";
import { Order, SummerVisitor, Vine, WinterVisitor } from "../../game-views/icons/Card";
import Coins from "../../game-views/icons/Coins";
import Worker from "../../game-views/icons/Worker";
import GameState from "../GameState";
import { hasGrapes, needGrapesDisabledReason, trainWorkerDisabledReason, harvestFieldDisabledReason, plantVineDisabledReason, needCardOfTypeDisabledReason, fillOrderDisabledReason, buildStructureDisabledReason } from "../shared/sharedSelectors";
import { default as VP } from "../../game-views/icons/VictoryPoints";
import WineGlass from "../../game-views/icons/WineGlass";

export interface BoardAction {
    type: WorkerPlacement,
    title: React.ReactNode,
    bonus: React.ReactNode; // displayed on game board
    bonusLabel: React.ReactNode; // displayed in place worker prompt
    disabledReason?: (state: GameState) => string | undefined;
}

export const summerActions: BoardAction[] = [
    {
        type: "drawVine",
        title: <>Draw <Vine /></>,
        bonusLabel: <>Draw 2 <Vine /></>,
        bonus: <Vine />,
    },
    {
        type: "playSummerVisitor",
        title: <>Play <SummerVisitor /></>,
        bonusLabel: <>Play up to 2 <SummerVisitor /></>,
        bonus: <SummerVisitor />,
        disabledReason: state => needCardOfTypeDisabledReason(state, "summerVisitor"),
    },
    {
        type: "giveTour",
        title: <>Give tour to gain <Coins>2</Coins></>,
        bonusLabel: <>Give tour to gain <Coins>3</Coins></>,
        bonus: <Coins>1</Coins>,
    },
    {
        type: "buySell",
        title: "Sell grape(s) or buy/sell one field",
        bonusLabel: <>Sell grape(s) or buy/sell one field and gain <VP>1</VP></>,
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
        type: "buildStructure",
        title: "Build one structure",
        bonusLabel: <>Build one structure at a <Coins>1</Coins> discount</>,
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
        bonusLabel: <>Plant up to 2 <Vine /></>,
        bonus: <Vine />,
        disabledReason: plantVineDisabledReason,
    }
];

export const winterActions: BoardAction[] = [
    {
        type: "drawOrder",
        title: <>Draw <Order /></>,
        bonusLabel: <>Draw 2 <Order /></>,
        bonus: <Order />,
    },
    {
        type: "playWinterVisitor",
        title: <>Play <WinterVisitor /></>,
        bonusLabel: <>Play up to 2 <WinterVisitor /></>,
        bonus: <WinterVisitor />,
        disabledReason: state => needCardOfTypeDisabledReason(state, "winterVisitor"),
    },
    {
        type: "harvestField",
        title: "Harvest one field",
        bonusLabel: <>Harvest up to 2 fields</>,
        bonus: <>+1</>,
        disabledReason: harvestFieldDisabledReason,
    },
    {
        type: "trainWorker",
        title: <>Pay <Coins>4</Coins> to train <Worker /></>,
        bonusLabel: <>Pay <Coins>3</Coins> to train <Worker /></>,
        bonus: <Coins>1</Coins>,
        disabledReason: state => {
            const isFirst = state.workerPlacements.trainWorker.length === 0;
            return trainWorkerDisabledReason(state, isFirst ? 3 : 4)
        },
    },
    {
        type: "makeWine",
        title: <>Make up to 2 <WineGlass /></>,
        bonusLabel: <>Make up to 3 <WineGlass /></>,
        bonus: <>+1</>,
        disabledReason: needGrapesDisabledReason,
    },
    {
        type: "fillOrder",
        title: <>Fill <Order /></>,
        bonusLabel: <>Fill <Order /> and gain <VP>1</VP> extra</>,
        bonus: <VP>1</VP>,
        disabledReason: fillOrderDisabledReason,
    }
];
