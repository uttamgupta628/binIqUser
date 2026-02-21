import {
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Splash from '../../assets/Splash.svg';
import City from '../../assets/City.svg';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Wait for splash to display (2.5s as before)
      await new Promise(resolve => setTimeout(resolve, 2500));

      const token = await AsyncStorage.getItem('authToken');

      if (token) {
        // ✅ Already logged in → go straight to Home
        navigation.replace('HomeNavigataor');
      } else {
        // ❌ Not logged in → go to OnBoarding
        navigation.replace('OnBoarding');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // On any error, fall back to OnBoarding
      navigation.replace('OnBoarding');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ImageBackground
        source={require('../../assets/vector_1.png')}
        style={styles.vector}>
        <View style={styles.logoContainer}>
          <Splash width={wp(38)} />
          <Text style={styles.logoText}>
            The Largest Amazon Bin Store Network
          </Text>
        </View>
        <City style={styles.cityVector} />
      </ImageBackground>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: wp(40),
    height: hp(10.5),
  },
  vector: {
    flex: 1,
    width: wp(100),
    height: hp(100),
  },
  logoText: {
    fontFamily: 'Nunito-SemiBold',
    color: '#000',
    fontSize: hp(2.5),
    position: 'absolute',
    bottom: '42%',
  },
  cityVector: {
    position: 'absolute',
    width: wp(50),
    bottom: 0,
  },
});
