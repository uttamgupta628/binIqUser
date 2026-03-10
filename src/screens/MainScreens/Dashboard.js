import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {Circle} from 'react-native-progress';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Svg, {Path} from 'react-native-svg';
import ProgressBar from '../../Components/ProgressBar';
import {useNavigation} from '@react-navigation/native';
import {userAPI} from '../../api/apiService';

const SCAN_LIMITS = {
  free: 100,
  tier1: 1000,
  tier2: 5000,
  tier3: 10000,
};

const PLAN_META = {
  free: {label: 'Free Plan', color: '#14BA9C'},
  tier1: {label: 'Tier 1', color: '#14BA9C'},
  tier2: {label: 'Tier 2', color: '#7B5EA7'},
  tier3: {label: 'Tier 3', color: '#E8A020'},
};

const getPlanKey = userProfile => {
  const sub = userProfile?.subscription;
  if (!sub) return 'free';
  if (typeof sub === 'object') return sub.plan || 'free';
  return 'free';
};

const Dashboard = ({percentage = 70}) => {
  const navigation = useNavigation();
  const size = Dimensions.get('window').width * 0.2;
  const strokeWidth = wp(2);
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;

  const semiCircle = `
    M ${strokeWidth / 2} ${center}
    A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}
  `;
  const progressLength = circumference * (percentage / 100);
  const strokeDasharray = `${progressLength} ${circumference}`;

  // ── State ──────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      if (response) {
        setUserProfile(response.user || response);
      }
      
    } catch (err) {
      console.error('Dashboard fetchProfile error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Derived values ─────────────────────────────────────────────────
  const planKey = getPlanKey(userProfile);
  const planMeta = PLAN_META[planKey] ?? PLAN_META.free;
  const maxScans = SCAN_LIMITS[planKey] ?? 100;
  const usedScans = userProfile?.scans_used?.length ?? 0;
  const storageProgress = maxScans > 0 ? Math.min(usedScans / maxScans, 1) : 0;
  const remainingScans = Math.max(maxScans - usedScans, 0);

  // Current plan progress (0–100) based on tier order
  const TIER_ORDER = {free: 0, tier1: 1, tier2: 2, tier3: 3};
  const planProgress = (TIER_ORDER[planKey] / 3) * 100;

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <ActivityIndicator size="large" color="#130160" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{flex: 1}}>
          <Text style={styles.greeting}>
            Hello,{' '}
            <Text style={styles.name}>{userProfile?.full_name || 'User'}</Text>
          </Text>
          <Text style={styles.subtext}>
            Here's what you've been up to lately!
          </Text>
        </View>
        <Image
          source={
            userProfile?.profile_image
              ? {uri: userProfile.profile_image}
              : require('../../../assets/dashboard_profile.png')
          }
          style={styles.profileImage}
        />
      </View>

      {/* Main Cards */}
      <View style={styles.cardsContainer}>
        {/* MY STORAGE — real scan data */}
        <View style={styles.card}>
          <Text style={styles.uppercardTitle}>MY STORAGE</Text>
          <Circle
            size={hp(10)}
            progress={storageProgress}
            showsText={true}
            formatText={() => `${Math.round(storageProgress * 100)}%`}
            thickness={5}
            color={planMeta.color}
            unfilledColor="#DDF4DF"
            textStyle={styles.progressText}
            style={styles.firstCardProgressBar}
          />
          <View style={styles.graphDetailsView}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                Remaining
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
              {usedScans >= maxScans
                ? `You've reached your ${maxScans.toLocaleString()} scan limit. Upgrade to scan more!`
                : `You've scanned ${usedScans.toLocaleString()} items. ${remainingScans.toLocaleString()} more scans available — keep finding treasures!`}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Cards */}
      <View style={styles.bottomCardsContainer}>
        {/* CURRENT PLAN — real plan from profile */}
        <View style={styles.smallCard}>
          <Text style={styles.uppercardTitle}>CURRENT PLAN</Text>
          <ProgressBar progress={planProgress} tier={planMeta.label} />
        </View>

        {/* EDUCATION LEVEL — semi-circle (static for now, no backend endpoint) */}
        <View style={styles.smallCard}>
          <Text style={styles.bottomcard2Title}>EDUCATION{'\n'}LEVEL</Text>
          <View style={styles.progressContainer}>
            <Svg width={size} height={size / 2 + strokeWidth / 2}>
              <Path
                d={semiCircle}
                fill="none"
                stroke="#E5E5E5"
                strokeWidth={strokeWidth}
              />
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

        {/* INVENTORY LEVEL — real scans_used count */}
        <View style={styles.smallCard}>
          <Text style={styles.bottomcard2Title}>INVENTORY{'\n'}LEVEL</Text>
          <ProgressBar
            progress={storageProgress * 100}
            tier={`${usedScans.toLocaleString()} Items`}
          />
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
  container: {flex: 1, paddingVertical: 16},
  header: {flexDirection: 'row', alignItems: 'center', marginBottom: 16},
  greeting: {fontSize: hp(2.4), fontFamily: 'Nunito-Bold', color: '#000'},
  name: {
    color: '#000',
    fontFamily: 'Nunito-Bold',
    textDecorationLine: 'underline',
  },
  subtext: {fontSize: wp(3.5), color: '#000', fontFamily: 'Nunito-Bold'},
  profileImage: {width: wp(11), height: wp(11), borderRadius: 25},
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
  },
  progressText: {fontSize: 16, fontWeight: 'bold'},
  bottomCardsContainer: {flexDirection: 'row', justifyContent: 'space-between'},
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
  firstCardProgressBar: {marginTop: '5%', marginBottom: '5%'},
  graphDetailsView: {
    width: '100%',
    height: hp(2),
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cardText: {padding: '1%', paddingHorizontal: '5%'},
  progressContainer: {position: 'absolute', alignItems: 'center', bottom: 3},
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
  enrollNowContainer: {
    width: wp(95),
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
