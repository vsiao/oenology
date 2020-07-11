import "./BuildStructurePrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GameAction, undo } from "../../game-data/gameActions";
import { buildStructure } from "../../game-data/prompts/promptActions";
import { structures, StructureId, Coupon } from "../../game-data/structures";
import { AppState } from "../../store/AppState";
import Coins from "../icons/Coins";
import PromptStructure from "./PromptStructure";
import ChoiceButton from "./ChoiceButton";
import { structureDisabledReason } from "../../game-data/shared/sharedSelectors";

interface Props {
    structureOptions: {
        id: StructureId;
        label: React.ReactNode;
        disabledReason: string | undefined;
    }[];
    onSelectStructure: (structureId: StructureId) => void;
    undo?: () => void;
}

const BuildStructurePrompt: React.FunctionComponent<Props> = props => {
    const { structureOptions, onSelectStructure } = props;

    return <PromptStructure
        title="Build a structure"
        onClose={props.undo}
    >
        <ul className="BuildStructurePrompt-choices">
            {structureOptions.map(({ id, label, disabledReason }) => {
                return <li className="BuildStructurePrompt-choice" key={id}>
                    <ChoiceButton
                        className="BuildStructurePrompt-choiceButton"
                        disabledReason={disabledReason}
                        onClick={() => onSelectStructure(id)}
                    >
                        {label}
                    </ChoiceButton>
                </li>;
            })}
        </ul>
    </PromptStructure>;
};

interface OwnProps {
    coupon?: Coupon;
    playerId: string;
    undoable: boolean;
}

const mapStateToProps = (state: AppState, ownProps: OwnProps) => {
    const coupon = ownProps.coupon || { kind: "discount" , amount: 0 };
    return {
        structureOptions: Object.entries(structures)
            .filter(([id, structure]) => coupon.kind !== "voucher" || structure.cost <= coupon.upToCost)
            .map(([id, structure]) => ({
                id: id as StructureId,
                label: <>{structure.name} <Coins>{structure.cost}</Coins></>,
                disabledReason: structureDisabledReason(
                    state.game!,
                    id as StructureId,
                    coupon,
                    ownProps.playerId
                ),
            })),
    };
};

const mapDispatchToProps = (dispatch: Dispatch<GameAction>, { playerId, undoable }: OwnProps) => {
    return {
        onSelectStructure: (structureId: StructureId) =>
            dispatch(buildStructure(structureId, playerId)),
        undo: undoable ? () => dispatch(undo(playerId)) : undefined,
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(BuildStructurePrompt);
