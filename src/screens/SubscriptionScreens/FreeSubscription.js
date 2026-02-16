import {Animated, StyleSheet, Text, View} from 'react-native';
import React, {useRef} from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import GreenCheck from '../../../assets/green_check.svg';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';

const FreeSubscription = () => {
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
      <View
        style={{
          width: '85%',
          alignSelf: 'center',
          height: hp(10),
          borderRadius: 14,
          backgroundColor: '#334155',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <View
          style={{
            width: '30%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: '#fff',
              fontFamily: 'DMSans-Regular',
              fontSize: wp(3.4),
            }}>
            Subscrition
          </Text>
        </View>
        <View
          style={{
            width: '50%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: '#fff',
              fontFamily: 'DMSans-Regular',
              fontSize: wp(6),
            }}>
            Premium
          </Text>
        </View>
      </View>
      <View
        style={{
          height: hp(40),
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
            }}>
            Become a Bin IQ PRO Today!
          </Text>
        </View>
        <View style={{height: '65%', justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row'}}>
            <GreenCheck size={30} />
            <Text
              style={{
                fontFamily: 'DMSans-SemiBold',
                color: '#64748B',
                fontSize: wp(4.7),
              }}>
              {'  '}Advanced Library Access
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
              {'  '}Inventory Management Tools
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
              {'  '}Educational Resources
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
              {'  '}Customer Support
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
              {'  '}Secure Scans
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
              {'  '}Storage for Scanned items
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          position: 'absolute',
          height: hp(33),
          bottom: 0,
          width: '100%',
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          backgroundColor: '#F1F5F9',
        }}>
        <View style={{width: '100%'}}>
          <Text
            style={{
              color: '#121826',
              fontWeight: 'bold',
              fontSize: hp(3),
              alignSelf: 'center',
            }}>
            Pick your plan
          </Text>
        </View>
        <View
          style={{
            width: '90%',
            height: '42%',
            flexDirection: 'row',
            alignSelf: 'center',
            marginVertical: '2%',
          }}>
          <View style={{width: '33.5%', height: '100%', padding: '1%'}}>
            <View
              style={{
                width: '100%',
                height: '100%',
                borderWidth: 1,
                borderColor: '#14BA9C',
                borderRadius: 8,
                backgroundColor: '#fff',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Nunito-Bold',
                  color: '#000',
                  fontSize: hp(2.5),
                }}>
                Tier 1
              </Text>
              <Text
                style={{
                  fontFamily: 'Nunito-SemiBold',
                  color: '#130160',
                  fontSize: hp(2.2),
                }}>
                $29.97/{'\n'}month
              </Text>
            </View>
          </View>
          <View style={{width: '33.5%', height: '100%', padding: '1%'}}>
            <View
              style={{
                width: '100%',
                height: '100%',
                borderWidth: 2,
                borderColor: '#14BA9C',
                borderRadius: 8,
                backgroundColor: '#fff',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Nunito-Bold',
                  color: '#000',
                  fontSize: hp(2.5),
                }}>
                Tier 2
              </Text>
              <Text
                style={{
                  fontFamily: 'Nunito-SemiBold',
                  color: '#130160',
                  fontSize: hp(2.2),
                }}>
                $59.97/{'\n'}month
              </Text>
            </View>
          </View>
          <View style={{width: '33.5%', height: '100%', padding: '1%'}}>
            <View
              style={{
                width: '100%',
                height: '100%',
                borderWidth: 1,
                borderColor: '#14BA9C',
                borderRadius: 8,
                backgroundColor: '#fff',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Nunito-Bold',
                  color: '#000',
                  fontSize: hp(2.5),
                }}>
                Tier 3
              </Text>
              <Text
                style={{
                  fontFamily: 'Nunito-SemiBold',
                  color: '#130160',
                  fontSize: hp(2.2),
                }}>
                $99.97/{'\n'}month
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
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

export default FreeSubscription;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gettingStarted: {
    backgroundColor: '#130160',
    width: '90%',
    height: hp(7),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: '4%',
  },
  buttonContainer: {
    width: '90%',
    alignSelf: 'center',
    // marginTop: '15%',
  },
  buttonText: {
    fontFamily: 'Nunito-SemiBold',
    color: '#fff',
    fontSize: hp(2.2),
  },
});
