import * as React from "react";
import GameState, { WorkerPlacementTurn } from "../GameState";
import { setPendingAction, endTurn } from "../shared/turnReducers";
import { promptForAction } from "../prompts/promptReducers";
import StarToken from "../../game-views/icons/StarToken";
import { InfluencePlacementBonus, InfluenceRegion, allRegions, influenceRegions } from "./influence";
import { Order, SummerVisitor, Vine, WinterVisitor } from "../../game-views/icons/Card";
import Coins from "../../game-views/icons/Coins";
import { drawCards } from "../shared/cardReducers";
import { gainCoins, updatePlayer, gainVP } from "../shared/sharedReducers";
import { GameAction } from "../gameActions";

export const promptToInfluence = (
    state: GameState,
    // "withBonus" means we should prompt an additional optional
    // influence place/move after the current one
    type: "required" | "optional" | "withBonus"
) => {
    const influence = state.players[state.currentTurn.playerId].influence;
    return promptForAction(
        setPendingAction({ type: "influence", hasBonus: type === "withBonus" }, state),
        {
            choices: [
                {
                    id: "INFLUENCE_PLACE",
                    label: <>Place a <StarToken /></>,
                    disabledReason: influence.every(i => i.placement)
                        ? "You don't have anything to place."
                        : undefined,
                },
                {
                    id: "INFLUENCE_MOVE",
                    label: <>Move a <StarToken /></>,
                    disabledReason: influence.every(i => !i.placement)
                        ? "You haven't placed anything yet."
                        : undefined,
                },
                ...type === "optional"
                    ? [{
                        id: "INFLUENCE_PASS",
                        label: <>Pass</>,
                    }]
                    : []
            ],
        }
    );
};

const renderInfluencePlacementBonus = (bonus: InfluencePlacementBonus): React.ReactElement => {
    switch (bonus) {
        case "drawOrder":
            return <>Draw <Order /></>;
        case "drawStructure":
            return <>XCXC</>;
        case "drawSummerVisitor":
            return <>Draw <SummerVisitor /></>;
        case "drawVine":
            return <>Draw <Vine /></>;
        case "drawWinterVisitor":
            return <>Draw <WinterVisitor /></>;
        case "gain1":
            return <>Gain <Coins>1</Coins></>;
        case "gain2":
            return <>Gain <Coins>2</Coins></>;
    }
};

const gainInfluencePlacementBonus = (
    region: InfluenceRegion,
    seed: string,
    state: GameState
): GameState => {
    const bonus = allRegions[region].bonus;
    switch (bonus) {
        case "drawOrder":
            return drawCards(state, seed, { order: 1 });
        case "drawStructure":
            return state; // TODO structures
        case "drawSummerVisitor":
            return drawCards(state, seed, { summerVisitor: 1 });
        case "drawVine":
            return drawCards(state, seed, { vine: 1 });
        case "drawWinterVisitor":
            return drawCards(state, seed, { winterVisitor: 1 });
        case "gain1":
            return gainCoins(1, state);
        case "gain2":
            return gainCoins(2, state);
    }
};

const maybeEndInfluence = (state: GameState): GameState => {
    if ((state.currentTurn as WorkerPlacementTurn).pendingAction?.hasBonus) {
        return promptToInfluence(state, "optional");
    }
    return endTurn(state);
};

interface MoveInfluenceChoiceData {
    idx: number;
    toRegion: InfluenceRegion;
}

export const influence = (state: GameState, action: GameAction): GameState => {
    const player = state.players[state.currentTurn.playerId];
    const regions = influenceRegions(state.boardType ?? "base")
    switch (action.type) {
        case "CHOOSE_ACTION":
            switch (action.choice) {
                case "INFLUENCE_PLACE":
                    return promptForAction<InfluenceRegion>(state, {
                        choices: regions.map(region => ({
                            id: "INFLUENCE_REGION",
                            data: region.id,
                            label: <><strong>{region.name}</strong>: {renderInfluencePlacementBonus(region.bonus)}</>,
                        })),
                    });
                case "INFLUENCE_REGION": {
                    const idx = player.influence.findIndex(i => !i.placement);
                    const placement = action.data as InfluenceRegion;
                    state = updatePlayer(
                        gainInfluencePlacementBonus(placement, action._key!, state),
                        player.id,
                        {
                            influence: player.influence.map((influence, i) =>
                                i === idx ? { ...influence, placement } : influence
                            ),
                        }
                    );
                    return maybeEndInfluence(state);
                }
                case "INFLUENCE_MOVE":
                    return promptForAction<InfluenceRegion>(state, {
                        title: "Choose a region",
                        description: <p>Move a <StarToken color={player.color} /> from where?</p>,
                        choices: regions
                            .filter(region => player.influence.some(i => i.placement === region.id))
                            .map(region => ({
                                id: "INFLUENCE_MOVE_FROM",
                                data: region.id,
                                label: <>
                                    <strong>{region.name}</strong>{" "}
                                    {Object.values(state.players).map(p =>
                                        p.influence.filter(i => i.placement === region.id).map(i =>
                                            <StarToken key={i.id} color={p.color} />
                                        )
                                    )}
                                </>,
                            })),
                    });
                case "INFLUENCE_MOVE_FROM":
                    const fromRegion = allRegions[action.data as InfluenceRegion];
                    const idx = player.influence.findIndex(i => i.placement === fromRegion.id);

                    return promptForAction<MoveInfluenceChoiceData>(state, {
                        title: "Choose a region",
                        description: <p>
                            Move a <StarToken color={player.color} /> from <strong>{fromRegion.name}</strong> to where?
                        </p>,
                        choices: regions
                            .filter(region => region.id !== fromRegion.id)
                            .map(region => ({
                                id: "INFLUENCE_MOVE_TO",
                                data: {
                                    idx,
                                    toRegion: region.id,
                                },
                                label: <>
                                    <strong>{region.name}</strong>{" "}
                                    {Object.values(state.players).map(p =>
                                        p.influence.filter(i => i.placement === region.id).map(i =>
                                            <StarToken key={i.id} color={p.color} />
                                        )
                                    )}
                                </>,
                            })),
                    });
                case "INFLUENCE_MOVE_TO": {
                    const { idx, toRegion } = action.data as MoveInfluenceChoiceData;
                    return maybeEndInfluence(
                        updatePlayer(state, player.id, {
                            influence: player.influence.map((influence, i) =>
                                i === idx ? { ...influence, placement: toRegion } : influence
                            ),
                        })
                    );
                }
                case "INFLUENCE_PASS":
                    return maybeEndInfluence(state);
                default:
                    return state;
            }
        default:
            return state;
    }
};

export const awardInfluenceVP = (state: GameState): GameState => {
    const allPlayers = Object.values(state.players);

    influenceRegions(state.boardType ?? "base").forEach(region => {
        const influencers = allPlayers.map(p => ({
            playerId: p.id,
            numStars: p.influence.filter(i => i.placement === region.id).length,
        }));
        influencers.sort((p1, p2) => p2.numStars - p1.numStars);
        if (influencers[0].numStars > influencers[1].numStars) {
            state = gainVP(region.vp, state, influencers[0].playerId);
        }
    });
    return state;
};
