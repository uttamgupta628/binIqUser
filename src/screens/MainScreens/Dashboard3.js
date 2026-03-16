import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {Circle} from 'react-native-progress';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {userAPI, productsAPI} from '../../api/apiService';

const Dashboard3 = ({percentage = 70}) => {
  const size        = Dimensions.get('window').width * 0.2;
  const strokeWidth = wp(2);
  const center      = size / 2;
  const radius      = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const progressLength  = circumference * (percentage / 100);
  const strokeDasharray = `${progressLength} ${circumference}`;

  // ── State ──────────────────────────────────────────────────────────
  const [loading, setLoading]           = useState(true);
  const [userProfile, setUserProfile]   = useState(null);
  const [coursesProgress, setCoursesProgress] = useState({
    completed: 0,
    total: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // ── Fetch user profile ──
      const profileRes = await userAPI.getProfile();
      if (profileRes) {
        const userData = profileRes.user || profileRes;
        setUserProfile(userData);

        // ── Derive courses progress from promotions or products ──
        // promotions array on user = courses they've engaged with
        const completedCourses = userData.promotions?.length || 0;
        setCoursesProgress({
          completed: completedCourses,
          total:     Math.max(completedCourses, 5), // minimum total of 5
        });
      }
    } catch (err) {
      console.error('Dashboard3 fetchData error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────
  const courseProgressValue = coursesProgress.total > 0
    ? coursesProgress.completed / coursesProgress.total
    : 0;

  // Progress bar value for top bar — based on subscription tier
  const TIER_PROGRESS = {free: 0, tier1: 25, tier2: 50, tier3: 100};
  const getPlanKey = profile => {
    const sub = profile?.subscription;
    if (!sub) return 'free';
    if (typeof sub === 'object') return sub.plan || 'free';
    return 'free';
  };
  const planKey      = getPlanKey(userProfile);
  const topBarProgress = TIER_PROGRESS[planKey] ?? 0;

  if (loading) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center', height: hp(50)}]}>
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
            Hello, <Text style={styles.name}>{userProfile?.full_name || 'User'}</Text>
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

      {/* ✅ Top progress bar — reflects subscription tier */}
      <View style={styles.progContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, {width: `${topBarProgress}%`}]} />
        </View>
      </View>

      <View style={{justifyContent: 'center', alignItems: 'center', width: wp(90), height: hp(43)}}>
        <Image
          source={require('../../../assets/slider_1.png')}
          style={{width: wp(99), height: hp(53)}}
        />
        <View style={{
          width: wp(90), height: hp(3),
          justifyContent: 'center', position: 'absolute', bottom: '8%',
        }}>
          <View style={styles.cardsContainer}>
            {/* BinIQ PRO card */}
            <View style={styles.card1}>
              <Text style={styles.uppercardTitle}>Ready to become a Bin IQ PRO?</Text>
              <View style={styles.cardText}>
                <Text style={{color: '#524B6B', fontFamily: 'Nunito-SemiBold', fontSize: hp(1.2)}}>
                  In this training learn the secrets of pinpointing the best bin
                  stores, selecting the right items, listing effectively, and
                  selling strategically with our proven BinIQ blueprint.
                </Text>
              </View>
              <View style={styles.cardButton}>
                <Text style={{color: '#fff', fontFamily: 'Nunito-SemiBold', fontSize: hp(1.4), textAlign: 'center'}}>
                  KEEP GOING
                </Text>
              </View>
            </View>

            {/* ✅ UNLOCK EDUCATIONS — real courses progress */}
            <View style={styles.card}>
              <Text style={styles.uppercardTitle}>UNLOCK EDUCATIONS</Text>
              <Circle
                size={hp(7)}
                progress={courseProgressValue}
                showsText={true}
                formatText={() => `${coursesProgress.completed}/${coursesProgress.total}`}
                thickness={4}
                color="#3CD4B8"
                unfilledColor="#DDF4DF"
                textStyle={{fontSize: hp(1.4), fontWeight: 'bold'}}
                style={styles.firstCardProgressBar}
              />
              <View style={styles.card2Text}>
                <Text style={{color: '#524B6B', fontFamily: 'Nunito-SemiBold', fontSize: hp(1.2)}}>
                  {coursesProgress.completed === 0
                    ? "Start your first course and begin your reselling journey!"
                    : coursesProgress.completed >= coursesProgress.total
                    ? "Amazing! You've completed all available courses!"
                    : `You're on a roll! You've finished ${coursesProgress.completed} course${coursesProgress.completed !== 1 ? 's' : ''}. Keep going to unlock more!`}
                </Text>
              </View>
              <View style={styles.cardButton}>
                <Text style={{color: '#fff', fontFamily: 'Nunito-SemiBold', fontSize: hp(1.4), textAlign: 'center'}}>
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
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center', marginTop: '5%'},
  greeting: {fontSize: hp(2.4), fontFamily: 'Nunito-Bold', color: '#000'},
  name: {color: '#000', fontFamily: 'Nunito-Bold', textDecorationLine: 'underline'},
  subtext: {fontSize: wp(3.5), color: '#000', fontFamily: 'Nunito-Bold'},
  profileImage: {width: wp(11), height: wp(11), borderRadius: 25},
  cardsContainer: {flexDirection: 'row', justifyContent: 'space-between'},
  card: {
    flex: 1, width: '50%', height: hp(26),
    backgroundColor: '#F2F5F8', borderRadius: 6, marginHorizontal: 5,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    paddingVertical: '2.5%', alignItems: 'center',
  },
  card1: {
    flex: 1, width: '50%', height: hp(26),
    backgroundColor: '#F2F5F8', borderRadius: 6, marginHorizontal: 5,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    paddingHorizontal: '2.5%', alignItems: 'center', justifyContent: 'center',
  },
  uppercardTitle: {fontSize: wp(3.6), color: '#130160', fontFamily: 'Nunito-SemiBold'},
  firstCardProgressBar: {marginTop: '5%', marginBottom: '5%'},
  card2Text: {paddingHorizontal: '5%'},
  cardText: {padding: '1%'},
  cardButton: {
    backgroundColor: '#130160', width: '55%',
    height: hp(3.5), marginTop: '3%',
    borderRadius: 5, justifyContent: 'center',
  },
  progContainer: {
    borderRadius: 8, width: '95%',
    alignSelf: 'center', marginTop: '5%',
  },
  progressBackground: {
    height: hp(1), backgroundColor: '#14BA9C33',
    borderRadius: 8, overflow: 'hidden',
  },
  progressFill: {height: '100%', backgroundColor: '#14BA9C', borderRadius: 8},
  progressText: {fontSize: 16, fontWeight: 'bold'},
});

export default Dashboard3;