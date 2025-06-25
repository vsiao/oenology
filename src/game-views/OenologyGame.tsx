import "./OenologyGame.css";
import { AnimateSharedLayout } from "framer-motion";
import * as React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import GameBoard from "./GameBoard";
import PlayerMat from "./controls/PlayerMat";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { joinGame } from "../store/appActions";
import { AppState } from "../store/AppState";
import Lobby from "./lobby/Lobby";
import { WorkerPlacement } from "../game-data/GameState";
import { placePendingWorker } from "../game-data/gameActions";

interface Props {
    isPlaying: boolean;
    joinGame: (gameId: string, playerOverride: string | null) => void;
    canPlaceWorker: boolean;
    setPendingWorker: (placement?: [WorkerPlacement, number | null]) => void;
}

const OenologyGame: React.FunctionComponent<Props> = ({
    isPlaying,
    joinGame,
    canPlaceWorker,
    setPendingWorker,
 }) => {
    const { gameId } = useParams<{ gameId: string }>();
    const [searchParams] = useSearchParams();
    React.useEffect(() => { joinGame(gameId!, searchParams.get("p")); }, [joinGame, gameId, searchParams]);
    const lastPendingWorkerRequest = React.useRef<[WorkerPlacement, number | null]>();

    const onMouseOver = React.useCallback((event: React.MouseEvent) => {
        let target = event.target as HTMLElement | null;
        while (target && !target.classList.contains("OenologyGame")) {
            if (target.hasAttribute("data-placement-id")) {
                const [placement, idx] = target.getAttribute("data-placement-id")!.split(":");
                const request: [WorkerPlacement, number | null] =
                    [placement as WorkerPlacement, idx ? parseInt(idx, 10) : null];
                if (lastPendingWorkerRequest.current?.[0] === request[0] &&
                    lastPendingWorkerRequest.current?.[1] === request[1]) {
                    // To avoid UI excessive re-rending (and a stuttering animation),
                    // don't make the same request twice in a row.
                    return;
                }
                setPendingWorker(request);
                lastPendingWorkerRequest.current = request;
                return;
            }
            target = target.parentElement;
        }
        lastPendingWorkerRequest.current = undefined;
        setPendingWorker(undefined);
    }, [setPendingWorker]);

    return <div className="OenologyGame" onMouseOver={canPlaceWorker ? onMouseOver : undefined}>
        {isPlaying
            ? <AnimateSharedLayout><GameBoard /><PlayerMat /><Sidebar /></AnimateSharedLayout>
            : <Lobby gameId={gameId!} />}
    </div>;
};

const mapStateToProps = (state: AppState) => {
    return {
        isPlaying: !!state.game,
        canPlaceWorker: state.game?.actionPrompts[0]?.type === "placeWorker",
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        joinGame: (gameId: string, playerOverride: string | null) =>
            dispatch(joinGame(gameId, playerOverride)),
        setPendingWorker: (placement?: [WorkerPlacement, number | null]) =>
            dispatch(placePendingWorker(placement)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(OenologyGame);
