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
import ChooseGrapePrompt from "./ChooseGrapePrompt";

interface Props {
    actionPrompt: PromptState | undefined;
    playerId: string;
    undoable: boolean;
}

const ActionPrompt: React.FunctionComponent<Props> = props => {
    return <TransitionGroup className="ActionPrompt">
        {props.actionPrompt === undefined
            ? null
            : <CSSTransition
                key={JSON.stringify(props.actionPrompt)} // #ForcePromptRemount
                timeout={300}
                classNames="PromptStructure"
            >
                {renderPrompt(props.actionPrompt, props)}
            </CSSTransition>}
    </TransitionGroup>;
};

const renderPrompt = (
    prompt: PromptState,
    { playerId, undoable }: Props,
): React.ReactNode => {
    switch (prompt.type) {
        case "buildStructure":
            return <BuildStructurePrompt coupon={prompt.coupon} playerId={playerId} undoable={undoable} />;
        case "chooseAction":
            return <ChooseActionPrompt prompt={prompt} undoable={undoable} />;
        case "chooseCard":
            return <ChooseCardPrompt prompt={prompt} playerId={playerId} undoable={undoable} />;
        case "chooseField":
            return <ChooseFieldPrompt prompt={prompt} playerId={playerId} undoable={undoable} />;
        case "chooseGrape":
            return <ChooseGrapePrompt prompt={prompt} playerId={playerId} undoable={undoable} />;
        case "chooseWine":
        case "fillOrder":
            return <ChooseWinePrompt prompt={prompt} playerId={playerId} undoable={undoable} />;
        case "makeWine":
            return <MakeWinePrompt prompt={prompt} playerId={playerId} undoable={undoable} />;
        case "placeWorker":
            return <PlaceWorkerPrompt playerId={playerId} />;
        case "gameOver":
            return <GameOverPrompt playerId={playerId} />;
    }
};

const mapStateToProps = (state: AppState) => {
    return {
        actionPrompt: state.game!.actionPrompts[0],
        playerId: state.game!.playerId!,
        undoable: state.game!.undoable,
    };
};

export default connect(mapStateToProps)(ActionPrompt);
