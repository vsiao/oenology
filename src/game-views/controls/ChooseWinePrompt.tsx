import "./ChooseWinePrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import cx from 'classnames';
import { GameAction } from "../../game-data/gameActions";
import { chooseWine } from "../../game-data/prompts/promptActions";
import { AppState } from "../../store/AppState";
import WineGlass from "../icons/WineGlass";
import PromptStructure from "./PromptStructure";
import ChoiceButton from "./ChoiceButton";
import { DiscardWinePromptState, FillOrderPromptState } from "../../game-data/prompts/PromptState";
import { WineSpec, orderCards } from "../../game-data/orderCards";
import { WineColor } from "../../game-data/GameState";

interface Props {
    prompt: DiscardWinePromptState | FillOrderPromptState;
    cellarWines: WineSpec[];
    onConfirm: (wines: WineSpec[]) => void;
}

const ChooseWinePrompt: React.FunctionComponent<Props> = props => {
    const { prompt } = props;
    const [selectedWines, setSelectedWines] = React.useState<WineSpec[]>([]);

    return <PromptStructure
        className="ChooseWinePrompt"
        title={prompt.type === "discardWine" ? "Discard wine" : "Fill order"}
    >
        <div className="ChooseWinePrompt-wineSelector">
            <ul className="ChooseWinePrompt-wines">
                {props.cellarWines.map(wine => {
                    const isSelected = selectedWines.some(w => w === wine);
                    return <li key={`${wine.color}${wine.value}`}>
                        <button
                            className={cx("ChooseWinePrompt-wineButton", {
                                "ChooseWinePrompt-wineButton--selected": isSelected
                            })}
                            role="switch"
                            aria-checked={isSelected}
                            onClick={() => setSelectedWines(
                                isSelected
                                    ? selectedWines.filter(w => w !== wine)
                                    : [...selectedWines, wine]
                            )}
                        >
                            <WineGlass color={wine.color}>{wine.value}</WineGlass>
                        </button>
                    </li>;
                })}
            </ul>
            <ChoiceButton
                className="ChooseWinePrompt-submit"
                disabled={isDisabled(prompt, selectedWines)}
                onClick={() => props.onConfirm(selectedWines)}
            >
                {prompt.type === "discardWine" ? "Discard" : "Fill"}
            </ChoiceButton>
        </div>
    </PromptStructure>;
};

const isDisabled = (prompt: DiscardWinePromptState | FillOrderPromptState, selectedWines: WineSpec[]) => {
    switch (prompt.type) {
        case "discardWine":
            return selectedWines.length > prompt.limit ||
                selectedWines.some(w => w.value < prompt.minValue);

        case "fillOrder":
            const sortedWines = selectedWines.slice().sort((w1, w2) => w1.value - w2.value);
            for (const orderId of prompt.orderIds) {
                for (const wine of orderCards[orderId].wines) {
                    const matchingWineIdx = sortedWines.findIndex(
                        ({ color, value }) => color === wine.color && value <= wine.value
                    );
                    if (matchingWineIdx < 0) {
                        return true;
                    }
                    sortedWines.splice(matchingWineIdx, 1);
                }
            }
            return sortedWines.length !== 0;
    }
};

const mapStateToProps = (state: AppState, ownProps: { playerId: string }) => {
    const cellarWines: WineSpec[] = [];
    Object.entries(state.game.players[ownProps.playerId].cellar).forEach(([color, tokenMap]) => {
        tokenMap.forEach((hasToken, i) => {
            if (hasToken) {
                cellarWines.push({ color: color as WineColor, value: i + 1 });
            }
        })
    });
    return { cellarWines };
};
const mapDispatchToProps = (dispatch: Dispatch<GameAction>, ownProps: { playerId: string }) => {
    return {
        onConfirm: (grapes: WineSpec[]) =>
            dispatch(chooseWine(grapes, ownProps.playerId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChooseWinePrompt);
