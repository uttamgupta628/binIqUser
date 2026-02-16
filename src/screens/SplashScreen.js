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
import {maxWorkers} from '../../metro.config';
import Splash from '../../assets/Splash.svg';
import City from '../../assets/City.svg';

const SplashScreen = () => {
  const navigation = useNavigation();
  // useEffect(()=>{
  //     setTimeout(()=>{
  //         checkUserLogin();
  //     }, 3500)
  // },[])
  // const checkUserLogin = async () => {

  //     const firstTimeAppOpen = await AsyncStorage.getItem('NEW_USER')
  //     if(firstTimeAppOpen == null)
  //     {
  //         navigation.dispatch(StackActions.push('GettingStarted'));
  //     }
  //     else
  //     {
  //         navigation.dispatch(StackActions.replace('HomeNavigator'));
  //     }
  // }
  useEffect(() => {
    setTimeout(() => {
      navigation.navigate('OnBoarding');
    }, 2500);
  }, []);
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
