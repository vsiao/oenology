import "./PlaceWorkerPrompt.css";
import cx from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GameAction, undo } from "../../game-data/gameActions";
import PromptStructure from "./PromptStructure";
import ChoiceButton from "./ChoiceButton";
import GameState, { WorkerType, WorkerPlacementTurn, WorkerPlacement, PlayerColor, Worker } from "../../game-data/GameState";
import WorkerIcon from "../icons/Worker";
import { yearRoundActions, boardActionsBySeason } from "../../game-data/board/boardPlacements";
import { placeWorker } from "../../game-data/prompts/promptActions";
import { AppState } from "../../store/AppState";

interface ActionChoice {
    type: WorkerPlacement | null;
    label: React.ReactNode;
    idx?: number | undefined;
    disabledReason?: string | undefined;
    hasSpace: boolean;
}

interface Props {
    color: PlayerColor;
    workers: Worker[];
    placements: ActionChoice[];
    defaultWorkerType: WorkerType;
    onPlaceWorker: (
        placement: WorkerPlacement | null,
        workerType: WorkerType,
        idx: number | undefined
    ) => void;
    undo?: () => void;
}

const PlaceWorkerPrompt: React.FunctionComponent<Props> = ({
    color,
    workers,
    placements,
    defaultWorkerType,
    onPlaceWorker,
    undo,
}) => {
    const [selectedWorkerType, setWorkerType] = React.useState<WorkerType>(defaultWorkerType);
    const noAvailableWorkers = workers
        .filter(({ type }) => type === selectedWorkerType)
        .every(w => !w.available);

    React.useEffect(() => {
        if (noAvailableWorkers) {
            setWorkerType(defaultWorkerType);
        }
    }, [noAvailableWorkers, setWorkerType, defaultWorkerType]);

    return <PromptStructure title="Place a worker" onClose={undo}>
        <div className="PlaceWorkerPrompt-body">
            <div className="PlaceWorkerPrompt-workerTypeSelector">
                Choose worker type:
                {["grande" as const, "normal" as const].map(workerType =>
                    <button
                        key={workerType}
                        className={cx({
                            "PlaceWorkerPrompt-workerTypeButton": true,
                            "PlaceWorkerPrompt-workerTypeButton--selected":
                                workerType === selectedWorkerType,
                        })}
                        disabled={
                            workers
                                .filter(({ type }) => type === workerType)
                                .every(w => !w.available)
                        }
                        onClick={() => setWorkerType(workerType)}>
                        {workers.filter(({ type }) => type === workerType)
                            .map((w, i) =>
                                <WorkerIcon
                                    key={i}
                                    workerType={w.type}
                                    color={color}
                                    disabled={!w.available}
                                    isTemp={w.isTemp}
                                />
                            )}
                    </button>
                )}
            </div>
            <ul className="PlaceWorkerPrompt-choices">
                {placements.map(({ type, label, idx, disabledReason, hasSpace }, i) => {
                    const requiresGrande = !hasSpace && selectedWorkerType !== "grande";
                    return <li className="PlaceWorkerPrompt-choice" key={i}>
                        <ChoiceButton
                            className="PlaceWorkerPrompt-choiceButton"
                            disabledReason={disabledReason ||
                                (requiresGrande ? "No space. Use a grande worker?" : undefined) ||
                                (noAvailableWorkers ? "No available workers." : undefined)
                            }
                            onClick={() => onPlaceWorker(type, selectedWorkerType, idx)}
                        >
                            {label}
                        </ChoiceButton>
                        {!disabledReason && requiresGrande
                            ? <WorkerIcon
                                className="PlaceWorkerPrompt-choiceNeedsGrande"
                                workerType="grande"
                            />
                            : null}
                    </li>;
                })}
            </ul>
        </div>
    </PromptStructure>;
};

const mapStateToProps = (state: AppState, ownProps: { playerId: string; }) => {
    const game = state.game!;
    const player = game.players[ownProps.playerId];
    return {
        color: player.color,
        workers: player.workers,
        placements: actionsForCurrentTurn(game),
        defaultWorkerType:
            player.workers.filter(({ type }) => type === "normal").some(w => w.available)
                ? "normal" as const
                : "grande" as const,
    };
};

const actionsForCurrentTurn = (game: GameState): ActionChoice[] => {
    const currentTurn = game.currentTurn as WorkerPlacementTurn;
    const boardActions = boardActionsBySeason(game);
    if (
        currentTurn.pendingAction &&
        currentTurn.pendingAction.type === "playVisitor" &&
        currentTurn.pendingAction.visitorId === "planner"
    ) {
        // The Planner visitor allows the player to place a worker in any future season.
        return [...boardActions.fall, ...boardActions.winter]
            .map(({ type, choices }) =>
                choices(game).map(choice => ({
                    ...choice,
                    type,
                    // Allow placing even if they can't resolve the action now.
                    // We'll check this condition again once the season rolls around.
                    disabledReason: undefined,
                    hasSpace: choice.idx === undefined,
                }))
            ).flat();
    }

    return [
        ...(boardActions[currentTurn.season] || [])
            .map(({ type, choices }) =>
                choices(game).map(choice => ({
                    ...choice,
                    type,
                    hasSpace: choice.idx === undefined,
                }))
            ).flat(),
        ...yearRoundActions
            .map(({ type, choices }) =>
                choices(game).map(choice => ({
                    ...choice,
                    type,
                    hasSpace: true,
                }))
            ).flat(),
        {
            type: null,
            label: "Pass",
            disabledReason: undefined,
            hasSpace: true,
        },
    ];
};

const mapDispatchToProps = (
    dispatch: Dispatch<GameAction>,
    { playerId, undoable }: { playerId: string; undoable: boolean }
) => {
    return {
        onPlaceWorker: (placement: WorkerPlacement | null, workerType: WorkerType) =>
            dispatch(placeWorker(placement, workerType, playerId)),
        undo: undoable ? () => dispatch(undo(playerId)) : undefined,
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaceWorkerPrompt);
