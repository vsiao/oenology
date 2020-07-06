import "./MakeWinePrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import cx from 'classnames';
import { GameAction } from "../../game-data/gameActions";
import { WineColor, TokenMap } from "../../game-data/GameState";
import { makeWine, GrapeSpec, WineIngredients } from "../../game-data/prompts/promptActions";
import { AppState } from "../../store/AppState";
import Grape from "../icons/Grape";
import WineGlass from "../icons/WineGlass";
import PromptStructure from "./PromptStructure";
import ChoiceButton from "./ChoiceButton";
import { devaluedIndex } from "../../game-data/shared/grapeWineReducers";
import { allGrapes } from "../../game-data/shared/sharedSelectors";


interface Props {
    cellar: Record<WineColor, TokenMap>;
    cellarLimit: number;
    upToN: number;
    grapes: GrapeSpec[];
    onConfirm: (ingredients: WineIngredients[]) => void;
}

const MakeWinePrompt: React.FunctionComponent<Props> = props => {
    const [availableGrapes, setAvailableGrapes] = React.useState(props.grapes);
    const [selectedGrapes, setSelectedGrapes] = React.useState<GrapeSpec[]>([]);
    const [localCellar, setCellar] = React.useState(props.cellar);
    const [cart, setCart] = React.useState<WineIngredients[]>([]);

    const wine = wineFromGrapes(selectedGrapes, localCellar, props.cellarLimit);

    return <PromptStructure className="MakeWinePrompt" title={`Make up to ${props.upToN} wine`}>
        <div className="MakeWinePrompt-hints">
            <p className="MakeWinePrompt-formula"><Grape color="red" /> = <WineGlass color="red" /></p>
            <p className="MakeWinePrompt-formula"><Grape color="white" /> = <WineGlass color="white" /></p>
            <p className="MakeWinePrompt-formula"><Grape color="red" /><span> + </span><Grape color="white" /> = <WineGlass color="blush" /></p>
            <p className="MakeWinePrompt-formula"><Grape color="red" /><span> + </span><Grape color="red" /><span> + </span><Grape color="white" /> = <WineGlass color="sparkling" /></p>
        </div>
        <div className="MakeWinePrompt-grapeSelector">
            {
                availableGrapes.length === 0
                    ? "Crush pad is empty"
                    : <ul className="MakeWinePrompt-grapes">
                        {availableGrapes.map(grape => {
                            const isSelected = selectedGrapes.some(g => g === grape);
                            return <li key={`${grape.color}${grape.value}`} className="MakeWinePrompt-grape">
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
                disabled={!wine || wine.cellarValue <= 0}
                onClick={wine
                    ? () => {
                        setCart([...cart, wine]);
                        setSelectedGrapes([]);
                        setAvailableGrapes(
                            availableGrapes.filter(g => wine.grapes.indexOf(g) < 0)
                        );
                        setCellar({
                            ...localCellar,
                            [wine.type]: localCellar[wine.type].map((w, i) => w || i === wine.cellarValue - 1)
                        });
                    }
                    : undefined
                }
            >
                Add {wine ? <WineGlass color={wine.type}>
                    {wine.cellarValue}
                </WineGlass> : null} to cart
            </ChoiceButton>
        </div>
        <div className="MakeWinePrompt-cart">
            {cart.length === 0
                ? "Cart is empty"
                : <ul className="MakeWinePrompt-wineList">
                    {cart.map(w => {
                        return <li key={`${w.type}${w.cellarValue}`} className="MakeWinePrompt-wine">
                            <button
                                className="MakeWinePrompt-removeWineButton"
                                onClick={() => {
                                    setCart(cart.filter(w2 => w !== w2));
                                    setAvailableGrapes([...availableGrapes, ...w.grapes]);
                                    setCellar({
                                        ...localCellar,
                                        [w.type]: localCellar[w.type].map((v, i) => i === w.cellarValue - 1 ? false : v)
                                    });
                                }}
                            >
                                <WineGlass color={w.type}>{w.cellarValue}</WineGlass>
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
    </PromptStructure>;
};

const wineFromGrapes = (grapes: GrapeSpec[], cellar: Record<WineColor, TokenMap>, maxValue: number): WineIngredients | null => {
    const numRed = grapes.filter(g => g.color === "red").length;
    const totalValue = grapes.reduce((v, g) => v + g.value, 0);

    let color: WineColor;
    if (grapes.length === 1) {
        color = grapes[0].color;
    } else if (grapes.length === 2 && numRed === 1) {
        color = "blush";
    } else if (grapes.length === 3 && numRed === 2) {
        color = "sparkling";
    } else {
        return null;
    }
    const cellarValue = devaluedIndex(Math.min(totalValue, maxValue), cellar[color]) + 1;
    if (
        (color === "blush" && cellarValue < 4) ||
        (color === "sparkling" && cellarValue < 7)
    ) {
        return null;
    }
    return {
        type: color,
        grapes,
        grapeValue: totalValue,
        cellarValue,
    };
};

const mapStateToProps = (state: AppState, ownProps: { cellarLimit?: number, playerId: string; }) => {
    const { cellarLimit, playerId } = ownProps;
    const currentPlayer = state.game!.players[playerId];
    const hasMediumCellar = currentPlayer.structures["mediumCellar"];
    const hasLargeCellar = currentPlayer.structures["largeCellar"];
    return {
        cellar: currentPlayer.cellar,
        cellarLimit: cellarLimit ? cellarLimit : hasLargeCellar ? 9 : hasMediumCellar ? 6 : 3,
        grapes: allGrapes(state.game!, playerId),
        playerId
    };
};
const mapDispatchToProps = (dispatch: Dispatch<GameAction>, ownProps: { playerId: string; }) => {
    return {
        onConfirm: (grapes: WineIngredients[]) =>
            dispatch(makeWine(grapes, ownProps.playerId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MakeWinePrompt);
