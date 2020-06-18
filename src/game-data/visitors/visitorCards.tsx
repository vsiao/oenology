import * as React from "react";
import { default as VP } from "../../game-views/icons/VictoryPoints";
import Coins from "../../game-views/icons/Coins";
import { Vine, SummerVisitor, Order, WinterVisitor } from "../../game-views/icons/Card";
import Worker from "../../game-views/icons/Worker";
import Grape from "../../game-views/icons/Grape";
import WineGlass from "../../game-views/icons/WineGlass";
import Rooster from "../../game-views/icons/Rooster";
import Residuals from "../../game-views/icons/Residuals";

export interface VisitorCardData {
    season: "summer" | "winter";
    name: string;
    description: React.ReactNode;
}

const visitorCard = (
    season: "summer" | "winter",
    name: string,
    description: React.ReactNode,
): VisitorCardData => {
    return { season, name, description, };
};

export type SummerVisitorId = keyof typeof summerVisitorCards;
export type WinterVisitorId = keyof typeof winterVisitorCards;
export type VisitorId = SummerVisitorId | WinterVisitorId;

const summerVisitorCard = (name: string, description: React.ReactNode) =>
    visitorCard("summer", name, description);

export const summerVisitorCards = {
    banker: summerVisitorCard(
        "Banker",
        <>Gain <Coins>5</Coins>. Each opponent may lose <VP>1</VP> to gain <Coins>3</Coins>.</>
    ),
    buyer: summerVisitorCard(
        "Buyer",
        <>Pay <Coins>2</Coins> to place a <Grape>1</Grape> on your crush pad OR discard 1 <Grape /> to gain <Coins>2</Coins> and <VP>1</VP>.</>
    ),
    // contractor: summerVisitorCard(
    //     "Contractor",
    //     <>Choose 2: Gain <VP>1</VP>, build 1 structure, or plant 1 <Vine />.</>
    // ),
    // entertainer: summerVisitorCard(
    //     "Entertainer",
    //     <>Pay <Coins>4</Coins> to draw 3 <WinterVisitor /> OR discard 1 <WineGlass /> and 3 visitor cards to gain <VP>3</VP>.</>
    // ),
    // handyman: summerVisitorCard(
    //     "Handyman",
    //     <>All players may build 1 structure at a <Coins>2</Coins> discount. You gain <VP>1</VP> for each opponent who does this.</>,
    // ),
    landscaper: summerVisitorCard(
        "Landscaper",
        <>Draw 1 <Vine /> and plant up to 1 <Vine /> OR switch 2 <Vine /> on your fields.</>,
    ),
    // negotiator: summerVisitorCard(
    //     "Negotiator",
    //     <>Discard 1 <Grape /> to gain <Residuals>1</Residuals> OR discard 1 wine to gain <Residuals>2</Residuals>.</>,
    // ),
    organizer: summerVisitorCard(
        "Organizer",
        <>Move your <Rooster /> to an empty row on the wake-up chart, take the bonus, then pass to the next season.</>
    ),
    patron: summerVisitorCard(
        "Patron",
        <>Gain <Coins>4</Coins> OR draw 1 <Order />  and 1 <WinterVisitor />.</>
    ),
    // planner: summervisitorcard(
    //     "planner",
    //     <>place a worker on an action in a future season. take the action at the beginning of that season.</>,
    // ),
    // planter: summerVisitorCard(
    //     "Planter",
    //     <>Plant up to 2 <Vine /> and gain <Coins>1</Coins> OR uproot and discard 1 <Vine /> to gain <VP>2</VP>.</>
    // ),
    // producer: summerVisitorCard(
    //     "Producer",
    //     <>Pay <Coins>2</Coins> to retrieve up to 2 <Worker /> from other actions. They may be used again this year.</>,
    // ),
    sponsor: summerVisitorCard(
        "Sponsor",
        <>Draw 2 <Vine /> OR gain <Coins>3</Coins>. You may lose <VP>1</VP> to do both.</>
    ),
    tourGuide: summerVisitorCard(
        "Tour Guide",
        <>Gain <Coins>4</Coins> OR harvest 1 field.</>
    ),
    uncertifiedArchitect: summerVisitorCard(
        "Uncertified Architect",
        <>Lose <VP>1</VP> to build a <Coins>2</Coins> or <Coins>3</Coins> structure OR lose <VP>2</VP> to build any structure.</>
    ),
    uncertifiedBroker: summerVisitorCard(
        "Uncertified Broker",
        <>Lose <VP>3</VP> to gain <Coins>9</Coins> OR pay <Coins>6</Coins> to gain <VP>2</VP>.</>
    ),
    // volunteerCrew: summerVisitorCard(
    //     "Volunteer Crew",
    //     <>All players may plant 1 <Vine />. Gain <Coins>2</Coins> for each opponent who does this.</>
    // ),
};

const winterVisitorCard = (name: string, description: React.ReactNode) =>
    visitorCard("winter", name, description);

export const winterVisitorCards = {
    assessor: winterVisitorCard(
        "Assessor",
        <>Gain <Coins>1</Coins> for each card in your hand OR discard your hand (min of 1 card) to gain <VP>2</VP>.</>,
    ),
    crusher: winterVisitorCard(
        "Crusher",
        <>Gain <Coins>3</Coins> and draw 1 <SummerVisitor /> OR draw 1 <Order /> and make up to 2 <WineGlass />.</>
    ),
    judge: winterVisitorCard(
        "Judge",
        <>Draw 2 <SummerVisitor /> OR discard 1 <WineGlass /> of value 4 or more to gain <VP>3</VP>.</>,
    ),
    mentor: winterVisitorCard(
        "Mentor",
        <>All players may make up to 2 <WineGlass />. Draw 1 <Vine /> or 1 <SummerVisitor /> for each opponent who does this.</>
    ),
    noble: winterVisitorCard(
        "Noble",
        <>Pay <Coins>1</Coins> to gain <Residuals>1</Residuals> OR lose <Residuals>2</Residuals> to gain <VP>2</VP>.</>
    ),
    politician: winterVisitorCard(
        "Politician",
        <>If you have less than <VP>0</VP>, gain <Coins>6</Coins>. Otherwise, draw 1 <Vine />, 1 <SummerVisitor />, and 1 <Order />.</>,
    ),
    professor: winterVisitorCard(
        "Professor",
        <>Pay <Coins>2</Coins> to train 1 <Worker /> OR gain <VP>2</VP> if you have a total of 6 <Worker />.</>,
    ),
    taster: winterVisitorCard(
        "Taster",
        <>Discard 1 <WineGlass /> to gain <Coins>4</Coins>. If it is the most valuable <WineGlass /> in any player's cellar (no ties), gain <VP>2</VP>.</>,
    ),
    teacher: winterVisitorCard(
        "Teacher",
        <>Make up to 2 wine OR pay <Coins>2</Coins> to train 1 <Worker />.</>,
    ),
};

export const visitorCards = {
    ...summerVisitorCards,
    ...winterVisitorCards,
};
