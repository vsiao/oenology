import "./GameTopbar.css";
import cx from "classnames";
import React, { FC, useState, RefObject, useMemo } from "react";
import { connect } from "react-redux";
import { AppState } from "../store/AppState";
import { Dispatch } from "redux";
import { GameAction, undo, applyCheatCode } from "../game-data/gameActions";
import { isControllingPlayer, wasLastActionByPlayer } from "../game-data/shared/sharedSelectors";
import { useTooltip } from "./shared/useTooltip";
import UndoIcon from "./icons/UndoIcon";
import Worker from "./icons/Worker";
import { SpecialWorkerId } from "../game-data/specialWorkers";
import SpecialWorkerCard from "./cards/SpecialWorkerCard";

interface Props {
    playerId: string | null;
    undoDisabledReason: string | undefined;
    undo: (playerId: string) => void;
    applyCheatCode: (playerId: string, code: string) => void;
    specialWorker1: SpecialWorkerId | undefined;
    specialWorker2: SpecialWorkerId | undefined;
}

const GameTopbar: FC<Props> = ({
    playerId,
    undoDisabledReason,
    undo,
    applyCheatCode,
    specialWorker1,
    specialWorker2,
}) => {
    const [cheatInputValue, setCheatInputValue] = useState("");
    const [undoAnchorRef, maybeUndoTooltip] = useTooltip("bottom", undoDisabledReason);

    return <>
        <button
            ref={undoAnchorRef as RefObject<HTMLButtonElement>}
            className={cx({
                "GameTopbar-undoButton": true,
                "GameTopbar-undoButton--enabled": !undoDisabledReason,
                "GameTopbar-undoButton--disabled": !!undoDisabledReason,
            })}
            aria-disabled={!!undoDisabledReason}
            onClick={!undoDisabledReason ? () => undo(playerId!) : undefined}
        >
            <UndoIcon className="GameTopbar-undoIcon" /> Undo
        </button>
        {maybeUndoTooltip}

        {specialWorker1 && <SpecialWorkerInfo workerType="special1" id={specialWorker1} />}
        {specialWorker2 && <SpecialWorkerInfo workerType="special2" id={specialWorker2} />}

        <input type="text"
            className="GameTopbar-cheatBox"
            value={cheatInputValue}
            onChange={e => setCheatInputValue(e.target.value)}
            onKeyDown={e => {
                if (e.key === "Enter") {
                    applyCheatCode(playerId!, cheatInputValue);
                    setCheatInputValue("");
                }
            }}
        />
    </>;
};

const mapStateToProps = (state: AppState) => {
    const game = state.game!
    return {
        playerId: game.playerId,
        undoDisabledReason: !game.undoState
            ? "Nothing to undo"
            : wasLastActionByPlayer(game, game.playerId) || isControllingPlayer(game)
                ? undefined
                : "Only the current player can undo the last action.",
        specialWorker1: game.specialWorkers?.special1,
        specialWorker2: game.specialWorkers?.special2,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<GameAction>) => {
    return {
        undo: (playerId: string) => dispatch(undo(playerId)),
        applyCheatCode: (playerId: string, code: string) => dispatch(applyCheatCode(code, playerId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(GameTopbar);

const SpecialWorkerInfo: FC<{
    workerType: "special1" | "special2";
    id: SpecialWorkerId
}> = ({ workerType, id }) => {
    const tooltip = useMemo(() => <SpecialWorkerCard id={id} />, [id]);
    const [anchorRef, maybeTooltip] = useTooltip("bottom", tooltip);
    return <>
        <Worker
            className="GameTopbar-specialWorkerInfo"
            ref={anchorRef as RefObject<HTMLSpanElement>}
            workerType={workerType}
        />
        {maybeTooltip}
    </>;
};
