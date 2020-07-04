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

interface Props {
    prompt: ChooseFieldPromptState;
    fields: (Field & { disabledReason: string | undefined; })[];
    chooseFields: (fields: FieldId[]) => void;
    chooseVines: (vines: VineInField[]) => void;
}

const ChooseFieldPrompt: React.FunctionComponent<Props> = ({
    prompt,
    fields,
    chooseFields,
    chooseVines,
}) => {
    const [selectedVines, setSelectedVines] = React.useState<VineInField[]>([]);
    const [selectedFields, setSelectedFields] = React.useState<FieldId[]>([]);

    return <PromptStructure title={renderTitle(prompt)}>
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
                        prompt.kind === "uproot"
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
                                    "ChooseFieldPrompt-vine--choice": prompt.kind === "uproot",
                                    "ChooseFieldPrompt-vine--selected": isVineSelected,
                                })}
                                onClick={
                                    prompt.kind === "uproot"
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
                            if (prompt.kind === "harvest") {
                                chooseFields(selectedFields);
                            } else {
                                chooseVines(selectedVines);
                            }
                        }}
                        disabled={
                            prompt.kind === "harvest"
                                ? selectedFields.length === 0 || selectedFields.length > prompt.numSelections
                                : selectedVines.length !== prompt.numSelections
                        }
                    >
                        {prompt.kind === "harvest"
                            ? "Harvest"
                            : "Uproot"}
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
    }
}

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
        chooseFields: (fields: FieldId[]) => dispatch(chooseField(fields, ownProps.playerId)),
        chooseVines: (vines: VineInField[]) => dispatch(chooseVine(vines, ownProps.playerId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChooseFieldPrompt);
