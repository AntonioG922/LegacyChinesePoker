const { isBetterHand, HAND_TYPES, getLowestCard, sortCards } = require('./HelperFunctions');

function get13RandomCards() {
  let deck = Array.from({ length: 52 }, (v, i) => i);
  let cards = [];
  for (let i = 0; i < 13; i++) {
    const randIndex = Math.floor(Math.random() * deck.length);
    cards.push(deck.splice(randIndex, 1)[0]);
  }
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

module.exports = { getLowestPlayableCards };