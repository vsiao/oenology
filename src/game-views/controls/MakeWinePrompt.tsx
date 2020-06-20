import "./MakeWinePrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import cx from 'classnames';
import { GameAction } from "../../game-data/gameActions";
import { makeWine, GrapeSpec, WineIngredients } from "../../game-data/prompts/promptActions";
import { AppState } from "../../store/AppState";
import Grape from "../icons/Grape";
import WineGlass from "../icons/WineGlass";
import PromptStructure from "./PromptStructure";
import ChoiceButton from "./ChoiceButton";

interface Props {
    upToN: number;
    grapes: GrapeSpec[];
    onConfirm: (ingredients: WineIngredients[]) => void;
}

const MakeWinePrompt: React.FunctionComponent<Props> = props => {
    const [availableGrapes, setAvailableGrapes] = React.useState(props.grapes);
    const [selectedGrapes, setSelectedGrapes] = React.useState<GrapeSpec[]>([]);
    const [cart, setCart] = React.useState<WineIngredients[]>([]);
    const wine = wineFromGrapes(selectedGrapes);
    const wineValueReducer = (v: number, g: GrapeSpec) => v + g.value;

    return <PromptStructure className="MakeWinePrompt" title={`Make up to ${props.upToN} wine`}>
        <div className="MakeWinePrompt-grapeSelector">
            {
                availableGrapes.length === 0
                    ? "Crush pad is empty"
                    : <ul className="MakeWinePrompt-grapes">
                        {availableGrapes.map(grape => {
                            const isSelected = selectedGrapes.some(g => g === grape);
                            return <li key={`${grape.color}${grape.value}`}>
                                <button
                                    className={cx("MakeWinePrompt-grapeButton", {
                                        "MakeWinePrompt-grapeButton--selected": isSelected
                                    })}
                                    role="switch"
                                    aria-checked={isSelected}
                                    disabled={cart.length >= props.upToN}
                                    onClick={() => setSelectedGrapes(
                                        isSelected
                                            ? selectedGrapes.filter(g => g !== grape)
                                            : [...selectedGrapes, grape]
                                    )}
                                >
                                    <Grape color={grape.color}>{grape.value}</Grape>
                                </button>
                            </li>;
                        })}
                    </ul>
            }
            <ChoiceButton
                className="MakeWinePrompt-addToCart"
                disabled={!wine}
                onClick={wine
                    ? () => {
                        setCart([...cart, wine]);
                        setSelectedGrapes([]);
                        setAvailableGrapes(
                            availableGrapes.filter(g => wine.grapes.indexOf(g) < 0)
                        );
                    }
                    : undefined
                }
            >
                Add {wine ? <WineGlass color={wine.type}>
                    {wine.grapes.reduce(wineValueReducer, 0)}
                </WineGlass> : null} to cart
            </ChoiceButton>
        </div>
        <div className="MakeWinePrompt-cart">
            {cart.length === 0
                ? "Cart is empty"
                : <ul className="MakeWinePrompt-wineList">
                    {cart.map(w => {
                        const wineValue = w.grapes.reduce(wineValueReducer, 0);
                        return <li key={`${w.type}${wineValue}`}>
                            <button
                                className="MakeWinePrompt-removeWineButton"
                                onClick={() => {
                                    setCart(cart.filter(w2 => w !== w2));
                                    setAvailableGrapes([...availableGrapes, ...w.grapes])
                                }}
                            >
                                <WineGlass color={w.type}>{wineValue}</WineGlass>
                            </button>
                        </li>;
                    })}
                </ul>}
            <ChoiceButton
                className="MakeWinePrompt-makeWineButton"
                disabled={cart.length === 0}
                onClick={() => props.onConfirm(cart)}
            >
                Make wine!
            </ChoiceButton>
        </div>
    </PromptStructure>
};

const wineFromGrapes = (grapes: GrapeSpec[]): WineIngredients | null => {
    const numRed = grapes.filter(g => g.color === "red").length;
    const totalValue = grapes.reduce((v, g) => v + g.value, 0);
    if (grapes.length === 1) {
        return { type: grapes[0].color, grapes };
    } else if (grapes.length === 2 && numRed === 1 && totalValue >= 4) {
        return { type: "blush", grapes };
    } else if (grapes.length === 3 && numRed === 2 && totalValue >= 7) {
        return { type: "sparkling", grapes };
    }
    return null;
};

const mapStateToProps = (state: AppState, ownProps: { playerId: string }) => {
    const grapes: GrapeSpec[] = [];
    const { red, white } = state.game.players[ownProps.playerId].crushPad;
    red.forEach((r, i) => {
        if (r) grapes.push({ color: "red", value: i + 1 });
    });
    white.forEach((w, i) => {
        if (w) grapes.push({ color: "white", value: i + 1 });
    });
    return { grapes, playerId: ownProps.playerId };
};
const mapDispatchToProps = (dispatch: Dispatch<GameAction>, ownProps: { playerId: string }) => {
    return {
        onConfirm: (grapes: WineIngredients[]) =>
            dispatch(makeWine(grapes, ownProps.playerId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MakeWinePrompt);
