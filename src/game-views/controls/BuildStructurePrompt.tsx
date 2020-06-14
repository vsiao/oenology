import "./BuildStructurePrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GameAction } from "../../game-data/gameActions";
import { buildStructure } from "../../game-data/prompts/promptActions";
import { StructureId } from "../../game-data/GameState";
import { structures } from "../../game-data/structures";
import { AppState } from "../../store/AppState";
import Coins from "../icons/Coins";

interface Props {
    currentCoins: number,
    currentStructures: Record<StructureId, boolean>;
    onSelectStructure: (structureId: StructureId) => void;
}

const BuildStructurePrompt: React.FunctionComponent<Props> = props => {
    return <div className="BuildStructurePrompt">
        <div className="BuildStructurePrompt-header">
            Choose a structure
        </div>
        <ul className="BuildStructurePrompt-choices">
            {Object.entries(structures).map(([structureId, structure]) => {
                return <li className="BuildStructurePrompt-choice" key={structureId}>
                    <button
                        className="BuildStructurePrompt-choiceButton"
                        disabled={props.currentStructures[structureId as StructureId] || props.currentCoins < structure.cost}
                        onClick={() => props.onSelectStructure(structureId as StructureId)}
                    >
                        {structure.name}{' '}
                        <Coins>{structure.cost}</Coins>
                    </button>
                </li>;
            })}
        </ul>
    </div>;
};

const mapStateToProps = (state: AppState) => {
    return {
        currentCoins: state.game.players[state.game.currentTurn.playerId].coins,
        currentStructures: state.game.players[state.game.currentTurn.playerId].structures
    };
};

const mapDispatchToProps = (dispatch: Dispatch<GameAction>) => {
    return {
        onSelectStructure: (structureId: StructureId) => dispatch(buildStructure(structureId))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(BuildStructurePrompt);
