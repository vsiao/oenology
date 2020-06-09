import "./ActionPrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { PromptState } from "../../game-data/prompts/PromptState";
import ChooseActionPrompt from "./ChooseActionPrompt";
import { AppState } from "../../store/AppState";

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

const mapStateToProps = (state: AppState) => {
    return { actionPrompt: state.game.actionPrompt, };
};

export default connect(mapStateToProps)(ActionPrompt);
