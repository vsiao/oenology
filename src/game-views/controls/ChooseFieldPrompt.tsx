import "./ChooseFieldPrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import cx from 'classnames';
import { FieldId, Field, GrapeColor } from "../../game-data/GameState";
import { chooseField, chooseVine } from "../../game-data/prompts/promptActions";
import { AppState } from "../../store/AppState";
import { ChooseFieldPromptState } from "../../game-data/prompts/PromptState";
import PromptStructure from "./PromptStructure";
import { vineCards, VineId } from "../../game-data/vineCards";
import Grape from "../icons/Grape";
import Coins from "../icons/Coins";

interface Props {
    prompt: ChooseFieldPromptState;
    fields: (Field & { disabledReason: string | undefined; })[];
    chooseField: (id: FieldId) => void;
    chooseVine: (vineId: VineId, fieldId: FieldId) => void;
}

const ChooseFieldPrompt: React.FunctionComponent<Props> = props => {
    const isChoosingVine = !!props.prompt.chooseVine;
    return <PromptStructure title="Choose a field">
        <div className="ChooseFieldPrompt-fields">
            {props.fields.map(field => {
                const isDisabled = field.disabledReason !== undefined;
                const isChoice = !isDisabled && !isChoosingVine;
                return <div key={field.id}
                    className={cx({
                        "ChooseFieldPrompt-field": true,
                        "ChooseFieldPrompt-field--sold": field.sold,
                        "ChooseFieldPrompt-field--disabled": isDisabled,
                        "ChooseFieldPrompt-field--choice": isChoice
                    })}
                    onClick={isChoice ? () => props.chooseField(field.id) : undefined}
                >
                    <ul className="ChooseFieldPrompt-vines">
                        {field.vines.map(vineId => {
                            const { name, yields } = vineCards[vineId];
                            return <li key={vineId}
                                className={cx("ChooseFieldPrompt-vine", {
                                    "ChooseFieldPrompt-vine--choice": isChoosingVine
                                })}
                                onClick={isChoosingVine ? () => props.chooseVine(vineId, field.id) : undefined}>
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
    return {
        chooseField: (id: FieldId) => dispatch(chooseField(id, ownProps.playerId)),
        chooseVine: (vineId: VineId, fieldId: FieldId) => dispatch(chooseVine(vineId, fieldId, ownProps.playerId))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChooseFieldPrompt);
