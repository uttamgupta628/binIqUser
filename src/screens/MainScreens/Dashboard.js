import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {Circle} from 'react-native-progress'; // For circular progress
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Svg, {Line, Path} from 'react-native-svg'; // For horizontal progress (e.g., Education Level)
import ProgressBar from '../../Components/ProgressBar';
import {useNavigation} from '@react-navigation/native';
import {userAPI} from '../../api/apiService';

const Dashboard = ({percentage = 70}) => {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        if (response) {
          const userData = response.user || response;
          setFullName(userData.full_name || 'User');
        }
      } catch (err) {
        console.error('Error fetching profile in Dashboard:', err);
        setFullName('User');
      } finally {
        setLoadingUser(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{flex: 1}}>
          <Text style={styles.greeting}>
            Hello,{' '}
            {loadingUser ? (
              <ActivityIndicator size="small" color="#130160" />
            ) : (
              <Text style={styles.name}>{fullName}</Text>
            )}
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

      {/* Main Cards */}
      <View style={styles.cardsContainer}>
        {/* Upgrade Storage */}
        <View style={styles.card}>
          <Text style={styles.uppercardTitle}>MY STORAGE</Text>
          <Circle
            size={hp(10)}
            progress={0.8}
            showsText={true}
            thickness={5}
            color="#3CD4B8"
            unfilledColor="#DDF4DF"
            textStyle={styles.progressText}
            style={styles.firstCardProgressBar}
          />
          <View style={styles.graphDetailsView}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <View
                style={{
                  width: wp(2),
                  height: wp(2),
                  backgroundColor: '#0049AF',
                  borderRadius: 3,
                }}
              />
              <Text
                style={{
                  color: '#000',
                  fontFamily: 'Nunito-Bold',
                  fontSize: hp(1.1),
                }}>
                {' '}
                Total Scans{' '}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <View
                style={{
                  width: wp(2),
                  height: wp(2),
                  backgroundColor: '#FFBB36',
                  borderRadius: 3,
                }}
              />
              <Text
                style={{
                  color: '#000',
                  fontFamily: 'Nunito-Bold',
                  fontSize: hp(1.1),
                }}>
                {' '}
                Remaining Scans
              </Text>
            </View>
          </View>
          <View style={styles.cardText}>
            <Text
              style={{
                color: '#524B6B',
                fontFamily: 'Nunito-SemiBold',
                fontSize: hp(1.2),
              }}>
              Awesome job! Youve scanned 6,000 items already.You have 4,000 more
              scans available—lets find more hidden treasures!
            </Text>
          </View>
        </View>

        {/* Unlock Education */}
        {/* <View style={styles.card}>
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
              You're on a roll! You've finished 3 courses. Keep going to unlock
              the full library of courses and boost your skills!
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
        </View> */}
      </View>

      {/* Bottom Cards */}
      <View style={styles.bottomCardsContainer}>
        {/* Current Plan */}
        <View style={styles.smallCard}>
          <Text style={styles.uppercardTitle}>CURRENT PLAN</Text>
          <ProgressBar progress={50} tier="Tier 1" />
        </View>

        {/* Education Level */}
        <View style={styles.smallCard}>
          <Text style={styles.bottomcard2Title}>EDUCATION{'\n'}LEVEL</Text>
          <View style={styles.progressContainer}>
            <Svg width={size} height={size / 2 + strokeWidth / 2}>
              {/* Background path */}
              <Path
                d={semiCircle}
                fill="none"
                stroke="#E5E5E5"
                strokeWidth={strokeWidth}
              />
              {/* Progress path */}
              <Path
                d={semiCircle}
                fill="none"
                stroke="#14BA9C"
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeLinecap="round"
              />
            </Svg>
            <Text style={styles.percentageText}>{percentage}%</Text>
          </View>
        </View>

        {/* Inventory Level */}
        <View style={styles.smallCard}>
          <Text style={styles.bottomcard2Title}>INVENTORY LEVEL</Text>
          <ProgressBar progress={50} tier="700 Items" />
        </View>
      </View>
      <View style={styles.enrollNowContainer}>
        <Pressable
          style={styles.libButton}
          onPress={() => navigation.navigate('MyLibrary')}>
          <Text style={styles.liBbuttonText}>Access library</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#f8f9fa",
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 16,
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
    paddingHorizontal: '5%',
  },
  card2Text: {
    paddingHorizontal: '5%',
  },
  cardButton: {
    backgroundColor: '#130160',
    width: '80%',
    height: hp(3),
    margin: '10%',
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
  tier: {
    color: '#1A1A4B',
    fontSize: hp(1.5),
    marginVertical: '15%',
    textAlign: 'left',
  },
  enrollNowContainer: {
    width: wp(95),
    // height: hp(13),
    alignSelf: 'center',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  libButton: {
    backgroundColor: '#130160',
    width: '95%',
    height: hp(3.5),
    borderRadius: 7,
    justifyContent: 'center',
    marginTop: '2.5%',
  },
  liBbuttonText: {
    color: 'white',
    fontSize: hp(1.4),
    fontFamily: 'Nunito-Bold',
    textAlign: 'center',
  },
});

export default Dashboard;
