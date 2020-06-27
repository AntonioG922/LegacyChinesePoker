import React, { useRef } from 'react';
import { View, useWindowDimensions, Animated, StyleSheet, Easing } from 'react-native';

export default function ConfettiDrop({ count, fallSpeed, colors, style }) {
  const colorPalette = colors || ['#9e0059', '#ff0054', '#F94144', '#F3722C', '#F8961E', '#F9C74F', '#90BE6D', '#43AA8B', '#577590'];

  return (
    <View style={[{ position: 'absolute', top: 0 }, style]}>
      {Array.from({ length: count }).map((val, index) => {
        return <Confetti key={index} colors={colorPalette} fallSpeed={fallSpeed} />
      })}
    </View>
  )
}

function Confetti({ fallSpeed, colors }) {
  const windowHeight = useWindowDimensions().height;
  const windowWidth = useWindowDimensions().width;
  const minWidth = 5;
  const maxWidth = 20;
  const minHeight = 10;
  const maxHeight = 20;
  const minYStart = -20;
  const maxYStart = -400;
  const minRotationY = 2 * 360;
  const maxRotationY = 8 * 360;
  const randColor = colors[Math.floor(Math.random() * colors.length)];
  const randHeight = Math.ceil(Math.random() * (maxHeight - minHeight) + minHeight);
  const randWidth = Math.ceil(Math.random() * (maxWidth - minWidth) + minWidth);
  const randYStart = Math.ceil(Math.random() * (maxYStart - minYStart) + minYStart);
  const randXStart = Math.ceil(Math.random() * windowWidth);
  const randRotation = `${Math.ceil(Math.random() * 360)}deg`;
  const randRotationY = Math.ceil(Math.random() * (maxRotationY - minRotationY) + minRotationY);
  const maxTranslateX = Math.random() > .65 ? -randXStart : windowWidth - randXStart;
  const randTranslateX = Math.ceil(Math.random() * maxTranslateX);

  const duration = (fallSpeed - ((fallSpeed / windowHeight) * randYStart)) * (Math.random() * (1 - .6) + .6);
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotationYAnim = useRef(new Animated.Value(0)).current;

  Animated.loop(
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: (windowHeight - randYStart),
        duration: duration,
        easing: Easing.linear
      }),
      Animated.timing(translateX, {
        toValue: randTranslateX,
        duration: duration,
        easing: Easing.linear
      }),
      Animated.timing(rotationYAnim, {
        toValue: 1,
        duration: duration,
        easing: Easing.linear
      })
    ])
  ).start();

  const rotationY = rotationYAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${randRotationY}deg`]
  });

  function getRandShape() {
    const percentSquare = .6;
    return Math.random() > percentSquare ? Math.min(randWidth, randHeight) / 2 : 0;
  }

  const styles = StyleSheet.create({
    confetti: {
      position: 'absolute',
      top: randYStart,
      left: randXStart,
      backgroundColor: randColor,
      height: randHeight,
      width: randWidth,
      zIndex: 20,
      borderRadius: getRandShape(),
      transform: [
        { translateY: translateY },
        { translateX: translateX },
        { rotate: randRotation },
        { rotateY: rotationY }
      ]
    }
  });

  return (
    <Animated.View style={styles.confetti} />
  )
}