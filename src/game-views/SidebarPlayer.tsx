import "./SidebarPlayer.css";
import * as React from "react";
import { PlayerState, CardId } from "../game-data/GameState";
import VictoryPoints from "./icons/VictoryPoints";
import Residuals from "./icons/Residuals";
import Coins from "./icons/Coins";
import { Vine, SummerVisitor, Order, WinterVisitor } from "./icons/Card";
import Worker from "./icons/Worker";
import Grape from "./icons/Grape";
import WineGlass from "./icons/WineGlass";
import { vineCards, VineCardData } from "../game-data/vineCards";

interface Props {
    player: PlayerState;
}

const SidebarPlayer: React.FunctionComponent<Props> = props => {
    const { player } = props;
    return <div className={`SidebarPlayer SidebarPlayer--${player.color}`}>
        <div className="SidebarPlayer-header">
            <span className="SidebarPlayer-playerName">{player.id}</span>
            <ul className="SidebarPlayer-cards">
                {player.cardsInHand.map(card =>
                    <li key={card.id} className="SidebarPlayer-card">
                        {renderCard(card)}
                    </li>
                )}
            </ul>
            <Residuals className="SidebarPlayer-residualPayments">{player.residuals}</Residuals>
            <Coins className="SidebarPlayer-coins">{player.coins}</Coins>
            <VictoryPoints className="SidebarPlayer-victoryPoints">{player.victoryPoints}</VictoryPoints>
        </div>
        <ul className="SidebarPlayer-structures">
            <li className="SidebarPlayer-structure">Tr</li>
            <li className="SidebarPlayer-structure">Irr</li>
            <li className="SidebarPlayer-structure">Yo</li>
            <li className="SidebarPlayer-structure">Wi</li>
            <li className="SidebarPlayer-structure">Co</li>
            <li className="SidebarPlayer-structure">Ta</li>
        </ul>
        <ul className="SidebarPlayer-fields">
            {Object.values(player.fields).map(field => {
                const totalRed = field.vines.reduce(
                    (r, v) => r + (vineCards[v] as VineCardData).yields.red! || 0,
                    0
                );
                const totalWhite = field.vines.reduce(
                    (w, v) => w + (vineCards[v] as VineCardData).yields.white! || 0,
                    0
                );
                return <li key={field.id} className="SidebarPlayer-field">
                    {field.sold ? <span className="SidebarPlayer-fieldSold">SOLD</span> : <>
                        {totalRed > 0 ? <Grape color="red">{totalRed}</Grape> : null}
                        {totalWhite > 0 ? <Grape color="white">{totalWhite}</Grape> : null}
                    </>}
                </li>;
            })}
        </ul>
        <div className="SidebarPlayer-grapesAndWine">
            <div className="SidebarPlayer-crushPad">
                <div className="SidebarPlayer-redGrapes">
                    {new Array(9).fill(0).map((_, i) =>
                        <div className="SidebarPlayer-grape" key={i}>{i + 1}</div>
                    )}
                </div>
                <div className="SidebarPlayer-redGrapes">
                    {new Array(9).fill(0).map((_, i) =>
                        <div className="SidebarPlayer-grape" key={i}>{i + 1}</div>
                    )}
                </div>
            </div>
            <div className="SidebarPlayer-cellar">
                <div className="SidebarPlayer-wines">
                    {new Array(9).fill(0).map((_, i) =>
                        <div className="SidebarPlayer-wine" key={i}>
                            <WineGlass color="red">{i + 1}</WineGlass>
                        </div>
                    )}
                </div>
                <div className="SidebarPlayer-wines">
                    {new Array(9).fill(0).map((_, i) =>
                        <div className="SidebarPlayer-wine" key={i}>
                            <WineGlass color="white">{i + 1}</WineGlass>
                        </div>
                    )}
                </div>
                <div className="SidebarPlayer-wines">
                    {new Array(6).fill(0).map((_, i) =>
                        <div className="SidebarPlayer-wine" key={i}>
                            <WineGlass color="blush">{i + 4}</WineGlass>
                        </div>
                    )}
                </div>
                <div className="SidebarPlayer-wines">
                    {new Array(3).fill(0).map((_, i) =>
                        <div className="SidebarPlayer-wine" key={i}>
                            <WineGlass color="sparkling">{i + 7}</WineGlass>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <ul className="SidebarPlayer-workers">
            <li className="SidebarPlayer-worker"><Worker /></li>
            <li className="SidebarPlayer-worker"><Worker /></li>
            <li className="SidebarPlayer-worker"><Worker /></li>
            <li className="SidebarPlayer-worker"><Worker /></li>
            <li className="SidebarPlayer-worker"><Worker /></li>
            <li className="SidebarPlayer-worker"><Worker /></li>
        </ul>
    </div>;
};

const renderCard = ({ type }: CardId): React.ReactNode => {
    switch (type) {
        case "order":
            return <Order />;
        case "summerVisitor":
            return <SummerVisitor />;
        case "vine":
            return <Vine />;
        case "winterVisitor":
            return <WinterVisitor />;
    }
};

export default SidebarPlayer;

