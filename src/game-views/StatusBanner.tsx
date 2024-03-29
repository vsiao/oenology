import "./StatusBanner.css";
import * as React from "react";
import { connect } from "react-redux";
import { AppState } from "../store/AppState";
import { CurrentTurn, WorkerPlacementTurnPendingAction, WorkerPlacementTurn, Season } from "../game-data/GameState";
import { SummerVisitor, WinterVisitor, Order, Vine } from "./icons/Card";
import { visitorCards } from "../game-data/visitors/visitorCards";
import { isGameOver } from "../game-data/shared/sharedSelectors";
import { Tooltip, useAnchoredLayer } from "./shared/useTooltip";
import VisitorCard from "./cards/VisitorCard";
import { orderCards } from "../game-data/orderCards";
import OrderCard from "./cards/OrderCard";
import VineCard from "./cards/VineCard";
import { vineCards } from "../game-data/vineCards";
import XIcon from "./icons/XIcon";
import StarToken from "./icons/StarToken";

interface Props {
    gameOver: boolean;
    season: Season;
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

            if (
                (pendingAction?.type === "plantVine" || pendingAction?.type === "playVisitor")
                    && pendingAction.vineId
            ) {
                const cardData = vineCards[pendingAction.vineId];
                const card = <VineCard className="StatusBanner-cardTip" cardData={cardData} />;
                mount(ref.current, "bottom", renderCardTip(card));
            } else if (
                (pendingAction?.type === "fillOrder" || pendingAction?.type === "playVisitor")
                    && pendingAction.orderId
            ) {
                const cardData = orderCards[pendingAction.orderId];
                const card = <OrderCard className="StatusBanner-cardTip" cardData={cardData} />;
                mount(ref.current, "bottom", renderCardTip(card));
            } else if (pendingAction?.type === "playVisitor" && pendingAction.visitorId) {
                const cardData = visitorCards[pendingAction.visitorId];
                const card = <VisitorCard className="StatusBanner-cardTip" cardData={cardData} />;
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

const renderStatus = ({ currentTurn, season, playerNames, playerId }: Props) => {
    const playerName = <strong>{playerNames[currentTurn.playerId]}</strong>;
    switch (currentTurn.type) {
        case "mamaPapa":
            return <span>{playerName} is choosing their inheritance.</span>;
        case "wakeUpOrder":
            return <span>{playerName} is choosing their wake-up position.</span>;
        case "fallVisitor":
            return <span>{playerName} is welcoming visitor(s).</span>;
        case "workerPlacement":
            if (currentTurn.pendingAction) {
                return renderPendingActionStatus(
                    season,
                    currentTurn,
                    playerNames
                );
            }
            const isCurrentPlayerTurn = currentTurn.playerId === playerId;
            return <span>
                It's {isCurrentPlayerTurn ? "your" : <>{playerName}'s</>} turn.
            </span>;
        case "endOfYearDiscard":
            return <span>{playerName} is discarding down to 7 cards.</span>;
    }
};

const renderPendingActionStatus = (
    season: Season,
    currentTurn: WorkerPlacementTurn,
    playerNames: Record<string, string>
): React.ReactElement => {
    const { playerId } = currentTurn;
    const pendingAction = currentTurn.pendingAction as WorkerPlacementTurnPendingAction;
    const playerName = <strong>{playerNames[playerId]}</strong>;

    switch (pendingAction.type) {
        case "buildOrGiveTour":
            return <span>{playerName} is building a structure or giving a tour.</span>;
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
        case "influence":
            return <span>{playerName} is placing or moving <StarToken />.</span>;
        case "makeWine":
            return <span>{playerName} is making some wine.</span>;
        case "plantVine":
            return <span>{playerName} is planting a <Vine />.</span>;
        case "playVisitor":
            // A pending Manager action implies that we're playing a visitor
            // in a prior season (ie. summer)
            const card = season === "summer" || currentTurn.managerPendingAction
                ? <SummerVisitor />
                : <WinterVisitor />;
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
                                pendingAction.actionPlayerId === playerId
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
        case "sellWine":
            return <span>{playerName} is selling some wine.</span>;
        case "trade":
            return <span>{playerName} is trading.</span>
        case "uproot":
            return <span>{playerName} is uprooting a <Vine />.</span>;
        case "passToNextSeason":
            return pendingAction.nextSeason === "endOfYear"
                ? <span>{playerName} is passing out of the year.</span>
                : <span>{playerName} is passing to the {pendingAction.nextSeason}.</span>;
    }
};

const mapStateToProps = (state: AppState) => {
    const game = state.game!;
    return {
        gameOver: isGameOver(game),
        season: game.season,
        currentTurn: game.currentTurn,
        playerNames: Object.fromEntries(
            Object.keys(game.players)
                .map(playerId => [playerId, game.players[playerId].name])
        ),
        playerId: game.playerId,
    };
};

export default connect(mapStateToProps)(StatusBanner);
