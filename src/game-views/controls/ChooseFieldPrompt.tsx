import "./ChooseFieldPrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import cx from 'classnames';
import { FieldId, Field, GrapeColor } from "../../game-data/GameState";
import { chooseField } from "../../game-data/prompts/promptActions";
import { AppState } from "../../store/AppState";
import { ChooseFieldPurpose } from "../../game-data/prompts/PromptState";
import PromptStructure from "./PromptStructure";
import { vineCards } from "../../game-data/vineCards";
import Grape from "../icons/Grape";
import Coins from "../icons/Coins";

interface Props {
    purpose: ChooseFieldPurpose;
    fields: Field[];
    chooseField: (id: FieldId) => void;
}

const ChooseFieldPrompt: React.FunctionComponent<Props> = props => {
    return <PromptStructure title="Choose a field">
        <div className="ChooseFieldPrompt-fields">
            {props.fields.map(field => {
                const isDisabled = isFieldDisabled(props.purpose, field);
                return <div key={field.id}
                    className={cx({
                        "ChooseFieldPrompt-field": true,
                        "ChooseFieldPrompt-field--sold": field.sold,
                        "ChooseFieldPrompt-field--disabled": isDisabled
                    })}
                    onClick={isDisabled ? undefined : () => props.chooseField(field.id)}
                >
                    <ul className="ChooseFieldPrompt-vines">
                        {field.vines.map(vineId => {
                            const { name, yields } = vineCards[vineId];
                            return <li key={vineId} className="ChooseFieldPrompt-vine">
                                {name}
                                <div className="ChooseFieldPrompt-vineYields">
                                    {(Object.keys(yields) as GrapeColor[]).map(grapeColor =>
                                        <Grape key={grapeColor} color={grapeColor}>{yields[grapeColor]}</Grape>
                                    )}
                                </div>
                            </li>;
                        })}
                    </ul>
                    <div className="ChooseFieldPrompt-fieldFooter">
                        <Coins>{field.value}</Coins>
                    </div>
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

function isFieldDisabled(purpose: ChooseFieldPurpose, field: Field): boolean {
    switch (purpose) {
        case "buy":
            return !field.sold;
        case "sell":
            return field.sold || field.vines.length > 0;
        case "harvest":
            return field.harvested || !field.vines.length;
        case "plant":
            // TODO: check vine value & structures
            // There are also visitors that let you plant despite these
            return field.sold;
    }
}
