import { visitorCard } from "./visitorCard";

export type SummerVisitorId = keyof typeof summerVisitorCards;

export const summerVisitorCards = {
    handyman: visitorCard(
        "Handyman",
        "All players may build 1 structure at a 2 coin discount. You gain 1VP for each opponent who does this.",
        () => {}
    ),
    landscaper: visitorCard(
        "Landscaper",
        "Draw 1 vine and plant up to 1 vine OR switch 2 vines on your fields.",
        () => {}
    ),
    negotiator: visitorCard(
        "Negotiator",
        "Discard 1 grape to gain 1 residual payment OR discard 1 wine to gain 2 residual payments.",
        () => {}
    ),
    planner: visitorCard(
        "Planner",
        "Place a worker on an action in a future season. Take the action at the beginning of that season.",
        () => {}
    ),
    producer: visitorCard(
        "Producer",
        "Pay 2 coins to retrieve up to 2 workers from other actions. They may be used again this year.",
        () => {}
    ),
    tourGuide: visitorCard(
        "Tour Guide",
        "Gain 4 coins OR harvest 1 field.",
        () => {}
    ),
};
