import * as React from "react";
import { PlayerState } from "../game-data/GameState";
import "./SidebarPlayer.css";

interface Props {
    player: PlayerState;
}

const SidebarPlayer: React.FunctionComponent<Props> = props => {
    return <div className="SidebarPlayer">
        <div className="SidebarPlayer-header">
            <span className="SidebarPlayer-playerName">{props.player.id}</span>
            <ul className="SidebarPlayer-cards">
                <li className="SidebarPlayer-card SidebarPlayer-card--vine"></li>
                <li className="SidebarPlayer-card SidebarPlayer-card--vine"></li>
                <li className="SidebarPlayer-card SidebarPlayer-card--summerVisitor"></li>
            </ul>
            <span className="SidebarPlayer-recurringRevenue">0</span>
            <span className="SidebarPlayer-coins">0</span>
            <span className="SidebarPlayer-victoryPoints">0</span>
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
            <li className="SidebarPlayer-field"></li>
            <li className="SidebarPlayer-field"></li>
            <li className="SidebarPlayer-field"></li>
        </ul>
        <div className="SidebarPlayer-grapesAndWine">
            <div className="SidebarPlayer-crushPad">
                <div className="SidebarPlayer-redGrapes">
                    {new Array(9).fill(0).map((_, i) =>
                        <div className="SidebarPlayer-grape" key={i}>{i+1}</div>
                    )}
                </div>
                <div className="SidebarPlayer-redGrapes">
                    {new Array(9).fill(0).map((_, i) =>
                        <div className="SidebarPlayer-grape" key={i}>{i+1}</div>
                    )}
                </div>
            </div>
            <div className="SidebarPlayer-cellar">
                <div className="SidebarPlayer-redWines">
                    {new Array(9).fill(0).map((_, i) =>
                        <div className="SidebarPlayer-wine" key={i}>{i+1}</div>
                    )}
                </div>
                <div className="SidebarPlayer-whiteWines">
                    {new Array(9).fill(0).map((_, i) =>
                        <div className="SidebarPlayer-wine" key={i}>{i+1}</div>
                    )}
                </div>
                <div className="SidebarPlayer-roseWines">
                    {new Array(6).fill(0).map((_, i) =>
                        <div className="SidebarPlayer-wine" key={i}>{i+4}</div>
                    )}
                </div>
                <div className="SidebarPlayer-sparklingWines">
                    {new Array(3).fill(0).map((_, i) =>
                        <div className="SidebarPlayer-wine" key={i}>{i+7}</div>
                    )}
                </div>
            </div>
        </div>
        <ul className="SidebarPlayer-workers">
            <li className="SidebarPlayer-worker">G</li>
            <li className="SidebarPlayer-worker"></li>
            <li className="SidebarPlayer-worker"></li>
            <li className="SidebarPlayer-worker"></li>
            <li className="SidebarPlayer-worker"></li>
            <li className="SidebarPlayer-worker"></li>
        </ul>
    </div>;
};

export default SidebarPlayer;

