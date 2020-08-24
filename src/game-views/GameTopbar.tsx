import "./GameTopbar.css";
import cx from "classnames";
import React, { FunctionComponent, useState, RefObject } from "react";
import { connect } from "react-redux";
import { AppState } from "../store/AppState";
import { Dispatch } from "redux";
import { GameAction, undo, CHEAT_drawCard, CHEAT_gainGrape } from "../game-data/gameActions";
import { isControllingPlayer } from "../game-data/shared/sharedSelectors";
import { useTooltip } from "./shared/useTooltip";
import UndoIcon from "./icons/UndoIcon";
import { GrapeSpec } from "../game-data/prompts/promptActions";
import { GrapeColor } from "../game-data/GameState";

interface Props {
    playerId: string | null;
    undoDisabledReason: string | undefined;
    undo: (playerId: string) => void;
    drawCard: (playerId: string, id: string) => void;
    gainGrape: (playerId: string, grape: GrapeSpec) => void;
}

const GameTopbar: FunctionComponent<Props> = props => {
    const [cheatInputValue, setCheatInputValue] = useState("");
    const [anchorRef, maybeTooltip] = useTooltip(
        "bottom",
        props.undoDisabledReason ?? "Undo last action"
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
            <UndoIcon className="GameTopbar-undoIcon" />
        </button>
        {maybeTooltip}
        <input type="text"
            className="GameTopbar-cheatBox"
            value={cheatInputValue}
            onChange={e => setCheatInputValue(e.target.value)}
            onKeyDown={e => {
                if (e.key === "Enter") {
                    const [cmd, ...parts] = cheatInputValue.split(":");
                    switch (cmd) {
                        case "d":
                            props.drawCard(props.playerId!, parts[0]);
                            break;
                        case "g":
                            props.gainGrape(props.playerId!, {
                                color: parts[0] as GrapeColor,
                                value: parseInt(parts[1], 10),
                            });
                            break;
                    }
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
            : game.undoState.type === "drawnCard"
                ? "Can't undo a card draw"
                : isControllingPlayer(game)
                    ? undefined
                    : "Only the current player can undo",
    };
};

const mapDispatchToProps = (dispatch: Dispatch<GameAction>) => {
    return {
        undo: (playerId: string) => dispatch(undo(playerId)),
        drawCard: (playerId: string, id: string) => dispatch(CHEAT_drawCard(id, playerId)),
        gainGrape: (playerId: string, grape: GrapeSpec) => dispatch(CHEAT_gainGrape(grape, playerId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(GameTopbar);
