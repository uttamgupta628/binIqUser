import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { userAPI } from '../../api/apiService';

const TIER_PROGRESS = { free: 0, tier1: 25, tier2: 50, tier3: 100 };
const TOTAL_MONTHS  = 5;

const MILESTONES = [
  'Start your 1st course & Start Reselling today',
  'Master the Blueprint — Learn how to Turn profits daily',
  'Learn how to buy Pallets & Truckloads',
  'Source inventory like a Bin Store Owner',
  'Lucrative Business Opportunity: How to Start a Bin Store',
];

const getPlanKey = profile => {
  const sub = profile?.subscription;
  if (!sub) return 'free';
  if (typeof sub === 'object') return sub.plan || 'free';
  return 'free';
};

// ── Circular Progress Component ──
const CircularProgress = ({ current, total }) => {
  const size        = wp(18);
  const strokeWidth = 5;
  const radius      = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress    = current / total;
  const strokeDash  = circumference * (1 - progress);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Background ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#14BA9C33"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#130160"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDash}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {/* Center text */}
      <Text style={{ fontSize: hp(1.4), fontFamily: 'Nunito-Bold', color: '#130160' }}>
        {current}/{total}
      </Text>
    </View>
  );
};

const Dashboard3 = () => {
  const [loading, setLoading]         = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [monthsUsed, setMonthsUsed]   = useState(0);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileRes = await userAPI.getProfile();
      if (profileRes) {
        const userData = profileRes.user || profileRes;
        setUserProfile(userData);

        const createdAt = userData.createdAt || userData.created_at || null;
        if (createdAt) {
          const created = new Date(createdAt);
          const now     = new Date();
          const months  =
            (now.getFullYear() - created.getFullYear()) * 12 +
            (now.getMonth() - created.getMonth());
          setMonthsUsed(Math.max(0, months));
        }
      }
    } catch (err) {
      console.error('Dashboard3 fetchData error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePressStartNow = () =>
    Linking.openURL('https://www.biniq.net/products/bin-reseller-blueprint?variant=50225218453820');

  const handleKeepGoing = () =>
    Linking.openURL('https://www.biniq.net/collections/training-and-resources');

  const handleEnrollNow = () =>
    Linking.openURL('https://www.biniq.net/products/free-bin-reselling-training?variant=50225215701308');

  const planKey        = getPlanKey(userProfile);
  const topBarProgress = TIER_PROGRESS[planKey] ?? 0;

  const currentMilestone = Math.max(0, Math.min(monthsUsed, TOTAL_MONTHS - 1));

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', minHeight: hp(50) }]}>
        <ActivityIndicator size="large" color="#130160" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>
            Hello,{' '}
            <Text style={styles.name}>{userProfile?.full_name || 'User'}</Text>
          </Text>
          <Text style={styles.subtext}>Here's what you've been up to lately!</Text>
        </View>
        <Image
          source={
            userProfile?.profile_image
              ? { uri: userProfile.profile_image }
              : require('../../../assets/profile_img.png')
          }
          style={styles.profileImage}
        />
      </View>

      {/* ── Tier Progress Bar ── */}
      <View style={styles.progContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${topBarProgress}%` }]} />
        </View>
      </View>

      {/* ── Banner + Cards ── */}
      <View style={styles.bannerContainer}>

        {/* Banner image */}
        <Image
          source={require('../../../assets/slider_1.png')}
          style={styles.bannerImage}
          resizeMode="cover"
        />

        {/* Enroll Now overlay */}
        <TouchableOpacity
          style={styles.enrollOverlayBtn}
          onPress={handleEnrollNow}
          activeOpacity={0.85}>
          <Text style={styles.enrollOverlayText}>Enroll Now</Text>
        </TouchableOpacity>

        {/* ── Bottom Cards ── */}
        <View style={styles.cardsWrapper}>
          <View style={styles.cardsContainer}>

            {/* Card 1: BinIQ Pro */}
            <View style={styles.card}>
              <Text style={styles.uppercardTitle1}>
                Ready to Become a Bin IQ PRO?
              </Text>
              <TouchableOpacity
                style={styles.cardButton}
                onPress={handlePressStartNow}>
                <Text style={styles.buttonText}>Start Now</Text>
              </TouchableOpacity>
            </View>

            {/* Card 2: Unlock Educations */}
            <View style={styles.card}>
              <Text style={styles.uppercardTitle}>UNLOCK EDUCATIONS</Text>

              {/* Circular Progress Graph */}
              <CircularProgress
                current={currentMilestone + 1}
                total={TOTAL_MONTHS}
              />

              {/* Current month label */}
              {/* <Text style={styles.monthLabel}>
                Month {currentMilestone + 1} of {TOTAL_MONTHS}
              </Text> */}

              {/* Only current milestone text */}
              <View style={styles.milestoneRow}>
                <View style={[styles.milestoneDot, styles.dotCurrent]} />
                <Text style={[styles.milestoneText, styles.milestoneTextCurrent]}>
                   {MILESTONES[currentMilestone]}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.cardButton}
                onPress={handleKeepGoing}>
                <Text style={styles.buttonText}>KEEP GOING</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </View>

    </View>
  );
};

export default Dashboard3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(1),
  },
  greetingContainer: {
    flex: 1,
    marginRight: wp(2),
  },
  greeting: {
    fontSize: hp(2.4),
    fontFamily: 'Nunito-Bold',
    color: '#000',
  },
  name: {
    textDecorationLine: 'underline',
  },
  subtext: {
    fontSize: wp(3.5),
    fontFamily: 'Nunito-Bold',
    color: '#524B6B',
  },
  profileImage: {
    width: wp(11),
    height: wp(11),
    borderRadius: 25,
  },

  // ── Tier Progress Bar ──
  progContainer: {
    width: '92%',
    alignSelf: 'center',
    marginBottom: hp(0.5),
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
  },

  // ── Banner ──
  bannerContainer: {
    flex: 1,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: hp(43),
  },

  // ── Enroll Now overlay ──
  enrollOverlayBtn: {
    position: 'absolute',
    top: hp(15),
    left: wp(8),
    backgroundColor: '#22C55E',
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.2),
    borderRadius: 8,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  enrollOverlayText: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
    fontSize: hp(1.8),
  },

  // ── Cards ──
  cardsWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: hp(4),
    paddingHorizontal: wp(4),
    paddingBottom: hp(0.5),
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp(2),
  },
  card: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(2),
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: hp(22),
    backgroundColor: 'rgba(242, 245, 248, 0.92)',
  },
  uppercardTitle: {
    fontSize: wp(3.4),
    color: '#130160',
    fontFamily: 'Nunito-SemiBold',
    textAlign: 'center',
    marginBottom: hp(0.8),
  },
  uppercardTitle1: {
  fontSize: wp(7.7),
  color: '#130160',
  fontFamily: 'Poppins-Bold',
  fontWeight: 'bold', 
  textAlign: 'center',
  marginBottom: hp(0.8),
},

  // ── Month Label ──
  monthLabel: {
    fontSize: hp(1.2),
    fontFamily: 'Nunito-Bold',
    color: '#130160',
    marginTop: hp(0.4),
    textAlign: 'center',
  },

  // ── Milestone Row ──
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp(1.5),
    paddingHorizontal: wp(1),
  },
  milestoneDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: hp(0.4),
    backgroundColor: '#ccc',
    flexShrink: 0,
  },
  dotCurrent: {
    backgroundColor: '#130160',
  },
  milestoneText: {
    flex: 1,
    fontSize: hp(1.15),
    fontFamily: 'Nunito-SemiBold',
    color: '#aaa',
    lineHeight: hp(1.7),
  },
  milestoneTextCurrent: {
    color: '#130160',
    fontFamily: 'Nunito-Bold',
  },

  // ── Card Button ──
  cardButton: {
    backgroundColor: '#130160',
    width: '80%',
    paddingVertical: hp(1),
    marginTop: hp(1),
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.4),
  },
});