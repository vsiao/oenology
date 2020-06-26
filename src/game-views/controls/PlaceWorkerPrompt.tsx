import "./PlaceWorkerPrompt.css";
import cx from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GameAction } from "../../game-data/gameActions";
import PromptStructure from "./PromptStructure";
import ChoiceButton from "./ChoiceButton";
import { WorkerType, Worker, PlayerColor, WorkerPlacementTurn, WorkerPlacement } from "../../game-data/GameState";
import { AppState } from "../../store/AppState";
import WorkerIcon from "../icons/Worker";
import { summerActions, winterActions } from "../../game-data/board/boardPlacements";
import { placeWorker } from "../../game-data/prompts/promptActions";

interface Props {
    color: PlayerColor;
    workers: Worker[];
    placements: {
        type: WorkerPlacement | null;
        label: React.ReactNode;
        disabledReason: string | undefined;
    }[];
    onPlaceWorker: (placement: WorkerPlacement | null, workerType: WorkerType) => void;
}

const PlaceWorkerPrompt: React.FunctionComponent<Props> = props => {
    const [selectedWorkerType, setWorkerType] = React.useState<WorkerType>(
        props.workers.filter(({ type }) => type === "normal").some(w => w.available)
            ? "normal"
            : "grande"
    );
    return <PromptStructure title="Place a worker">
        <div className="PlaceWorkerPrompt-body">
            <div className="PlaceWorkerPrompt-workerTypeSelector">
                {["grande" as const, "normal" as const].map(workerType =>
                    <button
                        key={workerType}
                        className={cx({
                            "PlaceWorkerPrompt-workerTypeButton": true,
                            "PlaceWorkerPrompt-workerTypeButton--selected":
                                workerType === selectedWorkerType,
                        })}
                        disabled={
                            props.workers
                                .filter(({ type }) => type === workerType)
                                .every(w => !w.available)
                        }
                        onClick={() => setWorkerType(workerType)}>
                        {props.workers.filter(({ type }) => type === workerType)
                            .map((w, i) =>
                                <WorkerIcon
                                    key={i}
                                    workerType={w.type}
                                    color={props.color}
                                    disabled={!w.available}
                                    isTemp={w.isTemp}
                                />
                            )}
                    </button>
                )}
            </div>
            <ul className="PlaceWorkerPrompt-choices">
                {props.placements.map((placement, i) => {
                    return <li className="PlaceWorkerPrompt-choice" key={i}>
                        <ChoiceButton
                            className="PlaceWorkerPrompt-choiceButton"
                            disabled={!!placement.disabledReason}
                            onClick={() => props.onPlaceWorker(placement.type, selectedWorkerType)}
                        >
                            {placement.label}
                        </ChoiceButton>
                    </li>;
                })}
            </ul>
        </div>
    </PromptStructure>;
};

const mapStateToProps = (state: AppState, ownProps: { playerId: string }) => {
    const numPlayers = Object.keys(state.game.players).length;
    const player = state.game.players[ownProps.playerId];

    return {
        color: player.color,
        workers: player.workers,
        placements: [
            ...((state.game.currentTurn as WorkerPlacementTurn).season === "summer"
                ? summerActions
                : winterActions)
                .map(action => ({
                    type: action.type,
                    label: numPlayers > 2 && state.game.workerPlacements[action.type].length === 0
                        ? action.bonusLabel
                        : action.title,
                    disabledReason: action.disabledReason && action.disabledReason(state.game),
                })),
            {
                type: null,
                label: "Pass",
                disabledReason: undefined,
            },
        ],
    };
};

const mapDispatchToProps = (dispatch: Dispatch<GameAction>, ownProps: { playerId: string }) => {
    return {
        onPlaceWorker: (placement: WorkerPlacement | null, workerType: WorkerType) =>
            dispatch(placeWorker(placement, workerType, ownProps.playerId))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaceWorkerPrompt);
