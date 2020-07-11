import "./ChooseActionPrompt.css";
import cx from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GameAction, undo } from "../../game-data/gameActions";
import { ChooseActionPromptState, Choice } from "../../game-data/prompts/PromptState";
import { chooseAction, chooseActionMulti } from "../../game-data/prompts/promptActions";
import PromptStructure from "./PromptStructure";
import ChoiceButton from "./ChoiceButton";

interface Props {
    prompt: ChooseActionPromptState;
    onSelectChoice: (choice: Choice, playerId: string) => void;
    onSelectMulti: (choices: string[], playerId: string) => void;
    undo?: (playerId: string) => void;
}

const ChooseActionPrompt: React.FunctionComponent<Props> = props => {
    const { prompt } = props;
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

    return <PromptStructure
        title={prompt.title}
        onClose={() => props.undo && props.undo(prompt.playerId)}
    >
        {prompt.description
            ? <div className="ChooseActionPrompt-description">
                {prompt.description}
            </div>
            :  null}
        <div className="ChooseActionPrompt-body">
            <ul className="ChooseActionPrompt-choices">
                {prompt.choices.map((choice, i) => {
                    const isSelected = selectedIds.some(id => id === choice.id);
                    const handleToggle = () =>
                        setSelectedIds(
                            isSelected
                                ? selectedIds.filter(id => id !== choice.id)
                                : [...selectedIds, choice.id]
                        );

                    return <li className="ChooseActionPrompt-choice" key={i}>
                        <ChoiceButton
                            className={cx({
                                "ChooseActionPrompt-choiceButton": true,
                                "ChooseActionPrompt-choiceButton--selected": isSelected,
                            })}
                            disabledReason={choice.disabledReason}
                            onClick={prompt.upToN ? handleToggle : () => props.onSelectChoice(choice, prompt.playerId)}
                        >
                            {choice.label}
                        </ChoiceButton>
                    </li>;
                })}
                {prompt.upToN
                    ? <ChoiceButton
                        className="ChooseActionPrompt-choiceButton"
                        disabled={selectedIds.length === 0 || selectedIds.length > prompt.upToN}
                        onClick={() => props.onSelectMulti(selectedIds, prompt.playerId)}
                    >OK</ChoiceButton>
                    : null}
            </ul>
        </div>
    </PromptStructure>;
};

const mapDispatchToProps = (dispatch: Dispatch<GameAction>, { undoable }: { undoable: boolean }) => {
    return {
        onSelectChoice: (choice: Choice, playerId: string) =>
            dispatch(chooseAction(choice, playerId)),
        onSelectMulti: (choices: string[], playerId: string) =>
            dispatch(chooseActionMulti(choices, playerId)),
        undo: undoable ? (playerId: string) => dispatch(undo(playerId)) : undefined,
    };
}

export default connect(null, mapDispatchToProps)(ChooseActionPrompt);