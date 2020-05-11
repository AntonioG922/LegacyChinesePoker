import { configureStore, getDefaultMiddleware, createSlice } from "@reduxjs/toolkit";

const userDataSlice = createSlice({
  name: 'userData',
  initialState: {},
  reducers: {
    setUserData(state, action) {
      state = action.payload;
    },
    clearUserData(state) {
      state = {}
    }
  }
});

const gameStateSlice = createSlice({
  name: 'gameState',
  initialState: {
    gameName: '',
    numberOfPlayers: 0,
    players: {},
    currentPlayerTurn: 0,
    playersLeftToJoin: 0,
    lastPlayerToPlay: '',
    playedCards: [],
    currentPlayerTurnIndex: 0,
  },
  reducers: {
    setGameState: (state, action) => {
      state = action.payload;
    },
    clearGameState: (state) => {
      state = {
        gameName: '',
        numberOfPlayers: 0,
        players: {},
        currentPlayerTurn: 0,
        playersLeftToJoin: 0,
        lastPlayerToPlay: '',
        playedCards: [],
        currentPlayerTurnIndex: 0,
      }
    },
  }
});

export const { setUserData, clearUserData } = userDataSlice.actions;
export const { setGameState, clearGameState } = gameStateSlice.actions;

let store;
export default store = configureStore({
  reducer: {
    userData: userDataSlice.reducer,
    gameState: gameStateSlice.reducer
  },
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  })
});
