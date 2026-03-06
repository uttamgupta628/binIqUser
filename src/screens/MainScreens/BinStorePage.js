import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import React, {useState, useEffect} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import LocationIcon from '../../../assets/LocationIcon.svg';
import FacebookIcon from '../../../assets/FacebookIcon.svg';
import TwitterIcon from '../../../assets/TwitterIcon.svg';
import WhatsappIcon from '../../../assets/WhatsappIcon.svg';
import LinkedinIcon from '../../../assets/LinkedinIcon.svg';
import Heart_Icon from '../../../assets/heart_icon.svg';
import Share_Icon from '../../../assets/share_icon.svg';
import HiddenFindsImg from '../../../assets/hidden_find_img.svg';
import BoldTick from '../../../assets/bold_tick.svg';
import GreenTick from '../../../assets/green_tick.svg';
import {Star} from 'lucide-react-native';
import {storesAPI, userAPI} from '../../api/apiService';
import {Alert} from 'react-native';

const {width} = Dimensions.get('window');

// ─── Static fallbacks ──────────────────────────────────────────
const STORE_FALLBACK = require('../../../assets/flip_find.png');
const PRODUCT_FALLBACK = require('../../../assets/gray_img.png');
const CAROUSEL_FALLBACK = require('../../../assets/bin_store_img.png');
const PROMO_FALLBACK = require('../../../assets/dummy_product.png');

// ─── SmartImage: backend URI → static fallback ─────────────────
const SmartImage = ({uri, fallback, style, resizeMode = 'cover'}) => {
  const [failed, setFailed] = useState(false);
  if (uri && !failed) {
    return (
      <Image
        source={{uri}}
        style={style}
        resizeMode={resizeMode}
        onError={() => setFailed(true)}
      />
    );
  }
  return <Image source={fallback} style={style} resizeMode={resizeMode} />;
};

// ─── Trending Product Card ─────────────────────────────────────
const TrendingCard = ({item, onPress}) => {
  const imageUri = item.images?.[0] || item.image || item.product_image || null;
  return (
    <TouchableOpacity
      style={styles.trendingCard}
      onPress={onPress}
      activeOpacity={0.85}>
      <SmartImage
        uri={imageUri}
        fallback={PRODUCT_FALLBACK}
        style={styles.trendingImg}
      />
      <Pressable style={styles.trendingHeart}>
        <View style={styles.heartBg}>
          <Ionicons name="heart-outline" size={hp(2.2)} color="#EE2525" />
        </View>
      </Pressable>
      <View style={styles.trendingInfo}>
        <Text style={styles.trendingTitle} numberOfLines={2}>
          {item.description || item.name || item.product_name || 'Product'}
        </Text>
      </View>
      <View style={styles.trendingPrice}>
        <Text style={styles.discountPrice}>
          ${item.discountPrice || item.price || item.discounted_price || '0'}
        </Text>
        {(item.originalPrice || item.original_price) && (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.originalPrice}>
              ${item.originalPrice || item.original_price}
            </Text>
            {(item.totalDiscount || item.discount_percentage) && (
              <Text style={styles.discountPct}>
                {'  '}
                {item.totalDiscount || `${item.discount_percentage}% off`}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ─── Promotion Card ────────────────────────────────────────────
const PromoCard = ({item, onPress}) => {
  const imageUri = item.images?.[0] || item.image || item.promo_image || null;
  return (
    <TouchableOpacity
      style={styles.promoCard}
      onPress={onPress}
      activeOpacity={0.85}>
      <SmartImage
        uri={imageUri}
        fallback={PROMO_FALLBACK}
        style={styles.promoImg}
      />
      <Ionicons
        name="heart"
        size={hp(2.5)}
        color="#EE2525"
        style={styles.promoHeart}
      />
      <Text style={styles.promoName} numberOfLines={1}>
        {item.name || 'Product'}
      </Text>
      <Text style={styles.promoSubtitle} numberOfLines={1}>
        {item.subtitle || item.store_name || ''}
      </Text>
      <View style={styles.promoRating}>
        <Star size={12} color="#FFD700" fill="#FFD700" />
        <Text style={styles.ratingVal}>{item.rating || '4.8'}</Text>
        <Text style={styles.reviewCount}>{item.reviews || '0'} Reviews</Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Carousel Slide ────────────────────────────────────────────
const CarouselSlide = ({item}) => (
  <View style={styles.slide}>
    <SmartImage
      uri={item.uri || null}
      fallback={CAROUSEL_FALLBACK}
      style={styles.slideImg}
    />
  </View>
);

// ─── Main Page ─────────────────────────────────────────────────
const BinStorePage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const store = route.params?.store || {};
  const [activeSlide, setActiveSlide] = useState(0);

  // ✅ Like state — initialised from store data passed via navigation
  const [likes, setLikes] = useState(
    typeof store.likes === 'number' ? store.likes : parseInt(store.likes) || 0,
  );
  const [isLiked, setIsLiked] = useState(false);

  // ✅ Follow state — initialised from store data passed via navigation
  const [followers, setFollowers] = useState(
    typeof store.followers === 'number'
      ? store.followers
      : parseInt(store.followers) || 0,
  );
  const [isFollowing, setIsFollowing] = useState(false);

  // ✅ Check-in state
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // ✅ On mount: fetch full store details + current user profile,
  //    then check if userId is in liked_by / followed_by arrays.
  //    This ensures liked/following state is restored after navigating back.
  useEffect(() => {
    const loadStoreState = async () => {
      try {
        const [storeDetails, userProfile] = await Promise.all([
          storesAPI.getDetails(store._id), // GET /api/stores/:store_id
          userAPI.getProfile(), // GET /api/user/profile
        ]);

        const userId = userProfile?._id?.toString();

        if (storeDetails) {
          // Restore accurate counts from backend
          setLikes(storeDetails.likes || 0);
          setFollowers(storeDetails.followers || 0);

          // Check if current user already liked this store
          const alreadyLiked = storeDetails.liked_by?.some(
            id => id.toString() === userId,
          );
          setIsLiked(!!alreadyLiked);

          // Check if current user already follows this store
          const alreadyFollowing = storeDetails.followed_by?.some(
            id => id.toString() === userId,
          );
          setIsFollowing(!!alreadyFollowing);

          // ✅ Check if current user already checked in to this store
          const alreadyCheckedIn = storeDetails.checked_in_by?.some(
            id => id.toString() === userId,
          );
          setIsCheckedIn(!!alreadyCheckedIn);
        }
      } catch (e) {
        console.error('loadStoreState:', e);
      }
    };

    if (store._id) loadStoreState();
  }, [store._id]);

  // ✅ Like handler — optimistic update, revert on failure
  const handleLike = async () => {
    const wasLiked = isLiked;
    const prevLikes = likes;

    // Optimistic update
    setIsLiked(!wasLiked);
    setLikes(prev => (wasLiked ? Math.max(0, prev - 1) : prev + 1));

    try {
      await storesAPI.like(store._id);
    } catch (e) {
      console.error('Like failed:', e);
      // Revert on error
      setIsLiked(wasLiked);
      setLikes(prevLikes);
    }
  };

  // ✅ Follow handler — optimistic update, revert on failure
  const handleFollow = async () => {
    const wasFollowing = isFollowing;
    const prevFollowers = followers;

    // Optimistic update
    setIsFollowing(!wasFollowing);
    setFollowers(prev => (wasFollowing ? Math.max(0, prev - 1) : prev + 1));

    try {
      await storesAPI.follow(store._id);
    } catch (e) {
      console.error('Follow failed:', e);
      // Revert on error
      setIsFollowing(wasFollowing);
      setFollowers(prevFollowers);
    }
  };

  // ✅ Check-in handler — optimistic update, revert on failure
  const handleCheckIn = async () => {
    const wasCheckedIn = isCheckedIn;

    // Optimistic update
    setIsCheckedIn(!wasCheckedIn);

    try {
      await storesAPI.checkIn(store._id);
      Alert.alert(
        wasCheckedIn ? 'Checked Out' : 'Checked In!',
        wasCheckedIn
          ? `You have checked out of ${storeName}`
          : `You are now checked in at ${storeName}`,
      );
    } catch (e) {
      console.error('Check-in failed:', e);
      // Revert on error
      setIsCheckedIn(wasCheckedIn);
      Alert.alert('Error', 'Check-in failed. Please try again.');
    }
  };
  const formatCount = count => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const carouselImages = (() => {
    if (store.images?.length > 0)
      return store.images.map((uri, i) => ({id: i, uri}));
    if (store.store_image) return [{id: 0, uri: store.store_image}];
    return [
      {id: 0, uri: null},
      {id: 1, uri: null},
      {id: 2, uri: null},
    ];
  })();

  const trendingProducts =
    store.products?.length > 0
      ? store.products
      : [
          {
            id: '1',
            description: `IWC Pilot's Watch 44mm`,
            discountPrice: '$65',
            originalPrice: '$151',
            totalDiscount: '60% off',
          },
          {
            id: '2',
            description: 'Labbin White Sneakers',
            discountPrice: '$650',
            originalPrice: '$125',
            totalDiscount: '70% off',
          },
          {
            id: '3',
            description: `Mammon Women's Handbag`,
            discountPrice: '$75',
            originalPrice: '$199',
            totalDiscount: '60% off',
          },
          {
            id: '4',
            description: `IWC Pilot's Watch 44mm`,
            discountPrice: '$65',
            originalPrice: '$151',
            totalDiscount: '60% off',
          },
          {
            id: '5',
            description: 'Labbin White Sneakers',
            discountPrice: '$650',
            originalPrice: '$125',
            totalDiscount: '70% off',
          },
        ];

  const promotions =
    store.promotions?.length > 0
      ? store.promotions
      : [
          {
            id: '1',
            name: 'TMA-2 HD Wireless',
            subtitle: 'Hidden Finds',
            rating: 4.8,
            reviews: 88,
          },
          {
            id: '2',
            name: 'TMA-2 HD Wireless',
            subtitle: 'ANC Store',
            rating: 4.8,
            reviews: 88,
          },
          {
            id: '3',
            name: 'TMA-2 HD Wireless',
            subtitle: 'Hidden Finds',
            rating: 4.8,
            reviews: 88,
          },
        ];

  const storeName = store.store_name || 'Hidden Finds';
  const website = store.website_url || 'www.hiddenfinds.com';
  const address = store.address || '—';
  const phone = store.phone_number || '—';
  const email = store.store_email || '—';
  const avgRating = store.ratings || 4.0;
  const reviewCount = store.rating_count || 56890;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar translucent backgroundColor="transparent" />

      {/* ── Hero ── */}
      <View style={styles.heroBg}>
        <View style={styles.header}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color="#C4C4C4" size={25} />
            </Pressable>
            <Text style={styles.headerText}>{storeName}</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
            {/* ✅ Toggles heart-outline → heart (filled) so user clearly sees liked state */}
            <Pressable onPress={handleLike} style={styles.headerHeart}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={hp(3.5)}
                color={isLiked ? '#EE2525' : '#C4C4C4'}
              />
            </Pressable>
            <Pressable>
              <Share_Icon height={hp(4)} />
            </Pressable>
          </View>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.storeLogoWrapper}>
            {store.store_image ? (
              <SmartImage
                uri={store.store_image}
                fallback={STORE_FALLBACK}
                style={styles.storeLogo}
              />
            ) : (
              <HiddenFindsImg width="95%" />
            )}
          </View>
          <View style={styles.storeInfoCol}>
            <View style={styles.storeNameRow}>
              <Text style={styles.storeNameText} numberOfLines={1}>
                {storeName}
              </Text>
              <BoldTick width={20} />
            </View>

            {/* ✅ Stats row — shows live likes and followers counts */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatCount(followers)}
                  {'\n'}
                  <Text style={styles.statLabel}>Followers</Text>
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatCount(likes)}
                  {'\n'}
                  <Text style={styles.statLabel}>Likes</Text>
                </Text>
              </View>
            </View>

            <Text style={styles.websiteText}>{website}</Text>

            {/* ✅ Follow button — toggles follow/unfollow with live count */}
            <View style={styles.followBtnWrapper}>
              <TouchableOpacity
                style={[styles.followBtn, isFollowing && styles.followingBtn]}
                onPress={handleFollow}>
                <Text
                  style={[
                    styles.followBtnText,
                    isFollowing && styles.followingBtnText,
                  ]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* ── Actions ── */}
      <View style={styles.actionRow}>
        {/* ✅ toggles checked-in state and saves to backend */}
        <TouchableOpacity
          style={[styles.actionBtnRed, isCheckedIn && styles.actionBtnChecked]}
          onPress={handleCheckIn}>
          <LocationIcon />
          <Text style={styles.actionBtnText}>
            {isCheckedIn ? 'Checked In ✓' : 'Check In'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnGreen}>
          <GreenTick />
          <Text style={styles.actionBtnText}>Verify My Bin</Text>
        </TouchableOpacity>
      </View>

      {/* ── Rating ── */}
      <View style={styles.contentHeader}>
        <Text style={styles.contentTitle}>{storeName.toUpperCase()}</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(s => (
            <FontAwesome
              key={s}
              name="star"
              color={s <= Math.round(avgRating) ? '#FFD700' : '#e6e6e6'}
              size={15}
            />
          ))}
          <Text style={styles.reviewCountText}>
            {' '}
            {reviewCount.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* ── Details ── */}
      <View style={styles.detailsBox}>
        <Text style={styles.detailRow}>
          <Text style={styles.detailLabel}>Address: </Text>
          {address}
        </Text>
        <Text style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phone Number: </Text>
          {phone}
        </Text>
        <Text style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email: </Text>
          {email}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text style={styles.detailLabel}>Social Media</Text>
          <View style={styles.socialIcons}>
            {store.facebook_link && (
              <Pressable>
                <FacebookIcon />
              </Pressable>
            )}
            {store.twitter_link && (
              <Pressable>
                <TwitterIcon />
              </Pressable>
            )}
            {store.whatsapp_link && (
              <Pressable>
                <WhatsappIcon />
              </Pressable>
            )}
            {!store.facebook_link &&
              !store.twitter_link &&
              !store.whatsapp_link && (
                <>
                  <FacebookIcon />
                  <TwitterIcon />
                  <WhatsappIcon />
                  <LinkedinIcon />
                </>
              )}
          </View>
        </View>
        <View
          style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
          <Text style={styles.detailLabel}>Daily Rates: </Text>
          <Text style={styles.dailyRates}>
            {store.daily_rates || '$10, $8, $6, $4, $2, $1'}
          </Text>
        </View>
      </View>

      {/* ── Carousel ── */}
      <View style={styles.carouselWrapper}>
        <Carousel
          data={carouselImages}
          renderItem={({item}) => <CarouselSlide item={item} />}
          sliderWidth={width}
          itemWidth={width * 0.88}
          layout="default"
          loop={carouselImages.length > 1}
          onSnapToItem={setActiveSlide}
        />
        {carouselImages.length > 1 && (
          <Pagination
            dotsLength={carouselImages.length}
            activeDotIndex={activeSlide}
            containerStyle={styles.paginationContainer}
            dotStyle={styles.paginationDot}
            inactiveDotStyle={styles.paginationInactiveDot}
            inactiveDotOpacity={0.3}
            inactiveDotScale={0.7}
          />
        )}
      </View>

      {/* ── Trending Products ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Products</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TopBinItems')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={trendingProducts}
          renderItem={({item}) => (
            <TrendingCard
              item={item}
              onPress={() =>
                navigation.navigate('SinglePageItem', {product: item})
              }
            />
          )}
          keyExtractor={(item, i) =>
            item._id || item.id?.toString() || i.toString()
          }
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hListPad}
        />
      </View>

      {/* ── Promotions ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PROMOTIONS</Text>
        </View>
        <FlatList
          data={promotions}
          renderItem={({item}) => (
            <PromoCard
              item={item}
              onPress={() =>
                navigation.navigate('SinglePageItem', {product: item})
              }
            />
          )}
          keyExtractor={(item, i) =>
            item._id || item.id?.toString() || i.toString()
          }
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hListPad}
        />
      </View>

      <View style={{height: 40}} />
    </ScrollView>
  );
};

export default BinStorePage;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  heroBg: {
    width: '100%',
    minHeight: hp(41),
    borderBottomEndRadius: 20,
    borderBottomLeftRadius: 20,
    backgroundColor: '#130160',
    paddingBottom: '5%',
  },
  header: {
    width: wp(100),
    height: hp(7),
    marginTop: '10%',
    paddingHorizontal: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {fontFamily: 'Nunito-Bold', fontSize: hp(3), color: '#C4C4C4'},
  profileRow: {
    width: '95%',
    alignSelf: 'center',
    flexDirection: 'row',
    marginTop: '5%',
    minHeight: hp(23),
  },
  storeLogoWrapper: {
    width: '45%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeLogo: {width: '90%', height: hp(18), borderRadius: 12},
  storeInfoCol: {width: '55%', paddingLeft: '2%'},
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: '5%',
    marginBottom: '3%',
  },
  storeNameText: {
    fontFamily: 'Roboto-SemiBold',
    color: '#fff',
    fontSize: hp(2.8),
    flex: 1,
  },
  statsRow: {flexDirection: 'row', marginBottom: '3%'},
  statItem: {width: '50%'},
  statNumber: {fontFamily: 'Roboto-ExtraBold', color: '#fff', fontSize: hp(3)},
  statLabel: {fontSize: hp(1.8), fontFamily: 'Roboto-Regular'},
  websiteText: {
    fontFamily: 'Roboto-Thin',
    color: '#F8F8F8',
    fontSize: hp(1.8),
    marginBottom: '4%',
  },
  followBtnWrapper: {width: '90%'},
  followBtn: {
    borderWidth: 2,
    borderColor: '#14BA9C',
    borderRadius: 7,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  // ✅ Following state style — filled green button
  followingBtn: {backgroundColor: '#14BA9C', borderColor: '#14BA9C'},
  followBtnText: {
    color: '#14BA9C',
    fontSize: hp(2.2),
    fontFamily: 'DMSans-SemiBold',
  },
  // ✅ Following state text — white text on green button
  followingBtnText: {color: '#fff'},
  headerHeart: {padding: 4},
  actionRow: {
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '5%',
    height: hp(6),
  },
  actionBtnRed: {
    width: '48%',
    borderWidth: 0.8,
    borderColor: 'red',
    borderRadius: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '9%',
  },
  // ✅ filled red when checked in
  actionBtnChecked: {backgroundColor: '#FF3B30', borderColor: '#FF3B30'},
  actionBtnGreen: {
    width: '48%',
    borderWidth: 0.8,
    borderColor: '#00B813',
    borderRadius: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '5%',
  },
  actionBtnText: {
    fontFamily: 'Nunito-SemiBold',
    color: '#000',
    fontSize: hp(1.9),
  },
  contentHeader: {
    width: '90%',
    marginHorizontal: '5%',
    marginTop: '7%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentTitle: {fontFamily: 'Nunito-Bold', color: '#000', fontSize: hp(2.4)},
  starsRow: {flexDirection: 'row', alignItems: 'center'},
  reviewCountText: {
    fontFamily: 'Nunito-SemiBold',
    color: '#828282',
    fontSize: hp(1.8),
  },
  detailsBox: {width: '90%', marginHorizontal: '5%', marginTop: '4%'},
  detailRow: {
    fontFamily: 'Nunito-SemiBold',
    color: '#000',
    fontSize: hp(1.8),
    marginVertical: 3,
  },
  detailLabel: {fontFamily: 'Nunito-Bold', color: '#000', fontSize: hp(1.8)},
  dailyRates: {
    fontFamily: 'Nunito-SemiBold',
    color: '#524B6B',
    fontSize: hp(1.8),
  },
  socialIcons: {flexDirection: 'row', gap: 8, alignItems: 'center'},
  carouselWrapper: {marginTop: '7%', height: hp(30)},
  slide: {flex: 1, alignItems: 'center', borderRadius: 12, overflow: 'hidden'},
  slideImg: {width: '100%', height: hp(28), borderRadius: 12},
  paginationContainer: {alignSelf: 'center', marginTop: 4},
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#130160',
  },
  paginationInactiveDot: {backgroundColor: 'rgba(0,0,0,0.3)'},
  section: {marginTop: hp(3), paddingHorizontal: '4%'},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  sectionTitle: {fontFamily: 'Nunito-Bold', fontSize: hp(2.3), color: '#000'},
  viewAll: {
    color: '#524B6B',
    fontSize: hp(1.9),
    textDecorationLine: 'underline',
  },
  hListPad: {paddingRight: 16, paddingVertical: 6},
  heartBg: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    elevation: 2,
  },
  trendingCard: {
    width: wp(42),
    height: hp(25),
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#e6e6e6',
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 2,
  },
  trendingImg: {width: '100%', height: hp(13)},
  trendingHeart: {position: 'absolute', right: '3%', top: '2%', zIndex: 10},
  trendingInfo: {paddingHorizontal: '4%', marginTop: 6},
  trendingTitle: {
    fontFamily: 'Nunito-SemiBold',
    color: '#000',
    fontSize: hp(1.6),
  },
  trendingPrice: {position: 'absolute', bottom: '3%', paddingHorizontal: '4%'},
  discountPrice: {fontFamily: 'Nunito-Bold', color: '#000', fontSize: hp(1.8)},
  originalPrice: {
    fontFamily: 'Nunito-Bold',
    color: '#808488',
    fontSize: hp(1.6),
    textDecorationLine: 'line-through',
  },
  discountPct: {color: 'red', fontFamily: 'Nunito-Regular', fontSize: hp(1.5)},
  promoCard: {
    width: wp(36),
    height: hp(22),
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: '2%',
  },
  promoImg: {width: '100%', height: hp(12), borderRadius: 6, marginBottom: 6},
  promoHeart: {position: 'absolute', right: '5%', top: '3%'},
  promoName: {fontSize: hp(1.5), fontWeight: '500', color: '#000'},
  promoSubtitle: {
    fontSize: hp(1.6),
    color: '#14BA9C',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  promoRating: {flexDirection: 'row', alignItems: 'center', gap: 3},
  ratingVal: {fontSize: hp(1.4), fontWeight: 'bold', color: '#000'},
  reviewCount: {fontSize: hp(1.2), color: '#666'},
});
