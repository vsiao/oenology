import "./ActionPrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { PromptState } from "../../game-data/prompts/PromptState";
import ChooseActionPrompt from "./ChooseActionPrompt";
import ChooseFieldPrompt from "./ChooseFieldPrompt";
import { AppState } from "../../store/AppState";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import MakeWinePrompt from "./MakeWinePrompt";
import BuildStructurePrompt from "./BuildStructurePrompt";
import ChooseCardPrompt from "./ChooseCardPrompt";
import ChooseWinePrompt from "./ChooseWinePrompt";
import PlaceWorkerPrompt from "./PlaceWorkerPrompt";
import GameOverPrompt from "./GameOverPrompt";

interface Props {
    actionPrompt: PromptState | undefined;
    playerId: string;
}

const ActionPrompt: React.FunctionComponent<Props> = props => {
    return <TransitionGroup className="ActionPrompt">
        {props.actionPrompt === undefined
            ? null
            : <CSSTransition
                key={props.actionPrompt.type}
                timeout={300}
                classNames="PromptStructure"
            >
                {renderPrompt(props.actionPrompt, props)}
            </CSSTransition>}
    </TransitionGroup>;
};

const renderPrompt = (
    prompt: PromptState,
    props: Props,
): React.ReactNode => {
    switch (prompt.type) {
        case "buildStructure":
            return <BuildStructurePrompt coupon={prompt.coupon} playerId={props.playerId} />;
        case "chooseAction":
            return <ChooseActionPrompt prompt={prompt} />;
        case "chooseCard":
            return <ChooseCardPrompt prompt={prompt} playerId={props.playerId} />;
        case "chooseField":
            return <ChooseFieldPrompt prompt={prompt} playerId={props.playerId} />;
        case "chooseWine":
        case "fillOrder":
            return <ChooseWinePrompt prompt={prompt} playerId={props.playerId} />;
        case "makeWine":
            return <MakeWinePrompt upToN={prompt.upToN} playerId={props.playerId} />;
        case "placeWorker":
            return <PlaceWorkerPrompt playerId={props.playerId} />;
        case "gameOver":
            return <GameOverPrompt />;
    }
};

const mapStateToProps = (state: AppState) => {
    return {
        actionPrompt: state.game!.actionPrompts[0],
        playerId: state.game!.playerId!,
    };
};

export default connect(mapStateToProps)(ActionPrompt);
