import "./ActionPrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { PromptState } from "../../game-data/prompts/PromptState";
import ChooseActionPrompt from "./ChooseActionPrompt";
import ChooseFieldPrompt from "./ChooseFieldPrompt";
import { AppState } from "../../store/AppState";
import { CSSTransition } from "react-transition-group";
import MakeWinePrompt from "./MakeWinePrompt";
import BuildStructurePrompt from "./BuildStructurePrompt";

interface Props {
    actionPrompt: PromptState | undefined;
    playerId: string;
}

const ActionPrompt: React.FunctionComponent<Props> = props => {
    const nodeRef = React.useRef<HTMLDivElement>(null);
    return <CSSTransition
        in={props.actionPrompt !== undefined}
        timeout={200}
        classNames="ActionPrompt"
        nodeRef={nodeRef}
        mountOnEnter
        unmountOnExit
    >
        <div ref={nodeRef} className="ActionPrompt">
            {props.actionPrompt === undefined
                ? null
                : renderPrompt(props.actionPrompt, props)}
        </div>
    </CSSTransition>;
};

const renderPrompt = (prompt: Exclude<PromptState, null>, props: Props) => {
    switch (prompt.type) {
        case "chooseAction":
            return <ChooseActionPrompt prompt={prompt} />;
        case "chooseField":
            return <ChooseFieldPrompt playerId={props.playerId} />;
        case "makeWine":
            return <MakeWinePrompt upToN={prompt.upToN} playerId={props.playerId} />;
        case "buildStructure":
            return <BuildStructurePrompt coupon={prompt.coupon} playerId={props.playerId} />;
        default:
            return JSON.stringify(prompt);
    }
};

const mapStateToProps = (state: AppState) => {
    return {
        actionPrompt: state.game.actionPrompts[0],
        playerId: state.game.playerId!,
    };
};

export default connect(mapStateToProps)(ActionPrompt);
