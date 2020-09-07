import * as React from "react";
import { Order, SummerVisitor, Vine, WinterVisitor } from "../../game-views/icons/Card";
import Coins from "../../game-views/icons/Coins";
import Worker from "../../game-views/icons/Worker";
import GameState, { WorkerPlacement, Season, BoardType } from "../GameState";
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
    label: (state: GameState) => React.ReactNode;
    choices: (state: GameState) => PlacementChoice[];
    choiceAt: (i: number | undefined, state: GameState) => PlacementChoice;
}
interface PlacementChoice {
    label: React.ReactNode;
    bonusIcon?: React.ReactNode;
    disabledReason?: string | undefined;
    idx: number | undefined; // undefined indicates grande is required
}

const action = (
    type: WorkerPlacement,
    choice: (placementIdx: number | undefined, data: {
        state: GameState;
        boardType: BoardType;
        numSpots: number;
    }) => {
        label: React.ReactNode;
        bonusIcon?: React.ReactNode;
        disabledReason?: string | undefined;
    }
): BoardAction => {
    const numSpots = (state: GameState) => Math.ceil(state.tableOrder.length / 2);
    const firstEmptyIndex = (state: GameState) => {
        const placements = state.workerPlacements[type];
        const firstEmpty = placements.indexOf(null); // find first empty
        const i = firstEmpty < 0 ? placements.length : firstEmpty;
        return i >= numSpots(state)
            ? undefined // must use grande to place
            : i;
    };
    const data = (state: GameState) => ({
        boardType: state.boardType ?? "base",
        numSpots: numSpots(state),
        state,
    });
    const choiceAt = (idx: number | undefined, state: GameState) => {
        return { ...choice(idx, data(state)), idx };
    };

    return {
        type,
        label: state => choice(-1, data(state)).label,
        choiceAt,
        choices: state => {
            const d = data(state);
            const firstChoice = choiceAt(firstEmptyIndex(state), state);
            if (firstChoice?.bonusIcon) {
                // return all possible bonus placements
                return new Array(numSpots(state)).fill(null)
                    .map((_, idx) => ({ ...choice(idx, d), idx }))
                    .filter(({ bonusIcon }) => !!bonusIcon);
            } else {
                return [firstChoice];
            }
        },
    };
}

export const boardActions: Record<WorkerPlacement, BoardAction> = {
    buildStructure: action(
        "buildStructure",
        (i, { numSpots, state }) => {
            const isBonusSpot = i === 0 && numSpots > 1;
            return {
                label: <>Build one structure{
                    isBonusSpot ? <> at a <Coins>1</Coins> discount</> : null
                }</>,
                bonusIcon: isBonusSpot ? <Coins>1</Coins> : null,
                disabledReason: buildStructureDisabledReason(
                    state,
                    isBonusSpot ? { kind: "discount", amount: 1 } : undefined
                ),
            }
        }
    ),
    buySell: action(
        "buySell",
        (i, { boardType, numSpots, state }) => {
            const player = state.players[state.currentTurn.playerId];
            const isBonusSpot = i === 0 &&
                (boardType !== "base" || numSpots > 1);
            return {
                label: boardType === "base"
                    ? <>Sell grape(s) or buy/sell one field{
                        isBonusSpot ? <> and gain <VP>1</VP></> : null
                    }</>
                    : <>Buy/sell one field{
                        isBonusSpot ? <> and gain <VP>1</VP></> : null
                    }</>,
                bonusIcon: isBonusSpot ? <VP>1</VP> : null,
                disabledReason: (boardType === "base" && hasGrapes(state)) ||
                    Object.values(player.fields)
                        .some(f =>
                            (f.sold && player.coins >= f.value) ||
                            (!f.sold && f.vines.length === 0)
                        )
                    ? undefined
                    : "You don't have anything to buy or sell.",
            };
        }
    ),
    drawOrder: action(
        "drawOrder",
        (i, { boardType, numSpots }) => {
            const isBonusSpot = i === 0 &&
                (boardType !== "base" || numSpots > 1);
            return {
                label: <>Draw {isBonusSpot ? "2 " : ""}<Order /></>,
                bonusIcon: isBonusSpot ? <Order /> : null,
            };
        }
    ),
    drawVine: action(
        "drawVine",
        (i, { boardType, numSpots }) => {
            const isBonusSpot = i === 0 &&
                (boardType !== "base" || numSpots > 1);
            return {
                label: <>Draw {isBonusSpot ? "2 " : ""}<Vine /></>,
                bonusIcon: isBonusSpot ? <Vine /> : null,
            };
        }
    ),
    fillOrder: action(
        "fillOrder",
        (i, { numSpots, state }) => {
            const isBonusSpot = i === 0 && numSpots > 1;
            return {
                label: <>Fill <Order />{
                    isBonusSpot ? <> and gain <VP>1</VP> extra</> : null
                }</>,
                bonusIcon: isBonusSpot ? <VP>1</VP> : null,
                disabledReason: fillOrderDisabledReason(state),
            };
        }
    ),
    gainCoin: action(
        "gainCoin",
        () => ({ label: <>Gain <Coins>1</Coins></> })
    ),
    giveTour: action(
        "giveTour",
        (i, { numSpots }) => {
            const isBonusSpot = i === 0 && numSpots > 1;
            return {
                label: <>Give tour to gain <Coins>{
                    isBonusSpot ? "3" : "2"
                }</Coins></>,
                bonusIcon: isBonusSpot ? <Coins>1</Coins> : null,
            };
        }
    ),
    harvestField: action(
        "harvestField",
        (i, { boardType, numSpots, state }) => {
            if (boardType !== "base" && i === 1) {
                return {
                    label: <>Harvest one field and gain <Coins>1</Coins></>,
                    bonusIcon: <Coins>1</Coins>,
                    disabledReason: harvestFieldDisabledReason(state),
                };
            }
            const isBonusSpot = i === 0 &&
                (boardType !== "base" || numSpots > 1);
            return {
                label: <>Harvest {
                    isBonusSpot ? "up to 2" : "one"
                } field</>,
                bonusIcon: isBonusSpot ? "+1" : null,
                disabledReason: harvestFieldDisabledReason(state),
            };
        }
    ),
    makeWine: action(
        "makeWine",
        (i, { boardType, numSpots, state }) => {
            const isBonusSpot = i === 0 &&
                (boardType !== "base" || numSpots > 1);
            return {
                label: <>Make up to {
                    isBonusSpot ? "3" : "2"
                } <WineGlass /></>,
                bonusIcon: isBonusSpot ? "+1" : null,
                disabledReason: needGrapesDisabledReason(state),
            };
        }
    ),
    plantVine: action(
        "plantVine",
        (i, { boardType, numSpots, state }) => {
            const isBonusSpot = i === 0 &&
                (boardType !== "base" || numSpots > 1);
            return {
                label: <>Plant {
                    isBonusSpot ? "up to 2 " : ""
                }<Vine /></>,
                bonusIcon: isBonusSpot ? <Vine /> : null,
                disabledReason: plantVinesDisabledReason(state),
            };
        }
    ),
    playSummerVisitor: action(
        "playSummerVisitor",
        (i, { boardType, numSpots, state }) => {
            if (boardType !== "base" && i === 0) {
                return {
                    label: <>Play <SummerVisitor /> and gain <Coins>1</Coins></>,
                    bonusIcon: <Coins>1</Coins>,
                    disabledReason: needCardOfTypeDisabledReason(state, "summerVisitor"),
                };
            }
            const isBonusSpot = numSpots > 1 && (
                (boardType === "base" && i === 0) ||
                (boardType !== "base" && i === 1)
            );
            return {
                label: <>Play {
                    isBonusSpot ? "up to 2 " : ""
                }<SummerVisitor /></>,
                bonusIcon: isBonusSpot ? <SummerVisitor /> : null,
                disabledReason: needCardOfTypeDisabledReason(state, "summerVisitor"),
            };
        }
    ),
    playWinterVisitor: action(
        "playWinterVisitor",
        (i, { boardType, numSpots, state }) => {
            if (boardType !== "base" && i === 0) {
                return {
                    label: <>Play <WinterVisitor /> and gain <Coins>1</Coins></>,
                    bonusIcon: <Coins>1</Coins>,
                    disabledReason: needCardOfTypeDisabledReason(state, "winterVisitor"),
                };
            }
            const isBonusSpot = numSpots > 1 && (
                (boardType === "base" && i === 0) ||
                (boardType !== "base" && i === 1)
            );
            return {
                label: <>Play {
                    isBonusSpot ? "up to 2 " : ""
                }<WinterVisitor /></>,
                bonusIcon: isBonusSpot ? <WinterVisitor /> : null,
                disabledReason: needCardOfTypeDisabledReason(state, "winterVisitor"),
            };
        }
    ),
    trainWorker: action(
        "trainWorker",
        (i, { boardType, numSpots, state }) => {
            const isBonusSpot = i === 0 &&
                (boardType !== "base" || numSpots > 1);
            return {
                label: <>Pay <Coins>{
                    isBonusSpot ? "3" : "4"
                }</Coins> to train <Worker /></>,
                bonusIcon: isBonusSpot ? <Coins>1</Coins> : null,
                disabledReason: trainWorkerDisabledReason(state, isBonusSpot ? 3 : 4),
            };
        }
    ),
    yokeHarvest: action(
        "yokeHarvest",
        (i, { state }) => ({
            label: "Yoke: Harvest one field",
            disabledReason: structureUsedDisabledReason(state, "yoke") ||
                harvestFieldDisabledReason(state),
        })
    ),
    yokeUproot: action(
        "yokeUproot",
        (i, { state }) => ({
            label: "Yoke: Uproot",
            disabledReason: structureUsedDisabledReason(state, "yoke") ||
                uprootDisabledReason(state),
        })
    ),
};

export const yearRoundActions: BoardAction[] = [
    boardActions.yokeHarvest,
    boardActions.yokeUproot,
    boardActions.gainCoin,
];

export const allPlacements = Object.values(boardActions);

export const boardActionsBySeason = (state: GameState): Record<Season, BoardAction[]> => {
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
