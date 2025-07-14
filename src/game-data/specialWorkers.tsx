import React from "react";
import Coins from "../game-views/icons/Coins";
import Card from "../game-views/icons/Card";
import VictoryPoints from "../game-views/icons/VictoryPoints";

export const implementedSpecialWorkers: SpecialWorkerId[] = [
    "Chef",
    "Innkeeper",
    "Mafioso",
    "Merchant",
    "Messenger",
    "Professore",
];

export const tuscanyWorkers = {
    Chef: <p>You may place the Chef on an action space already occupied by an opponent's worker by “bumping” that worker back to the opponent's pool of available workers. Chefs can't bump Chefs.</p>,
    Farmer: <p>When you place the Farmer on the board, you may gain a total of one bonus of your choice among the bonuses on that action even if the Farmer is not on a bonus action space. All bonuses on each action are available regardless of player count.</p>,
    Innkeeper: <p>When you place the Innkeeper, you may pay <Coins>1</Coins> to an opponent who has a worker on the same action to take 1 <Card type="summerVisitor" /> or <Card type="winterVisitor" /> at random from their hand.</p>,
    Mafioso: <p>When you place the Mafioso on a non-bonus action space, after you take the action, you may take the action again.</p>,
    Merchant: <p>If you place the Merchant on the board after all opponents have passed to the next season, after you take the action, you may draw 1 of any card.</p>,
    Messenger: <p>You may place the Messenger on an action space in a future season. When you take your first turn that season, use the Messenger's action instead of placing a worker.</p>,
    Oracle: <p>When you draw cards with the Oracle, draw 1 extra card of same type and discard 1 of the cards you drew. You may not draw more than 1 extra card per turn with the Oracle.</p>,
    Politico: <p>When you place the Politico on a bonus action space on the board, after you take the action and gain the bonus, you may pay <Coins>1</Coins> to gain the bonus again.</p>,
    Professore: <p>When you place the Professore, you may retrieve 1 of your regular workers from an action space on the board in the current season. That worker is available to be placed again this year.</p>,
    Soldato: <p>If the Soldato is on an action space on the board, opponents must pay you <Coins>1</Coins> to place a worker on the same action. Opponents may place workers on the same action as your Soldato even if all action spaces are full.</p>,
    Traveler: <p>You may place the Traveler on any open action space in a previous season of the current year, regardless of the action spaces available based on player count. Immediately take that action.</p>,
};

export const promoWorkers = {
    Alchemist: <p>When you place the Alchemist, you may change one white-grape token on your crush pad into a red-grape token of equal of lesser value (or vice versa red into white).</p>,
    Apprentice: <p>After taking an action with the Apprentice, you may immediately place your Grande Worker on the same action (not on an action space).</p>,
    Builder: <p>When using the Builder to build a structure (on a “Build One Structure” action or a visitor card action), pay <Coins>2</Coins> less per structure.</p>,
    Martyr: <p>After placing the Martyr, instead of taking the action, you may remove the Martyr from the game. If you do, immediately place any/all of your other workers in the current season and their actions.</p>,
    "Mama Grande": <p>This is a second Grande Worker. If you place Mama Grande on the same action on the board as your Grande Worker, gain <VictoryPoints>1</VictoryPoints>.</p>,
    Salesman: <p>After using the Salesman to fill a wine order (on the “Fill One Wine Order” action or a visitor card action), you may pay <Coins>2</Coins> to fill a second wine order.</p>,
    Sommelier: <p>After taking an action with the Sommelier, you may age X different wine tokens each, where X is the total number of workers on the Sommelier's action (including the Sommelier).</p>,
    Storyteller: <p>After you take an action on the board with the Storyteller, all regular workers on other actions in the current season move to the same action as the Storyteller. Those workers do not take the action.</p>,
    Vagabond: <p>You may place the Vagabond horizontally to cover two open, adjacent action spaces on the same action (ignore player count restrictions). If you do, gain all bonuses on those action spaces, but do not take the action.</p>
};

export type SpecialWorkerId = keyof typeof specialWorkers;
export const specialWorkers = {
    ...tuscanyWorkers,
    ...promoWorkers,
};
