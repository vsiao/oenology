import "./ChooseFieldPrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { FieldId, Field } from "../../game-data/GameState";
import { chooseField } from "../../game-data/prompts/promptActions";
import { AppState } from "../../store/AppState";
import PromptStructure from "./PromptStructure";

interface Props {
    fields: Field[];
    chooseField: (id: FieldId) => void;
}

const ChooseFieldPrompt: React.FunctionComponent<Props> = props => {
    return <PromptStructure title="Choose a field">
        <ul className="ChooseFieldPrompt-fields">
            {props.fields.map(field => {
                return <li key={field.id}>
                    <button onClick={() => props.chooseField(field.id)}>
                        {JSON.stringify(field)}
                    </button>
                </li>;
            })}
        </ul>
    </PromptStructure>;
};

const mapStateToProps = (state: AppState, ownProps: { playerId: string }) => {
    return {
        fields: Object.values(state.game.players[ownProps.playerId].fields)
    };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: { playerId: string }) => {
    return { chooseField: (id: FieldId) => dispatch(chooseField(id, ownProps.playerId)) };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChooseFieldPrompt);
