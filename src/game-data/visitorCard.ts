import { GameAction } from "./actionCreators";
import { ThunkDispatch } from "redux-thunk"; 
import GameState from "./GameState";

type GameDispatch = ThunkDispatch<GameState, undefined, GameAction>;

export interface VisitorCardData {
    name: string;
    description: string;
    action: (dispatch: GameDispatch, getState: () => GameState) => void;
}

export const visitorCard = (
    name: string,
    description: string,
    action: (dispatch: GameDispatch, getState: () => GameState) => void
): VisitorCardData => {
    return { name, description, action };
};
