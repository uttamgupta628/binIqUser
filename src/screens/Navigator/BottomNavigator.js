import React, {useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  PanResponder,
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreenMain from '../MainScreens/HomeScreenMain';
import FavouratiesScreen from '../MainScreens/FavouratiesScreen';
import MyLibrary from '../MainScreens/MyLibrary';
import UserProfileScreen from '../MainScreens/UserProfileScreen';
import MapScreen from '../MainScreens/MapScreen';
import CameraScan from '../../../assets/CameraScan.svg';
import Home from '../../../assets/Home.svg';
import HomeFocused from '../../../assets/HomeFocused.svg';
import Heart from '../../../assets/Heart.svg';
import HeartFocused from '../../../assets/HeartFocused.svg';
import Library from '../../../assets/Library.svg';
import LibraryFocused from '../../../assets/LibraryFocused.svg';
import User from '../../../assets/User.svg';
import UserFocused from '../../../assets/user_focus.svg';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const Tab = createBottomTabNavigator();
const {width, height} = Dimensions.get('window');
const CIRCLE_RADIUS = wp(28);
const ICON_SIZE = hp(3.5);
const BUTTON_COUNT = 4;
const SCAN_BUTTON_RADIUS = 65 / 2; // Scan button is 65x65, so radius is 32.5
const ICON_RADIUS =
  (CIRCLE_RADIUS - SCAN_BUTTON_RADIUS) / 2 + SCAN_BUTTON_RADIUS; // Halfway between scan button edge and circle edge

const BottomNavigator = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const lastAngle = useRef(0);
  const velocity = useRef(0);

  const routes = [
    {name: 'HomeScreen', component: HomeScreenMain},
    {name: 'FavouritesScreen', component: FavouratiesScreen},
    {name: 'MyLibrary', component: MyLibrary},
    {name: 'UserProfileScreen', component: UserProfileScreen},
  ];

  const icons = [
    {
      unfocused: <Home height={ICON_SIZE} />,
      focused: <HomeFocused height={ICON_SIZE} />,
      color: '#FF6347',
    },
    {
      unfocused: <Heart height={ICON_SIZE} />,
      focused: <HeartFocused height={ICON_SIZE} />,
      color: '#FFD700',
    },
    {
      unfocused: <Library height={ICON_SIZE} />,
      focused: <LibraryFocused height={ICON_SIZE} />,
      color: '#1E90FF',
    },
    {
      unfocused: <User height={ICON_SIZE} />,
      focused: <UserFocused height={ICON_SIZE} />,
      color: '#32CD32',
    },
  ];

  const handlePress = (index, navigation) => {
    setSelectedIndex(index);
    const currentAngle = index * (360 / BUTTON_COUNT);
    const targetAngle = -currentAngle;
    Animated.spring(rotateAnim, {
      toValue: targetAngle,
      useNativeDriver: true,
    }).start();
    navigation.navigate(routes[index].name);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const {dx} = gestureState;
        const angleChange = (dx / CIRCLE_RADIUS) * (180 / Math.PI);
        const newAngle = lastAngle.current + angleChange;
        rotateAnim.setValue(newAngle);
        velocity.current = gestureState.vx;
      },
      onPanResponderRelease: (evt, gestureState, navigation) => {
        lastAngle.current = rotateAnim._value;
        Animated.decay(rotateAnim, {
          velocity: velocity.current * 10,
          deceleration: 0.997,
          useNativeDriver: true,
        }).start(() => {
          lastAngle.current = rotateAnim._value;
          const finalAngle = rotateAnim._value;
          const nearestIndex =
            Math.round(finalAngle / (360 / BUTTON_COUNT)) % BUTTON_COUNT;
          const adjustedIndex =
            nearestIndex < 0 ? BUTTON_COUNT + nearestIndex : nearestIndex;
          handlePress(adjustedIndex, navigation);
        });
      },
    }),
  ).current;

  const renderButtons = navigation => {
    return icons.map((icon, index) => {
      const angle = (index * (360 / BUTTON_COUNT) - 90) * (Math.PI / 180);
      const x = ICON_RADIUS * Math.cos(angle); // Use ICON_RADIUS instead of CIRCLE_RADIUS
      const y = ICON_RADIUS * Math.sin(angle);

      return (
        <Animated.View
          key={index}
          style={[
            styles.iconContainer,
            {
              transform: [
                {translateX: x},
                {translateY: y},
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [-360, 360],
                    outputRange: ['360deg', '-360deg'],
                  }),
                },
              ],
            },
          ]}>
          {selectedIndex === index && (
            <View style={styles.selectedBackground} />
          )}
          <TouchableOpacity onPress={() => handlePress(index, navigation)}>
            {selectedIndex === index ? icon.focused : icon.unfocused}
          </TouchableOpacity>
        </Animated.View>
      );
    });
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {display: 'none'},
      }}
      tabBar={({navigation}) => (
        <View style={styles.tabBarContainer}>
          <Animated.View
            style={[
              styles.circle,
              {
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [-360, 360],
                      outputRange: ['-360deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
            // {...panResponder.panHandlers}
          >
            {renderButtons(navigation)}
            <TouchableOpacity onPress={() => navigation.navigate('MapScreen')}>
              <View style={styles.scanButton}>
                <CameraScan size={hp(4.2)} color={'white'} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}>
      <Tab.Screen name="HomeScreen" component={HomeScreenMain} />
      <Tab.Screen name="FavouritesScreen" component={FavouratiesScreen} />
      <Tab.Screen name="MapScreen" component={MapScreen} />
      <Tab.Screen name="MyLibrary" component={MyLibrary} />
      <Tab.Screen name="UserProfileScreen" component={UserProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: hp(-10),
    width: width,
    height: CIRCLE_RADIUS * 2 + hp(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    borderRadius: CIRCLE_RADIUS,
    backgroundColor: 'rgba(164, 163, 163, 0.4)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.35,
    shadowRadius: 8,
    // elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    width: ICON_SIZE,
    height: ICON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    // position: 'absolute',
    width: 65,
    height: 65,
    backgroundColor: '#14BA9C',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBackground: {
    position: 'absolute',
    width: ICON_SIZE + 12,
    height: ICON_SIZE + 12,
    borderRadius: (ICON_SIZE + 10) / 2,
    backgroundColor: '#130160',
    zIndex: -10,
  },
});

export default BottomNavigator;
