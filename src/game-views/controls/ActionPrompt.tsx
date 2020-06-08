import * as React from "react";
import "./ActionPrompt.css";
import GameState from "../../game-data/GameState";
import { connect } from "react-redux";
import { PromptState } from "../../game-data/prompts/PromptState";
import ChooseActionPrompt from "./ChooseActionPrompt";

interface Props {
    actionPrompt: PromptState;
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
            return <ChooseActionPrompt prompt={prompt} />;
        default:
            return JSON.stringify(prompt);
    }
};

const mapStateToProps = (state: GameState) => {
    return { actionPrompt: state.actionPrompt, };
};

export default connect(mapStateToProps)(ActionPrompt);
