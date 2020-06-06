import { visitorCard } from "./visitorCard";
import * as React from "react";
import { default as VP } from "../game-views/icons/VictoryPoints";
import Coins from "../game-views/icons/Coins";
import { Vine } from "../game-views/icons/Card";
import Worker from "../game-views/icons/Worker";

export type SummerVisitorId = keyof typeof summerVisitorCards;

export const summerVisitorCards = {
    handyman: visitorCard(
        "Handyman",
        <>All players may build 1 structure at a <Coins>2</Coins> discount. You gain <VP>1</VP> for each opponent who does this.</>,
        () => {}
    ),
    landscaper: visitorCard(
        "Landscaper",
        <>Draw 1 <Vine /> and plant up to 1 <Vine /> OR switch 2 <Vine /> on your fields.</>,
        () => {}
    ),
    negotiator: visitorCard(
        "Negotiator",
        "Discard 1 grape to gain 1 residual payment OR discard 1 wine to gain 2 residual payments.",
        () => {}
    ),
    planner: visitorCard(
        "Planner",
        <>Place a worker on an action in a future season. Take the action at the beginning of that season.</>,
        () => {}
    ),
    producer: visitorCard(
        "Producer",
        <>Pay <Coins>2</Coins> to retrieve up to 2 <Worker /> from other actions. They may be used again this year.</>,
        () => {}
    ),
    tourGuide: visitorCard(
        "Tour Guide",
        <>Gain <Coins>4</Coins> OR harvest 1 field.</>,
        () => {}
    ),
};
