import * as React from "react";
import { PlayerState } from "../game-data/GameState";
import "./SidebarPlayer.css";
import VictoryPoints from "./icons/VictoryPoints";
import Residuals from "./icons/Residuals";
import Coins from "./icons/Coins";
import { Vine, SummerVisitor } from "./icons/Card";
import Worker from "./icons/Worker";
import Grape from "./icons/Grape";

interface Props {
    player: PlayerState;
}

const SidebarPlayer: React.FunctionComponent<Props> = props => {
    return <div className={`SidebarPlayer SidebarPlayer--${props.player.color}`}>
        <div className="SidebarPlayer-header">
            <span className="SidebarPlayer-playerName">{props.player.id}</span>
            <ul className="SidebarPlayer-cards">
                <li className="SidebarPlayer-card">
                    <Vine />
                </li>
                <li className="SidebarPlayer-card">
                    <Vine />
                </li>
                <li className="SidebarPlayer-card">
                    <SummerVisitor />
                </li>
            </ul>
            <Residuals className="SidebarPlayer-residualPayments">0</Residuals>
            <Coins className="SidebarPlayer-coins">0</Coins>
            <VictoryPoints className="SidebarPlayer-victoryPoints">0</VictoryPoints>
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
            <li className="SidebarPlayer-field">
                <Grape>1</Grape>
            </li>
            <li className="SidebarPlayer-field"></li>
            <li className="SidebarPlayer-field"></li>
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
                <div className="SidebarPlayer-redWines">
                    {new Array(9).fill(0).map((_, i) =>
                        <div className="SidebarPlayer-wine" key={i}>{i + 1}</div>
                    )}
                </div>
                <div className="SidebarPlayer-whiteWines">
                    {new Array(9).fill(0).map((_, i) =>
                        <div className="SidebarPlayer-wine" key={i}>{i + 1}</div>
                    )}
                </div>
                <div className="SidebarPlayer-roseWines">
                    {new Array(6).fill(0).map((_, i) =>
                        <div className="SidebarPlayer-wine" key={i}>{i + 4}</div>
                    )}
                </div>
                <div className="SidebarPlayer-sparklingWines">
                    {new Array(3).fill(0).map((_, i) =>
                        <div className="SidebarPlayer-wine" key={i}>{i + 7}</div>
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

export default SidebarPlayer;

