import React from 'react';
import { View, TouchableOpacity, Dimensions, StyleSheet, Text } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import AnimatedTabIcon from './AnimatedTabIcon';
import { heightPercentageToDP as hp} from 'react-native-responsive-screen';

const { width } = Dimensions.get('window');
const tabWidth = width / 4;
const height = hp(10)
const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.svgContainer}>
        <Svg
          width={width}
          height={85}
          viewBox={`0 0 ${width} 70`}
        >
          <Path
            d={`M 0 0 L ${width / 2 - hp(6)} 0 Q ${width / 2} ${hp(11)} ${width / 2 + hp(6)} 0 L ${width} 0 L ${width} 80 L 0 80 Z`}
            fill="#E6E6E6"
          />
        </Svg>
      </View>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            onPress={onPress}
            style={[styles.tabButton, { marginLeft: index === 2 ? 20 : 0 }]}
          >
            <AnimatedTabIcon isFocused={isFocused} label={route.name} />
          </TouchableOpacity>
        );
      })}

      <View style={styles.fabContainer}>
        <TouchableOpacity onPress={() => { /* Handle floating action */ }}>
          <View style={styles.fab}>
            <View style={styles.fabTextContainer}>
              <Text style={styles.fabText}>+</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 75,
    position: 'relative',
    backgroundColor: '#F1F1F1',
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: hp(5),
    left: width / 2 - 30, // Center FAB
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00C5A4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default CustomTabBar;
