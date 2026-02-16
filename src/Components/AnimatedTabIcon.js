import React from 'react';
import { Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const AnimatedTabIcon = ({ isFocused, label }) => {
  const scale = useSharedValue(isFocused ? 1.2 : 1);

  // Define animated style for scaling effect
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(scale.value, { duration: 300 }) }],
  }), [isFocused]);

  return (
    <Animated.View style={[animatedStyle, { alignItems: 'center' }]}>
      <Text style={{ color: isFocused ? '#00C5A4' : '#000' }}>{label}</Text>
    </Animated.View>
  );
};

export default AnimatedTabIcon;
