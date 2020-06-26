import "./OenologyGame.css";
import * as React from "react";
import { useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import GameBoard from "./GameBoard";
import PlayerMat from "./controls/PlayerMat";
import StatusBanner from "./StatusBanner";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { joinGame } from "../store/appActions";

interface Props {
    joinGame: (gameId: string) => void;
}

const OenologyGame: React.FunctionComponent<Props> = props => {
    const { joinGame } = props;
    const { gameId } = useParams();
    React.useEffect(() => { joinGame(gameId); }, [joinGame, gameId]);

    return <div className="OenologyGame">
        <Sidebar />
        <StatusBanner />
        <GameBoard />
        <PlayerMat />
    </div>;
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        joinGame: (gameId: string) => dispatch(joinGame(gameId)),
    };
};

export default connect(null, mapDispatchToProps)(OenologyGame);
