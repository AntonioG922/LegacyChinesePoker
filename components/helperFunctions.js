const NUMBER_OF_CARDS = 52;
const STANDARD_DECK = Array.from({length: NUMBER_OF_CARDS}, (v, i) => i + 1);
const JOKER_DECK = Array.from({length: NUMBER_OF_CARDS + 1}, (v, i) => i + 1);

export function dealCards(numberOfPlayers = 4, useJoker) {
  const deck = shuffle(useJoker ? JOKER_DECK : STANDARD_DECK);

  return Array.from({length: numberOfPlayers},(x, i) => {
        return {
          player: i,
          cards: deck.splice(0, NUMBER_OF_CARDS / numberOfPlayers)
        }});
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
