import "./OenologyGame.css";
import { AnimateSharedLayout } from "framer-motion";
import * as React from "react";
import { useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import GameBoard from "./GameBoard";
import PlayerMat from "./controls/PlayerMat";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { joinGame } from "../store/appActions";
import { AppState } from "../store/AppState";
import Lobby from "./lobby/Lobby";

interface Props {
    isPlaying: boolean;
    joinGame: (gameId: string) => void;
}

const OenologyGame: React.FunctionComponent<Props> = props => {
    const { isPlaying, joinGame } = props;
    const { gameId } = useParams<{ gameId: string }>();
    React.useEffect(() => { joinGame(gameId); }, [joinGame, gameId]);

    return <div className="OenologyGame">
        {isPlaying
            ? <AnimateSharedLayout><GameBoard /><PlayerMat /><Sidebar /></AnimateSharedLayout>
            : <Lobby gameId={gameId} />}
    </div>;
};

const mapStateToProps = (state: AppState) => {
    return { isPlaying: !!state.game };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        joinGame: (gameId: string) => dispatch(joinGame(gameId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(OenologyGame);
