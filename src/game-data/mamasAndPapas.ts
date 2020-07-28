import { CardType } from "./GameState";
import { StructureId } from "./structures";

export interface MamaCard {
    name: string;
    cards: { [K in CardType]?: number };
    coins: number;
}
const mama = (
    name: string,
    cards: { [K in CardType]?: number },
    coins = 0
): MamaCard => {
    return { name, cards, coins, };
};

export type MamaId = keyof typeof mamaCards;
export const mamaCards = {
    alaena: mama("Alaena", { vine: 1, summerVisitor: 1, order: 1, }),
    alyssa: mama("Alyssa", { vine: 1, summerVisitor: 1, winterVisitor: 1, }),
    ariel: mama("Ariel", { summerVisitor: 1, order: 1, }, 2),
    casey: mama("Casey", { order: 2, winterVisitor: 1, }),
    christine: mama("Christine", { order: 1, winterVisitor: 2, }),
    danyel: mama("Danyel", { summerVisitor: 2, winterVisitor: 1, }),
    deann: mama("Deann", { vine: 1, order: 1, winterVisitor: 1, }),
    emily: mama("Emily", { vine: 1, summerVisitor: 2, }),
    falon: mama("Falon", { order: 1, winterVisitor: 2 ,}),
    jess: mama("Jess", { summerVisitor: 1, order: 2, }),
    laura: mama("Laura", { vine: 1, order: 2, }),
    margaret: mama("Margaret", { vine: 2, summerVisitor: 1, }),
    margot: mama("Margot", { summerVisitor: 1, order: 1, winterVisitor: 1, }),
    naja: mama("Naja", { summerVisitor: 1, winterVisitor: 2, }),
    nici: mama("Nici", { vine: 2, order: 1, }),
    nicole: mama("Nicole", { vine: 1, winterVisitor: 1, }, 2),
    rebecca: mama("Rebecca", { summerVisitor: 2, order: 1, }),
    teruyo: mama("Teruyo", { vine: 2, winterVisitor: 1, }),
};

export interface PapaCard {
    name: string;
    coins: number;

    choiceA: StructureId | "victoryPoint" | "worker";
    choiceB: number; // coins
}
const papa = (
    name: string,
    coins: number,
    choiceA: StructureId | "victoryPoint" | "worker",
    choiceB: number
): PapaCard => {
    return { name, coins, choiceA, choiceB };
};

export type PapaId = keyof typeof papaCards;
export const papaCards = {
    alan: papa("Alan", 5, "victoryPoint", 2),
    andrew: papa("Andrew", 4, "trellis", 2),
    christian: papa("Christian", 3, "irrigation", 3),
    gary: papa("Gary", 3, "worker", 3),
    jay: papa("Jay", 5, "yoke", 2),
    jerry: papa("Jerry", 2, "windmill", 4),
    joel: papa("Joel", 4, "mediumCellar", 3),
    josh: papa("Josh", 3, "mediumCellar", 4),
    kozi: papa("Kozi", 2, "cottage", 4),
    matt: papa("Matt", 0, "tastingRoom", 6),
    matthew: papa("Matthew", 1, "windmill", 5),
    morten: papa("Morten", 4, "victoryPoint", 3),
    paul: papa("Paul", 5, "trellis", 1),
    rafael: papa("Rafael", 2, "worker", 4),
    raymond: papa("Raymond", 3, "cottage", 3),
    stephan: papa("Stephan", 4, "irrigation", 2),
    steven: papa("Steven", 6, "yoke", 1),
    trevor: papa("Trevor", 1, "tastingRoom", 5),
};
