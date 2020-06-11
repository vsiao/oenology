import "./ActionPrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { PromptState } from "../../game-data/prompts/PromptState";
import ChooseActionPrompt from "./ChooseActionPrompt";
import { AppState } from "../../store/AppState";
import { CSSTransition } from "react-transition-group";

interface Props {
    actionPrompt: PromptState;
}

const ActionPrompt: React.FunctionComponent<Props> = props => {
    return <CSSTransition
        in={props.actionPrompt !== null}
        timeout={200}
        classNames="ActionPrompt"
        mountOnEnter
        unmountOnExit
    >
        <div className="ActionPrompt">
            {props.actionPrompt === null
                ? null
                : renderPrompt(props.actionPrompt, props)}
        </div>
    </CSSTransition>;
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
