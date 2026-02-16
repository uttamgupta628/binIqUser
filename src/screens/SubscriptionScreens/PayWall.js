import React, {useRef} from 'react';
import {Image, StyleSheet, Text, View, Animated} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import GreenCheck from '../../../assets/green_check.svg';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';

const PayWall = () => {
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <View style={{height: hp(7)}} />
      <View style={{width: '100%', height: hp(18), alignItems: 'center'}}>
        <Image
          source={require('../../../assets/animated_tick.gif')}
          style={{width: '50%', height: '100%'}}
        />
      </View>
      <View
        style={{
          height: hp(50),
          marginTop: '10%',
          marginHorizontal: '7.5%',
          justifyContent: 'space-between',
        }}>
        <View style={{height: '23%'}}>
          <Text
            style={{
              fontFamily: 'Nunito-Bold',
              color: '#14BA9C',
              fontSize: wp(7),
              textAlign: 'center',
            }}>
            Access Your Library Today!
          </Text>
        </View>
        <View style={{height: '70%', justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row'}}>
            <GreenCheck size={30} />
            <Text
              style={{
                fontFamily: 'DMSans-SemiBold',
                color: '#64748B',
                fontSize: wp(4.7),
              }}>
              {'  '}Upload and manage your scans in the library.
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <GreenCheck size={30} />
            <Text
              style={{
                fontFamily: 'DMSans-SemiBold',
                color: '#64748B',
                fontSize: wp(4.7),
              }}>
              {'  '}Largest Bin Store Network
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <GreenCheck size={30} />
            <Text
              style={{
                fontFamily: 'DMSans-SemiBold',
                color: '#64748B',
                fontSize: wp(4.7),
              }}>
              {'  '}View Trending items from Bin Stores Near You
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <GreenCheck size={30} />
            <Text
              style={{
                fontFamily: 'DMSans-SemiBold',
                color: '#64748B',
                fontSize: wp(4.7),
              }}>
              {'  '}Reseller Dashboard Access
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <GreenCheck size={30} />
            <Text
              style={{
                fontFamily: 'DMSans-SemiBold',
                color: '#64748B',
                fontSize: wp(4.7),
              }}>
              {'  '}Historical Data Access
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <GreenCheck size={30} />
            <Text
              style={{
                fontFamily: 'DMSans-SemiBold',
                color: '#64748B',
                fontSize: wp(4.7),
              }}>
              {'  '}Customization Options
            </Text>
          </View>
        </View>
      </View>
      <Animated.View
        style={[styles.buttonContainer, {transform: [{scale: scaleAnim}]}]}>
        <TouchableOpacity
          style={styles.gettingStarted}
          onPress={() => navigation.navigate('FreeSubscription')}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}>
          <Text style={styles.buttonText}>Access Now</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    width: '90%',
    alignSelf: 'center',
    marginTop: '15%',
  },
  gettingStarted: {
    backgroundColor: '#130160',
    opacity: 0.85, // Semi-transparency for glassmorphism
    width: '100%',
    height: hp(7),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Border for glassmorphism effect
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)', // Subtle white border
    // Elevation for Android
    elevation: 8,
  },
  buttonText: {
    fontFamily: 'Nunito-SemiBold',
    color: '#fff',
    fontSize: hp(2.2),
  },
});

export default PayWall;
