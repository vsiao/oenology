import { visitorCard } from "../visitorCard";
import * as React from "react";
import { default as VP } from "../../../game-views/icons/VictoryPoints";
import Coins from "../../../game-views/icons/Coins";
import Worker from "../../../game-views/icons/Worker";
import { SummerVisitor, Vine, Order } from "../../../game-views/icons/Card";

export type WinterVisitorId = keyof typeof winterVisitorCards;

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
