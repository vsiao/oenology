import * as React from "react";
import VP from "../../game-views/icons/VictoryPoints";
import Coins from "../../game-views/icons/Coins";
import Card, { Vine, SummerVisitor, Order, WinterVisitor } from "../../game-views/icons/Card";
import Worker from "../../game-views/icons/Worker";
import Grape from "../../game-views/icons/Grape";
import WineGlass from "../../game-views/icons/WineGlass";
import Rooster from "../../game-views/icons/Rooster";
import Residuals from "../../game-views/icons/Residuals";

export const UNIMPLEMENTED_CARDS = {
    // summer
    importer: true,
    // winter
    caravan: true,
    innkeeper: true,
} as const;

export const RHINE_UNIMPLEMENTED_CARDS = {
    // summer
    accountant: true,
    administrator: true,
    brickMason: true,
    dismantler: true,
    grapeMerchant: true,
    oldGeneral: true, // tuscany
    plantDealer: true,
    sculptor: true,
    sonInLaw: true,
    structureReorganizer: true, // tuscany
    subsidizer: true,
    vineTrader: true,
    wineEngineer: true,
    // winter
    brideToBe: true,
    cellarmaster: true,
    cheapBuyer: true,
    chemist: true,
    influencer: true, // tuscany
    lobbyist: true, // tuscany
    middleman: true,
    specialHarvester: true,
    theologian: true,
    trainer: true,
    tutor: true,
    virtuoso: true,
    wineStoreOwner: true,
} as const;

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

export type SummerVisitorId = keyof typeof summerVisitorCards | keyof typeof rhineSummerVisitorCards;
export type WinterVisitorId = keyof typeof winterVisitorCards | keyof typeof rhineWinterVisitorCards;
export type VisitorId = SummerVisitorId | WinterVisitorId;

const summerVisitorCard = (name: string, description: React.ReactNode) =>
    visitorCard("summer", name, description);

export const summerVisitorCards = {
    agriculturist: summerVisitorCard(
        "Agriculturist",
        <>Plant 1 <Vine />. Then, if you have at least 3 different types of <Vine /> planted on that field, gain <VP>2</VP>.</>
    ),
    architect: summerVisitorCard(
        "Architect",
        <>Build a structure at a <Coins>3</Coins> discount OR gain <VP>1</VP> for each <Coins>4</Coins> structure you have built.</>
    ),
    artisan: summerVisitorCard(
        "Artisan",
        <>Choose 1: Gain <Coins>3</Coins>, build a structure at a <Coins>1</Coins> discount, or plant up to 2 <Vine />.</>
    ),
    auctioneer: summerVisitorCard(
        "Auctioneer",
        <>Discard 2 <Card /> to gain <Coins>4</Coins> OR discard 4 <Card /> to gain <VP>3</VP>.</>
    ),
    banker: summerVisitorCard(
        "Banker",
        <>Gain <Coins>5</Coins>. Each opponent may lose <VP>1</VP> to gain <Coins>3</Coins>.</>
    ),
    blacksmith: summerVisitorCard(
        "Blacksmith",
        <>Build a structure at a <Coins>2</Coins> discount. If it is a <Coins>5</Coins> or <Coins>6</Coins> structure, also gain <VP>1</VP>.</>
    ),
    broker: summerVisitorCard(
        "Broker",
        <>Pay <Coins>9</Coins> to gain <VP>3</VP> OR lose <VP>2</VP> to gain <Coins>6</Coins>.</>
    ),
    buyer: summerVisitorCard(
        "Buyer",
        <>Pay <Coins>2</Coins> to place a <Grape>1</Grape> on your crush pad OR discard 1 <Grape /> to gain <Coins>2</Coins> and <VP>1</VP>.</>
    ),
    contractor: summerVisitorCard(
        "Contractor",
        <>Choose 2: Gain <VP>1</VP>, build 1 structure, or plant 1 <Vine />.</>
    ),
    cultivator: summerVisitorCard(
        "Cultivator",
        <>Plant 1 <Vine />. You may plant it on a field even if the total value of that field exceeds the max vine value.</>,
    ),
    entertainer: summerVisitorCard(
        "Entertainer",
        <>Pay <Coins>4</Coins> to draw 3 <WinterVisitor /> OR discard 1 <WineGlass /> and 3 visitor cards to gain <VP>3</VP>.</>
    ),
    grower: summerVisitorCard(
        "Grower",
        <>Plant 1 <Vine />. Then, if you have planted a total of at least 6 <Vine />, gain <VP>2</VP>.</>
    ),
    handyman: summerVisitorCard(
        "Handyman",
        <>All players may build 1 structure at a <Coins>2</Coins> discount. You gain <VP>1</VP> for each opponent who does this.</>,
    ),
    homesteader: summerVisitorCard(
        "Homesteader",
        <>Build 1 structure at a <Coins>3</Coins> discount OR plant up to 2 <Vine />. You may lose <VP>1</VP> to do both.</>
    ),
    horticulturist: summerVisitorCard(
        "Horticulturist",
        <>Plant 1 <Vine /> even without the required structure(s) OR uproot and discard 2 <Vine /> to gain <VP>3</VP>.</>
    ),
    // importer: summerVisitorCard(
    //     "Importer",
    //     <>Draw 3 <WinterVisitor /> unless all opponents combine to give you 3 visitor cards (total).</>
    // ),
    landscaper: summerVisitorCard(
        "Landscaper",
        <>Draw 1 <Vine /> and plant up to 1 <Vine /> OR switch 2 <Vine /> on your fields.</>,
    ),
    negotiator: summerVisitorCard(
        "Negotiator",
        <>Discard 1 <Grape /> to gain <Residuals>1</Residuals> OR discard 1 wine to gain <Residuals>2</Residuals>.</>,
    ),
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
    peddler: summerVisitorCard(
        "Peddler",
        <>Discard 2 <Card /> to draw 1 of each type of card.</>
    ),
    planner: summerVisitorCard(
        "Planner",
        <>Place a worker on an action in a future season. Take the action at the beginning of that season.</>,
    ),
    planter: summerVisitorCard(
        "Planter",
        <>Plant up to 2 <Vine /> and gain <Coins>1</Coins> OR uproot and discard 1 <Vine /> to gain <VP>2</VP>.</>
    ),
    producer: summerVisitorCard(
        "Producer",
        <>Pay <Coins>2</Coins> to retrieve up to 2 <Worker /> from other actions. They may be used again this year.</>,
    ),
    sharecropper: summerVisitorCard(
        "Sharecropper",
        <>Plant 1 <Vine /> even without the required structure(s) OR uproot and discard 1 <Vine /> to gain <VP>2</VP>.</>
    ),
    sponsor: summerVisitorCard(
        "Sponsor",
        <>Draw 2 <Vine /> OR gain <Coins>3</Coins>. You may lose <VP>1</VP> to do both.</>
    ),
    stonemason: summerVisitorCard(
        "Stonemason",
        <>Pay <Coins>8</Coins> to build any 2 structures (ignore their regular costs).</>
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
    volunteerCrew: summerVisitorCard(
        "Volunteer Crew",
        <>All players may plant 1 <Vine />. Gain <Coins>2</Coins> for each opponent who does this.</>
    ),
    weddingParty: summerVisitorCard(
        "Wedding Party",
        <>Pay up to 3 opponents <Coins>2</Coins> each. Gain <VP>1</VP> for each of those opponents.</>
    ),
    wineCritic: summerVisitorCard(
        "Wine Critic",
        <>Draw 2 <WinterVisitor /> OR discard 1 <WineGlass /> of value 7 or more to gain <VP>4</VP>.</>
    ),
};

export const rhineSummerVisitorCards = {
    // accountant: summerVisitorCard(
    //     "Accountant",
    //     <>Draw 1 <Vine />, 1 <SummerVisitor />, 1 <WinterVisitor /> and gain <Coins>1</Coins>. Each opponent may draw 1 <SummerVisitor />.</>
    // ),
    // administrator: summerVisitorCard(
    //     "Administrator",
    //     <>Place the <Worker /> with which you played this card on an action in a future season. Take the action at the beginning of that season.</>
    // ),
    agent: summerVisitorCard(
        "Agent",
        <>Discard 2 <Card /> to gain <Coins>5</Coins> OR pay <Coins>2</Coins> to draw 2 <WinterVisitor /> or 2 <Vine />.</>
    ),
    ampelograph: summerVisitorCard(
        "Ampelograph",
        <>Plant 1 <Vine />. You may plant it on a field even if it exceeds the max vine value; if it doesn't, also gain <Coins>2</Coins>.</>
    ),
    banker: summerVisitorCards.banker,
    botanist: summerVisitorCard(
        "Botanist",
        <>Gain <Grape>2</Grape> OR discard 1 <Grape /> to draw 4 <Vine />.</>
    ),
    // brickMason: summerVisitorCard(
    //     "Brick Mason",
    //     <>Pay <Coins>9</Coins> to build any 2 structures OR destroy a structure to gain <VP>1</VP> and <Order />.</>
    // ),
    cicerone: summerVisitorCard(
        "Cicerone",
        <>Gain <Coins>4</Coins>, harvest 1 field, or discard 1 <Grape /> to draw 3 <Order />.</>
    ),
    contractor: summerVisitorCards.contractor,
    // dismantler: summerVisitorCard(
    //     "Dismantler",
    //     <>Destroy 1 of your structures, then gain <WineGlass>X</WineGlass>, where X is the cost of the structure.</>
    // ),
    docent: summerVisitorCard(
        "Docent",
        <>Gain <Coins>3</Coins> OR make up to 3 <WineGlass />.</>
    ),
    earlyBuyer: summerVisitorCard(
        "Early Buyer",
        <>Fill 1 <Order /> and gain <Coins>2</Coins>. If you have no more than <VP>5</VP>, gain <Coins>4</Coins> instead.</>
    ),
    embezzler: summerVisitorCard(
        "Embezzler",
        <>Lose <VP>2</VP> or discard 3 <Card /> to either gain <Coins>6</Coins> or draw 3 <Order />.</>
    ),
    fortuneTeller: summerVisitorCard(
        "Fortune Teller",
        <>Draw 2 <WinterVisitor />. If any opponent already has at least <VP>5</VP>, also draw 1 <Order />.</>
    ),
    freelancer: summerVisitorCard(
        "Freelancer",
        <>Draw 1 <Card /> OR lose <VP>2</VP> to build 1 structure for free.</>
    ),
    friendlyHelper: summerVisitorCard(
        "Friendly Helper",
        <>Upgrade your cellar at a <Coins>3</Coins> discount OR gain <WineGlass>1</WineGlass>.</>
    ),
    grapeBuyer: summerVisitorCard(
        "Grape Buyer",
        <>Pay <Coins>3</Coins> to gain <Grape color="white">1</Grape> and <Grape color="red">1</Grape> OR pay <Coins>5</Coins> to gain <Grape color="white">4</Grape> and <Grape color="red">4</Grape>.</>
    ),
    // grapeMerchant: summerVisitorCard(
    //     "Grape Merchant",
    //     <>Sell up to 3 <Grape /> for triple their price OR discard 2 <Grape /> to gain <WineGlass color="blush">6</WineGlass> even if you don't have the Medium Cellar.</>
    // ),
    greenskeeper: summerVisitorCard(
        "Greenskeeper",
        <>Gain <Coins>2</Coins> and plant 1 <Vine />. If any player already has at least <VP>10</VP>, plant 1 additional <Vine /> ignoring the fields maximum.</>
    ),
    miller: summerVisitorCard(
        "Miller",
        <>If you have a windmill, gain <Grape>3</Grape> or <VP>1</VP>. Otherwise pay <Coins>2</Coins> to build a windmill.</>
    ),
    // oldGeneral: summerVisitorCard(
    //     "Old General",
    //     <>Place 1 STAR_TOKEN. Each opponent who has all 6 STAR_TOKEN on the map must retrieve 3 of their STAR_TOKEN.</>
    // ),
    owner: summerVisitorCard(
        "Owner",
        <>Choose 2: Build 1 structure at its regular cost, draw 1 <Order />, or plant 1 <Vine />. If you have the Windmill, gain <VP>1</VP>.</>
    ),
    peasant: summerVisitorCard(
        "Peasant",
        <>Draw <Order />. Then plant 1 <Vine /> even if you don't have the required structure(s) OR gain <Coins>2</Coins>.</>
    ),
    philanthropist: summerVisitorCard(
        "Philanthropist",
        <>Gain <Coins>3</Coins> OR draw 1 <Order /> and 1 <WinterVisitor />.</>
    ),
    // plantDealer: summerVisitorCard(
    //     "Plant Dealer",
    //     <>Draw 4 <Vine /> and discard 2 of them.</>
    // ),
    plantReorganizer: summerVisitorCard(
        "Plant Reorganizer",
        <>Draw 1 <Vine /> and 1 <Card />, then uproot any 1 <Vine /> and plant 1 <Vine />.</>
    ),
    premiumWineDealer: summerVisitorCard(
        "Premium Wine Dealer",
        <>Gain <Coins>3</Coins> OR pay <Coins>9</Coins> to gain <WineGlass color="sparkling">7</WineGlass> or <WineGlass color="blush">7</WineGlass> even if you don't have a Large Cellar.</>
    ),
    reorganizer: summerVisitorCard(
        "Reorganizer",
        <>Discard 2 <Card /> to gain either <Coins>5</Coins> or <Grape>2</Grape>.</>
    ),
    // sculptor: summerVisitorCard(
    //     "Sculptor",
    //     <>Gain <Coins>1</Coins> per field you own, lose <Residuals>1</Residuals> to gain <WineGlass color="blush">4</WineGlass>, or plant up to 2 <Vine />.</>
    // ),
    sommelier: summerVisitorCard(
        "Sommelier",
        <>If you have the Tasting Room, discard 1 <WineGlass /> to gain <VP>1</VP>. Otherwise pay <Coins>2</Coins> to build the Tasting Room.</>
    ),
    // sonInLaw: summerVisitorCard(
    //     "Son-in-law",
    //     <>Lay this card on a field. For the remainder of the game you may choose to harvest this field in addition to your first action each winter, but only to a total grape value of 3.</>
    // ),
    // structureReorganizer: summerVisitorCard(
    //     "Structure Reorganizer",
    //     <>Draw 1 <Card />. Then you may destroy 1 of your structures. If you do, you may build 1 structure for free.</>
    // ),
    // subsidizer: summerVisitorCard(
    //     "Subsidizer",
    //     <>Build 1 structure at a <Coins>2</Coins> discount, plant up to 2 <Vine />, or plant 1 <Vine /> even if you don't have the required structure(s).</>
    // ),
    supporter: summerVisitorCard(
        "Supporter",
        <>Choose 2: Draw 1 <Vine />, gain <Coins>2</Coins>, or draw 1 <Order />.</>
    ),
    traveller: summerVisitorCard(
        "Traveller",
        <>Gain <Coins>3</Coins> or harvest up to 2 fields. If you have the Tasting Room, also gain <Coins>3</Coins>.</>
    ),
    // vineTrader: summerVisitorCard(
    //     "Vine Trader",
    //     <>Discard any number of <Vine /> to gain <Coins>3</Coins> for each. Then draw any number of <Vine /> for <Coins>2</Coins> each and/or any number of <WinterVisitor /> for <Coins>4</Coins> each.</>
    // ),
    // wineEngineer: summerVisitorCard(
    //     "Wine Engineer",
    //     <>Pay <Coins>2</Coins> to either gain <WineGlass>4</WineGlass> in your cellar or to age 1 or 2 <Grape /> up to 3 times.</>
    // ),
    wineLover: summerVisitorCard(
        "Wine Lover",
        <>If you have a Tasting Room, gain <Residuals>1</Residuals> or <Grape>4</Grape>. Otherwise lose <Residuals>2</Residuals> to build a Tasting Room for free and gain <WineGlass>1</WineGlass>.</>
    ),
    wineTrader: summerVisitorCard(
        "Wine Trader",
        <>Gain <Grape>1</Grape> OR pay <Coins>6</Coins> to gain <WineGlass color="red">7</WineGlass> or <WineGlass color="white">7</WineGlass> even if you don't have the Large Cellar.</>
    ),
    writer: summerVisitorCard(
        "Writer",
        <>Discard 1 <WineGlass /> to gain <Residuals>2</Residuals> OR lose <Residuals>2</Residuals> to gain either <Grape>4</Grape> or <WineGlass>4</WineGlass>.</>
    ),
};

const winterVisitorCard = (name: string, description: React.ReactNode) =>
    visitorCard("winter", name, description);

export const winterVisitorCards = {
    assessor: winterVisitorCard(
        "Assessor",
        <>Gain <Coins>1</Coins> for each card in your hand OR discard your hand (min of 1 card) to gain <VP>2</VP>.</>,
    ),
    benefactor: winterVisitorCard(
        "Benefactor",
        <>Draw 1 <Vine /> and 1 <SummerVisitor /> OR discard 2 visitor cards to gain <VP>2</VP>.</>
    ),
    bottler: winterVisitorCard(
        "Bottler",
        <>Make up to 3 <WineGlass />. Gain <VP>1</VP> for each type of wine you make.</>
    ),
    // caravan: winterVisitorCard(
    //     "Caravan",
    //     <>Turn the top card of each deck face up. Draw 2 of those cards and discard the others.</>
    // ),
    craftsman: winterVisitorCard(
        "Craftsman",
        <>Choose 2: Draw 1 <Order />, upgrade your cellar at the regular cost, or gain <VP>1</VP>.</>
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
    exporter: winterVisitorCard(
        "Exporter",
        <>Choose 1: Make up to 2 <WineGlass />, fill 1 <Order />, or discard 1 <Grape /> to gain <VP>2</VP>.</>
    ),
    governess: winterVisitorCard(
        "Governess",
        <>Pay <Coins>3</Coins> to train 1 <Worker /> that you may use this year OR discard 1 <WineGlass /> to gain <VP>2</VP>.</>
    ),
    guestSpeaker: winterVisitorCard(
        "Guest Speaker",
        <>All players may pay <Coins>1</Coins> to train 1 <Worker />. Gain <VP>1</VP> for each opponent who does this.</>
    ),
    governor: winterVisitorCard(
        "Governor",
        <>Choose up to 3 opponents to each give you 1 <SummerVisitor />. Gain <VP>1</VP> for each of them who cannot.</>
    ),
    harvestExpert: winterVisitorCard(
        "Harvest Expert",
        <>Harvest 1 field and either draw 1 <Vine /> or pay <Coins>1</Coins> to build a yoke.</>
    ),
    harvester: winterVisitorCard(
        "Harvester",
        <>Harvest up to 2 fields and choose 1: Gain <Coins>2</Coins> or gain <VP>1</VP>.</>
    ),
    // innkeeper: winterVisitorCard(
    //     "Innkeeper",
    //     <>As you play this card, put the top card of 2 different discard piles into your hand.</>
    // ),
    jackOfAllTrades: winterVisitorCard(
        "Jack-of-all-trades",
        <>Choose 2: Harvest 1 field, make up to 2 <WineGlass />, or fill 1 <Order /></>
    ),
    judge: winterVisitorCard(
        "Judge",
        <>Draw 2 <SummerVisitor /> OR discard 1 <WineGlass /> of value 4 or more to gain <VP>3</VP>.</>,
    ),
    laborer: winterVisitorCard(
        "Laborer",
        <>Harvest up to 2 fields OR make up to 3 <WineGlass />. You may lose <VP>1</VP> to do both.</>
    ),
    manager: winterVisitorCard(
        "Manager",
        <>Take any action (no bonus) from a previous season without placing a worker.</>
    ),
    marketer: winterVisitorCard(
        "Marketer",
        <>Draw 2 <SummerVisitor /> and gain <Coins>1</Coins> OR fill 1 <Order /> and gain <VP>1</VP> extra.</>
    ),
    masterVintner: winterVisitorCard(
        "Master Vintner",
        <>Upgrade your cellar to the next level at a <Coins>2</Coins> discount OR age 1 <WineGlass /> and fill 1 <Order />.</>
    ),
    merchant: winterVisitorCard(
        "Merchant",
        <>Pay <Coins>3</Coins> to place <Grape color="red">1</Grape> and <Grape color="white">1</Grape> on your crush pad OR fill 1 <Order /> and gain <VP>1</VP> extra.</>
    ),
    mentor: winterVisitorCard(
        "Mentor",
        <>All players may make up to 2 <WineGlass />. Draw 1 <Vine /> or 1 <SummerVisitor /> for each opponent who does this.</>
    ),
    motivator: winterVisitorCard(
        "Motivator",
        <>Each player may retrieve their grande worker. Gain <VP>1</VP> for each opponent who does this.</>
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
    promoter: winterVisitorCard(
        "Promoter",
        <>Discard <Grape /> or <WineGlass /> to gain <VP>1</VP> and <Residuals>1</Residuals>.</>
    ),
    queen: winterVisitorCard(
        "Queen",
        <>The player on your right must choose 1: lose <VP>1</VP>, give you 2 <Card />, or pay you <Coins>3</Coins>.</>
    ),
    reaper: winterVisitorCard(
        "Reaper",
        <>Harvest up to 3 fields. If you harvest 3 fields, gain <VP>2</VP>.</>
    ),
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
    zymologist: winterVisitorCard(
        "Zymologist",
        <>Make up to 2 <WineGlass /> of value 4 or greater, even if you haven't upgraded your cellar.</>
    ),
};

export const rhineWinterVisitorCards = {
    advertiser: winterVisitorCard(
        "Advertiser",
        <>Discard 1 <Grape /> or 1 <WineGlass /> to gain <VP>1</VP> and <Residuals>1</Residuals> OR lose <Residuals>2</Residuals> to draw 3 <Order />.</>
    ),
    bargainer: winterVisitorCard(
        "Bargainer",
        <>Draw 3 <Order />.</>
    ),
    // brideToBe: winterVisitorCard(
    //     "Bride-to-be",
    //     <>Gain <Coins>3</Coins> OR make 1 <WineGlass color="sparkling" /> with any 2 <Grape /> (instead of 2 <Grape color="red" /> and 1 <Grape color="white" />).</>
    // ),
    bureaucrat: winterVisitorCard(
        "Bureaucrat",
        <>If you have the fewest <VP /> (no ties), gain <Coins>5</Coins>. Otherwise pay <Coins>1</Coins> to draw 1 <Vine />, 1 <WinterVisitor />, and 1 <Order />.</>
    ),
    cellarman: winterVisitorCard(
        "Cellarman",
        <>Pay <Coins>4</Coins> to gain <Grape color="red">1</Grape> and <Grape color="white">1</Grape> OR fill 1 <Order /> and then gain <Coins>3</Coins>.</>
    ),
    // cellarmaster: winterVisitorCard(
    //     "Cellarmaster",
    //     <>Discard 1 <WineGlass /> to gain <Coins>4</Coins>. If it is the most valuable wine in any player's cellar, gain also <VP>2</VP></>
    // ),
    // cheapBuyer: winterVisitorCard(
    //     "Cheap Buyer",
    //     <>Increase the value of 1 or 2 <WineGlass /> by a combined total of 2, then fill 1 <Order />.</>
    // ),
    // chemist: winterVisitorCard(
    //     "Chemist",
    //     <>Plant 2 <Vine /> OR harvest a field, devaluing the harvested grapes by 1 each to gain <VP>1</VP>.</>
    // ),
    craftsman: winterVisitorCards.craftsman,
    duchess: winterVisitorCard(
        "Duchess",
        <>Pay <Coins>1</Coins> to gain <Residuals>1</Residuals> OR lose <Residuals>2</Residuals> to fill 2 <Order />.</>
    ),
    eliteOenologist: winterVisitorCard(
        "Elite Oenologist",
        <>Age all <WineGlass /> in your cellar twice OR upgrade your cellar at a <Coins>4</Coins> discount.</>
    ),
    endorser: winterVisitorCard(
        "Endorser",
        <>Discard 1 <Grape /> or 1 <WineGlass /> to either gain <VP>1</VP> and <Residuals>1</Residuals> or draw 3 <Order />.</>
    ),
    enthusiast: winterVisitorCard(
        "Enthusiast",
        <>Draw 2 <SummerVisitor /> OR fill 1 <Order /> and draw 1 <Order />.</>
    ),
    estateAgent: winterVisitorCard(
        "Estate Agent",
        <>Draw X <Card />, where X is the number of fields you own.</>
    ),
    grapeVendor: winterVisitorCard(
        "Grape Vendor",
        <>Discard <Grape>X</Grape> to either gain <Coins>X</Coins> or draw X/2 <WinterVisitor /> (rounded up). Then gain <Coins>4</Coins> if you have the Tasting Room.</>
    ),
    grapeWhisperer: winterVisitorCard(
        "Grape Whisperer",
        <>Harvest up to 2 fields and gain <Coins>2</Coins>.</>
    ),
    harvestExpert: winterVisitorCards.harvestExpert,
    hiredHand: winterVisitorCard(
        "Hired Hand",
        <>Choose 2: Harvest 1 field, make up to 2 <WineGlass />, gain <Coins>2</Coins>, or fill 1 <Order />.</>
    ),
    // influencer: winterVisitorCard(
    //     "Influencer",
    //     <>Place 1 STAR_TOKEN, then move up to 3 STAR_TOKEN owned by any player.</>
    // ),
    laborer: winterVisitorCards.laborer,
    lecturer: winterVisitorCard(
        "Lecturer",
        <>Make up to 3 <WineGlass /> OR pay <Coins>3</Coins> to train 1 <Worker />.</>
    ),
    // lobbyist: winterVisitorCard(
    //     "Lobbyist",
    //     <>Pay <Coins>X</Coins> to return X STAR_TOKEN from the map to their owners. If any player has at least <VP>20</VP>, you lose <VP>3</VP>.</>
    // ),
    lovebirds: winterVisitorCard(
        "Lovebirds",
        <>Gain <Coins>1</Coins> and draw 1 <SummerVisitor /> OR draw 1 <Order /> and make up to 2 <WineGlass />.</>
    ),
    // middleman: winterVisitorCard(
    //     "Middleman",
    //     <>Draw 3 <Vine />, then discard 1 <Vine /> or pay <Coins>2</Coins> OR fill 1 <Order />, even if the type(s) of wine doesn't match the <Order /> (values matter).</>
    // ),
    premiumBuyer: winterVisitorCard(
        "Premium Buyer",
        <>Fill 1 <Order />. If all of the <WineGlass /> used to fill the wine order were at least 2 higher than the necessary value, gain <VP>2</VP>.</>
    ),
    researcher: winterVisitorCard(
        "Researcher",
        <>Draw 2 <Order /> OR pay <Coins>3</Coins> to train 1 <Worker />.</>
    ),
    rhineSailor: winterVisitorCard(
        "Rhine Sailor",
        <>Discard 3 <Card /> to draw 3 <WinterVisitor /> and gain <Coins>1</Coins>.</>
    ),
    schoolTeacher: winterVisitorCard(
        "School Teacher",
        <>Pay <Coins>4</Coins> to train 1 <Worker /> that you may use this year OR discard 1 <WineGlass /> to gain <VP>2</VP>.</>
    ),
    shipper: winterVisitorCard(
        "Shipper",
        <>Make up to 3 <WineGlass />, fill 1 <Order />, or gain <Coins>3</Coins>.</>
    ),
    skeptic: winterVisitorCard(
        "Skeptic",
        <>Upgrade your cellar to the next level at a <Coins>3</Coins> discount OR age 2 <WineGlass /> and fill 1 <Order />.</>
    ),
    // specialHarvester: winterVisitorCard(
    //     "Special Harvester",
    //     <>Harvest 1 field and make 1 <WineGlass /> OR harvest each <Vine /> on a field as if it were its own field.</>
    // ),
    supervisor: winterVisitorCards.supervisor,
    // theologian: winterVisitorCard(
    //     "Theologian",
    //     <>Harvest 1 field and get <Grape>1</Grape> extra OR fill 1 <Order /> and then you may discard <WineGlass color="red">X</WineGlass> to gain either <Coins>X</Coins> or <VP>2</VP>.</>
    // ),
    // trainer: winterVisitorCard(
    //     "Trainer",
    //     <>Pay <Coins>3</Coins> to train 1 <Worker /> that you may use this year OR lose an available <Worker /> to gain <VP>2</VP>.</>
    // ),
    // tutor: winterVisitorCard(
    //     "Tutor",
    //     <>Lose <VP>1</VP> and pay <Coins>1</Coins> to train 1 <Worker /> OR lose 1 <Worker /> to discard X <Card /> and draw X <Card />.</>
    // ),
    uncertifiedOenologist: winterVisitorCards.uncertifiedOenologist,
    // virtuoso: winterVisitorCard(
    //     "Virtuoso",
    //     <>Take any action from a previous season without placing a <Worker />. Choose any bonus on that action (even if it's blocked).</>
    // ),
    // wineStoreOwner: winterVisitorCard(
    //     "Wine Store Owner",
    //     <>Discard <WineGlass>X</WineGlass> to gain X <Order /> OR pay <Coins>X</Coins> to gain <WineGlass>X</WineGlass>.</>
    // ),
    winterAgent: winterVisitorCard(
        "Winter Agent",
        <>Draw 2 <SummerVisitor />. If any opponent already has at least <VP>5</VP>, also draw 1 <Order />.</>
    ),
    zymologist: winterVisitorCards.zymologist,
};

export const visitorCards = {
    ...summerVisitorCards,
    ...rhineSummerVisitorCards,
    ...winterVisitorCards,
    ...rhineWinterVisitorCards,
};
