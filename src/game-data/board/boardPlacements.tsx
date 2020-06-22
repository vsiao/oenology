import * as React from "react";
import { WorkerPlacement } from "./boardActions";
import { Order, SummerVisitor, Vine, WinterVisitor } from "../../game-views/icons/Card";
import Coins from "../../game-views/icons/Coins";
import Worker from "../../game-views/icons/Worker";
import GameState from "../GameState";
import { hasGrapes, needGrapesDisabledReason, trainWorkerDisabledReason, harvestFieldDisabledReason, plantVineDisabledReason, needCardOfTypeDisabledReason, fillOrderDisabledReason } from "../shared/sharedSelectors";
import { structures, StructureId } from "../structures";

export interface BoardAction {
    type: WorkerPlacement,
    title: React.ReactNode,
    disabledReason?: (state: GameState) => string | undefined;
}

export const summerActions: BoardAction[] = [
    {
        type: "drawVine",
        title: <>Draw <Vine /></>
    },
    {
        type: "playSummerVisitor",
        title: <>Play <SummerVisitor /></>,
        disabledReason: state => needCardOfTypeDisabledReason(state, "summerVisitor"),
    },
    {
        type: "buySell",
        title: "Sell grape(s) or buy/sell one field",
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
    },
    {
        type: "buildStructure",
        title: "Build one structure",
        disabledReason: state => {
            const player = state.players[state.currentTurn.playerId]
            return Object.entries(player.structures)
                .some(([id, built]) =>
                    // TODO take into account bonus
                    !built && structures[id as StructureId].cost <= player.coins
                )
                ? undefined
                : "You don't have any structures you can build.";
        },
    },
    {
        type: "plantVine",
        title: <>Plant <Vine /></>,
        disabledReason: plantVineDisabledReason,
    }
];

export const winterActions: BoardAction[] = [
    {
        type: "playWinterVisitor",
        title: <>Play <WinterVisitor /></>,
        disabledReason: state => needCardOfTypeDisabledReason(state, "winterVisitor"),
    },
    {
        type: "drawOrder",
        title: <>Draw <Order /></>
    },
    {
        type: "harvestField",
        title: "Harvest one field",
        disabledReason: harvestFieldDisabledReason,
    },
    {
        type: "makeWine",
        title: "Make up to two wine tokens",
        disabledReason: needGrapesDisabledReason,
    },
    {
        type: "trainWorker",
        title: <>Pay <Coins>4</Coins> to train <Worker /></>,
        disabledReason: state => trainWorkerDisabledReason(state, 4),
    },
    {
        type: "fillOrder",
        title: <>Fill <Order /></>,
        disabledReason: fillOrderDisabledReason,
    }
];

export const allSeasonActions: BoardAction[] = [
    {
        type: "gainCoin",
        title: <>Gain <Coins>1</Coins></>
    },
];
