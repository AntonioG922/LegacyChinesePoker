import * as firebase from 'firebase';
import "firebase/firestore";
import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { SplashScreen } from 'expo';
import * as Font from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import useLinking from './navigation/useLinking';
import HomeScreen from './screens/HomeScreen';
import HowToPlayScreen from './screens/HowToPlayScreen';
import HostGameOptionsScreen from './screens/HostGameOptionsScreen';
import JoinGameMenuScreen from './screens/JoinGameMenuScreen';
import GameScreen from './screens/GameScreen';

// Initialize Firebase
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

const Stack = createStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'rgb(217, 56, 27)',
    accent: 'rgb(96,100,109)',
  },
};

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const [initialNavigationState, setInitialNavigationState] = React.useState();
  const containerRef = React.useRef();
  const { getInitialState } = useLinking(containerRef);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHide();

        // Load our initial navigation state
        setInitialNavigationState(await getInitialState());

        // Load fonts
        await Font.loadAsync({
          'gang-of-three': require('./assets/fonts/GangOfThree.ttf'),
        });
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hide();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    return null;
  } else {
    return (
      <PaperProvider theme={theme}>
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <NavigationContainer ref={containerRef} initialState={initialNavigationState}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="HowToPlay" component={HowToPlayScreen} />
              <Stack.Screen name="HostGameOptions" component={HostGameOptionsScreen} />
              <Stack.Screen name="JoinGameMenu" component={JoinGameMenuScreen} />
              <Stack.Screen name="Game" component={GameScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </PaperProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
