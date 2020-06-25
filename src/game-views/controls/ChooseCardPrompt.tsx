import "./ChooseCardPrompt.css";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GameAction } from "../../game-data/gameActions";
import { ChooseCardPromptState } from "../../game-data/prompts/PromptState";
import { chooseCards } from "../../game-data/prompts/promptActions";
import { CardId } from "../../game-data/GameState";
import { vineCards } from "../../game-data/vineCards";
import { orderCards } from "../../game-data/orderCards";
import VineCard from "../cards/VineCard";
import OrderCard from "../cards/OrderCard";
import { visitorCards } from "../../game-data/visitors/visitorCards";
import VisitorCard from "../cards/VisitorCard";
import PromptStructure from "./PromptStructure";
import ChoiceButton from "./ChoiceButton";
import { AppState } from "../../store/AppState";
import { StructureId } from "../../game-data/structures";

interface Props {
    prompt: ChooseCardPromptState;
    onSelectCards: (cards: CardId[]) => void;
    structures: Record<StructureId, boolean>;
}

const ChooseCardPrompt: React.FunctionComponent<Props> = props => {
    const { prompt } = props;
    return <PromptStructure title={prompt.title}>
        <ul className="ChooseCardPrompt-cards">
            {prompt.cards.map((card, i) => {
                const disabled = isDisabled(card, props);
                return <li className="ChooseCardPrompt-card" key={card.id}>
                    <button
                        className="ChooseCardPrompt-cardButton"
                        disabled={disabled}
                        onClick={disabled ? undefined : () => props.onSelectCards([card])}
                    >
                        {renderCard(card, props)}
                    </button>
                </li>;
            })}
            {prompt.optional
                ? <ChoiceButton
                    className="ChooseCardPrompt-pass"
                    onClick={() => props.onSelectCards([])}
                >
                    Pass
                  </ChoiceButton>
                : null}
        </ul>
    </PromptStructure>;
};

const renderCard = (card: CardId, props: Props) => {
    switch (card.type) {
        case "vine":
            return <VineCard cardData={vineCards[card.id]} />;

        case "order":
            return <OrderCard cardData={orderCards[card.id]} />;

        case "visitor":
            return <VisitorCard cardData={visitorCards[card.id]} />;
    }
};

const isDisabled = (card: CardId, props: Props): boolean => {
    switch (card.type) {
        case "vine":
            const { prompt, structures } = props;
            const cardData = vineCards[card.id];
            if (!prompt.requireStructures) return false;
            return !cardData.structures.every(s => structures[s as StructureId]);
        default:
            return false;
    }
};

const mapStateToProps = (state: AppState, ownProps: { playerId: string; }) => {
    const { playerId } = ownProps;
    return { structures: state.game.players[playerId].structures };
};

const mapDispatchToProps = (dispatch: Dispatch<GameAction>, ownProps: { playerId: string; }) => {
    return {
        onSelectCards: (cards: CardId[]) => dispatch(chooseCards(cards, ownProps.playerId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChooseCardPrompt);
