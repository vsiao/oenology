import * as React from "react";
import Card, { Order, SummerVisitor, Vine, WinterVisitor } from "../../game-views/icons/Card";
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
import Grape from "../../game-views/icons/Grape";
import StarToken from "../../game-views/icons/StarToken";

export interface BoardAction {
    type: WorkerPlacement,
    label: (state: GameState) => React.ReactNode;
    choices: (state: GameState) => PlacementChoice[];
    choiceAt: (i: number | undefined, state: GameState) => PlacementChoice;
}

export type PlacementBonus =
    | "gainCoin"
    | "gainVP"
    | "drawOrder"
    | "drawVine"
    | "plantVine"
    | "influence"
    | "playSummerVisitor"
    | "playWinterVisitor"
    | "plusOne";

interface PlacementChoice {
    label: React.ReactNode;
    bonus?: PlacementBonus;
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
        bonus?: PlacementBonus;
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
            if (firstChoice?.bonus) {
                // return all possible bonus placements
                return new Array(numSpots(state)).fill(null)
                    .map((_, idx) => ({ ...choice(idx, d), idx }))
                    .filter(({ bonus }) => !!bonus);
            } else {
                return [firstChoice];
            }
        },
    };
}

export const boardActions: Record<WorkerPlacement, BoardAction> = {
    buildOrGiveTour: action(
        "buildOrGiveTour",
        i => {
            const isBonusSpot = i === 0;
            return {
                label: <>Build one structure{
                    isBonusSpot ? <> at a <Coins>1</Coins> discount</> : null
                } or Give tour to gain <Coins>{isBonusSpot ? 3 : 2}</Coins></>,
                bonus: isBonusSpot ? "gainCoin" : undefined,
            };
        }
    ),
    buildStructure: action(
        "buildStructure",
        (i, { numSpots, state }) => {
            const isBonusSpot = i === 0 && numSpots > 1;
            return {
                label: <>Build one structure{
                    isBonusSpot ? <> at a <Coins>1</Coins> discount</> : null
                }</>,
                bonus: isBonusSpot ? "gainCoin" : undefined,
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
                bonus: isBonusSpot ? "gainVP" : undefined,
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
                bonus: isBonusSpot ? "drawOrder" : undefined,
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
                bonus: isBonusSpot ? "drawVine" : undefined,
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
                bonus: isBonusSpot ? "gainVP" : undefined,
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
                bonus: isBonusSpot ? "gainCoin" : undefined,
            };
        }
    ),
    harvestField: action(
        "harvestField",
        (i, { boardType, numSpots, state }) => {
            if (boardType !== "base" && i === 1) {
                return {
                    label: <>Harvest one field and gain <Coins>1</Coins></>,
                    bonus: "gainCoin",
                    disabledReason: harvestFieldDisabledReason(state),
                };
            }
            const isBonusSpot = i === 0 &&
                (boardType !== "base" || numSpots > 1);
            return {
                label: <>Harvest {
                    isBonusSpot ? "up to 2 fields" : "one field"
                }</>,
                bonus: isBonusSpot ? "plusOne" : undefined,
                disabledReason: harvestFieldDisabledReason(state),
            };
        }
    ),
    influence: action(
        "influence",
        (i, { numSpots }) => {
            const isBonusSpot = numSpots > 1 && i === 0;
            return {
                label: <>Place or move <StarToken /></>,
                bonus: isBonusSpot ? "influence" : undefined,
                disabledReason: "Unimplemented",
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
                } wine tokens</>,
                bonus: isBonusSpot ? "plusOne" : undefined,
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
                bonus: isBonusSpot ? "plantVine" : undefined,
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
                    bonus: "gainCoin",
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
                bonus: isBonusSpot ? "playSummerVisitor" : undefined,
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
                    bonus: "gainCoin",
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
                bonus: isBonusSpot ? "playWinterVisitor" : undefined,
                disabledReason: needCardOfTypeDisabledReason(state, "winterVisitor"),
            };
        }
    ),
    sellWine: action(
        "sellWine",
        (i, { numSpots }) => {
            const isBonusSpot = numSpots > 1 && i === 0;
            return {
                label: <>Sell one wine token</>,
                bonus: isBonusSpot ? "influence" : undefined,
                disabledReason: "Unimplemented",
            };
        }
    ),
    trade: action(
        "trade",
        (i, { numSpots }) => {
            const isBonusSpot = numSpots > 1 && i === 0;
            return {
                label: <>
                    Trade {isBonusSpot ? "up to 2" : "one"}
                    {" "}<Card /><Card style={{ marginLeft: "-.8em" }} /> /
                    {" "}<Coins>3</Coins> /
                    {" "}<VP>1</VP> /
                    {" "}<Grape>1</Grape>
                </>,
                bonus: isBonusSpot ? "plusOne" : undefined,
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
                bonus: isBonusSpot ? "gainCoin" : undefined,
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
                    boardActions.drawVine,
                    boardActions.giveTour,
                    boardActions.buildStructure,
                    boardActions.influence,
                ],
                summer: [
                    boardActions.playSummerVisitor,
                    boardActions.plantVine,
                    boardActions.trade,
                    boardActions.buySell,
                ],
                fall: [
                    boardActions.drawOrder,
                    boardActions.harvestField,
                    boardActions.makeWine,
                    boardActions.buildOrGiveTour,
                ],
                winter: [
                    boardActions.playWinterVisitor,
                    boardActions.trainWorker,
                    boardActions.sellWine,
                    boardActions.fillOrder,
                ],
            };
    }
};
