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

    return <div className="MakeWinePrompt">
        <div className="MakeWinePrompt-header">
            Make up to {props.upToN} wine
        </div>
        <ul className="MakeWinePrompt-grapes">
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
        <button
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
        </button>
        <div className="MakeWinePrompt-cart">
            <div className="MakeWinePrompt-header">Cart</div>
            <ul className="MakeWinePrompt-wineList">
                {cart.map(w => {
                    const wineValue = w.grapes.reduce(wineValueReducer, 0);
                    return <li key={`${w.type}${wineValue}`}>
                        <WineGlass color={w.type}>{wineValue}</WineGlass>
                    </li>;
                })}
            </ul>
            <button
                className="MakeWinePrompt-confirm"
                disabled={cart.length === 0}
                onClick={() => props.onConfirm(cart)}
            >
                Make wine!
            </button>
        </div>
    </div>;
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

const mapStateToProps = (state: AppState) => {
    const grapes: GrapeSpec[] = [];
    const { red, white } = state.game.players[state.game.currentTurn.playerId].crushPad;
    red.forEach((r, i) => {
        if (r) grapes.push({ color: "red", value: i + 1 });
    });
    white.forEach((w, i) => {
        if (w) grapes.push({ color: "white", value: i + 1 });
    });
    return { grapes };
};
const mapDispatchToProps = (dispatch: Dispatch<GameAction>) => {
    return {
        onConfirm: (grapes: WineIngredients[]) => dispatch(makeWine(grapes))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MakeWinePrompt);
