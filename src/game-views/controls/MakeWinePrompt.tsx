import "./MakeWinePrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import cx from 'classnames';
import { GameAction, undo } from "../../game-data/gameActions";
import { WineColor, TokenMap } from "../../game-data/GameState";
import { makeWine, GrapeSpec, WineIngredients } from "../../game-data/prompts/promptActions";
import { AppState } from "../../store/AppState";
import Grape from "../icons/Grape";
import WineGlass from "../icons/WineGlass";
import PromptStructure from "./PromptStructure";
import ChoiceButton from "./ChoiceButton";
import { allGrapes, devaluedIndex } from "../../game-data/shared/sharedSelectors";
import { MakeWinePromptState } from "../../game-data/prompts/PromptState";


interface Props {
    prompt: MakeWinePromptState;
    cellar: Record<WineColor, TokenMap>;
    cellarLimit: number;
    grapes: GrapeSpec[];
    onConfirm: (ingredients: WineIngredients[]) => void;
    undo?: () => void;
}

const MakeWinePrompt: React.FunctionComponent<Props> = props => {
    const [availableGrapes, setAvailableGrapes] = React.useState(props.grapes);
    const [selectedGrapes, setSelectedGrapes] = React.useState<GrapeSpec[]>([]);
    const [localCellar, setCellar] = React.useState(props.cellar);
    const [cart, setCart] = React.useState<WineIngredients[]>([]);

    const wine = wineFromGrapes(
        selectedGrapes,
        localCellar,
        props.cellarLimit,
        /* minValue */ props.prompt.asZymologist ? 4 : 1
    );

    return <PromptStructure
        className="MakeWinePrompt"
        title={`Make up to ${props.prompt.upToN} wine`}
        onClose={props.undo}
    >
        <div className="MakeWinePrompt-hints">
            <p className="MakeWinePrompt-formula"><Grape color="red" /> = <WineGlass color="red" /></p>
            <p className="MakeWinePrompt-formula"><Grape color="white" /> = <WineGlass color="white" /></p>
            <p className="MakeWinePrompt-formula">
                <Grape color="red" /> + <Grape color="white" /> = <WineGlass color="blush" />
            </p>
            <p className="MakeWinePrompt-formula">
                <Grape color="red" /> + <Grape color="red" /> + <Grape color="white" /> = <WineGlass color="sparkling" />
            </p>
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
                                    disabled={cart.length >= props.prompt.upToN}
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
            <ul className="MakeWinePrompt-wineList">
                {new Array(props.prompt.upToN).fill(null).map((_, i) => {
                    const w = cart[i];
                    if (!w) {
                        return <li key={i} className="MakeWinePrompt-wine"><WineGlass>?</WineGlass></li>;
                    }
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
            </ul>
            <ChoiceButton
                className="MakeWinePrompt-makeWineButton"
                disabled={cart.length === 0}
                onClick={() => props.onConfirm(cart)}
            >
                {cart.length === 0
                    ? "Make wine"
                    : cart.length === 1
                        ? "Make 1 wine"
                        : `Make ${cart.length} wines`}
            </ChoiceButton>
        </div>
    </PromptStructure>;
};

const wineFromGrapes = (
    grapes: GrapeSpec[],
    cellar: Record<WineColor, TokenMap>,
    maxValue: number,
    minValue = 1
): WineIngredients | null => {
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
        cellarValue < minValue ||
        (color === "blush" && cellarValue < 4) ||
        (color === "sparkling" && cellarValue < 7)
    ) {
        return null;
    }
    return {
        type: color,
        grapes,
        cellarValue,
    };
};

interface OwnProps {
    prompt: MakeWinePromptState;
    playerId: string;
    undoable: boolean;
}

const mapStateToProps = (state: AppState, { prompt, playerId }: OwnProps) => {
    const currentPlayer = state.game!.players[playerId];
    const hasMediumCellar = currentPlayer.structures.mediumCellar;
    const hasLargeCellar = currentPlayer.structures.largeCellar;
    return {
        cellar: currentPlayer.cellar,
        cellarLimit: prompt.asZymologist || hasLargeCellar ? 9 : hasMediumCellar ? 6 : 3,
        grapes: allGrapes(state.game!, playerId),
        playerId
    };
};
const mapDispatchToProps = (dispatch: Dispatch<GameAction>, { playerId, undoable }: OwnProps) => {
    return {
        onConfirm: (grapes: WineIngredients[]) => dispatch(makeWine(grapes, playerId)),
        undo: undoable ? () => dispatch(undo(playerId)) : undefined,
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MakeWinePrompt);
