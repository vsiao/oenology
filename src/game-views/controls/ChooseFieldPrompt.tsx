import "./ChooseFieldPrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import cx from 'classnames';
import { FieldId, Field, GrapeColor } from "../../game-data/GameState";
import { chooseField, chooseVine, VineInField } from "../../game-data/prompts/promptActions";
import { AppState } from "../../store/AppState";
import { ChooseFieldPromptState } from "../../game-data/prompts/PromptState";
import PromptStructure from "./PromptStructure";
import { vineCards } from "../../game-data/vineCards";
import Grape from "../icons/Grape";
import Coins from "../icons/Coins";
import ChoiceButton from "./ChoiceButton";
import { undo } from "../../game-data/gameActions";

interface Props {
    prompt: ChooseFieldPromptState;
    fields: (Field & { disabledReason: string | undefined; })[];
    chooseFields: (fields: FieldId[]) => void;
    chooseVines: (vines: VineInField[]) => void;
    undo?: () => void;
}

const ChooseFieldPrompt: React.FunctionComponent<Props> = ({
    prompt,
    fields,
    chooseFields,
    chooseVines,
    undo,
}) => {
    const [selectedVines, setSelectedVines] = React.useState<VineInField[]>([]);
    const [selectedFields, setSelectedFields] = React.useState<FieldId[]>([]);
    const isSelectingVines = prompt.kind === "uproot" || prompt.kind === "switch";
    const switchDisabledReason = prompt.kind === "switch"
        ? prompt.submitDisabledReason!(selectedVines)
        : undefined;

    return <PromptStructure title={renderTitle(prompt)} onClose={undo}>
        <div className="ChooseFieldPrompt-fields">
            {fields.map(field => {
                const isDisabled = field.disabledReason !== undefined;
                const isSelected = selectedFields.indexOf(field.id) >= 0;

                return <div key={field.id}
                    className={cx({
                        "ChooseFieldPrompt-field": true,
                        "ChooseFieldPrompt-field--sold": field.sold,
                        "ChooseFieldPrompt-field--disabled": isDisabled,
                        "ChooseFieldPrompt-field--oneClick": prompt.kind === "oneClick",
                        "ChooseFieldPrompt-field--selectable": prompt.kind === "harvest",
                        "ChooseFieldPrompt-field--selected": isSelected,
                    })}
                    onClick={
                        isSelectingVines || isDisabled
                            ? undefined
                            : () => {
                                if (prompt.kind === "oneClick") {
                                    chooseFields([field.id]);
                                } else {
                                    setSelectedFields(
                                        isSelected
                                            ? selectedFields.filter(id => id !== field.id)
                                            : [...selectedFields, field.id]
                                    );
                                }
                            }
                    }
                >
                    <ul className="ChooseFieldPrompt-vines">
                        {field.vines.map(vineId => {
                            const { name, yields } = vineCards[vineId];
                            const isVineSelected = selectedVines.some(({ id }) => id === vineId);
                            return <li
                                key={vineId}
                                className={cx({
                                    "ChooseFieldPrompt-vine": true,
                                    "ChooseFieldPrompt-vine--choice": isSelectingVines,
                                    "ChooseFieldPrompt-vine--selected": isVineSelected
                                })}
                                onClick={
                                    isSelectingVines
                                        ? () => {
                                            setSelectedVines(
                                                isVineSelected
                                                    ? selectedVines.filter(({ id }) => id !== vineId)
                                                    : [...selectedVines, { id: vineId, field: field.id }]
                                            );
                                        }
                                        : undefined
                                }
                            >
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
            {
                prompt.kind !== "oneClick"
                    ? <ChoiceButton
                        className="ChooseFieldPrompt-confirm"
                        onClick={() => {
                            if (isSelectingVines) {
                                chooseVines(selectedVines);
                            } else {
                                chooseFields(selectedFields);
                            }
                        }}
                        disabled={
                            isSelectingVines
                                ? selectedVines.length !== prompt.numSelections || !!switchDisabledReason
                                : selectedFields.length === 0 || selectedFields.length > prompt.numSelections
                        }
                        disabledReason={switchDisabledReason}
                    >
                        {prompt.kind === "harvest"
                            ? "Harvest"
                            : prompt.kind === "switch"
                                ? "Switch"
                                : "Uproot"
                        }
                    </ChoiceButton>
                    : null
            }
        </div>
    </PromptStructure>;
};

const renderTitle = (prompt: ChooseFieldPromptState) => {
    switch (prompt.kind) {
        case "harvest":
            return prompt.numSelections === 1
                ? "Harvest a field"
                : `Harvest up to ${prompt.numSelections} fields`;
        case "oneClick":
            return "Choose a field";
        case "uproot":
            return prompt.numSelections === 1
                ? "Uproot a vine"
                : `Uproot ${prompt.numSelections} vines`;
        case "switch":
            return "Switch 2 vines on your fields";
    }
};

interface OwnProps {
    prompt: ChooseFieldPromptState;
    playerId: string;
    undoable: boolean;
}

const mapStateToProps = (state: AppState, { prompt, playerId }: OwnProps) => {
    const fields = state.game!.players[playerId].fields;
    return {
        fields: Object.keys(fields).sort().map(id => {
            const fieldId = id as FieldId;
            return { ...fields[fieldId], disabledReason: prompt.disabledReasons[fieldId] };
        }),
    };
};

const mapDispatchToProps = (dispatch: Dispatch, { playerId, undoable }: OwnProps) => {
    return {
        chooseFields: (fields: FieldId[]) => dispatch(chooseField(fields, playerId)),
        chooseVines: (vines: VineInField[]) => dispatch(chooseVine(vines, playerId)),
        undo: undoable ? () => dispatch(undo(playerId)) : undefined,
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChooseFieldPrompt);
