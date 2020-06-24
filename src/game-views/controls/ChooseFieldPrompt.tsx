import "./ChooseFieldPrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { FieldId, Field, GrapeColor } from "../../game-data/GameState";
import { chooseField } from "../../game-data/prompts/promptActions";
import { AppState } from "../../store/AppState";
import PromptStructure from "./PromptStructure";
import { vineCards } from "../../game-data/vineCards";
import Grape from "../icons/Grape";
import Coins from "../icons/Coins";

interface Props {
    fields: Field[];
    chooseField: (id: FieldId) => void;
}

const ChooseFieldPrompt: React.FunctionComponent<Props> = props => {
    return <PromptStructure title="Choose a field">
        <div className="ChooseFieldPrompt-fields">
            {props.fields.map(field => {
                return <div key={field.id} className="ChooseFieldPrompt-field" onClick={() => props.chooseField(field.id)}>
                    <div className="ChooseFieldPrompt-fieldHeader">
                        <Coins>{field.value}</Coins>
                    </div>
                    {field.vines.map(vineId => {
                        const { name, yields } = vineCards[vineId];
                        return <div key={vineId} className="ChooseFieldPrompt-vine">
                            {name}
                            <div className="ChooseFieldPrompt-vineYields">
                                {(Object.keys(yields) as GrapeColor[]).map(grapeColor =>
                                    <Grape key={grapeColor} color={grapeColor}>{yields[grapeColor]}</Grape>
                                )}
                            </div>
                        </div>;
                    })}
                </div>;
            })}
        </div>
    </PromptStructure>;
};

const mapStateToProps = (state: AppState, ownProps: { playerId: string; }) => {
    return {
        fields: Object.values(state.game.players[ownProps.playerId].fields)
    };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: { playerId: string; }) => {
    return { chooseField: (id: FieldId) => dispatch(chooseField(id, ownProps.playerId)) };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChooseFieldPrompt);
