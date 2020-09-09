import cx from "classnames";
import * as React from "react";
import { PlayerState, CardId, StructureState, FieldId, Field, TokenMap, WineColor, GrapeColor, BoardWorker } from "../game-data/GameState";
import VictoryPoints from "./icons/VictoryPoints";
import Residuals from "./icons/Residuals";
import Coins from "./icons/Coins";
import { Vine, SummerVisitor, Order, WinterVisitor } from "./icons/Card";
import Worker from "./icons/Worker";
import Grape from "./icons/Grape";
import GrapeToken from "./icons/GrapeToken";
import WineGlass from "./icons/WineGlass";
import { fieldYields } from "../game-data/shared/sharedSelectors";
import { visitorCards } from "../game-data/visitors/visitorCards";
import { StructureId, structures } from "../game-data/structures";
import { AnchorSide, useTooltip } from "./shared/useTooltip";
import { vineCards } from "../game-data/vineCards";
import Rooster from "./icons/Rooster";
import { AppState } from "../store/AppState";
import { connect } from "react-redux";
import StarToken from "./icons/StarToken";
import "./SidebarPlayer.css";

interface Props {
    player: PlayerState;
    inWakeUpOrder: boolean;
    hasGrape?: boolean;
    yokeWorker?: BoardWorker | null;
}

const SidebarPlayer: React.FunctionComponent<Props> = props => {
    const { player } = props;
    const playerStructures = player.structures;
    const hasMediumCellar = playerStructures["mediumCellar"];
    const hasLargeCellar = playerStructures["largeCellar"];
    const numUnplacedStars = player.influence.filter(i => !i.placement).length;

    return <div className={`SidebarPlayer SidebarPlayer--${player.color}`}>
        <div className="SidebarPlayer-header">
            {player.influence.length
                ? <div className="SidebarPlayer-influence">
                    <StarToken className="SidebarPlayer-influencePlaceholder" isPlaceholder={true} />
                    <ul className="SidebarPlayer-influenceTokens">
                        {player.influence.map(i =>
                            !i.placement &&
                                <li key={i.id} className="SidebarPlayer-influenceToken">
                                    <StarToken color={player.color} animateWithId={i.id} />
                                </li>
                        )}
                    </ul>
                    <span className="SidebarPlayer-unplacedInfluence">
                        {numUnplacedStars}
                    </span>
                </div>
                : null}
            <span className="SidebarPlayer-playerName">{player.name}</span>
            <ul className="SidebarPlayer-cards">
                {player.cardsInHand.map(card =>
                    <li key={card.id} className="SidebarPlayer-card">
                        {renderCard(card)}
                    </li>
                )}
            </ul>
            {props.hasGrape && <GrapeToken className="SidebarPlayer-grapeToken" animated={true} />}
            {props.inWakeUpOrder
                ? null
                : <Rooster className="SidebarPlayer-rooster" color={player.color} />}
            <Residuals className="SidebarPlayer-residualPayments">{player.residuals}</Residuals>
            <Coins className="SidebarPlayer-coins">{player.coins}</Coins>
            <VictoryPoints className="SidebarPlayer-victoryPoints">{player.victoryPoints}</VictoryPoints>
        </div>
        <div className="SidebarPlayer-contents">
            <ul className="SidebarPlayer-workers">
                {player.workers
                    // Force temp worker to be last in the list
                    .sort((w1, w2) => (w1.isTemp ? 1 : 0) - (w2.isTemp ? 1 : 0))
                    .map((worker, i) =>
                        <li key={worker.id} className="SidebarPlayer-worker">
                            <Worker
                                workerType={worker.type}
                                color={player.color}
                                isTemp={worker.isTemp}
                                disabled={true}
                            />
                            {worker.available &&
                                <Worker
                                    className="SidebarPlayer-animatedWorker"
                                    workerType={worker.type}
                                    color={player.color}
                                    isTemp={worker.isTemp}
                                    animateWithId={worker.id}
                                />}
                        </li>
                    )}
            </ul>
            <ul className="SidebarPlayer-fields">
                {Object.keys(player.fields).sort().map(fieldId => {
                    const field = player.fields[fieldId as FieldId];
                    const { red, white } = fieldYields(field);
                    return <FieldTooltip field={field} key={field.id}>
                        {anchorRef => <li
                            ref={anchorRef as React.RefObject<HTMLLIElement>}
                            className={cx({
                                "SidebarPlayer-field": true,
                                "SidebarPlayer-field--harvested": field.harvested,
                                "SidebarPlayer-field--sold": field.sold,
                            })}
                        >
                            {red > 0 ? <Grape color="red">{red}</Grape> : null}
                            {white > 0 ? <Grape color="white">{white}</Grape> : null}
                        </li>}
                    </FieldTooltip>;
                })}
            </ul>
            <div className="SidebarPlayer-grapesAndWine">
                <div className="SidebarPlayer-crushPad">
                    <CrushPadRow type="red" grapes={player.crushPad.red} />
                    <CrushPadRow type="white" grapes={player.crushPad.white} />
                </div>
                <div className="SidebarPlayer-cellar">
                    <CellarRow type="red" wines={player.cellar.red} />
                    <CellarRow type="white" wines={player.cellar.white} />
                    <CellarRow type="blush" wines={player.cellar.blush} />
                    <CellarRow type="sparkling" wines={player.cellar.sparkling} />
                    {hasMediumCellar
                        ? null
                        : <StructureTooltip id="mediumCellar" side="top">
                            {ref =>
                                <div
                                    ref={ref as React.RefObject<HTMLDivElement>}
                                    className="SidebarPlayer-mediumCellarOverlay"
                                />}
                        </StructureTooltip>}
                    {hasLargeCellar
                        ? null
                        : <StructureTooltip id="largeCellar" side="top">
                            {ref =>
                                <div
                                    ref={ref as React.RefObject<HTMLDivElement>}
                                    className="SidebarPlayer-largeCellarOverlay"
                                />}
                        </StructureTooltip>}
                </div>
            </div>
            <ul className="SidebarPlayer-structures">
                {Object.entries(structures).map(([structureId, structure]) => {
                    if (structureId === "mediumCellar" || structureId === "largeCellar") {
                        return null;
                    }
                    const isUsed = playerStructures[structureId as StructureId] === StructureState.Used;
                    return <StructureTooltip key={structureId} id={structureId as StructureId}>
                        {anchorRef =>
                            <li ref={anchorRef as React.RefObject<HTMLLIElement>}
                                className={cx("SidebarPlayer-structure", {
                                    "SidebarPlayer-structure--built": playerStructures[structureId as StructureId],
                                    "SidebarPlayer-structure--used": isUsed
                                })}
                            >
                                {structure.name}&nbsp;
                                {structureId === "yoke" && maybeRenderYokeWorker(props)}
                            </li>}
                    </StructureTooltip>;
                })}
            </ul>
        </div>
    </div>;
};

const maybeRenderYokeWorker = ({ player, yokeWorker }: Props) => {
    return yokeWorker && <Worker
        color={player.color}
        workerType={yokeWorker.type}
        animateWithId={yokeWorker.id}
        isTemp={yokeWorker.isTemp}
    />;
};

const FieldTooltip: React.FunctionComponent<{
    field: Field;
    children: (anchorRef: React.RefObject<HTMLElement>) => React.ReactNode;
}> = ({ field, children }) => {
    const tooltip = React.useMemo(() => {
        return <>
            Field value: {field.value}
            {field.vines.length === 0
                ? null
                : <>
                    <hr />
                    <ul>
                        {field.vines.map(id => {
                            const vine = vineCards[id];
                            const { red, white } = vine.yields;
                            return <li key={id}>
                                {vine.name}{" "}
                                {(red || 0) > 0 ? <Grape color="red">{red}</Grape> : null}
                                {(white || 0) > 0 ? <Grape color="white">{white}</Grape> : null}
                            </li>
                        })}
                    </ul>
                </>}
        </>;
    }, [field]);
    const [anchorRef, maybeTooltip] = useTooltip("right", tooltip);
    return <>
        {children(anchorRef)}
        {maybeTooltip}
    </>;
};

const CrushPadRow: React.FunctionComponent<{
    type: GrapeColor;
    grapes: TokenMap;
}> = ({ type, grapes }) => {
    const [anchorRef, maybeLayer] = useTooltip(
        "left",
        `${type === "red" ? "Red" : "White"} crush pad`
    );
    return <div
        ref={anchorRef as React.RefObject<HTMLDivElement>}
        className="SidebarPlayer-grapes"
    >
        {grapes.map((hasGrape, i) =>
            <div key={i} className="SidebarPlayer-grape">
                <Grape
                    className={cx({ "SidebarPlayer-grapeToken--placeholder": !hasGrape, })}
                    color={type}
                >{i + 1}</Grape>
                {hasGrape ? null : <span className="SidebarPlayer-grapePlaceholder">{i + 1}</span>}
            </div>
        )}
        {maybeLayer}
    </div>;
};

const CellarRow: React.FunctionComponent<{
    type: WineColor;
    wines: TokenMap;
}> = ({ type, wines }) => {
    const [anchorRef, maybeLayer] = useTooltip(
        "left",
        React.useMemo(() => {
            switch (type) {
                case "red":
                    return <>
                        Red wine<hr />
                        <Grape color="red" /> = <WineGlass color="red" />
                    </>;
                case "white":
                    return <>
                        White wine<hr />
                        <Grape color="white" /> = <WineGlass color="white" />
                    </>;
                case "blush":
                    return <>
                        Blush wine<br />
                        <em>requires Medium Cellar</em><hr />
                        <Grape color="red" /> + <Grape color="white" /> = <WineGlass color="blush" />
                    </>;
                case "sparkling":
                    return <>
                        Sparkling wine<br />
                        <em>requires Large Cellar</em><hr />
                        <Grape color="red" /> + <Grape color="red" /> + <Grape color="white" /> = <WineGlass color="sparkling" />
                    </>;
            }
        }, [type])
    );

    return <div
        ref={anchorRef as React.RefObject<HTMLDivElement>}
        className={cx("SidebarPlayer-wines", `SidebarPlayer-wines--${type}`)}
    >
        {wines.map((hasWine, i) => {
            if ((type === "blush" && i < 3) || (type === "sparkling" && i < 6)) {
                return null;
            }
            return <div className="SidebarPlayer-wine" key={i}>
                <WineGlass
                    className={cx({ "SidebarPlayer-wineToken--placeholder": !hasWine, })}
                    color={type}
                >{i + 1}</WineGlass>
                {hasWine ? null : <span className="SidebarPlayer-winePlaceholder">{i + 1}</span>}
            </div>;
        })}
        {maybeLayer}
    </div>;
};

const StructureTooltip: React.FunctionComponent<{
    id: StructureId;
    children: (anchorRef: React.RefObject<HTMLElement>) => React.ReactNode;
    side?: AnchorSide
}> = ({ id, children, side = "left" }) => {
    const structure = structures[id];
    const [anchorRef, maybeTooltip] = useTooltip(
        side,
        `${structure.description} Costs ${structure.cost}.`
    );

    return <>
        {children(anchorRef)}
        {maybeTooltip}
    </>;
};

const renderCard = (card: CardId): React.ReactNode => {
    switch (card.type) {
        case "vine":
            return <Vine />;
        case "order":
            return <Order />;
        case "visitor":
            switch (visitorCards[card.id].season) {
                case "summer":
                    return <SummerVisitor />;
                case "winter":
                    return <WinterVisitor />;
            }
    }
};

const mapStateToProps = (state: AppState, { playerId }: { playerId: string }) => {
    const game = state.game!;
    return {
        player: game.players[playerId],
        inWakeUpOrder: game.wakeUpOrder.some(pos => pos && pos.playerId === playerId),

        // In Tuscany, only display the grape token after the game has started.
        // During game set-up, `grapeIndex` indicates the starting player.
        hasGrape: (game.boardType === "base" || game.year >= 1) &&
            game.grapeIndex === game.tableOrder.indexOf(playerId),

        yokeWorker: game.workerPlacements.yokeHarvest.find(w => w && w.playerId === playerId) ||
            game.workerPlacements.yokeUproot.find(w => w && w.playerId === playerId),
    };
};

export default connect(mapStateToProps)(SidebarPlayer);

