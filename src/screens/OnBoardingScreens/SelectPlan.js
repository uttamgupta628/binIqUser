import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Pressable,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import FreePlan from '../../../assets/free_plan.svg';
import PremiumPlan from '../../../assets/premium_plan.svg';

const SelectPlan = ({ navigation }) => {
  const [selectPlan, setSelectPlan] = useState(null);

  const handleSelectPlan = () => {
    if (!selectPlan) {
      Alert.alert('No Plan Selected', 'Please select a plan to continue.');
      return;
    }

    if (selectPlan === 'free') {
      // Free plan → go directly to SignUp
      navigation.navigate('SignUp', { selectedPlan: 'free' });
    } else {
      // Premium → go to tier selection screen
      navigation.navigate('SelectPremiumPlan');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor="transparent" />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}>

        <View style={styles.logoHeader}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
          />
        </View>

        <View style={{ flex: 1, top: '23%' }}>
          <View
            style={{
              height: hp(43),
              alignItems: 'center',
              paddingHorizontal: '5%',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>

            <View style={{ height: hp(10), width: '100%' }}>
              <Text style={styles.heading}>Pick Your Plan</Text>
              <Text style={styles.subheading}>
                Select The Plan That Best Suits Your Needs !
              </Text>
            </View>

            <View style={styles.planRow}>
              {/* Free Plan Card */}
              <Pressable
                style={styles.planCard}
                onPress={() => setSelectPlan('free')}>
                <LinearGradient
                  colors={['#D6F0E7', '#E4F3EE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={[
                    styles.planGradient,
                    selectPlan === 'free' && styles.planSelected,
                  ]}>
                  {selectPlan === 'free' && (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                  )}
                  <FreePlan />
                </LinearGradient>
                <Text style={styles.planLabel}>Free Plan</Text>
                <Text style={styles.planPrice}>$0</Text>
              </Pressable>

              {/* Premium Plan Card */}
              <Pressable
                style={styles.planCard}
                onPress={() => setSelectPlan('premium')}>
                <LinearGradient
                  colors={['#D6F0E7', '#E4F3EE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={[
                    styles.planGradient,
                    selectPlan === 'premium' && styles.planSelected,
                  ]}>
                  {selectPlan === 'premium' && (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                  )}
                  <PremiumPlan />
                </LinearGradient>
                <Text style={styles.planLabel}>Premium Plan</Text>
                <Text style={styles.planPrice}>From $29/mo</Text>
              </Pressable>
            </View>

          </View>
        </View>

        <TouchableOpacity style={styles.gettingStarted} onPress={handleSelectPlan}>
          <Text style={styles.gettingStartedText}>
            {selectPlan === 'premium' ? 'Choose Tier →' : 'Select Plan'}
          </Text>
        </TouchableOpacity>

      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  vector: { flex: 1, width: wp(100), height: hp(100) },

  logoHeader: {
    position: 'absolute',
    zIndex: 1,
    alignItems: 'flex-end',
    paddingRight: '3%',
    height: hp(13),
    width: '100%',
  },
  logo: { marginTop: hp(7), width: wp(28), height: hp(5) },

  heading: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(3.6),
    color: '#14BA9C',
  },
  subheading: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(2),
    color: '#524B6B',
  },

  planRow: {
    height: hp(28),
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planCard: {
    height: hp(28),
    width: '48%',
    justifyContent: 'space-between',
  },
  planGradient: {
    height: hp(22),
    width: '100%',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#14BA9C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planSelected: {
    borderWidth: 2.5,
    borderColor: '#14BA9C',
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#14BA9C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  planLabel: {
    textAlign: 'center',
    fontFamily: 'Nunito-SemiBold',
    color: '#130160',
    fontSize: wp(4.2),
  },
  planPrice: {
    textAlign: 'center',
    fontFamily: 'Nunito-Regular',
    color: '#14BA9C',
    fontSize: wp(3.5),
  },

  gettingStarted: {
    position: 'absolute',
    backgroundColor: '#130160',
    width: '90%',
    height: hp(7),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    bottom: '5%',
  },
  gettingStartedText: {
    fontFamily: 'Nunito-SemiBold',
    color: '#fff',
    fontSize: hp(2.4),
  },
});

export default SelectPlan;