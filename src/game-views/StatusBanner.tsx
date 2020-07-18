import "./StatusBanner.css";
import * as React from "react";
import { connect } from "react-redux";
import { AppState } from "../store/AppState";
import { CurrentTurn, WorkerPlacementTurnPendingAction } from "../game-data/GameState";
import { SummerVisitor, WinterVisitor, Order, Vine } from "./icons/Card";
import { visitorCards } from "../game-data/visitors/visitorCards";
import { gameIsOver } from "../game-data/shared/sharedSelectors";
import { Tooltip, useAnchoredLayer } from "./shared/useTooltip";
import VisitorCard from "./cards/VisitorCard";
import { orderCards } from "../game-data/orderCards";
import OrderCard from "./cards/OrderCard";
import VineCard from "./cards/VineCard";
import { vineCards } from "../game-data/vineCards";
import XIcon from "./icons/XIcon";

interface Props {
    gameOver: boolean;
    currentTurn: CurrentTurn;
    playerNames: Record<string, string>;
    playerId: string | null;
}

const StatusBanner: React.FunctionComponent<Props> = props => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [maybeLayer, mount, maybeUnmount] = useAnchoredLayer();
    React.useEffect(() => {
        if (ref.current && props.currentTurn.type === "workerPlacement" && props.currentTurn.pendingAction) {
            const { pendingAction } = props.currentTurn;
            const renderCardTip = (card: React.ReactNode) => {
                return <Tooltip className="StatusBanner-tooltip">
                    {card}
                    <button className="StatusBanner-hideTipButton" onClick={maybeUnmount}>
                        <XIcon />
                    </button>
                </Tooltip>;
            };

            if (pendingAction?.type === "plantVine" && pendingAction.vineId) {
                const cardData = vineCards[pendingAction.vineId];
                const card = <VineCard className="StatusBanner-cardTip" cardData={cardData} />;
                mount(ref.current, "bottom", renderCardTip(card));
            } else if (pendingAction?.type === "playVisitor" && pendingAction.visitorId) {
                const cardData = visitorCards[pendingAction.visitorId];
                const card = <VisitorCard className="StatusBanner-cardTip" cardData={cardData} />;
                mount(ref.current, "bottom", renderCardTip(card));
            } else if (pendingAction?.type === "fillOrder" && pendingAction.orderId) {
                const cardData = orderCards[pendingAction.orderId];
                const card = <OrderCard className="StatusBanner-cardTip" cardData={cardData} />;
                mount(ref.current, "bottom", renderCardTip(card));
            }
        }
        return () => maybeUnmount();
    }, [props.currentTurn, mount, maybeUnmount]);

    return <>
        <div ref={ref} className="StatusBanner">
            {props.gameOver ? "Game over! Thanks for playing!" : renderStatus(props)}
        </div>
        {maybeLayer}
    </>;
};

const renderStatus = ({ currentTurn, playerNames, playerId }: Props) => {
    const playerName = <strong>{playerNames[currentTurn.playerId]}</strong>;
    switch (currentTurn.type) {
        case "mamaPapa":
            return <span>{playerName} is choosing their mama and papa.</span>;
        case "wakeUpOrder":
            return <span>{playerName} is choosing their wake-up position.</span>;
        case "fallVisitor":
            return <span>{playerName} is welcoming visitor(s).</span>;
        case "workerPlacement":
            if (currentTurn.pendingAction) {
                return renderPendingActionStatus(
                    currentTurn.pendingAction,
                    currentTurn.playerId,
                    currentTurn.season,
                    playerNames
                );
            }
            const isCurrentPlayerTurn = currentTurn.playerId === playerId;
            return <span>
                It's {isCurrentPlayerTurn ? "your" : <>{playerName}'s</>} turn.
            </span>;
        case "endOfYearDiscard":
            return <span>{playerName} is discarding cards.</span>;
    }
};

const renderPendingActionStatus = (
    pendingAction: WorkerPlacementTurnPendingAction,
    currentTurnPlayerId: string,
    season: "summer" | "winter",
    playerNames: Record<string, string>
): React.ReactElement => {
    const playerName = <strong>{playerNames[currentTurnPlayerId]}</strong>;
    switch (pendingAction.type) {
        case "buildStructure":
            return <span>{playerName} is building a structure.</span>;
        case "buyField":
            return <span>{playerName} is buying a field.</span>;
        case "buySell":
            return <span>{playerName} is selling grape(s) or buying/selling a field.</span>;
        case "fillOrder":
            return <span>{playerName} is filling an <Order />.</span>;
        case "harvestField":
            return <span>{playerName} is harvesting a field.</span>;
        case "makeWine":
            return <span>{playerName} is making some wine.</span>;
        case "plantVine":
            return <span>{playerName} is planting a <Vine />.</span>;
        case "playVisitor":
            const card = season === "summer" ? <SummerVisitor /> : <WinterVisitor />;
            if (!pendingAction.visitorId) {
                return <span>{playerName} is playing a {card}.</span>;
            }
            const { name } = visitorCards[pendingAction.visitorId];
            return <span>
                {playerName} played the <strong>{name}</strong> {card}. {
                    !pendingAction.actionPlayerId
                        ? null
                        : <>
                            It's {
                                pendingAction.actionPlayerId === currentTurnPlayerId
                                    ? "their"
                                    : <><strong>{playerNames[pendingAction.actionPlayerId]}</strong>'s</>
                            } turn to choose.
                        </>
                }
            </span>;
        case "sellField":
            return <span>{playerName} is selling a field.</span>;
        case "sellGrapes":
            return <span>{playerName} is selling grape(s).</span>;
        case "uproot":
            return <span>{playerName} is uprooting a <Vine />.</span>;
    }
};

const mapStateToProps = (state: AppState) => {
    const game = state.game!;
    return {
        gameOver: gameIsOver(game),
        currentTurn: game.currentTurn,
        playerNames: Object.fromEntries(
            Object.keys(game.players)
                .map(playerId => [playerId, game.players[playerId].name])
        ),
        playerId: game.playerId,
    };
};

export default connect(mapStateToProps)(StatusBanner);
