import * as React from "react";
import { Order, SummerVisitor, Vine, WinterVisitor } from "../../game-views/icons/Card";
import Coins from "../../game-views/icons/Coins";
import Worker from "../../game-views/icons/Worker";
import GameState, { WorkerPlacement, Season } from "../GameState";
import {
    buildStructureDisabledReason,
    fillOrderDisabledReason,
    harvestFieldDisabledReason,
    hasGrapes,
    needCardOfTypeDisabledReason,
    needGrapesDisabledReason,
    plantVinesDisabledReason,
    structureUsedDisabledReason,
    trainWorkerDisabledReason,
    uprootDisabledReason,
} from "../shared/sharedSelectors";
import { default as VP } from "../../game-views/icons/VictoryPoints";
import WineGlass from "../../game-views/icons/WineGlass";

export interface BoardAction {
    type: WorkerPlacement,
    label: (state: GameState, placementIndex?: number) => React.ReactNode;
    boardIcon: (state: GameState, placementIndex?: number) => React.ReactNode;
    disabledReason: (state: GameState, placementIndex?: number) => string | undefined;
}

const action = (
    type: WorkerPlacement,
    label: (bonusIdx?: number) => React.ReactNode,
    boardIcon?: (bonusIdx?: number) => React.ReactNode,
    disabledReason?: (state: GameState, bonusIdx: number) => string | undefined
): BoardAction => {
    const defaultPlacementIndex = (state: GameState) => {
        const placements = state.workerPlacements[type];
        const i = placements.indexOf(null); // find first empty
        return i < 0 ? placements.length : i;
    };
    const bonusIdx = (state: GameState, placementIdx: number) => {
        return state.tableOrder.length > 2 ? placementIdx : -1;
    };
    return {
        type,
        label: ((state, i = defaultPlacementIndex(state)) => label(bonusIdx(state, i))),
        boardIcon: ((state, i = defaultPlacementIndex(state)) =>
            boardIcon && boardIcon(bonusIdx(state, i))),
        disabledReason: ((state, i = defaultPlacementIndex(state)) =>
            disabledReason && disabledReason(state, bonusIdx(state, i)))
    };
}

const boardActions: Record<WorkerPlacement, BoardAction> = {
    buildStructure: action(
        "buildStructure",
        i => i === 0
            ? <>Build one structure at a <Coins>1</Coins> discount</>
            : <>Build one structure</>,
        i => i === 0 ? <Coins>1</Coins> : null,
        (state, i) => {
            return buildStructureDisabledReason(
                state,
                i === 0 ? { kind: "discount", amount: 1 } : undefined
            );
        },
    ),
    buySell: action(
        "buySell",
        i => i === 0
            ? <>Sell grape(s) or buy/sell one field and gain <VP>1</VP></>
            : <>Sell grape(s) or buy/sell one field</>,
        i => i === 0 ? <VP>1</VP> : null,
        state => {
            const player = state.players[state.currentTurn.playerId];
            return hasGrapes(state) ||
                Object.values(player.fields)
                    .some(f =>
                        (f.sold && player.coins >= f.value) ||
                        (!f.sold && f.vines.length === 0)
                    )
                ? undefined
                : "You don't have anything to buy or sell.";
        },
    ),
    drawOrder: action(
        "drawOrder",
        i => i === 0 ? <>Draw 2 <Order /></> : <>Draw <Order /></>,
        i => i === 0 ? <Order /> : null,
    ),
    drawVine: action(
        "drawVine",
        i => i === 0 ? <>Draw 2 <Vine /></> : <>Draw <Vine /></>,
        i => i === 0 ? <Vine /> : null,
    ),
    fillOrder: action(
        "fillOrder",
        i => i === 0
            ? <>Fill <Order /> and gain <VP>1</VP> extra</>
            : <>Fill <Order /></>,
        i => i === 0 ? <VP>1</VP> : null,
        state => fillOrderDisabledReason(state),
    ),
    gainCoin: action(
        "gainCoin",
        () => <>Gain <Coins>1</Coins></>
    ),
    giveTour: action(
        "giveTour",
        i => i === 0
            ? <>Give tour to gain <Coins>3</Coins></>
            : <>Give tour to gain <Coins>2</Coins></>,
        i => i === 0 ? <Coins>1</Coins> : null,
    ),
    harvestField: action(
        "harvestField",
        i => i === 0 ? <>Harvest up to 2 fields</> : <>Harvest one field</>,
        i => i === 0 ? <>+1</> : null,
        harvestFieldDisabledReason,
    ),
    makeWine: action(
        "makeWine",
        i => i === 0 ? <>Make up to 3 <WineGlass /></> : <>Make up to 2 <WineGlass /></>,
        i => i === 0 ? <>+1</> : null,
        state => needGrapesDisabledReason(state),
    ),
    plantVine: action(
        "plantVine",
        i => i === 0 ? <>Plant up to 2 <Vine /></> : <>Plant <Vine /></>,
        i => i === 0 ? <Vine /> : null,
        state => plantVinesDisabledReason(state),
    ),
    playSummerVisitor: action(
        "playSummerVisitor",
        i => i === 0 ? <>Play up to 2 <SummerVisitor /></> : <>Play <SummerVisitor /></>,
        i => i === 0 ? <SummerVisitor /> : null,
        state => needCardOfTypeDisabledReason(state, "summerVisitor"),
    ),
    playWinterVisitor: action(
        "playWinterVisitor",
        i => i === 0 ? <>Play up to 2 <WinterVisitor /></> : <>Play <WinterVisitor /></>,
        i => i === 0 ? <WinterVisitor /> : null,
        state => needCardOfTypeDisabledReason(state, "winterVisitor"),
    ),
    trainWorker: action(
        "trainWorker",
        i => i === 0
            ? <>Pay <Coins>3</Coins> to train <Worker /></>
            : <>Pay <Coins>4</Coins> to train <Worker /></>,
        i => i === 0 ? <Coins>1</Coins> : null,
        (state, i) => trainWorkerDisabledReason(state, i === 0 ? 3 : 4),
    ),
    yokeHarvest: action(
        "yokeHarvest",
        () => "Yoke: Harvest one field",
        () => null,
        state => structureUsedDisabledReason(state, "yoke") || harvestFieldDisabledReason(state),
    ),
    yokeUproot: action(
        "yokeUproot",
        () => "Yoke: Uproot",
        () => null,
        state => structureUsedDisabledReason(state, "yoke") || uprootDisabledReason(state)
    ),
};

export const yearRoundActions: BoardAction[] = [
    boardActions.yokeHarvest,
    boardActions.yokeUproot,
    boardActions.gainCoin,
];

export const allPlacements = Object.values(boardActions);

export const boardActionsBySeason = (state: GameState): { [K in Season]: BoardAction[] } => {
    switch (state.boardType) {
        case undefined:
        case "base":
            return {
                spring: [],
                summer: [
                    boardActions.drawVine,
                    boardActions.playSummerVisitor,
                    boardActions.giveTour,
                    boardActions.buySell,
                    boardActions.buildStructure,
                    boardActions.plantVine,
                ],
                fall: [],
                winter: [
                    boardActions.drawOrder,
                    boardActions.playWinterVisitor,
                    boardActions.harvestField,
                    boardActions.trainWorker,
                    boardActions.makeWine,
                    boardActions.fillOrder,
                ]
            };
        case "tuscanyA":
        case "tuscanyB":
            return {
                spring: [
                    boardActions.drawVine, // draw 0
                    boardActions.giveTour, // gain 1
                    boardActions.buildStructure, // gain 1
                    // place or move star token // star 1
                ],
                summer: [
                    boardActions.playSummerVisitor, // gain 0 play 1
                    boardActions.plantVine, // plant 0
                    // trade // +1 1
                    boardActions.buySell, // gainVP 0
                ],
                fall: [
                    boardActions.drawOrder, // draw 0
                    boardActions.harvestField, // +1 0 gain 1
                    boardActions.makeWine, // +1 0
                    // build 2 // gain 0
                ],
                winter: [
                    boardActions.playWinterVisitor, // gain 0 play 1
                    boardActions.trainWorker, // gain 0
                    // sell wine // star 1
                    boardActions.fillOrder, // gainVP 1
                ],
            };
    }
};
