import "./BuildStructurePrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GameAction } from "../../game-data/gameActions";
import { buildStructure } from "../../game-data/prompts/promptActions";
import { structures, StructureId, Coupon } from "../../game-data/structures";
import { AppState } from "../../store/AppState";
import Coins from "../icons/Coins";

interface Props {
    coupon?: Coupon,
    currentCoins: number,
    currentStructures: Record<StructureId, boolean>;
    onSelectStructure: (structureId: StructureId) => void;
}

const BuildStructurePrompt: React.FunctionComponent<Props> = props => {
    const { coupon, currentCoins, currentStructures, onSelectStructure } = props;
    const voucherFor = coupon?.kind === "voucher" ? coupon.upToCost : 0;
    const discount = coupon?.kind === "discount" ? coupon.amount : 0;

    return <div className="BuildStructurePrompt">
        <div className="BuildStructurePrompt-header">
            Choose a structure
        </div>
        <ul className="BuildStructurePrompt-choices">
            {Object.entries(structures).map(([structureId, structure]) => {
                if (voucherFor && structure.cost > voucherFor) {
                    return null;
                }
                const hasBuilt = currentStructures[structureId as StructureId];
                const cost = voucherFor ? 0 : structure.cost - discount;
                const canAfford = !cost || cost <= currentCoins;
                return <li className="BuildStructurePrompt-choice" key={structureId}>
                    <button
                        className="BuildStructurePrompt-choiceButton"
                        disabled={hasBuilt || !canAfford}
                        onClick={() => onSelectStructure(structureId as StructureId)}
                    >
                        {structure.name}{' '}
                        <Coins>{structure.cost}</Coins>
                    </button>
                </li>;
            })}
        </ul>
    </div>;
};

const mapStateToProps = (state: AppState, ownProps: { playerId: string }) => {
    return {
        currentCoins: state.game.players[ownProps.playerId].coins,
        currentStructures: state.game.players[ownProps.playerId].structures
    };
};

const mapDispatchToProps = (dispatch: Dispatch<GameAction>, ownProps: { playerId: string }) => {
    return {
        onSelectStructure: (structureId: StructureId) =>
            dispatch(buildStructure(structureId, ownProps.playerId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(BuildStructurePrompt);
