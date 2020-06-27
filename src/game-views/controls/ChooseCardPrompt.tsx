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
import { plantVineDisabledReason } from "../../game-data/shared/sharedSelectors";

interface Props {
    title: string;
    optional: boolean;
    cards: {
        id: CardId;
        disabledReason?: string | undefined
    }[];
    onSelectCards: (cards: CardId[]) => void;
}

const ChooseCardPrompt: React.FunctionComponent<Props> = props => {
    return <PromptStructure title={props.title}>
        <ul className="ChooseCardPrompt-cards">
            {props.cards.map((card, i) => {
                return <li className="ChooseCardPrompt-card" key={card.id.id}>
                    <button
                        className="ChooseCardPrompt-cardButton"
                        disabled={!!card.disabledReason}
                        onClick={() => props.onSelectCards([card.id])}
                    >
                        {renderCard(card.id, props)}
                    </button>
                </li>;
            })}
            {props.optional
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

const mapStateToProps = (
    state: AppState,
    { prompt }: { playerId: string; prompt: ChooseCardPromptState }
) => {
    return {
        title: prompt.title,
        optional: !!prompt.optional,
        cards: prompt.cards.map(card => {
            return {
                id: card,
                disabledReason: prompt.requireStructures && card.type === "vine"
                    ? plantVineDisabledReason(state.game, card.id)
                    : undefined,
            };
        }),
    };
};

const mapDispatchToProps = (dispatch: Dispatch<GameAction>, ownProps: { playerId: string; }) => {
    return {
        onSelectCards: (cards: CardId[]) => dispatch(chooseCards(cards, ownProps.playerId)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChooseCardPrompt);
