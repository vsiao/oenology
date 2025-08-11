import cx from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import "./BoardPlacement.css";
import Worker from "./icons/Worker";
import { PlacedWorker, BoardType, WorkerPlacement, WorkerType } from "../game-data/GameState";
import { AppState } from "../store/AppState";
import { Order, Vine, SummerVisitor, WinterVisitor } from "./icons/Card";
import Coins from "./icons/Coins";
import VictoryPoints from "./icons/VictoryPoints";
import StarToken from "./icons/StarToken";
import { PlacementAction, PlacementBonus } from "../game-data/shared/placementAction";
import { numActionSpaces } from "../game-data/shared/sharedSelectors";
import { useTooltip } from "./shared/useTooltip";
import { Dispatch } from "redux";
import { GameAction, placeWorker } from "../game-data/gameActions";
import { seasonByBoardAction } from "../game-data/board/boardPlacements";
import { openSpaceOrDisabledReason } from "../game-data/shared/workerReducers";

const CANNOT_PLACE_WORKER = "Can't place a worker right now.";

interface ActionSpace {
    bonus: PlacementBonus | undefined;
    worker: PlacedWorker | null;
}

interface Props {
    boardType: BoardType;
    placement: WorkerPlacement;
    title: React.ReactNode;
    actionSpaces: ActionSpace[];
    overflow: PlacedWorker[];
    disabledReason?: string;
    selectedWorkerType: WorkerType;
    placeWorker: (workerType: WorkerType, space: number | null) => void;
}

const BoardPlacement: React.FunctionComponent<Props> = ({
    boardType,
    placement,
    title,
    actionSpaces,
    overflow,
    disabledReason,
    selectedWorkerType,
    placeWorker
}) => {
    const renderSpot = ({ worker, bonus }: ActionSpace, i: number) => {
        return <div
            className={cx({
                "BoardPlacement-spot": true,
                "BoardPlacement-spot--taken": worker && worker.source !== "pending",
            })}
            data-placement-id={disabledReason ? undefined : `${placement}:${i}`}
            onClick={disabledReason ? undefined : event => {
                event.preventDefault();
                placeWorker(selectedWorkerType, i);
            }}
        >
            {worker
                ? <Worker
                    key={`${worker.color}${worker.id}`}
                    {...worker}
                    animateWithId={worker.id}
                />
                : ((bonus && renderBonusIcon(bonus)) || <>&nbsp;</>)}
        </div>
    };
    const [anchorRef, maybeTooltip] = useTooltip(
        "top",
        disabledReason === CANNOT_PLACE_WORKER ? undefined : disabledReason
    );
    return (
        <tr
            className={cx({
                BoardPlacement: true,
                "BoardPlacement--interactive": !disabledReason,
            })}
        >
            {boardType !== "base"
                ? <td className={cx("BoardPlacement-cell--vertical", "BoardPlacement-cell")} colSpan={42}>
                    <div className="BoardPlacement-title">{title}</div>
                    <ul
                        ref={anchorRef as React.RefObject<HTMLUListElement>}
                        className={cx({
                            "BoardPlacement-spots": true,
                            "BoardPlacement-spots--disabled": !!disabledReason,
                        })}
                        data-placement-id={disabledReason ? undefined : placement}
                        onClick={disabledReason ? undefined : event => {
                            if (event.defaultPrevented) {
                                return;
                            }
                            placeWorker(selectedWorkerType, null);
                        }}
                    >
                        {actionSpaces.map((space, i) => {
                            return <li key={i}>
                                {renderSpot(space, i)}
                                {i === actionSpaces.length - 1 && renderOverflow(overflow)}
                            </li>;
                        })}
                    </ul>
                </td>
                : <>
                    {actionSpaces.map((space, i) => {
                        return <td key={i} className={cx("BoardPlacement-spotCell", "BoardPlacement-cell")}>
                            {renderSpot(space, i)}
                            {i === 0 && renderOverflow(overflow)}
                        </td>;
                    })}
                    <td className={cx("BoardPlacement-title", "BoardPlacement-cell")}>
                        {title}
                    </td>
                </>}
            {maybeTooltip}
        </tr>
    );
};

const renderOverflow = (overflowWorkers: PlacedWorker[]) => {
    return <div className="BoardPlacement-overflow">
        {overflowWorkers.map((w, i) =>
            w && <Worker key={`${w.color}${i}`} {...w} animateWithId={w.id} />
        )}
    </div>;
};

const renderBonusIcon = (bonus: PlacementBonus): React.ReactNode => {
    switch (bonus) {
        case "drawOrder":
            return <Order />;
        case "drawVine":
        case "plantVine":
            return <Vine />;
        case "gainCoin":
            return <Coins>1</Coins>;
        case "gainVP":
            return <VictoryPoints>1</VictoryPoints>;
        case "influence":
            return <StarToken />;
        case "playSummerVisitor":
            return <SummerVisitor />;
        case "playWinterVisitor":
            return <WinterVisitor />;
        case "plusOne":
            return "+1";
        default:
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const exhaustivenessCheck: never = bonus;
            return null;
    }
};

const mapStateToProps = (state: AppState, { placement }: { placement: PlacementAction; }) => {
    const game = state.game!;

    const season = seasonByBoardAction(game, placement.type);
    const allSeasons = ["spring", "summer", "fall", "winter"] as const;
    const isCurrentSeason = season === game.season;
    const isFutureSeason = allSeasons.indexOf(season) > allSeasons.indexOf(game.season);
    const isPastSeason = allSeasons.indexOf(season) < allSeasons.indexOf(game.season);

    const isAdministratorPlacement = game.currentTurn.type === "workerPlacement" &&
        game.currentTurn.pendingAction?.type === "playVisitor" &&
        game.currentTurn.pendingAction.visitorId === "administrator";
    const isPlannerPlacement = game.currentTurn.type === "workerPlacement" &&
        game.currentTurn.pendingAction?.type === "playVisitor" &&
        game.currentTurn.pendingAction.visitorId === "planner";
    const isTravelerPlacement = isPastSeason &&
        game.actionPrompts[0]?.type === "placeWorker" &&
        game.specialWorkers?.[game.selectedWorkerType] === "Traveler";
    const isPlaceable = game.actionPrompts[0]?.type === "placeWorker" && (
        isCurrentSeason ||
        (isFutureSeason && (
            isPlannerPlacement ||
            isAdministratorPlacement ||
            game.specialWorkers?.[game.selectedWorkerType] === "Messenger"
        )) ||
        isTravelerPlacement
    );

    const workers = game.workerPlacements[placement.type].slice();
    if (game.pendingWorker?.placement === placement.type) {
        workers[game.pendingWorker.space] = game.pendingWorker;
    }
    const placedSpaces = workers.slice(0, 3).findLastIndex(w => !!w) + 1;
    const numSpots = isTravelerPlacement ? 3 : Math.max(placedSpaces, numActionSpaces(game));
    const actionSpaces = new Array(numSpots).fill(null).map((_, i) => ({
        bonus: placement.spaceAt(i, game).bonus,
        worker: workers[i] ?? null,
    }));
    const spaceOrDisabledReason = openSpaceOrDisabledReason(
        game,
        game.selectedWorkerType,
        placement.type,
        null,
    );
    return {
        placement: placement.type,
        title: placement.label(game),
        actionSpaces,
        overflow: workers.slice(3).filter((w): w is PlacedWorker => !!w),
        selectedWorkerType: game.selectedWorkerType,
        disabledReason:
            (isPlaceable
                ? undefined
                : CANNOT_PLACE_WORKER) ??
            (typeof spaceOrDisabledReason === "string"
                ? spaceOrDisabledReason
                : undefined),
    };
};

const mapDispatchToProps = (
    dispatch: Dispatch<GameAction>,
    { playerId, placement }: { playerId: string | null; placement: PlacementAction; }
) => {
    return {
        placeWorker: (workerType: WorkerType, space: number | null) => {
            dispatch(placeWorker(workerType, placement.type, space, playerId!));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(BoardPlacement);
