import "./GameTopbar.css";
import cx from "classnames";
import React, { FunctionComponent, useState, RefObject } from "react";
import { connect } from "react-redux";
import { AppState } from "../store/AppState";
import { Dispatch } from "redux";
import { GameAction, undo, applyCheatCode } from "../game-data/gameActions";
import { isControllingPlayer } from "../game-data/shared/sharedSelectors";
import { useTooltip } from "./shared/useTooltip";
import UndoIcon from "./icons/UndoIcon";

interface Props {
    playerId: string | null;
    undoDisabledReason: string | undefined;
    undo: (playerId: string) => void;
    applyCheatCode: (playerId: string, code: string) => void;
}

const GameTopbar: FunctionComponent<Props> = props => {
    const [cheatInputValue, setCheatInputValue] = useState("");
    const [anchorRef, maybeTooltip] = useTooltip(
        "bottom",
        props.undoDisabledReason
    );

    return <>
        <button
            ref={anchorRef as RefObject<HTMLButtonElement>}
            className={cx({
                "GameTopbar-undoButton": true,
                "GameTopbar-undoButton--enabled": !props.undoDisabledReason,
                "GameTopbar-undoButton--disabled": !!props.undoDisabledReason,
            })}
            aria-disabled={!!props.undoDisabledReason}
            onClick={
                !props.undoDisabledReason ? () => props.undo(props.playerId!) : undefined
            }
        >
            <UndoIcon className="GameTopbar-undoIcon" /> Undo
        </button>
        {maybeTooltip}
        <input type="text"
            className="GameTopbar-cheatBox"
            value={cheatInputValue}
            onChange={e => setCheatInputValue(e.target.value)}
            onKeyDown={e => {
                if (e.key === "Enter") {
                    props.applyCheatCode(props.playerId!, cheatInputValue);
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
            : isControllingPlayer(game)
                ? undefined
                : "Only the current player can undo the last action.",
    };
};

const mapDispatchToProps = (dispatch: Dispatch<GameAction>) => {
    return {
        undo: (playerId: string) => dispatch(undo(playerId)),
        applyCheatCode: (playerId: string, code: string) => dispatch(applyCheatCode(code, playerId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(GameTopbar);
