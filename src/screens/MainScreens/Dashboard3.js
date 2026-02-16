import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import {Circle} from 'react-native-progress'; // For circular progress
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Svg, {Line, Path} from 'react-native-svg'; // For horizontal progress (e.g., Education Level)
import ProgressBar from '../../Components/ProgressBar';

const Dashboard3 = ({percentage = 70}) => {
  const size = Dimensions.get('window').width * 0.2;
  const strokeWidth = wp(2);
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;

  // Calculate the path for the semi-circle
  const semiCircle = `
      M ${strokeWidth / 2} ${center}
      A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}
    `;

  // Calculate the progress
  const progressLength = circumference * (percentage / 100);
  const strokeDasharray = `${progressLength} ${circumference}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{flex: 1}}>
          <Text style={styles.greeting}>
            Hello, <Text style={styles.name}>Lee Carter</Text>
          </Text>
          <Text style={styles.subtext}>
            Here's what you've been up to lately!
          </Text>
        </View>
        <Image
          source={require('../../../assets/dashboard_profile.png')} // Replace with profile picture
          style={styles.profileImage}
        />
      </View>
      <View style={styles.progContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, {width: `${50}%`}]} />
        </View>
      </View>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          width: wp(90),
          height: hp(43),
          // marginTop: '10%',
        }}>
        <Image
          source={require('../../../assets/slider_1.png')}
          style={{width: wp(99), height: hp(53)}}
        />
        <View
          style={{
            width: wp(90),
            height: hp(3),
            // paddingHorizontal: '5%',
            justifyContent: 'center',
            position: 'absolute',
            bottom: '8%',
          }}>
          {/* <Text
            style={{
              fontFamily: 'Nunito-SemiBold',
              color: '#000',
              fontSize: hp(2.2),
            }}>
            Ready to become a Bin IQ PRO?
          </Text>
          <Text
            style={{
              fontFamily: 'Nunito-SemiBold',
              color: '#667085',
              fontSize: hp(1.4),
            }}>
            Ready to become a Bin IQ PRO? In this training learn the secrets of
            pinpointing the best bin stores, selecting the right items, listing
            effectively, and selling strategically with our proven BinIQ
            blueprint.
          </Text>
          <View style={styles.cardButton}>
            <Text
              style={{
                color: '#fff',
                fontFamily: 'Nunito-SemiBold',
                fontSize: hp(1.4),
                textAlign: 'center',
              }}>
              KEEP GOING
            </Text>
          </View> */}
          <View style={styles.cardsContainer}>
            {/* Upgrade Storage */}
            <View style={styles.card1}>
              <Text style={styles.uppercardTitle}>
                Ready to become a Bin IQ PRO?
              </Text>
              <View style={styles.cardText}>
                <Text
                  style={{
                    color: '#524B6B',
                    fontFamily: 'Nunito-SemiBold',
                    fontSize: hp(1.2),
                  }}>
                  In this training learn the secrets of pinpointing the best bin
                  stores, selecting the right items, listing effectively, and
                  selling strategically with our proven BinIQ blueprint.
                </Text>
              </View>
              <View style={styles.cardButton}>
                <Text
                  style={{
                    color: '#fff',
                    fontFamily: 'Nunito-SemiBold',
                    fontSize: hp(1.4),
                    textAlign: 'center',
                  }}>
                  KEEP GOING
                </Text>
              </View>
            </View>

            {/* Unlock Education */}
            <View style={styles.card}>
              <Text style={styles.uppercardTitle}>UNLOCK EDUCATIONS</Text>
              <Circle
                size={hp(7)}
                progress={0.3}
                showsText={true}
                thickness={4}
                color="#3CD4B8"
                unfilledColor="#DDF4DF"
                textStyle={styles.progressText}
                style={styles.firstCardProgressBar}
              />
              <View style={styles.card2Text}>
                <Text
                  style={{
                    color: '#524B6B',
                    fontFamily: 'Nunito-SemiBold',
                    fontSize: hp(1.2),
                  }}>
                  You're on a roll! You've finished 3 courses. Keep going to
                  unlock the full library of courses and boost your skills!
                </Text>
              </View>
              <View style={styles.cardButton}>
                <Text
                  style={{
                    color: '#fff',
                    fontFamily: 'Nunito-SemiBold',
                    fontSize: hp(1.4),
                    textAlign: 'center',
                  }}>
                  KEEP GOING
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '5%',
    // marginBottom: 16,
  },
  greeting: {
    fontSize: hp(2.4),
    fontFamily: 'Nunito-Bold',
    color: '#000',
  },
  name: {
    color: '#000',
    fontFamily: 'Nunito-Bold',
    textDecorationLine: 'underline',
  },
  subtext: {
    fontSize: wp(3.5),
    color: '#000',
    fontFamily: 'Nunito-Bold',
  },
  profileImage: {
    width: wp(11),
    height: wp(11),
    borderRadius: 25,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // bottom: 0,
    // marginBottom: 16,
  },
  card: {
    flex: 1,
    width: '50%',
    height: hp(26),
    backgroundColor: '#F2F5F8',
    borderRadius: 6,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    paddingVertical: '2.5%',
    alignItems: 'center',
  },
  uppercardTitle: {
    fontSize: wp(3.6),
    color: '#130160',
    fontFamily: 'Nunito-SemiBold',
    // marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 16,
  },
  highlight: {
    color: '#4B9CD3',
    fontWeight: 'bold',
  },

  button: {
    backgroundColor: '#4B9CD3',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallCard: {
    flex: 1,
    backgroundColor: '#F2F5F8',
    borderRadius: 6,
    padding: 16,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    width: '30%',
    height: hp(16),
  },
  smallCardTitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  smallCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  svg: {
    marginVertical: 8,
  },
  firstCardProgressBar: {
    marginTop: '5%',
    marginBottom: '5%',
  },
  graphDetailsView: {
    width: '100%',
    height: hp(2),
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cardText: {
    padding: '1%',
  },
  card2Text: {
    paddingHorizontal: '5%',
  },
  cardButton: {
    backgroundColor: '#130160',
    width: '55%',
    height: hp(3.5),
    marginTop: '3%',
    borderRadius: 5,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A4B',
    marginBottom: 40,
  },
  progressContainer: {
    position: 'absolute',
    alignItems: 'center',
    bottom: 3,
  },
  percentageText: {
    position: 'absolute',
    bottom: 0,
    fontSize: wp(3.5),
    fontWeight: 'bold',
    color: '#000',
  },
  bottomcard2Title: {
    fontSize: wp(3.1),
    textAlign: 'center',
    color: '#130160',
    fontFamily: 'Nunito-SemiBold',
  },
  progContainer: {
    borderRadius: 8,
    width: '95%',
    alignSelf: 'center',
    marginTop: '5%',
  },
  progressBackground: {
    height: hp(1),
    backgroundColor: '#14BA9C33',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#14BA9C',
    borderRadius: 8,
  },
  card: {
    flex: 1,
    width: '50%',
    height: hp(26),
    backgroundColor: '#F2F5F8',
    borderRadius: 6,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    paddingVertical: '2.5%',
    alignItems: 'center',
  },
  card1: {
    flex: 1,
    width: '50%',
    height: hp(26),
    backgroundColor: '#F2F5F8',
    borderRadius: 6,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    paddingHorizontal: '2.5%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uppercardTitle: {
    fontSize: wp(3.6),
    color: '#130160',
    fontFamily: 'Nunito-SemiBold',
    // marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Dashboard3;
