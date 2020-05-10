const NUMBER_OF_CARDS = 52;
const STANDARD_DECK = Array.from({length: NUMBER_OF_CARDS}, (v, i) => i + 1);
const JOKER_DECK = Array.from({length: NUMBER_OF_CARDS + 1}, (v, i) => i + 1);
export const SUITS = {
  CLUB: 'CLUB',
  DIAMOND: 'DIAMOND',
  HEART: 'HEART',
  SPADE: 'SPADE',
};
export const RANKS = {
  THREE: '3',
  FOUR: '4',
  FIVE: '5',
  SIX: '6',
  SEVEN: '7',
  EIGHT: '8',
  NINE: '9',
  TEN: '10',
  JACK: 'J',
  QUEEN: 'Q',
  KING: 'K',
  ACE: 'A',
  TWO: '2',
};
export const HAND_TYPES = {
  INVALID: 'INVALID', // Should never be allowed to be played
  START_OF_GAME: 'START OF GAME',
  SINGLE: 'SINGLE',
  PAIR: 'PAIR',
  THREE_OF_A_KIND: 'THREE OF A KIND',
  FULL_HOUSE: 'FULL HOUSE',
  STRAIGHT: 'STRAIGHT',
  STRAIGHT_FLUSH: 'STRAIGHT FLUSH',
  UNION: 'UNION',
  DRAGON: 'DRAGON',
};
const ORDERED_SUITS = [SUITS.CLUB, SUITS.DIAMOND, SUITS.HEART, SUITS.SPADE];
const ORDERED_RANKS = [RANKS.THREE, RANKS.FOUR, RANKS.FIVE, RANKS.SIX, RANKS.SEVEN, RANKS.EIGHT, RANKS.NINE, RANKS.TEN, RANKS.JACK, RANKS.QUEEN, RANKS.KING, RANKS.ACE, RANKS.TWO];

export function getCardInfo(rank) {
  let cardInfo = { suit: '', number: '', color: 'black' };

  if (rank === 53)
    return { suit: '$', number: 'J', color: 'purple' };

  cardInfo.suit = ORDERED_SUITS[(rank - 1) % 4];
  if (cardInfo.suit === SUITS.DIAMOND || cardInfo.suit === SUITS.HEART)
    cardInfo.color = 'red';
  cardInfo.number = ORDERED_RANKS[Math.floor((rank - 1) / 4)];
  return cardInfo;
}

export function getHandType(cardRanks) {
  const cards = cardRanks.sort((a, b) => a-b).map((rank) => getCardInfo(rank));

  switch (cards.length) {
    case 0:
      return HAND_TYPES.START_OF_GAME;
    case 1:
      return HAND_TYPES.SINGLE;
    case 2:
      if (cards[0].number === cards[1].number)
        return HAND_TYPES.PAIR;

      return HAND_TYPES.INVALID;
    case 3:
      if (cards[0].number === cards[1].number && cards[0].number === cards[1].number)
        return HAND_TYPES.THREE_OF_A_KIND;

      return HAND_TYPES.INVALID;
    case 4:
      if (cards[0].number === cards[1].number && cards[0].number === cards[1].number && cards[0].number === cards[2].number && cards[0].number === cards[3].number)
        return HAND_TYPES.UNION;

      return HAND_TYPES.INVALID;
    case 5:
      // Full House
      if (cards[0].number === cards[1].number && cards[3].number === cards[4].number && (cards[2].number === cards[1].number || cards[2].number === cards[3].number))
        return HAND_TYPES.FULL_HOUSE;

      // Straight
      const startingIndex = ORDERED_RANKS.indexOf(cards[0].number);
      if (ORDERED_RANKS.indexOf(cards[1].number) === startingIndex + 1 &&
          ORDERED_RANKS.indexOf(cards[2].number) === startingIndex + 2 &&
          ORDERED_RANKS.indexOf(cards[3].number) === startingIndex + 3 &&
          ORDERED_RANKS.indexOf(cards[4].number) === startingIndex + 4) {
        if (cards[0].suit === cards[1].suit && cards[0].suit === cards[2].suit && cards[0].suit === cards[3].suit && cards[0].suit === cards[4].suit)
          return HAND_TYPES.STRAIGHT_FLUSH;
        return HAND_TYPES.STRAIGHT;
      }

      return HAND_TYPES.INVALID;
    case 13:
      if (cards.findIndex((card) => card.number === RANKS.TWO) !== -1 &&
          cards.findIndex((card) => card.number === RANKS.THREE) !== -1 &&
          cards.findIndex((card) => card.number === RANKS.FOUR) !== -1 &&
          cards.findIndex((card) => card.number === RANKS.FIVE) !== -1 &&
          cards.findIndex((card) => card.number === RANKS.SIX) !== -1 &&
          cards.findIndex((card) => card.number === RANKS.SEVEN) !== -1 &&
          cards.findIndex((card) => card.number === RANKS.EIGHT) !== -1 &&
          cards.findIndex((card) => card.number === RANKS.NINE) !== -1 &&
          cards.findIndex((card) => card.number === RANKS.TEN) !== -1 &&
          cards.findIndex((card) => card.number === RANKS.JACK) !== -1 &&
          cards.findIndex((card) => card.number === RANKS.QUEEN) !== -1 &&
          cards.findIndex((card) => card.number === RANKS.KING) !== -1 &&
          cards.findIndex((card) => card.number === RANKS.ACE) !== -1 &&
          cards.findIndex((card) => card.number === RANKS.TWO))
        return HAND_TYPES.UNION;
      else return HAND_TYPES.INVALID;
  }
}

/**
 * Determines an one hand is better than another.
 * Assumes that both hands are valid and of matching hand type.
 * @param attemptedPlay
 * @param lastPlayedHand
 * @return {boolean}
 */
export function isBetterHand(attemptedPlay, lastPlayedHand) {
  switch (getHandType(lastPlayedHand)) {
    case HAND_TYPES.SINGLE:
    case HAND_TYPES.PAIR:
    case HAND_TYPES.THREE_OF_A_KIND:
    case HAND_TYPES.UNION:
    case HAND_TYPES.STRAIGHT:
    case HAND_TYPES.STRAIGHT_FLUSH:
      return getHighestCard(attemptedPlay) > getHighestCard(lastPlayedHand);
    case HAND_TYPES.FULL_HOUSE:
      return lastPlayedHand.length === 0 ? true : attemptedPlay.sort((a, b) => a-b)[2] > lastPlayedHand.sort((a, b) => a-b)[2];
    case HAND_TYPES.START_OF_GAME:
    case HAND_TYPES.DRAGON:
      return true;
    default:
      return false;
  }
}

export function getNextPlayer(hands, currentPlayerIndex) {

}

function getHighestCard(cards) {
  return Math.max(...[].concat(...cards));
}

export function findStartingPlayer(hands) {
  const lowestCard = Math.min(...[].concat(...hands.map((hand) => hand.cards)));

  return hands.findIndex((hand) => hand.cards.includes(lowestCard));
}

export function dealCards(numberOfPlayers = 4, useJoker) {
  const deck = shuffle(useJoker ? JOKER_DECK : STANDARD_DECK);

  return Array.from({length: numberOfPlayers},(x, i) => {
        return {
          player: i,
          cards: deck.splice(0, NUMBER_OF_CARDS / numberOfPlayers)
        }});
}

function shuffle(arr) {
  let shuffledCopy = arr.slice(0);

  for (let i = shuffledCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledCopy[i], shuffledCopy[j]] = [shuffledCopy[j], shuffledCopy[i]];
  }
  return shuffledCopy;
}
