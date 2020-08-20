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
import { summerActions, winterActions, yearRoundActions, seasonalActions } from "../../game-data/board/boardPlacements";
import { placeWorker } from "../../game-data/prompts/promptActions";
import { AppState } from "../../store/AppState";
import { workerPlacementSeasons, needsGrandeDisabledReason } from "../../game-data/shared/sharedSelectors";

interface ActionChoice {
    type: WorkerPlacement | null;
    label: React.ReactNode;
    disabledReason: string | undefined;
    hasSpace: boolean;
}

interface Props {
    color: PlayerColor;
    workers: Worker[];
    placements: ActionChoice[];
    defaultWorkerType: WorkerType;
    onPlaceWorker: (placement: WorkerPlacement | null, workerType: WorkerType) => void;
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
                {placements.map((placement, i) => {
                    const requiresGrande = !placement.hasSpace && selectedWorkerType !== "grande";
                    return <li className="PlaceWorkerPrompt-choice" key={i}>
                        <ChoiceButton
                            className="PlaceWorkerPrompt-choiceButton"
                            disabledReason={placement.disabledReason ||
                                (requiresGrande ? "No space. Use a grande worker?" : undefined) ||
                                (noAvailableWorkers ? "No available workers." : undefined)
                            }
                            onClick={() => onPlaceWorker(placement.type, selectedWorkerType)}
                        >
                            {placement.label}
                        </ChoiceButton>
                        {!placement.disabledReason && requiresGrande
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
    if (
        currentTurn.pendingAction &&
        currentTurn.pendingAction.type === "playVisitor" &&
        currentTurn.pendingAction.visitorId === "planner"
    ) {
        const seasons = workerPlacementSeasons(game);
        const futureSeasons = seasons.slice(seasons.indexOf("summer") + 1);
        // The Planner visitor allows the player to place a worker in any future season.
        return seasonalActions
            .filter(a => futureSeasons.some(s => s === a.season))
            .map(({ type, label }) => ({
                type,
                label: label(game),
                disabledReason: undefined,
                hasSpace: !needsGrandeDisabledReason(game, type),
            }));
    }

    return [
        ...(currentTurn.season === "summer" ? summerActions : winterActions)
            .map(({ type, label, disabledReason, }) => ({
                type,
                label: label(game),
                disabledReason: disabledReason(game),
                hasSpace: !needsGrandeDisabledReason(game, type),
            })),
        ...yearRoundActions.map(({ type, label, disabledReason, }) => ({
            type,
            label: label(game),
            disabledReason: disabledReason(game),
            hasSpace: true,
        })),
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
