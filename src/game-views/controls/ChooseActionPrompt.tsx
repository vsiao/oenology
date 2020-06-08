
import * as React from "react";
import { connect } from "react-redux";
import { ChooseActionPromptState } from "../../game-data/prompts/PromptState";
import { GameAction } from "../../game-data/actionCreators";
import { Dispatch } from "redux";
import { chooseAction } from "../../game-data/prompts/promptActionCreators";

import "./ChooseActionPrompt.css";

interface Props {
    prompt: ChooseActionPromptState;
    onSelectChoice: (choice: number) => void;
}

const ChooseActionPrompt: React.FunctionComponent<Props> = props => {
    const { prompt } = props;
    return <div className="ChooseActionPrompt">
        <div className="ChooseActionPrompt-header">
            Choose an action
        </div>
        <ul className="ChooseActionPrompt-choices">
            {prompt.choices.map((choice, i) => {
                return <li className="ChooseActionPrompt-choice" key={i}>
                    <button
                        className="ChooseActionPrompt-choiceButton"
                        onClick={() => props.onSelectChoice(i)}
                    >
                        {choice}
                    </button>
                </li>;
            })}
        </ul>
    </div>;
};

const mapDispatchToProps = (dispatch: Dispatch<GameAction>) => {
    return {
        onSelectChoice: (choice: number) => dispatch(chooseAction(choice))
    };
}

export default connect(null, mapDispatchToProps)(ChooseActionPrompt);