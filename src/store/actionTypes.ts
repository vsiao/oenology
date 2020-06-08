import { GameAction } from "../game-data/actionTypes";
import { LocalAction } from "./localActionCreators";

export type AppAction =
    | LocalAction
    | GameAction & { localOnly?: false };
