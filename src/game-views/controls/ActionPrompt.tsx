import * as React from "react";
import "./ActionPrompt.css";
import GameState from "../../game-data/GameState";
import { connect } from "react-redux";
import { PromptState } from "../../game-data/prompts/PromptState";

interface Props {
    currentPlayerId: string;
    actionPrompt: PromptState;
}

const ActionPrompt: React.FunctionComponent<Props> = props => {
    return <div className="ActionPrompt">
        {JSON.stringify(props.actionPrompt)}
    </div>;
};

const mapStateToProps = (state: GameState) => {
    return { actionPrompt: state.actionPrompt };
};

export default connect(mapStateToProps)(ActionPrompt);
