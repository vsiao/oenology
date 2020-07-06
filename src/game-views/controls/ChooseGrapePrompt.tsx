import "./ChooseGrapePrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import cx from 'classnames';
import { GameAction } from "../../game-data/gameActions";
import { GrapeSpec, chooseGrape } from "../../game-data/prompts/promptActions";
import { AppState } from "../../store/AppState";
import PromptStructure from "./PromptStructure";
import ChoiceButton from "./ChoiceButton";
import { ChooseGrapePromptState } from "../../game-data/prompts/PromptState";
import { allGrapes } from "../../game-data/shared/sharedSelectors";
import Grape from "../icons/Grape";

interface Props {
    prompt: ChooseGrapePromptState;
    grapes: GrapeSpec[];
    onConfirm: (grapes: GrapeSpec[]) => void;
}

const ChooseGrapePrompt: React.FunctionComponent<Props> = props => {
    const [selectedGrapes, setSelectedGrapes] = React.useState<GrapeSpec[]>([]);

    return <PromptStructure
        className="ChooseGrapePrompt"
        title="Choose grape(s)"
    >
        <div className="ChooseGrapePrompt-grapeSelector">
            <ul className="ChooseGrapePrompt-grapes">
                {props.grapes.map(grape => {
                    const isSelected = selectedGrapes.some(g => g === grape);
                    return <li key={`${grape.color}${grape.value}`}>
                        <button
                            className={cx("ChooseGrapePrompt-grapeButton", {
                                "ChooseGrapePrompt-grapeButton--selected": isSelected
                            })}
                            role="switch"
                            aria-checked={isSelected}
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
            <ChoiceButton
                className="ChooseGrapePrompt-submit"
                disabled={selectedGrapes.length === 0 || props.prompt.limit !== undefined && selectedGrapes.length > props.prompt.limit}
                onClick={() => props.onConfirm(selectedGrapes)}
            >
                Confirm
            </ChoiceButton>
        </div>
    </PromptStructure>;
};

const mapStateToProps = (state: AppState, ownProps: { playerId: string; }) => {
    return { grapes: allGrapes(state.game!, ownProps.playerId) };
};
const mapDispatchToProps = (dispatch: Dispatch<GameAction>, ownProps: { playerId: string; }) => {
    return {
        onConfirm: (grapes: GrapeSpec[]) =>
            dispatch(chooseGrape(grapes, ownProps.playerId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChooseGrapePrompt);
