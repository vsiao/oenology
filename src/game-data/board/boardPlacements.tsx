import * as React from "react";
import Card, { Order, SummerVisitor, Vine, WinterVisitor } from "../../game-views/icons/Card";
import Coins from "../../game-views/icons/Coins";
import Worker from "../../game-views/icons/Worker";
import GameState, { Season, BoardPlacement } from "../GameState";
import {
    buildStructureDisabledReason,
    fillOrderDisabledReason,
    harvestFieldDisabledReason,
    hasGrapes,
    needCardOfTypeDisabledReason,
    needGrapesDisabledReason,
    plantVinesDisabledReason,
    trainWorkerDisabledReason,
    needWineDisabledReason,
} from "../shared/sharedSelectors";
import { default as VP } from "../../game-views/icons/VictoryPoints";
import Grape from "../../game-views/icons/Grape";
import StarToken from "../../game-views/icons/StarToken";
import { structureActions } from "../structures/structureActionReducer";
import { placementAction, PlacementAction } from "../shared/placementAction";

export const isBoardAction = (placement: string): placement is BoardPlacement =>
    placement in boardActions;

export const boardActions: Record<BoardPlacement, PlacementAction> = {
    buildOrGiveTour: placementAction(
        "buildOrGiveTour",
        i => {
            const isBonusSpot = i === 0;
            return {
                label: <>Build or give tour{isBonusSpot ? <> (bonus <Coins>1</Coins>)</> : null}</>,
                bonus: isBonusSpot ? "gainCoin" : undefined,
            };
        }
    ),
    buildStructure: placementAction(
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
    buySell: placementAction(
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
    drawOrder: placementAction(
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
    drawVine: placementAction(
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
    fillOrder: placementAction(
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
    gainCoin: placementAction(
        "gainCoin",
        () => ({ label: <>Gain <Coins>1</Coins></> })
    ),
    giveTour: placementAction(
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
    harvestField: placementAction(
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
    influence: placementAction(
        "influence",
        (i, { numSpots }) => {
            const isBonusSpot = numSpots > 1 && i === 0;
            return {
                label: <>Place or move <StarToken />{isBonusSpot ? <StarToken /> : null}</>,
                bonus: isBonusSpot ? "influence" : undefined,
            };
        }
    ),
    makeWine: placementAction(
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
    plantVine: placementAction(
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
    playSummerVisitor: placementAction(
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
    playWinterVisitor: placementAction(
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
    sellWine: placementAction(
        "sellWine",
        (i, { numSpots, state }) => {
            const isBonusSpot = numSpots > 1 && i === 0;
            return {
                label: <>
                    Sell one wine token{
                        isBonusSpot ? <> and place/move <StarToken /></> : null
                    }
                </>,
                bonus: isBonusSpot ? "influence" : undefined,
                disabledReason: needWineDisabledReason(state),
            };
        }
    ),
    trade: placementAction(
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
    trainWorker: placementAction(
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
};

export const yearRoundActions: PlacementAction[] = [
    structureActions.yokeHarvest,
    structureActions.yokeUproot,
    boardActions.gainCoin,
];

export const allPlacements = Object.values({ ...boardActions, ...structureActions });

export const boardActionsBySeason = (state: GameState): Record<Season, PlacementAction[]> => {
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
