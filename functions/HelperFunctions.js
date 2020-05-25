const NUMBER_OF_CARDS = 52;
const STANDARD_DECK = Array.from({ length: NUMBER_OF_CARDS }, (v, i) => i + 1);
const JOKER_DECK = Array.from({ length: NUMBER_OF_CARDS + 1 }, (v, i) => i + 1);
export const JOKER = NUMBER_OF_CARDS + 1;
export const SUITS = {
  CLUB: 'CLUB',
  DIAMOND: 'DIAMOND',
  HEART: 'HEART',
  SPADE: 'SPADE',
};
export const SUIT_TO_COLOR_MAP = {
  CLUB: 'black',
  DIAMOND: 'red',
  HEART: 'red',
  SPADE: 'black',
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
export const AVATARS = {
  DOG: 'DOG',
  DRAGON: 'DRAGON',
  GOAT: 'GOAT',
  HORSE: 'HORSE',
  MONKEY: 'MONKEY',
  OX: 'OX',
  PIG: 'PIG',
  RABBIT: 'RABBIT',
  RAT: 'RAT',
  ROOSTER: 'ROOSTER',
  SNAKE: 'SNAKE',
  TIGER: 'TIGER',
};
const AVATAR_IMAGES = {
  DOG: require('../assets/images/avatars/dog.png'),
  DRAGON: require('../assets/images/avatars/dragon.png'),
  GOAT: require('../assets/images/avatars/goat.png'),
  HORSE: require('../assets/images/avatars/horse.png'),
  MONKEY: require('../assets/images/avatars/monkey.png'),
  OX: require('../assets/images/avatars/ox.png'),
  PIG: require('../assets/images/avatars/pig.png'),
  RABBIT: require('../assets/images/avatars/rabbit.png'),
  RAT: require('../assets/images/avatars/rat.png'),
  ROOSTER: require('../assets/images/avatars/rooster.png'),
  SNAKE: require('../assets/images/avatars/snake.png'),
  TIGER: require('../assets/images/avatars/tiger.png'),
};
export const ORDERED_SUITS = [SUITS.CLUB, SUITS.DIAMOND, SUITS.HEART, SUITS.SPADE];
export const ORDERED_RANKS = [RANKS.THREE, RANKS.FOUR, RANKS.FIVE, RANKS.SIX, RANKS.SEVEN, RANKS.EIGHT, RANKS.NINE, RANKS.TEN, RANKS.JACK, RANKS.QUEEN, RANKS.KING, RANKS.ACE, RANKS.TWO];
const AVATAR_LIST = [AVATARS.DOG, AVATARS.DRAGON, AVATARS.GOAT, AVATARS.HORSE, AVATARS.MONKEY, AVATARS.OX, AVATARS.PIG, AVATARS.RABBIT, AVATARS.RAT, AVATARS.ROOSTER, AVATARS.SNAKE, AVATARS.TIGER];
export const PLACE_SUFFIX = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th'];
export const MIN_NUMBER_PLAYERS = 2;
export const MAX_NUMBER_PLAYERS = 5;

export function getRandomAvatars(numAvatars) {
  let avatars = [];

  Array.from({ length: numAvatars }).map(() => {
    let index = Math.floor(Math.random() * (AVATAR_LIST.length));
    while (avatars.includes(index)) {
      index = Math.floor(Math.random() * (AVATAR_LIST.length));
    }
    avatars.push(index);
  });

  return avatars.map((avatar) => AVATAR_LIST[avatar]);
}

export function getAvatarImage(avatar) {
  return AVATAR_IMAGES[avatar];
}

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

export function getRank(rank, suit) {
  return ORDERED_RANKS.indexOf(rank) * 4 + ORDERED_SUITS.indexOf(suit) + 1;
}

export function getHandType(cardRanks) {
  const cards = cardRanks.sort((a, b) => a - b).map((rank) => getCardInfo(rank));

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

export function isLegalPlay(playedHandType, currentHandType) {
  if (currentHandType === HAND_TYPES.START_OF_GAME)
    return true;

  switch (playedHandType) {
    case HAND_TYPES.STRAIGHT_FLUSH:
      return currentHandType === HAND_TYPES.STRAIGHT_FLUSH || currentHandType === HAND_TYPES.STRAIGHT;
    case HAND_TYPES.UNION:
    case HAND_TYPES.DRAGON:
      return true;
    default:
      return currentHandType === playedHandType;
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
  if (getHandType(attemptedPlay) === HAND_TYPES.UNION && getHandType(lastPlayedHand) !== HAND_TYPES.UNION)
    return true;

  switch (getHandType(lastPlayedHand)) {
    case HAND_TYPES.SINGLE:
    case HAND_TYPES.PAIR:
    case HAND_TYPES.THREE_OF_A_KIND:
    case HAND_TYPES.UNION:
    case HAND_TYPES.STRAIGHT:
    case HAND_TYPES.STRAIGHT_FLUSH:
      return getHighestCard(attemptedPlay) > getHighestCard(lastPlayedHand);
    case HAND_TYPES.FULL_HOUSE:
      return lastPlayedHand.length === 0 ? true : attemptedPlay.sort((a, b) => a - b)[2] > lastPlayedHand.sort((a, b) => a - b)[2];
    case HAND_TYPES.START_OF_GAME:
    case HAND_TYPES.DRAGON:
      return true;
    default:
      return false;
  }
}

export function getNextEmptyHandIndex(hands, currentPlayerTurnIndex, numberOfPlayers) {
  let currentIndex = currentPlayerTurnIndex % numberOfPlayers;
  for (i = 0; i < numberOfPlayers; i++) {
    currentIndex = (currentIndex + 1) % numberOfPlayers;

    if (hands[currentIndex].cards.length !== 0) {
      return currentIndex;
    }
  }
  return currentIndex;
}

export function sortCards(cards) {
  return cards.sort((a, b) => a - b);
}

function getHighestCard(cards) {
  return Math.max(...[].concat(...cards));
}

export function getLowestCard(cards) {
  return Math.min(...[].concat(...cards));
}

export function findStartingPlayer(hands) {
  const lowestCard = getLowestCard(hands.map((hand) => hand.cards));

  return hands.findIndex((hand) => hand.cards.includes(lowestCard));
}

export function dealCards(useJoker, numberOfPlayers = 4, numberOfCards = NUMBER_OF_CARDS / numberOfPlayers) {
  const avatars = getRandomAvatars(numberOfPlayers);
  const deck = shuffle(useJoker ? JOKER_DECK : STANDARD_DECK);

  return Array.from({ length: numberOfPlayers }, (x, i) => {
    return {
      player: i,
      cards: deck.splice(0, numberOfCards),
      avatar: avatars[i]
    }
  });
}

function shuffle(arr) {
  let shuffledCopy = arr.slice(0);

  for (let i = shuffledCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledCopy[i], shuffledCopy[j]] = [shuffledCopy[j], shuffledCopy[i]];
  }
  return shuffledCopy;
}

export function releaseTheDragon() {
  let dragon = [];
  for (let i = 1; i < NUMBER_OF_CARDS; i += 4) {
    const tempNum = i + Math.floor(Math.random() * 4);
    dragon.push(tempNum);
  }
  return dragon;
}

export function getRandomCard() {
  return [Math.floor(Math.random() * 52 + 1)];
}

export function getPair() {
  const pairNumber = Math.floor(Math.random() * 13 + 1) * 4;
  let nums = [0, 1, 2, 3];
  let pair = [];
  for (i = 0; i < 2; i++) {
    const num = nums.splice(Math.floor(Math.random() * nums.length), 1);
    pair.push(pairNumber - num);
  }
  return pair;
}

export function getThreeOfAKind() {
  const thriceNumber = Math.floor(Math.random() * 13 + 1) * 4;
  let nums = [0, 1, 2, 3];
  let thrice = [];
  for (i = 0; i < 3; i++) {
    const num = nums.splice(Math.floor(Math.random() * nums.length), 1);
    thrice.push(thriceNumber - num);
  }
  return thrice;
}

export function getUnion() {
  const unionNumber = Math.floor(Math.random() * 13 + 1) * 4;
  return [unionNumber - 3, unionNumber - 2, unionNumber - 1, unionNumber];
}

export function getFullHouse() {
  const pair = getPair();
  let thrice = getThreeOfAKind();
  while (Math.ceil((pair[0] / 4) - 1) === Math.ceil((thrice[0] / 4)) - 1) {
    thrice = getThreeOfAKind();
  }
  return pair.concat(thrice);
}

export function getStraight() {
  let lowCard = Math.floor(Math.random() * 9 + 1) * 4;
  let nextCard = lowCard + 4;
  lowCard = lowCard - Math.floor(Math.random() * 4);
  let straight = [lowCard];
  for (i = 0; i < 4; i++) {
    const card = nextCard - Math.floor(Math.random() * 4);
    straight.push(card);
    nextCard += 4;
  }
  return straight;
}

export function getStraightFlush() {
  let lowCard = Math.floor(Math.random() * 9 + 1) * 4;
  lowCard = lowCard - Math.floor(Math.random() * 4);
  return [lowCard, lowCard + 4, lowCard + 8, lowCard + 12, lowCard + 16];
}

