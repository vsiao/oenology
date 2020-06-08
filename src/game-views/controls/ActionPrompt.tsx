import * as React from "react";
import "./ActionPrompt.css";
import GameState from "../../game-data/GameState";
import { connect } from "react-redux";
import { PromptState } from "../../game-data/prompts/PromptState";
import { GameAction } from "../../game-data/actionCreators";
import { Dispatch } from "redux";
import { chooseAction } from "../../game-data/prompts/promptActionCreators";

interface Props {
    currentPlayerId: string;
    actionPrompt: PromptState;
    onSelectChoice: (choice: number) => void;
}

const ActionPrompt: React.FunctionComponent<Props> = props => {
    if (props.actionPrompt === null) {
        return null;
    }
    return <div className="ActionPrompt">
        {renderPrompt(props.actionPrompt, props)}
    </div>;
};

const renderPrompt = (prompt: Exclude<PromptState, null>, props: Props) => {
    switch (prompt.type) {
        case "chooseAction":
            return <ul>
                {prompt.choices.map((choice, i) => {
                    return <li className="ActionPrompt-choice" key={i}>
                        <button
                            className="ActionPrompt-choiceButton"
                            onClick={() => props.onSelectChoice(i)}
                        >
                            {choice}
                        </button>
                    </li>;
                })}
            </ul>;
        default:
            return JSON.stringify(prompt);
    }
};

const mapStateToProps = (state: GameState) => {
    return { actionPrompt: state.actionPrompt, };
};

const mapDispatchToProps = (dispatch: Dispatch<GameAction>) => {
    return {
        onSelectChoice: (choice: number) => dispatch(chooseAction(choice))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionPrompt);
