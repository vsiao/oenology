import "./ChooseActionPrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GameAction } from "../../game-data/gameActions";
import { ChooseActionPromptState } from "../../game-data/prompts/PromptState";
import { chooseAction } from "../../game-data/prompts/promptActions";

interface Props {
    prompt: ChooseActionPromptState;
    onSelectChoice: (choice: string) => void;
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
                        disabled={choice.disabledReason !== undefined}
                        onClick={() => props.onSelectChoice(choice.id)}
                    >
                        {choice.label}
                    </button>
                </li>;
            })}
        </ul>
    </div>;
};

const mapDispatchToProps = (dispatch: Dispatch<GameAction>) => {
    return {
        onSelectChoice: (choice: string) => dispatch(chooseAction(choice))
    };
}

export default connect(null, mapDispatchToProps)(ChooseActionPrompt);