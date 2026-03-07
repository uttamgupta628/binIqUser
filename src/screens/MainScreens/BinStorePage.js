import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
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
import InstagramIcon from '../../../assets/instagram.svg'; // add if you have it
import Share_Icon from '../../../assets/share_icon.svg';
import HiddenFindsImg from '../../../assets/hidden_find_img.svg';
import BoldTick from '../../../assets/bold_tick.svg';
import GreenTick from '../../../assets/green_tick.svg';
import {Alert} from 'react-native';
import {
  storesAPI,
  userAPI,
  productsAPI,
  promotionsAPI,
} from '../../api/apiService';

const {width} = Dimensions.get('window');

// ─── Static fallbacks ──────────────────────────────────────────
const STORE_FALLBACK = require('../../../assets/flip_find.png');
const CAROUSEL_FALLBACK = require('../../../assets/bin_store_img.png');
const PLACEHOLDER = require('../../../assets/slider_1.png');

// ─────────────────────────────────────────────────────────────────────────────
// Social platform config — maps DB field → SVG icon
// Only platforms with a saved URL are shown (same logic as Dashboard2/BinStorePage)
// ─────────────────────────────────────────────────────────────────────────────
const SOCIAL_PLATFORMS = [
  {fieldKey: 'facebook_link', Icon: FacebookIcon},
  {fieldKey: 'instagram_link', Icon: InstagramIcon},
  {fieldKey: 'twitter_link', Icon: TwitterIcon},
  {fieldKey: 'whatsapp_link', Icon: WhatsappIcon},
];

// ─── SmartImage: shows URI or falls back to static asset ───────
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

// ─────────────────────────────────────────────────────────────────────────────
// Normalise a product item (from storeDetails.products or productsAPI.getAll)
// into the same shape HomeScreen's renderTrendingItem expects.
// ─────────────────────────────────────────────────────────────────────────────
const normaliseProduct = item => ({
  id: item._id || item.id,
  // image field may already be { uri } (from useStore mapping) or a raw string
  image: item.image_inner
    ? {uri: item.image_inner}
    : item.image && typeof item.image === 'string'
    ? {uri: item.image}
    : item.image || null,
  title: item.title,
  description: item.description || item.title,
  discountPrice: `$${item.offer_price || item.price || 0}`,
  originalPrice: item.price ? `$${item.price}` : null,
  totalDiscount:
    item.offer_price && item.price
      ? `${100 - Math.round((item.offer_price / item.price) * 100)}% off`
      : '',
});

// ─────────────────────────────────────────────────────────────────────────────
// Normalise a promotion item (from storeDetails.promotions or promotionsAPI.getAll)
// into the same shape HomeScreen's renderPromotionItem expects.
// ─────────────────────────────────────────────────────────────────────────────
const normalisePromotion = item => ({
  id: item._id || item.id,
  image: item.banner_image
    ? {uri: item.banner_image}
    : item.image && typeof item.image === 'string'
    ? {uri: item.image}
    : item.image || null,
  title: item.title || item.name,
  shortDescription: item.description,
  status: item.status,
  start_date: item.start_date,
  end_date: item.end_date,
});

// ─────────────────────────────────────────────────────────────────────────────
// TrendingCard — identical layout to HomeScreen's renderTrendingItem
// ─────────────────────────────────────────────────────────────────────────────
const TrendingCard = ({item, onPress}) => (
  <Pressable style={styles.favouritePressable} onPress={onPress}>
    <View style={styles.favouriteCard}>
      <View style={styles.imageWrapper}>
        <Image
          source={item.image || PLACEHOLDER}
          style={styles.favouriteImage}
          resizeMode="cover"
        />
      </View>
      <Pressable style={styles.trendingHeart}>
        <View style={styles.heartBg}>
          <Ionicons name="heart-outline" size={hp(2.2)} color="#EE2525" />
        </View>
      </Pressable>
      <View style={styles.favouriteDescriptionContainer}>
        <Text style={styles.favouriteDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.favouriteDiscountPrice}>{item.discountPrice}</Text>
        {item.originalPrice && (
          <Text style={styles.favouritePriceText}>
            <Text style={styles.favouriteOriginalPrice}>
              {item.originalPrice}
            </Text>
            {'  '}
            {item.totalDiscount}
          </Text>
        )}
      </View>
    </View>
  </Pressable>
);

// ─────────────────────────────────────────────────────────────────────────────
// PromoCard — identical layout to HomeScreen's renderPromotionItem
// ─────────────────────────────────────────────────────────────────────────────
const PromoCard = ({item, onPress}) => {
  const fmtDate = d =>
    d
      ? new Date(d).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      : '';

  return (
    <Pressable style={styles.promotionPressable} onPress={onPress}>
      <View style={styles.promotionCard}>
        <View style={styles.imageWrapper}>
          <Image
            source={item.image || PLACEHOLDER}
            style={styles.promotionImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.promotionContent}>
          <Text style={styles.promotionTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.promotionDescription} numberOfLines={2}>
            {item.shortDescription}
          </Text>
          <Text style={styles.promotionStatus}>
            {item.status
              ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
              : 'Active'}
          </Text>
          {(item.start_date || item.end_date) && (
            <Text style={styles.promotionDate}>
              {fmtDate(item.start_date)}
              {item.start_date && item.end_date ? ' to ' : ''}
              {fmtDate(item.end_date)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
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

const LoadingRow = () => (
  <ActivityIndicator size="large" color="#130160" style={{padding: hp(2)}} />
);

const EmptyRow = ({message}) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const BinStorePage = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // store passed via navigation.navigate('BinStorePage', { store: {...} })
  const store = route.params?.store || {};

  const [activeSlide, setActiveSlide] = useState(0);

  // ── Full store details (enriched after getDetails call) ──
  const [activeStore, setActiveStore] = useState(store);

  // ── Interaction state ──
  const [likes, setLikes] = useState(parseInt(store.likes) || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [followers, setFollowers] = useState(parseInt(store.followers) || 0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // ── This store's products & promotions ──
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(true);

  // ─────────────────────────────────────────────────────────────
  // Load everything on mount using storesAPI / productsAPI / promotionsAPI
  // from apiService — same pattern as HomeScreen's useFocusEffect.
  //
  // Flow:
  //   1. storesAPI.getDetails(store._id)  — enriches store data + gets
  //      embedded products / promotions if the backend populates them
  //   2. userAPI.getProfile()             — needed to check liked_by etc.
  //   3. If storeDetails.products is empty → productsAPI.getAll({ store_id })
  //   4. If storeDetails.promotions is empty → promotionsAPI.getAll({ store_id })
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!store._id) return;

    // ── Step 1 & 2: store details + user profile ──
    const loadStoreAndUser = async () => {
      try {
        const [details, userProfile] = await Promise.all([
          storesAPI.getDetails(store._id), // GET /api/stores/details/:id
          userAPI.getProfile(), // GET /api/users/profile
        ]);

        if (details) {
          setActiveStore(details);
          setLikes(details.likes || 0);
          setFollowers(details.followers || 0);

          const uid = userProfile?._id?.toString();
          setIsLiked(!!details.liked_by?.some(id => id.toString() === uid));
          setIsFollowing(
            !!details.followed_by?.some(id => id.toString() === uid),
          );
          setIsCheckedIn(
            !!details.checked_in_by?.some(id => id.toString() === uid),
          );
        }
      } catch (e) {
        console.error('BinStorePage loadStoreAndUser:', e);
      }
    };

    // ── Step 3: products belonging to THIS store's owner ──
    // GET /api/products → filter client-side by store.user_id.
    // Every product has a user_id field that matches the store owner's user_id.
    // This is the same field set when the store owner creates a product.
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const res = await productsAPI.getAll(); // GET /api/products
        const raw =
          res?.results || res?.products || (Array.isArray(res) ? res : []);

        const storeUserId = store.user_id?.toString();
        const filtered = storeUserId
          ? raw.filter(p => p.user_id?.toString() === storeUserId)
          : raw;

        setTrendingProducts(filtered.map(normaliseProduct));
      } catch (e) {
        console.error('BinStorePage loadProducts:', e);
        setTrendingProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    // ── Step 4: promotions belonging to THIS store's owner ──
    // GET /api/promotions → filter client-side by store.user_id.
    const loadPromotions = async () => {
      setIsLoadingPromotions(true);
      try {
        const res = await promotionsAPI.getAll(); // GET /api/promotions
        const raw =
          res?.data ||
          res?.results ||
          res?.promotions ||
          (Array.isArray(res) ? res : []);

        const storeUserId = store.user_id?.toString();
        const filtered = storeUserId
          ? raw.filter(p => p.user_id?.toString() === storeUserId)
          : raw;

        setPromotions(filtered.map(normalisePromotion));
      } catch (e) {
        console.error('BinStorePage loadPromotions:', e);
        setPromotions([]);
      } finally {
        setIsLoadingPromotions(false);
      }
    };

    loadStoreAndUser();
    loadProducts();
    loadPromotions();
  }, [store._id]);

  // ─── Like ─────────────────────────────────────────────────────
  const handleLike = async () => {
    const prev = {liked: isLiked, count: likes};
    setIsLiked(!isLiked);
    setLikes(n => (isLiked ? Math.max(0, n - 1) : n + 1));
    try {
      await storesAPI.like(store._id); // POST /api/stores/like
    } catch (e) {
      setIsLiked(prev.liked);
      setLikes(prev.count);
    }
  };

  // ─── Follow ───────────────────────────────────────────────────
  const handleFollow = async () => {
    const prev = {following: isFollowing, count: followers};
    setIsFollowing(!isFollowing);
    setFollowers(n => (isFollowing ? Math.max(0, n - 1) : n + 1));
    try {
      await storesAPI.follow(store._id); // POST /api/stores/follow
    } catch (e) {
      setIsFollowing(prev.following);
      setFollowers(prev.count);
    }
  };

  // ─── Check-in ─────────────────────────────────────────────────
  const handleCheckIn = async () => {
    const was = isCheckedIn;
    setIsCheckedIn(!was);
    try {
      await storesAPI.checkIn(store._id); // POST /api/stores/checkin
      Alert.alert(
        was ? 'Checked Out' : 'Checked In!',
        was
          ? `You have checked out of ${activeStore.store_name}`
          : `You are now checked in at ${activeStore.store_name}`,
      );
    } catch (e) {
      setIsCheckedIn(was);
      Alert.alert('Error', 'Check-in failed. Please try again.');
    }
  };

  // ─── Open social URL ──────────────────────────────────────────
  const handleSocialPress = url => {
    if (!url?.trim()) return;
    const full = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(full).catch(() =>
      Alert.alert('Error', 'Could not open this link.'),
    );
  };

  const fmtCount = n => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  // Carousel images
  const carouselImages = (() => {
    if (activeStore.images?.length > 0)
      return activeStore.images.map((uri, i) => ({id: i, uri}));
    if (activeStore.store_image) return [{id: 0, uri: activeStore.store_image}];
    return [
      {id: 0, uri: null},
      {id: 1, uri: null},
      {id: 2, uri: null},
    ];
  })();

  // Only platforms that have a saved URL
  const activeSocialLinks = SOCIAL_PLATFORMS.filter(p =>
    activeStore[p.fieldKey]?.trim(),
  );

  const storeName = activeStore.store_name || 'Hidden Finds';
  const website = activeStore.website_url || 'www.hiddenfinds.com';
  const address = activeStore.address || '—';
  const phone = activeStore.phone_number || '—';
  const email = activeStore.store_email || '—';
  const avgRating = activeStore.ratings || 4.0;
  const reviewCount = activeStore.rating_count || 0;

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
            {activeStore.store_image ? (
              <SmartImage
                uri={activeStore.store_image}
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

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {fmtCount(followers)}
                  {'\n'}
                  <Text style={styles.statLabel}>Followers</Text>
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {fmtCount(likes)}
                  {'\n'}
                  <Text style={styles.statLabel}>Likes</Text>
                </Text>
              </View>
            </View>

            <Text style={styles.websiteText}>{website}</Text>

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
          {reviewCount > 0 && (
            <Text style={styles.reviewCountText}>
              {' '}
              {reviewCount.toLocaleString()}
            </Text>
          )}
        </View>
      </View>

      {/* ── Store Details ── */}
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

        {/* Social icons — only shown for platforms with saved URLs */}
        {activeSocialLinks.length > 0 && (
          <View style={styles.socialRow}>
            <Text style={styles.detailLabel}>Social Media</Text>
            <View style={styles.socialIcons}>
              {activeSocialLinks.map(({fieldKey, Icon}) => (
                <Pressable
                  key={fieldKey}
                  onPress={() => handleSocialPress(activeStore[fieldKey])}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                  style={({pressed}) => [{opacity: pressed ? 0.6 : 1}]}>
                  <Icon width={wp(6)} height={wp(6)} />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View
          style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
          <Text style={styles.detailLabel}>Daily Rates: </Text>
          <Text style={styles.dailyRates}>
            {activeStore.daily_rates || '$10, $8, $6, $4, $2, $1'}
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
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AllProductsScreen', {
                section: 'Trending Products',
                data: trendingProducts,
              })
            }>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        {isLoadingProducts ? (
          <LoadingRow />
        ) : (
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
            keyExtractor={(item, i) => item.id?.toString() || `product-${i}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hListPad}
            ListEmptyComponent={
              <EmptyRow message="No products for this store yet" />
            }
          />
        )}
      </View>

      {/* ── Promotions ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PROMOTIONS</Text>
        </View>
        {isLoadingPromotions ? (
          <LoadingRow />
        ) : (
          <FlatList
            data={promotions}
            renderItem={({item}) => (
              <PromoCard
                item={item}
                onPress={() =>
                  navigation.navigate('PromotionScreen', {
                    section: 'Promotions',
                    data: promotions,
                  })
                }
              />
            )}
            keyExtractor={(item, i) => item.id?.toString() || `promo-${i}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hListPad}
            ListEmptyComponent={
              <EmptyRow message="No promotions for this store yet" />
            }
          />
        )}
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
  followingBtn: {backgroundColor: '#14BA9C', borderColor: '#14BA9C'},
  followBtnText: {
    color: '#14BA9C',
    fontSize: hp(2.2),
    fontFamily: 'DMSans-SemiBold',
  },
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
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  socialIcons: {flexDirection: 'row', alignItems: 'center', gap: wp(3)},
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
  emptyContainer: {padding: hp(2), alignItems: 'center'},
  emptyText: {
    fontFamily: 'Nunito-Regular',
    color: '#524B6B',
    fontSize: hp(1.8),
  },

  // ── Trending card (matches HomeScreen exactly) ──
  imageWrapper: {
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
  },
  favouritePressable: {
    width: wp(46),
    marginRight: wp(3),
    marginVertical: hp(1),
  },
  favouriteCard: {
    width: '100%',
    borderRadius: 10,
    elevation: 3,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  favouriteImage: {width: '100%', height: hp(15)},
  trendingHeart: {position: 'absolute', right: '3%', top: '2%', zIndex: 10},
  heartBg: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    elevation: 2,
  },
  favouriteDescriptionContainer: {padding: wp(2.5)},
  favouriteDescription: {
    fontFamily: 'Nunito-SemiBold',
    color: '#000',
    fontSize: hp(1.5),
    marginBottom: hp(0.5),
  },
  favouriteDiscountPrice: {
    fontFamily: 'Nunito-Bold',
    color: '#000',
    fontSize: hp(1.8),
    marginBottom: hp(0.2),
  },
  favouritePriceText: {
    color: 'red',
    fontSize: hp(1.4),
    fontFamily: 'Nunito-Regular',
  },
  favouriteOriginalPrice: {
    fontFamily: 'Nunito-Bold',
    color: '#808488',
    fontSize: hp(1.5),
    textDecorationLine: 'line-through',
  },

  // ── Promotion card (matches HomeScreen exactly) ──
  promotionPressable: {
    width: wp(46),
    marginRight: wp(3),
    marginVertical: hp(1),
  },
  promotionCard: {
    width: '100%',
    borderRadius: 10,
    elevation: 3,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  promotionImage: {width: '100%', height: hp(16)},
  promotionContent: {padding: wp(2.5)},
  promotionTitle: {
    fontFamily: 'DMSans-Bold',
    color: '#000',
    fontSize: hp(1.5),
    marginBottom: hp(0.3),
  },
  promotionDescription: {
    fontFamily: 'Nunito-SemiBold',
    color: '#000',
    fontSize: hp(1.3),
    marginBottom: hp(0.2),
  },
  promotionStatus: {
    fontFamily: 'Nunito-Bold',
    color: '#14BA9C',
    fontSize: hp(1.5),
    marginTop: hp(0.5),
  },
  promotionDate: {
    fontFamily: 'Nunito-SemiBold',
    color: '#000',
    fontSize: hp(1.4),
    marginTop: hp(0.3),
  },
});
