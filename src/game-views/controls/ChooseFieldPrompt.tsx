import "./ChooseFieldPrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import cx from 'classnames';
import { FieldId, Field, GrapeColor } from "../../game-data/GameState";
import { chooseField } from "../../game-data/prompts/promptActions";
import { AppState } from "../../store/AppState";
import { ChooseFieldPromptState } from "../../game-data/prompts/PromptState";
import PromptStructure from "./PromptStructure";
import { vineCards } from "../../game-data/vineCards";
import Grape from "../icons/Grape";
import Coins from "../icons/Coins";

interface Props {
    prompt: ChooseFieldPromptState;
    fields: (Field & { disabledReason: string | undefined })[];
    chooseField: (id: FieldId) => void;
}

const ChooseFieldPrompt: React.FunctionComponent<Props> = props => {
    return <PromptStructure title="Choose a field">
        <div className="ChooseFieldPrompt-fields">
            {props.fields.map(field => {
                const isDisabled = field.disabledReason !== undefined;
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

const mapStateToProps = (
    state: AppState,
    { prompt, playerId }: { prompt: ChooseFieldPromptState; playerId: string; }
) => {
    return {
        fields: Object.values(state.game!.players[playerId].fields).map(
            f => ({ ...f, disabledReason: prompt.disabledReasons[f.id] })
        ),
    };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: { playerId: string; }) => {
    return { chooseField: (id: FieldId) => dispatch(chooseField(id, ownProps.playerId)) };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChooseFieldPrompt);
