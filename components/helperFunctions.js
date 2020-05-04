const NUMBER_OF_CARDS = 52;
const STANDARD_DECK = Array.from({length: NUMBER_OF_CARDS}, (v, i) => i + 1);
const JOKER_DECK = Array.from({length: NUMBER_OF_CARDS + 1}, (v, i) => i + 1);

export function getCardInfo(rank) {
  const suits = ['club', 'diamond', 'heart', 'spade'];
  const nums = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
  let cardInfo = { suit: '', number: '', color: 'black' };

  if (rank === 53)
    return { suit: '$', number: 'J', color: 'purple' };

  cardInfo.suit = suits[(rank - 1) % 4];
  if (cardInfo.suit === 'diamond' || cardInfo.suit === 'heart')
    cardInfo.color = 'red';
  cardInfo.number = nums[Math.floor((rank - 1) / 4)];
  return cardInfo;
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
