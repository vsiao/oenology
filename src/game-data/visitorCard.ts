import { GameAction } from "./actionCreators";
import { ThunkDispatch } from "redux-thunk"; 
import GameState from "./GameState";
import * as React from "react";

type GameDispatch = ThunkDispatch<GameState, undefined, GameAction>;

export interface VisitorCardData {
    name: string;
    description: React.ReactNode;
    action: (dispatch: GameDispatch, getState: () => GameState) => void;
}

export const visitorCard = (
    name: string,
    description: React.ReactNode,
    action: (dispatch: GameDispatch, getState: () => GameState) => void
): VisitorCardData => {
    return { name, description, action };
};
