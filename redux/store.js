import { configureStore, getDefaultMiddleware, createSlice } from "@reduxjs/toolkit";

const userDataSlice = createSlice({
  name: 'userData',
  initialState: {
    user: {
      displayName: '',
      email: '',
      photoURL: '',
      providerData: '',
      uid: ''
    }
  },
  reducers: {
    setUserData(state, action) {
      state.user = action.payload;
    },
    updateUserData(state, action) {
      state.user.displayName = action.payload.displayName || state.user.displayName;
      state.user.email = action.payload.email || state.user.email;
      state.user.photoURL = action.payload.photoURL || state.user.photoURL;
      state.user.providerData = action.payload.providerData || state.user.providerData;
      state.user.uid = action.payload.uid || state.user.uid;
    },
    clearUserData(state) {
      state.user = {
        displayName: '',
        email: '',
        photoURL: '',
        providerData: '',
        uid: ''
      }
    }
  }
});

const howToPlaySectionSlice = createSlice({
  name: 'howToPlaySection',
  initialState: 0,
  reducers: {
    setHowToPlaySection(state, action) {
      return state = action.payload;
    }
  }
})

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

const globalFontSlice = createSlice({
  name: 'globalFont',
  initialState: 'gang-of-three',
  reducers: {
    setGlobalFont(state, action) {
      return state = action.payload;
    }
  }
});

export const { setUserData, updateUserData, clearUserData } = userDataSlice.actions;
export const { setGameState, clearGameState } = gameStateSlice.actions;
export const { setHowToPlaySection } = howToPlaySectionSlice.actions;
export const { setGlobalFont } = globalFontSlice.actions;

let store;
export default store = configureStore({
  reducer: {
    userData: userDataSlice.reducer,
    gameState: gameStateSlice.reducer,
    howToPlaySection: howToPlaySectionSlice.reducer,
    globalFont: globalFontSlice.reducer
  },
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  })
});
