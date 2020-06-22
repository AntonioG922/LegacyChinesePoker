const functions = require('firebase-functions');
const firebase = require('firebase');

const firebaseConfig = {
  apiKey: "AIzaSyB-4633U4p-ZxErfCWFtGRP4qLzsBiZEjc",
  authDomain: "chinesepoker-d0082.firebaseapp.com",
  databaseURL: "https://chinesepoker-d0082.firebaseio.com",
  projectId: "chinesepoker-d0082",
  storageBucket: "chinesepoker-d0082.appspot.com",
  messagingSenderId: "602907791506",
  appId: "1:602907791506:web:7f06ab397d7410dffe964b",
  measurementId: "G-PSG3FMNF0E"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

exports.computerTakeTurn = functions.firestore.document('CustomGames/{gameName}')
  .onUpdate((change, context) => {

    function everyonePassAfterWinner() {
      // called while last player needed to pass is passing
      if (gameData.places.length === 0)
        return false;

      const lastUIDToPlay = Object.keys(gameData.lastPlayerToPlay)[0];
      const lastUIDToPlayTurnIndex = gameData.players[lastUIDToPlay];
      if (gameData.hands[lastUIDToPlayTurnIndex].cards.length)
        return false;

      const lastPlayTurnNum = Number(Object.keys(gameData.playersTurnHistory[lastUIDToPlay]).pop());
      let index = 0;
      for (let hand of gameData.hands) {
        if (hand.cards.length) {
          const remainingPlayerUID = Object.keys(gameData.players).find(key => gameData.players[key] === index);
          const remainingPlayerLastPlayTurnNum = Number(Object.keys(gameData.playersTurnHistory[remainingPlayerUID]).pop());
          const remainingPlayerLastPlay = gameData.playersTurnHistory[remainingPlayerUID][remainingPlayerLastPlayTurnNum];
          const currentPlayerUID = Object.keys(gameData.players).find(uid => gameData.players[uid] === gameData.currentPlayerTurnIndex);

          if ((remainingPlayerLastPlayTurnNum < lastPlayTurnNum ||
            (remainingPlayerLastPlayTurnNum > lastPlayTurnNum && remainingPlayerLastPlay !== 'PASS')) &&
            remainingPlayerUID !== currentPlayerUID) {
            return false;
          }
        }
        index++;
      };

      return true;
    }

    function playCards(selectedCards) {
      const gameName = context.params.gameName;
      const currentPlayerUID = (Object.keys(gameData.players).find(uid => gameData.players[uid] === gameData.currentPlayerTurnIndex));
      let hands = gameData.hands;
      const turnIndex = gameData.currentPlayerTurnIndex;
      const playedHandType = getHandType(selectedCards);
      hands[turnIndex].cards = hands[turnIndex].cards.filter(card => !selectedCards.includes(card));

      let overallTurnHistory = gameData.overallTurnHistory;
      let playersTurnHistory = gameData.playersTurnHistory;
      const turnsTaken = Object.keys(overallTurnHistory).length;
      overallTurnHistory[turnsTaken] = selectedCards;
      playersTurnHistory[currentPlayerUID][turnsTaken] = selectedCards;

      const handIsEmpty = hands[turnIndex].cards.length === 0;

      const data = {
        playedCards: firebase.firestore.FieldValue.arrayUnion(...selectedCards),
        lastPlayed: selectedCards,
        lastPlayerToPlay: { [currentPlayerUID]: gameData.displayNames[currentPlayerUID] },
        hands: hands,
        currentPlayerTurnIndex: getNextNonEmptyHandIndex(gameData.hands, gameData.currentPlayerTurnIndex, gameData.numberOfPlayers) % gameData.numberOfPlayers,
        currentHandType: playedHandType,
        playersTurnHistory: playersTurnHistory,
        overallTurnHistory: overallTurnHistory
      };
      if (handIsEmpty) {
        data['places'] = firebase.firestore.FieldValue.arrayUnion(currentPlayerUID);

        if (!gameData.places.length) {
          data[`gamesWon.${currentPlayerUID}`] = firebase.firestore.FieldValue.increment(1);
          data['gamesPlayed'] = firebase.firestore.FieldValue.increment(1);
        }

        if (gameData.places.length === gameData.numberOfPlayers - 2) {
          const lastPlaceUID = Object.keys(gameData.players).find((playerUid) => playerUid !== currentPlayerUID && !gameData.places.includes(playerUid));
          data['places'] = firebase.firestore.FieldValue.arrayUnion(currentPlayerUID, lastPlaceUID);
        }
      }

      const onlyBotsLeft = (gameData.numberOfPlayers - gameData.numberOfComputers) === gameData.places.length;
      setTimeout(() => {
        firebase.firestore().collection('CustomGames').doc(gameName).update(data)
          .then(() => {
            console.log('Computer played!');
          })
          .catch((error) => {
            console.log('Error with computer playing: ' + error);
          });
      }, onlyBotsLeft ? 500 : 1500);

      return true;
    }

    function pass() {
      const gameName = context.params.gameName;
      const currentPlayerUID = Object.keys(gameData.players).find(uid => gameData.players[uid] === gameData.currentPlayerTurnIndex);

      const nextPlayerStillInUID = Object.keys(gameData.players).find(uid => gameData.players[uid] === getNextNonEmptyHandIndex(gameData.hands, gameData.currentPlayerTurnIndex, gameData.numberOfPlayers) % gameData.numberOfPlayers);
      const everyonePassed = nextPlayerStillInUID === Object.keys(gameData.lastPlayerToPlay)[0] || everyonePassAfterWinner();

      let overallTurnHistory = gameData.overallTurnHistory;
      let playersTurnHistory = gameData.playersTurnHistory;
      const turnsTaken = Object.keys(overallTurnHistory).length;
      overallTurnHistory[turnsTaken] = 'PASS';
      playersTurnHistory[currentPlayerUID][turnsTaken] = 'PASS';

      const update = {
        currentHandType: everyonePassed ? HAND_TYPES.START_OF_ROUND : gameData.currentHandType,
        currentPlayerTurnIndex: getNextNonEmptyHandIndex(gameData.hands, gameData.currentPlayerTurnIndex, gameData.numberOfPlayers) % gameData.numberOfPlayers,
        playersTurnHistory: playersTurnHistory,
        overallTurnHistory: overallTurnHistory
      };

      const onlyBotsLeft = (gameData.numberOfPlayers - gameData.numberOfComputers) === gameData.places.length;
      setTimeout(() => {
        firebase.firestore().collection('CustomGames').doc(gameName).update(update)
          .then(() => {
            console.log('Computer passed!');
          })
          .catch(error => {
            console.log('Error passing for computer: ', error);
          });
      }, onlyBotsLeft ? 500 : 1500);

      return true;
    }

    const gameData = change.after.data();
    const gameStarted = Object.keys(gameData.players).length === gameData.numberOfPlayers;
    const gameEnded = Object.keys(gameData.places).length === gameData.numberOfPlayers;
    if (gameStarted && !gameEnded) {
      const currentPlayerUID = (Object.keys(gameData.players).find(uid => gameData.players[uid] === gameData.currentPlayerTurnIndex));
      const computerPlaysNext = AI_UID_PREFIXES.includes(currentPlayerUID.slice(0, 7));

      if (computerPlaysNext) {
        const turnIndex = gameData.currentPlayerTurnIndex;
        const AIDifficulty = currentPlayerUID.slice(3, 7);
        const exclusive = AIDifficulty === 'Easy' ? false : true;
        const selectedCards = getLowestPlayableCards(gameData.hands[turnIndex].cards, gameData.cardsPerPlayer, gameData.currentHandType, gameData.lastPlayed, exclusive);
        if (selectedCards) {
          playCards(selectedCards);
        } else {
          pass();
        }
      }
    }

    return true;
  })


const AI_DIFFICULTIES = {
  EASY: 'Easy',
  MEDIUM: 'Medium'
}
const AI_UID_PREFIXES = Object.keys(AI_DIFFICULTIES).map(difficulty => 'Bot' + AI_DIFFICULTIES[difficulty].slice(0, 4));

const HAND_TYPES = {
  INVALID: 'INVALID', // Should never be allowed to be played
  START_OF_GAME: 'START OF GAME',
  START_OF_ROUND: 'START OF ROUND',
  SINGLE: 'SINGLE',
  PAIR: 'PAIR',
  THREE_OF_A_KIND: 'THREE OF A KIND',
  FULL_HOUSE: 'FULL HOUSE',
  STRAIGHT: 'STRAIGHT',
  STRAIGHT_FLUSH: 'STRAIGHT FLUSH',
  UNION: 'UNION',
  DRAGON: 'DRAGON',
};
const RANKS = {
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
const SUITS = {
  CLUB: 'CLUB',
  DIAMOND: 'DIAMOND',
  HEART: 'HEART',
  SPADE: 'SPADE',
};
const ORDERED_SUITS = [SUITS.CLUB, SUITS.DIAMOND, SUITS.HEART, SUITS.SPADE];
const ORDERED_RANKS = [RANKS.THREE, RANKS.FOUR, RANKS.FIVE, RANKS.SIX, RANKS.SEVEN, RANKS.EIGHT, RANKS.NINE, RANKS.TEN, RANKS.JACK, RANKS.QUEEN, RANKS.KING, RANKS.ACE, RANKS.TWO];

function getLowestCard(cards) {
  return Math.min(...[].concat(...cards));
}

function getHighestCard(cards) {
  return Math.max(...[].concat(...cards));
}

function getCardInfo(rank) {
  let cardInfo = { suit: '', number: '', color: 'black' };

  if (rank === 53)
    return { suit: '$', number: 'J', color: 'purple' };

  cardInfo.suit = ORDERED_SUITS[(rank - 1) % 4];
  if (cardInfo.suit === SUITS.DIAMOND || cardInfo.suit === SUITS.HEART)
    cardInfo.color = 'red';
  cardInfo.number = ORDERED_RANKS[Math.floor((rank - 1) / 4)];
  return cardInfo;
}

function isBetterHand(attemptedPlay, lastPlayedHand) {
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
    case HAND_TYPES.START_OF_ROUND:
    case HAND_TYPES.DRAGON:
      return true;
    default:
      return false;
  }
}

function getHandType(cardRanks) {
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

function getNextNonEmptyHandIndex(hands, currentPlayerTurnIndex, numberOfPlayers) {
  let currentIndex = currentPlayerTurnIndex % numberOfPlayers;
  for (i = 0; i < numberOfPlayers; i++) {
    currentIndex = (currentIndex + 1) % numberOfPlayers;

    if (hands[currentIndex].cards.length !== 0) {
      return currentIndex;
    }
  }
  return currentIndex;
}

function sortCards(cards) {
  return cards.sort((a, b) => a - b);
}


function harnessedTheDragon(cards, cardsPerPlayer) {
  // inputs:
  //    cards: sorted array of cards in hand
  //
  // outputs: 
  //    dragon: boolean

  if (cardsPerPlayer !== 13 || cards.length !== 13) {
    return false;
  }

  for (let i = 0; i < cards.length - 1; i++) {
    if (Math.ceil(cards[i] / 4) === Math.ceil(cards[i + 1] / 4)) {
      return false;
    }
  }
  return true;
}

/*  GET HAND TYPES
    inputs:
      cards: sorted array of cards in hand
 
    outputs:
      non-exclusive: array of arrays of given hand type in ascending order. includes hand types contained in other higher hand types (pairs in triples, etc.)
      exclusive: array of arrays of given hand type in ascending order. doesn't include hand types contained in other higher hand types. Does not account for pairs/triples/etc. in straights
*/

function getAllSinglesExclusive(cards) {
  // outputs: 
  //    singles: **NOTE** straights are exclusive, so only those with two or less pairs/triples in them

  function rank1Thru13(card) {
    return Math.ceil(card / 4);
  }

  function cardBeneathIsntPair(card, index) {
    return index !== cards.length - 1 ? rank1Thru13(cards[index + 1]) !== rank1Thru13(card) : true;
  }

  function cardAboveIsntPair(card, index) {
    return index !== 0 ? rank1Thru13(cards[index - 1]) !== rank1Thru13(card) : true;
  }

  function isCardPartOfStraight(card) {
    for (let straight of straights) {
      if (straight.find(straightCard => straightCard === card) !== undefined) {
        return true;
      }
    }

    return false;
  }

  let singles = [];
  let straights = getAllStraightsExclusive(cards);

  cards.forEach((card, index) => {
    if (cardBeneathIsntPair(card, index) && cardAboveIsntPair(card, index) && !isCardPartOfStraight(card)) {
      singles.push([card]);
    }
  });

  return singles;
}

function getAllPairs(cards) {
  let pairs = [];
  for (let i = 0; i < cards.length - 1; i++) {
    let j = i + 1;
    while (j < cards.length) {
      const isPair = Math.ceil(cards[i] / 4) === Math.ceil(cards[j] / 4);
      if (isPair) {
        pairs.push([cards[i], cards[j]]);
        j++;
      } else {
        break;
      }
    }
  }
  return pairs;
}

function getAllPairsExclusive(cards) {
  let pairs = [];
  for (let i = 0; i < cards.length - 1; i++) {
    const isPair = Math.ceil(cards[i] / 4) === Math.ceil(cards[i + 1] / 4);
    if (isPair) {
      const isTriple = (i !== cards.length - 2) && (Math.ceil(cards[i] / 4) === Math.ceil(cards[i + 2] / 4));
      if (!isTriple) {
        pairs.push([cards[i], cards[i + 1]]);
      } else {
        i += 2;
      }
    }
  }
  return pairs;
}

function getAllTriples(cards) {
  let triples = [];
  for (let i = 0; i < cards.length - 2; i++) {
    let j = i + 1;
    while (j < cards.length - 1) {
      let k = j + 1;
      const isTriple = Math.ceil(cards[i] / 4) === Math.ceil(cards[k] / 4);
      if (isTriple) {
        triples.push([cards[i], cards[j], cards[k]]);
        while (k < cards.length) {
          k++;
          const isTriple2 = Math.ceil(cards[i] / 4) === Math.ceil(cards[k] / 4);
          if (isTriple2) {
            triples.push([cards[i], cards[j], cards[k]]);
          } else {
            break;
          }
        }
        j++
      } else {
        break;
      }
    }
  }
  return triples;
}

function getAllTriplesExclusive(cards) {
  let triples = [];
  for (let i = 0; i < cards.length - 2; i++) {
    const isTriple = Math.ceil(cards[i] / 4) === Math.ceil(cards[i + 2] / 4);
    if (isTriple) {
      const isUnion = (i !== cards.length - 3) && (Math.ceil(cards[i] / 4) === Math.ceil(cards[i + 3] / 4));
      if (!isUnion) {
        triples.push([cards[i], cards[i + 1], cards[i + 2]]);
      } else {
        i += 3;
      }
    }
  }
  return triples;
}

function getAllUnions(cards) {
  // includes unions in 5-of-a-kinds and higher

  let unions = [];
  for (let i = 0; i < cards.length - 3; i++) {
    const isUnion = Math.ceil(cards[i] / 4) === Math.ceil(cards[i + 3] / 4);
    if (isUnion) {
      unions.push(Array.from({ length: 4 }, (v, ind) => cards[i + ind]));
      i += 3;
    }
  }
  return unions;
}

function getAllFullHousesExclusive(cards) {
  const triples = getAllTriplesExclusive(cards);
  const pairs = getAllPairsExclusive(cards);
  let fullHouses = [];
  for (let i = 0; i < triples.length; i++) {
    for (let j = 0; j < pairs.length; j++) {
      fullHouses.push(pairs[j].concat(triples[i]));
    }
  }
  return fullHouses;
}

function getAllStraights(cards) {
  // includes straights in pairs, triples, unions, full houses
  // only returns lowest straights in 5 card sets (doesn't account for pairs and triples in straights)

  function rank1Thru13(card) {
    return Math.ceil(card / 4);
  }

  let straights = [];
  let cardsInARow = [];
  for (let i = 0; i < cards.length - 4; i++) {
    let j = i + 1;
    cardsInARow = [cards[i]];
    while (rank1Thru13(cards[j]) - 1 <= rank1Thru13(cardsInARow[cardsInARow.length - 1])) {
      if (rank1Thru13(cards[j]) - 1 === rank1Thru13(cardsInARow[cardsInARow.length - 1])) {
        cardsInARow.push(cards[j]);
        if (cardsInARow.length === 5) {
          straights.push(cardsInARow);
          break;
        }
      }
      j++;
    }
  }
  return straights;
}

function getAllStraightsExclusive(cards) {
  // only includes straights with up to two pairs/three-of-a-kinds in it
  // doesn't include straights containing a union

  let exclusiveStraights = [];
  let straights = getAllStraights(cards);
  const pairs = getAllPairsExclusive(cards);
  const triples = getAllTriples(cards);

  straights.forEach(straight => {
    let pairsAndTriplesInStraight = 0;
    straight.forEach(straightNum => {
      if (pairsAndTriplesInStraight > 2) {
        return;
      }

      pairs.forEach(pair => {
        if (pair.find(pairNum => pairNum === straightNum) !== undefined) {
          pairsAndTriplesInStraight++;
        }
      });

      triples.forEach(triple => {
        if (triple.find(tripleNum => tripleNum === straightNum) != undefined) {
          pairsAndTriplesInStraight++;
        }
      })

    });

    if (pairsAndTriplesInStraight <= 2) {
      exclusiveStraights.push(straight);
    }
  });

  return exclusiveStraights;
}

function getAllStraightFlushes(cards) {
  let straightFlushes = [];
  for (let i = 0; i < cards.length - 4; i++) {
    if (cards.find(card => card === cards[i] + 4) &&
      cards.find(card => card === cards[i] + 8) &&
      cards.find(card => card === cards[i] + 12) &&
      cards.find(card => card === cards[i] + 16)) {
      straightFlushes.push([cards[i], cards[i] + 4, cards[i] + 8, cards[i] + 12, cards[i] + 16])
    }
  }
  return straightFlushes;
}

function getAllStraightFlushesExclusive(cards) {
  // only includes straight flushes with up to two pairs/three-of-a-kinds in it

  let pairsAndTriplesInStraight = 0;
  let exclusiveStraights = [];
  let straights = getAllStraightFlushes(cards);
  const pairs = getAllPairsExclusive(cards);
  const triples = getAllTriples(cards);
  straights.forEach(straight => {
    pairsAndTriplesInStraight = 0;
    straight.forEach(straightNum => {
      if (pairsAndTriplesInStraight > 2) {
        return;
      }
      pairs.forEach(pair => {
        if (pair.find(pairNum => pairNum === straightNum) !== undefined) {
          pairsAndTriplesInStraight++;
        }
      });
      triples.forEach(triple => {
        if (triple.find(tripleNum => tripleNum === straightNum) !== undefined) {
          pairsAndTriplesInStraight++;
        }
      })
    });
    if (pairsAndTriplesInStraight <= 2) {
      exclusiveStraights.push(straight);
    }
  });
  return exclusiveStraights;
}


function getLowestStartOfRoundCardsExclusive(cards, startOfGame) {
  //  inputs:
  //    cards: sorted array of cards in hand
  //    startOfGame: boolean
  //
  //  outputs:  array with the cards to play. array is chosen by lowest card in players hand and biggest hand types to get rid of

  const lowestCard = getLowestCard(cards);

  // play straight first
  const lowestStraight = getAllStraightsExclusive(cards)[0];
  if (lowestStraight && lowestStraight[0] === lowestCard) {
    return lowestStraight;
  }

  // play full house second
  const lowestFullHouse = getAllFullHousesExclusive(cards)[0];
  if (lowestFullHouse && (lowestFullHouse[0] === lowestCard || lowestFullHouse[2] === lowestCard)) {
    return lowestFullHouse;
  }

  // play union third if start of game
  if (startOfGame) {
    const lowestUnion = getAllUnions(cards)[0];
    if (lowestUnion && (lowestUnion[0] === lowestCard)) {
      return lowestUnion;
    }
  }

  // play three-of-a-kind fourth
  const lowestTriple = getAllTriplesExclusive(cards)[0];
  if (lowestTriple && (lowestTriple[0] === lowestCard)) {
    return lowestTriple;
  }

  // play pair fifth
  const lowestPair = getAllPairsExclusive(cards)[0];
  if (lowestPair && (lowestPair[0] === lowestCard)) {
    return lowestPair;
  }

  return [lowestCard];
}


function getLowestPlayableCards(cards, cardsPerPlayer, currentHandType, lastCardsPlayed, exclusive) {
  /* inputs:
        cards: array of cards in hand
        lastCardsPlayed: array of the last cards played
        exclusive: boolean. false means just find the lowest playable current hand type. true adds logic to not break up paris/triples/straights/etc.
 
      outputs:
        if they have a playable hand, an array of the cards to play. otherwise, false
  */

  cards = sortCards(cards);

  if (harnessedTheDragon(cards, cardsPerPlayer)) {
    console.log(cards);
    return cards;
  }

  let cardsMinusStraights = [...cards];
  if (exclusive) {
    while (getAllStraightsExclusive(cardsMinusStraights).length) {
      cardsMinusStraights = cardsMinusStraights.filter(card => {
        getAllStraightsExclusive(cardsMinusStraights)[0].includes(card)
      });
    }
  }

  let handTypeSets;

  switch (currentHandType) {
    case HAND_TYPES.START_OF_GAME:
      return getLowestStartOfRoundCardsExclusive(cards, true);
    case HAND_TYPES.START_OF_ROUND:
      return getLowestStartOfRoundCardsExclusive(cards, false);
    case HAND_TYPES.SINGLE:
      handTypeSets = exclusive ? getAllSinglesExclusive(cardsMinusStraights) : cards;
      break;
    case HAND_TYPES.PAIR:
      handTypeSets = exclusive ? getAllPairsExclusive(cardsMinusStraights) : getAllPairs(cards);
      break;
    case HAND_TYPES.THREE_OF_A_KIND:
      handTypeSets = exclusive ? getAllTriplesExclusive(cardsMinusStraights) : getAllTriples(cards);
      break;
    case HAND_TYPES.UNION:
      handTypeSets = getAllUnions(cards);
      break;
    case HAND_TYPES.FULL_HOUSE:
      handTypeSets = getAllFullHousesExclusive(cardsMinusStraights);
      break;
    case HAND_TYPES.STRAIGHT:
      handTypeSets = exclusive ? getAllStraightsExclusive(cards) : getAllStraights(cards);
      break;
    case HAND_TYPES.STRAIGHT_FLUSH:
      handTypeSets = exclusive ? getAllStraightFlushesExclusive(cards) : getAllStraightFlushes(cards);
      break;
    default:
      return false;
  }

  for (let set of handTypeSets) {
    if (!Array.isArray(set)) {
      set = [set];
    }
    if (isBetterHand(set, lastCardsPlayed)) {
      console.log(set);
      return set;
    }
  }

  return false;
}