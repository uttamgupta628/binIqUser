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
import ProgressBar from '../../Components/ProgressBar';
import {useNavigation} from '@react-navigation/native';
import {userAPI} from '../../api/apiService';

const SCAN_LIMITS = {
  free:  100,
  tier1: 1000,
  tier2: 5000,
  tier3: 10000,
};

const PLAN_META = {
  free:  {label: 'Free Plan', color: '#14BA9C'},
  tier1: {label: 'Tier 1',   color: '#14BA9C'},
  tier2: {label: 'Tier 2',   color: '#7B5EA7'},
  tier3: {label: 'Tier 3',   color: '#E8A020'},
};

const getPlanKey = userProfile => {
  const sub = userProfile?.subscription;
  if (!sub) return 'free';
  if (typeof sub === 'object') return sub.plan || 'free';
  return 'free';
};

const formatExpiry = dateStr => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date)) return null;
  return date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

const getDaysRemaining = dateStr => {
  if (!dateStr) return null;
  const expiry = new Date(dateStr);
  const today  = new Date();
  expiry.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

const Dashboard = ({percentage = 70}) => {
  const navigation = useNavigation();
  const size        = Dimensions.get('window').width * 0.2;
  const strokeWidth = wp(2);
  const center      = size / 2;
  const radius      = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;

  const [loading, setLoading]         = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      if (response) setUserProfile(response.user || response);
    } catch (err) {
      console.error('Dashboard fetchProfile error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Derived: scans ─────────────────────────────────────────
  const planKey         = getPlanKey(userProfile);
  const planMeta        = PLAN_META[planKey] ?? PLAN_META.free;
  const maxScans        = SCAN_LIMITS[planKey] ?? 100;
  const usedScans       = userProfile?.scans_used?.length ?? 0;
  const storageProgress = maxScans > 0 ? Math.min(usedScans / maxScans, 1) : 0;
  const remainingScans  = Math.max(maxScans - usedScans, 0);
  const TIER_ORDER      = {free: 0, tier1: 1, tier2: 2, tier3: 3};
  const planProgress    = (TIER_ORDER[planKey] / 3) * 100;

  // ── Derived: expiry ────────────────────────────────────────
  const isFree         = planKey === 'free';
  const expiryDate     = userProfile?.subscription_end_time;
  const expiryStr      = formatExpiry(expiryDate);
  const daysLeft       = getDaysRemaining(expiryDate);
  const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
  const isExpired      = daysLeft !== null && daysLeft < 0;

  const expiryColor = isExpired      ? '#FF4444'
                    : isExpiringSoon ? '#E8A020'
                    : planMeta.color;

  if (loading) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color="#130160" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={{flex: 1}}>
          <Text style={styles.greeting}>
            Hello,{' '}
            <Text style={styles.name}>{userProfile?.full_name || 'User'}</Text>
          </Text>
          <Text style={styles.subtext}>Here's what you've been up to lately!</Text>
        </View>
        <Image
          source={
            userProfile?.profile_image
              ? {uri: userProfile.profile_image}
              : require('../../../assets/profile_img.png')
          }
          style={styles.profileImage}
        />
      </View>

      {/* ── Main Cards (MY STORAGE — unchanged) ── */}
      <View style={styles.cardsContainer}>
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
              <View style={{width: wp(2), height: wp(2), backgroundColor: '#0049AF', borderRadius: 3}} />
              <Text style={{color: '#000', fontFamily: 'Nunito-Bold', fontSize: hp(1.1)}}> Total Scans </Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{width: wp(2), height: wp(2), backgroundColor: '#FFBB36', borderRadius: 3}} />
              <Text style={{color: '#000', fontFamily: 'Nunito-Bold', fontSize: hp(1.1)}}> Remaining</Text>
            </View>
          </View>
          <View style={styles.cardText}>
            <Text style={{color: '#524B6B', fontFamily: 'Nunito-SemiBold', fontSize: hp(1.2)}}>
              {usedScans >= maxScans
                ? `You've reached your ${maxScans.toLocaleString()} scan limit. Upgrade to scan more!`
                : `You've scanned ${usedScans.toLocaleString()} items. ${remainingScans.toLocaleString()} more scans available — keep finding treasures!`}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Bottom Cards ── */}
      <View style={styles.bottomCardsContainer}>

        {/* Card 1: CURRENT PLAN — same as before */}
        <View style={styles.smallCard}>
          <Text style={styles.uppercardTitle}>CURRENT PLAN</Text>
          <ProgressBar progress={planProgress} tier={planMeta.label} />
        </View>

        {/* Card 2: PLAN EXPIRY — replaces Education Level */}
        <View style={styles.smallCard}>
          <Text style={styles.bottomcard2Title}>Renewal{'\n'}Date</Text>
          <View style={styles.expiryContentWrap}>
            {isFree ? (
              <>
                <Text style={[styles.expiryMainText, {color: '#14BA9C'}]}>Free Plan</Text>
                {/* <Text style={styles.expirySubText}>No Expires</Text> */}
              </>
            ) : isExpired ? (
              <>
                <Text style={[styles.expiryMainText, {color: '#FF4444'}]}>Expired</Text>
                <Text style={[styles.expirySubText, {color: '#FF4444'}]}>{expiryStr || '—'}</Text>
              </>
            ) : isExpiringSoon ? (
              <>
                <Text style={[styles.expiryMainText, {color: '#E8A020'}]}>{daysLeft}d left</Text>
                <Text style={[styles.expirySubText, {color: '#E8A020'}]}>{expiryStr || '—'}</Text>
              </>
            ) : (
              <>
                <Text style={[styles.expiryMainText, {color: planMeta.color}]}>
                  {daysLeft != null ? `${daysLeft}d` : '—'}
                </Text>
                <Text style={styles.expirySubText}>{expiryStr || '—'}</Text>
              </>
            )}
          </View>
        </View>

        {/* Card 3: PLAN TYPE — replaces Inventory Level */}
        {/* <View style={styles.smallCard}>
          <Text style={styles.bottomcard2Title}>PLAN{'\n'}TYPE</Text>
          <View style={styles.expiryContentWrap}>
            <Text style={[styles.expiryMainText, {color: planMeta.color, fontSize: hp(1.8)}]}>
              {planMeta.label}
            </Text>
            {(() => {
              const billingCycle = userProfile?.subscription?.billing_cycle ||
                                   userProfile?.subscription?.interval || null;
              const cycleLabel   = billingCycle === 'yearly'  ? 'Yearly'
                                 : billingCycle === 'monthly' ? 'Monthly'
                                 : isFree ? 'Free' : null;
              return cycleLabel
                ? <Text style={styles.expirySubText}>{cycleLabel}</Text>
                : null;
            })()}
            <View style={[styles.planDot, {backgroundColor: planMeta.color + '33', borderColor: planMeta.color}]}>
              <View style={[styles.planDotInner, {backgroundColor: planMeta.color}]} />
            </View>
          </View>
        </View> */}

      </View>

      {/* ── Access Library Button (unchanged) ── */}
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
  container:    {flex: 1, paddingVertical: 16},
  header:       {flexDirection: 'row', alignItems: 'center', marginBottom: 16},
  greeting:     {fontSize: hp(2.4), fontFamily: 'Nunito-Bold', color: '#000'},
  name:         {color: '#000', fontFamily: 'Nunito-Bold', textDecorationLine: 'underline'},
  subtext:      {fontSize: wp(3.5), color: '#000', fontFamily: 'Nunito-Bold'},
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
  progressText:         {fontSize: 16, fontWeight: 'bold'},
  firstCardProgressBar: {marginTop: '5%', marginBottom: '5%'},
  graphDetailsView: {
    width: '100%',
    height: hp(2),
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cardText: {padding: '1%', paddingHorizontal: '5%'},

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
  bottomcard2Title: {
    fontSize: wp(3.1),
    textAlign: 'center',
    color: '#130160',
    fontFamily: 'Nunito-SemiBold',
  },

  // Expiry & Plan Type card content
  expiryContentWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  expiryMainText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.2),
    textAlign: 'center',
  },
  expirySubText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.2),
    color: '#524B6B',
    textAlign: 'center',
  },
  planDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  planDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
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