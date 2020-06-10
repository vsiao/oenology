import * as React from "react";
import { default as VP } from "../../game-views/icons/VictoryPoints";
import Coins from "../../game-views/icons/Coins";
import { Vine, SummerVisitor, Order } from "../../game-views/icons/Card";
import Worker from "../../game-views/icons/Worker";
import Grape from "../../game-views/icons/Grape";
import Residuals from "../../game-views/icons/Residuals";

export interface VisitorCardData {
    name: string;
    description: React.ReactNode;
}

export const visitorCard = (
    name: string,
    description: React.ReactNode,
): VisitorCardData => {
    return { name, description, };
};

export type SummerVisitorId = keyof typeof summerVisitorCards;
export type WinterVisitorId = keyof typeof winterVisitorCards;
export type VisitorId = SummerVisitorId | WinterVisitorId;

export const summerVisitorCards = {
    handyman: visitorCard(
        "Handyman",
        <>All players may build 1 structure at a <Coins>2</Coins> discount. You gain <VP>1</VP> for each opponent who does this.</>,
    ),
    landscaper: visitorCard(
        "Landscaper",
        <>Draw 1 <Vine /> and plant up to 1 <Vine /> OR switch 2 <Vine /> on your fields.</>,
    ),
    negotiator: visitorCard(
        "Negotiator",
        <>Discard 1 <Grape /> to gain <Residuals>1</Residuals> OR discard 1 wine to gain <Residuals>2</Residuals>.</>,
    ),
    planner: visitorCard(
        "Planner",
        <>Place a worker on an action in a future season. Take the action at the beginning of that season.</>,
    ),
    producer: visitorCard(
        "Producer",
        <>Pay <Coins>2</Coins> to retrieve up to 2 <Worker /> from other actions. They may be used again this year.</>,
    ),
    tourGuide: visitorCard(
        "Tour Guide",
        <>Gain <Coins>4</Coins> OR harvest 1 field.</>,
    ),
};

export const winterVisitorCards = {
    judge: visitorCard(
        "Judge",
        <>Draw 2 <SummerVisitor /> OR discard 1 wine of value 4 or more to gain <VP>3</VP>.</>,
    ),
    politician: visitorCard(
        "Politician",
        <>If you have less than <VP>0</VP>, gain <Coins>6</Coins>. Otherwise, draw 1 <Vine />, 1 <SummerVisitor />, and 1 <Order />.</>,
    ),
    professor: visitorCard(
        "Professor",
        <>Pay <Coins>2</Coins> to train 1 <Worker /> OR gain <VP>2</VP> if you have a total of 6 <Worker />.</>,
    ),
    taster: visitorCard(
        "Taster",
        <>Discard 1 wine to gain <Coins>4</Coins>. If it is the most valuable wine in any player's cellar (no ties), gain <VP>2</VP>.</>,
    ),
    teacher: visitorCard(
        "Teacher",
        <>Make up to 2 wine OR pay <Coins>2</Coins> to train 1 <Worker />.</>,
    ),
};

export const visitorCards = {
    ...summerVisitorCards,
    ...winterVisitorCards,
};
