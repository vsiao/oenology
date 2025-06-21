import "./PlaceWorkerPrompt.css";
import cx from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GameAction, undo } from "../../game-data/gameActions";
import PromptStructure from "./PromptStructure";
import ChoiceButton from "./ChoiceButton";
import GameState, { WorkerType, WorkerPlacementTurn, WorkerPlacement, PlayerColor, PlayerWorker } from "../../game-data/GameState";
import Worker from "../icons/Worker";
import { yearRoundActions, boardActionsBySeason } from "../../game-data/board/boardPlacements";
import { placeWorker } from "../../game-data/prompts/promptActions";
import { AppState } from "../../store/AppState";

interface ActionChoice {
    type: WorkerPlacement | "messenger" | null;
    label: React.ReactNode;
    idx?: number;
    disabledReason?: string | undefined;
    hasSpace: boolean;
}

interface Props {
    color: PlayerColor;
    workers: PlayerWorker[];
    placements: ActionChoice[];
    onPlaceWorker: (
        placement: WorkerPlacement | "messenger" | null,
        workerType: WorkerType,
        idx: number | null
    ) => void;
    undo?: () => void;
}

const PlaceWorkerPrompt: React.FunctionComponent<Props> = ({
    color,
    workers,
    placements,
    onPlaceWorker,
    undo,
}) => {
    const workerTypes = ["grande", "special1", "special2", "normal"] as WorkerType[];
    const defaultWorkerType = workerTypes.findLast(workerType => workers.some(w => w.type === workerType && w.available))!;
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
                <span className="PlaceWorkerPrompt-workerTypeLabel">Choose worker type:</span>
                {workerTypes.map(workerType => {
                    const workersOfType = workers.filter(w => w.type === workerType);
                    if (workersOfType.length === 0) {
                        return null;
                    }
                    return <button
                        key={workerType}
                        className={cx({
                            "PlaceWorkerPrompt-workerTypeButton": true,
                            "PlaceWorkerPrompt-workerTypeButton--selected":
                                workerType === selectedWorkerType,
                        })}
                        disabled={workersOfType.every(w => !w.available)}
                        onClick={() => setWorkerType(workerType)}>
                        {workersOfType.map((w, i) =>
                            <Worker
                                key={i}
                                workerType={w.type}
                                color={color}
                                disabled={!w.available}
                                isTemp={w.isTemp}
                            />
                        )}
                    </button>;
                })}
            </div>
            <ul className="PlaceWorkerPrompt-choices">
                {placements.map(({ type, label, idx, disabledReason, hasSpace }, i) => {
                    const canOverrideSpaceConstraints = selectedWorkerType === "grande";
                    const requiresGrande = !hasSpace && !canOverrideSpaceConstraints;

                    return <li className="PlaceWorkerPrompt-choice" key={i}>
                        <ChoiceButton
                            className="PlaceWorkerPrompt-choiceButton"
                            disabledReason={disabledReason ??
                                (requiresGrande ? "No space. Use a grande worker?" : undefined) ??
                                (noAvailableWorkers ? "No available workers." : undefined)
                            }
                            onClick={() => onPlaceWorker(type, selectedWorkerType, idx ?? null)}
                        >
                            {label}
                        </ChoiceButton>
                        {!disabledReason && !hasSpace 
                            ? <Worker
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
        placements: actionsForCurrentTurn(game, player.color, player.workers),
    };
};

const actionsForCurrentTurn = (game: GameState, color: PlayerColor, workers: PlayerWorker[]): ActionChoice[] => {
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
                    hasSpace: choice.idx !== undefined,
                }))
            ).flat();
    }

    const actions: ActionChoice[] = [
        ...(boardActions[game.season] || [])
            .map(({ type, choices }) =>
                choices(game).map(choice => ({
                    ...choice,
                    type,
                    hasSpace: choice.idx !== undefined,
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
    ];
    const messengerWorkerType = game.specialWorkers?.Messenger;
    if (
        messengerWorkerType &&
        game.season !== "winter" && 
        workers.some(w => w.type === messengerWorkerType && w.available)
    ) {
        // If the Messenger is available, allow placing it in the future.
        actions.push(
            {
                type: "messenger",
                label: <>Place <Worker workerType={messengerWorkerType} color={color} /> in the future</>,
                hasSpace: true,
            },
        );
    }
    actions.push(
        {
            type: null,
            label: "Pass",
            disabledReason: undefined,
            hasSpace: true,
        },
    );
    return actions;
};

const mapDispatchToProps = (
    dispatch: Dispatch<GameAction>,
    { playerId, undoable }: { playerId: string; undoable: boolean }
) => {
    return {
        onPlaceWorker: (placement: WorkerPlacement | "messenger" | null, workerType: WorkerType, idx: number | null) =>
            dispatch(placeWorker(placement, workerType, playerId, idx)),
        undo: undoable ? () => dispatch(undo(playerId)) : undefined,
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaceWorkerPrompt);
