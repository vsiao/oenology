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
import { ChooseWinePromptState, FillOrderPromptState } from "../../game-data/prompts/PromptState";
import { WineSpec } from "../../game-data/orderCards";
import { allWines, canFillOrderWithWines } from "../../game-data/shared/sharedSelectors";

interface Props {
    prompt: ChooseWinePromptState | FillOrderPromptState;
    cellarWines: WineSpec[];
    onConfirm: (wines: WineSpec[]) => void;
}

const ChooseWinePrompt: React.FunctionComponent<Props> = props => {
    const { prompt } = props;
    const [selectedWines, setSelectedWines] = React.useState<WineSpec[]>([]);

    return <PromptStructure
        className="ChooseWinePrompt"
        title={prompt.type === "chooseWine" ? "Choose a wine" : "Fill order"}
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
                {prompt.type === "chooseWine" ? "Confirm" : "Fill"}
            </ChoiceButton>
        </div>
    </PromptStructure>;
};

const isDisabled = (prompt: ChooseWinePromptState | FillOrderPromptState, selectedWines: WineSpec[]) => {
    switch (prompt.type) {
        case "chooseWine":
            return selectedWines.some(w => w.value < prompt.minValue);

        case "fillOrder":
            let winesLeft = selectedWines;
            for (const orderId of prompt.orderIds) {
                const result = canFillOrderWithWines(orderId, winesLeft);
                if (!result) {
                    return true;
                }
                winesLeft = result;
            }
            return winesLeft.length !== 0;
    }
};

const mapStateToProps = (state: AppState, ownProps: { playerId: string }) => {
    return { cellarWines: allWines(state.game!, ownProps.playerId) };
};
const mapDispatchToProps = (dispatch: Dispatch<GameAction>, ownProps: { playerId: string }) => {
    return {
        onConfirm: (grapes: WineSpec[]) =>
            dispatch(chooseWine(grapes, ownProps.playerId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChooseWinePrompt);
