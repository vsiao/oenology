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
    agriculturalist: summerVisitorCard(
        "Agriculturalist",
        <>Plant 1 <Vine />. Then, if you have at least 3 different types of <Vine /> planted on that field, gain <VP>2</VP>.</>
    ),
    banker: summerVisitorCard(
        "Banker",
        <>Gain <Coins>5</Coins>. Each opponent may lose <VP>1</VP> to gain <Coins>3</Coins>.</>
    ),
    broker: summerVisitorCard(
        "Broker",
        <>Pay <Coins>9</Coins> to gain <VP>3</VP> OR lose <VP>2</VP> to gain <Coins>6</Coins>.</>
    ),
    buyer: summerVisitorCard(
        "Buyer",
        <>Pay <Coins>2</Coins> to place a <Grape>1</Grape> on your crush pad OR discard 1 <Grape /> to gain <Coins>2</Coins> and <VP>1</VP>.</>
    ),
    // contractor: summerVisitorCard(
    //     "Contractor",
    //     <>Choose 2: Gain <VP>1</VP>, build 1 structure, or plant 1 <Vine />.</>
    // ),
    cultivator: summerVisitorCard(
        "Cultivator",
        <>Plant 1 <Vine />. You may plant it on a field even if the total value of that field exceeds the max vine value.</>,
    ),
    // entertainer: summerVisitorCard(
    //     "Entertainer",
    //     <>Pay <Coins>4</Coins> to draw 3 <WinterVisitor /> OR discard 1 <WineGlass /> and 3 visitor cards to gain <VP>3</VP>.</>
    // ),
    grower: summerVisitorCard(
        "Grower",
        <>Plant 1 <Vine />. Then, if you have planted a total of at least 6 <Vine />, gain <VP>2</VP>.</>
    ),
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
    noviceGuide: summerVisitorCard(
        "Novice Guide",
        <>Gain <Coins>3</Coins> OR make up to 2 <WineGlass />.</>
    ),
    organizer: summerVisitorCard(
        "Organizer",
        <>Move your <Rooster /> to an empty row on the wake-up chart, take the bonus, then pass to the next season.</>
    ),
    overseer: summerVisitorCard(
        "Overseer",
        <>Build 1 structure at its regular cost and plant 1 <Vine />. If it is a 4-value <Vine />, gain <VP>1</VP>.</>
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
    surveyor: summerVisitorCard(
        "Surveyor",
        <>Gain <Coins>2</Coins> for each empty field you own OR gain <VP>1</VP> for each planted field you own.</>
    ),
    swindler: summerVisitorCard(
        "Swindler",
        <>Each opponent may give you <Coins>2</Coins>. For each opponent who does not, gain <VP>1</VP>.</>
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
    vendor: summerVisitorCard(
        "Vendor",
        <>Draw 1 <Vine />, 1 <Order />, and 1 <WinterVisitor />. Each opponent may draw 1 <SummerVisitor />.</>
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
    bottler: winterVisitorCard(
        "Bottler",
        <>Make up to 3 <WineGlass />. Gain <VP>1</VP> for each type of wine you make.</>
    ),
    crushExpert: winterVisitorCard(
        "Crush Expert",
        <>Gain <Coins>3</Coins> and draw 1 <Order /> OR make up to 3 <WineGlass />.</>
    ),
    crusher: winterVisitorCard(
        "Crusher",
        <>Gain <Coins>3</Coins> and draw 1 <SummerVisitor /> OR draw 1 <Order /> and make up to 2 <WineGlass />.</>
    ),
    designer: winterVisitorCard(
        "Designer",
        <>Build 1 structure at its regular cost. Then, if you have at least 6 structures, gain <VP>2</VP>.</>
    ),
    guestSpeaker: winterVisitorCard(
        "Guest Speaker",
        <>All players may pay <Coins>1</Coins> to train 1 <Worker />. Gain <VP>1</VP> for each opponent who does this.</>
    ),
    // governor: winterVisitorCard(
    //     "Governor",
    //     <>Choose up to 3 opponents to each give you 1 <SummerVisitor />. Gain <VP>1</VP> for each of them who cannot.</>
    // ),
    harvestExpert: winterVisitorCard(
        "Harvest Expert",
        <>Harvest 1 field and either draw 1 <Vine /> or pay <Coins>1</Coins> to build a yoke.</>
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
    oenologist: winterVisitorCard(
        "Oenologist",
        <>Age all <WineGlass /> in your cellar twice OR pay <Coins>3</Coins> to upgrade your cellar to the next level.</>
    ),
    politician: winterVisitorCard(
        "Politician",
        <>If you have less than <VP>0</VP>, gain <Coins>6</Coins>. Otherwise, draw 1 <Vine />, 1 <SummerVisitor />, and 1 <Order />.</>,
    ),
    professor: winterVisitorCard(
        "Professor",
        <>Pay <Coins>2</Coins> to train 1 <Worker /> OR gain <VP>2</VP> if you have a total of 6 <Worker />.</>,
    ),
    // queen: winterVisitorCard(
    //     "Queen",
    //     <>The player on your right must choose 1: lose <VP>1</VP>, give you 2 <Card />, or pay you <Coins>3</Coins>.</>
    // ),
    scholar: winterVisitorCard(
        "Scholar",
        <>Draw 2 <Order /> OR pay <Coins>3</Coins> to train <Worker />. You may lose <VP>1</VP> to do both.</>
    ),
    supervisor: winterVisitorCard(
        "Supervisor",
        <>Make up to 2 <WineGlass />. Gain <VP>1</VP> for each sparkling wine token you make.</>
    ),
    taster: winterVisitorCard(
        "Taster",
        <>Discard 1 <WineGlass /> to gain <Coins>4</Coins>. If it is the most valuable <WineGlass /> in any player's cellar (no ties), gain <VP>2</VP>.</>,
    ),
    teacher: winterVisitorCard(
        "Teacher",
        <>Make up to 2 wine OR pay <Coins>2</Coins> to train 1 <Worker />.</>,
    ),
    uncertifiedOenologist: winterVisitorCard(
        "Uncertified Oenologist",
        <>Age all <WineGlass /> in your cellar twice OR lose <VP>1</VP> to upgrade your cellar to the next level.</>
    ),
    uncertifiedTeacher: winterVisitorCard(
        "Uncertified Teacher",
        <>Lose <VP>1</VP> to train 1 <Worker /> OR gain <VP>1</VP> for each opponent who has a total of 6 <Worker />.</>
    ),
};

export const visitorCards = {
    ...summerVisitorCards,
    ...winterVisitorCards,
};
