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
import React, {useState, useEffect, useCallback, useRef} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import LocationIcon from '../../../assets/LocationIcon.svg';
import FacebookIcon from '../../../assets/FacebookIcon.svg';
import TwitterIcon from '../../../assets/TwitterIcon.svg';
import WhatsappIcon from '../../../assets/WhatsappIcon.svg';
import InstagramIcon from '../../../assets/instagram.svg';
import Share_Icon from '../../../assets/share_icon.svg';
import HiddenFindsImg from '../../../assets/hidden_find_img.svg';
import BoldTick from '../../../assets/bold_tick.svg';
import GreenTick from '../../../assets/green_tick.svg';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  storesAPI,
  userAPI,
  productsAPI,
  subscriptionsAPI,
} from '../../api/apiService';

const {width} = Dimensions.get('window');

const TRENDING_LIKE_THRESHOLD = 5;

// ─── Static fallbacks ──────────────────────────────────────────
const STORE_FALLBACK = require('../../../assets/flip_find.png');
const CAROUSEL_FALLBACK = require('../../../assets/bin_store_img.png');
const PLACEHOLDER = require('../../../assets/slider_1.png');

// ─── Social platform config ────────────────────────────────────
const SOCIAL_PLATFORMS = [
  {fieldKey: 'facebook_link', Icon: FacebookIcon},
  {fieldKey: 'instagram_link', Icon: InstagramIcon},
  {fieldKey: 'twitter_link', Icon: TwitterIcon},
  {fieldKey: 'whatsapp_link', Icon: WhatsappIcon},
];

const resolveUserId = val => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object')
    return val._id?.toString() || val.id?.toString() || null;
  return null;
};

// ─── SmartImage ────────────────────────────────────────────────
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
// normaliseProduct
// ─────────────────────────────────────────────────────────────────────────────
const normaliseProduct = item => ({
  id: item._id || item.id,
  _id: item._id || item.id,
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
  product_image: item.image_inner || item.image || null,
  price: item.offer_price || item.price || 0,
  original_price: item.price || null,
  rating: item.rating || null,
  review_count: item.review_count || null,
  category_id: item.category_id || null,
  upc_id: item.upc_id || null,
  tags: item.tags || [],
  status: item.status || null,
  type: item.type || 2,
  likes: typeof item.likes === 'number' ? item.likes : 0,
  liked_by: Array.isArray(item.liked_by) ? item.liked_by.map(String) : [],
  isLikedByMe: false,
});

// ─── normalisePromotion ────────────────────────────────────────
const normalisePromotion = item => ({
  id: item._id || item.id,
  _id: item._id || item.id,
  product_id: item.product_id || null,
  image: item.banner_image
    ? {uri: item.banner_image}
    : item.image && typeof item.image === 'string'
    ? {uri: item.image}
    : item.image || null,
  product_image: item.banner_image || item.image || null,
  title: item.title || item.name,
  description: item.description || '',
  shortDescription: item.description,
  status: item.status,
  start_date: item.start_date,
  end_date: item.end_date,
  price: item.price || 0,
  original_price: item.original_price || null,
  rating: item.rating || null,
  review_count: item.review_count || null,
  tags: item.tags || [],
  category_id: item.category_id || null,
  upc_id: item.upc_id || null,
});

// ─── useDynamicCardHeight ──────────────────────────────────────
const useDynamicCardHeight = () => {
  const [cardHeight, setCardHeight] = useState(null);
  const onCardLayout = useCallback(event => {
    const {height} = event.nativeEvent.layout;
    setCardHeight(prev => (prev === null || height > prev ? height : prev));
  }, []);
  return {cardHeight, onCardLayout};
};

// ─────────────────────────────────────────────────────────────────────────────
// TrendingCard
// ─────────────────────────────────────────────────────────────────────────────
const TrendingCard = ({item, onPress, cardHeight, onCardLayout}) => (
  <Pressable style={styles.favouritePressable} onPress={onPress}>
    <View
      style={[styles.favouriteCard, cardHeight ? {height: cardHeight} : {}]}
      onLayout={onCardLayout}>
      <View style={styles.imageWrapper}>
        <Image
          source={item.image || PLACEHOLDER}
          style={styles.favouriteImage}
          resizeMode="cover"
        />
      </View>
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
// ActivityCard
// ─────────────────────────────────────────────────────────────────────────────
const ActivityCard = React.memo(
  ({item, onPress, cardHeight, onCardLayout, onLike, likingIds}) => {
    const isBusy = likingIds.has(item._id);
    const isTrending = item.likes >= TRENDING_LIKE_THRESHOLD;

    return (
      <Pressable style={styles.favouritePressable} onPress={onPress}>
        <View
          style={[styles.favouriteCard, cardHeight ? {height: cardHeight} : {}]}
          onLayout={onCardLayout}>
          <View style={styles.imageWrapper}>
            <Image
              source={item.image || PLACEHOLDER}
              style={styles.favouriteImage}
              resizeMode="cover"
            />
            {isTrending && (
              <View style={styles.trendingBadge}>
                <Text style={styles.trendingBadgeText}>Trending</Text>
              </View>
            )}
          </View>

          <Pressable
            style={[styles.activityHeart, isBusy && {opacity: 0.5}]}
            onPress={() => !isBusy && onLike(item._id)}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <View style={styles.heartBg}>
              <Ionicons
                name={item.isLikedByMe ? 'heart' : 'heart-outline'}
                size={hp(2.2)}
                color="#EE2525"
              />
            </View>
          </Pressable>

          <View style={styles.favouriteDescriptionContainer}>
            <Text style={styles.favouriteDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={styles.favouriteDiscountPrice}>
              {item.discountPrice}
            </Text>
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
  },
);

// ─── PromoCard ─────────────────────────────────────────────────
const PromoCard = ({item, onPress, cardHeight, onCardLayout}) => {
  const fmtDate = d =>
    d
      ? new Date(d).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      : '';
  return (
    <Pressable style={styles.promotionPressable} onPress={onPress}>
      <View
        style={[styles.promotionCard, cardHeight ? {height: cardHeight} : {}]}
        onLayout={onCardLayout}>
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
              {item.start_date && item.end_date ? ' – ' : ''}
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
  const store = route.params?.store || {};

  const [activeSlide, setActiveSlide] = useState(0);
  const [activeStore, setActiveStore] = useState(store);

  const [storeLikes, setStoreLikes] = useState(parseInt(store.likes) || 0);
  const [isStoreLiked, setIsStoreLiked] = useState(false);
  const [followers, setFollowers] = useState(parseInt(store.followers) || 0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // ── Verify My Bin — derived locally, no separate API call ─────────────────
  const [isBinVerified, setIsBinVerified] = useState(false);

  // ── Resolved once from /api/users/profile ─────────────────────────────────
  const currentUserIdRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // ── Sections ───────────────────────────────────────────────────────────────
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [promotions, setPromotions] = useState([]);

  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(true);

  const [likingIds, setLikingIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState('trending');

  const {cardHeight: trendingCardHeight, onCardLayout: onTrendingCardLayout} =
    useDynamicCardHeight();
  const {cardHeight: activityCardHeight, onCardLayout: onActivityCardLayout} =
    useDynamicCardHeight();
  const {cardHeight: promoCardHeight, onCardLayout: onPromoCardLayout} =
    useDynamicCardHeight();

  useEffect(() => {
    if (!store._id) return;
    loadStoreAndUser();
  }, [store._id]);

  // ─── Helper: stamp isLikedByMe onto every item ────────────────────────────
  const stampLikes = useCallback(
    (items, uid) =>
      items.map(item => ({
        ...item,
        isLikedByMe: uid ? item.liked_by.includes(uid) : false,
      })),
    [],
  );

  // ─── Derive verification locally from store details + user profile ─────────
  // Same logic as StoreViewPage — no API call needed
  const deriveVerification = (details, userProfile) => {
    const now = new Date();
    const endTime =
      details?.subscription_end_time || userProfile?.subscription_end_time;
    const notExpired = endTime && new Date(endTime) > now;

    return (
      details?.verified === true ||
      userProfile?.verified === true ||
      userProfile?.status === 'approved' ||
      notExpired === true
    );
  };

  // ─── Loaders ──────────────────────────────────────────────────────────────
  const loadStoreAndUser = async () => {
    try {
      const [details, userProfile] = await Promise.all([
        storesAPI.getDetails(store._id),
        userAPI.getProfile(),
      ]);

      if (details) {
        setActiveStore(details);
        setStoreLikes(details.likes || 0);
        setFollowers(details.followers || 0);

        const uid = userProfile?._id?.toString();
        currentUserIdRef.current = uid;
        setCurrentUserId(uid);

        setIsStoreLiked(!!details.liked_by?.some(id => id.toString() === uid));
        setIsFollowing(
          !!details.followed_by?.some(id => id.toString() === uid),
        );
        setIsCheckedIn(
          !!details.checked_in_by?.some(id => id.toString() === uid),
        );

        // ── Derive verification locally — same approach as StoreViewPage ──
        const verified = deriveVerification(details, userProfile);
        setIsBinVerified(verified);

        const confirmedUserId =
          resolveUserId(details.user_id) || details._id?.toString();

        loadTrendingProducts(confirmedUserId);
        loadActivityFeed(confirmedUserId, uid);
        loadPromotions(confirmedUserId);
      }
    } catch (e) {
      console.error('BinStorePage loadStoreAndUser:', e);
    }
  };

  const loadTrendingProducts = async userId => {
    setIsLoadingTrending(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const url = `https://biniq.onrender.com/api/products/trending${
        userId ? `?user_id=${userId}` : ''
      }`;
      const res = await fetch(url, {
        headers: {Authorization: `Bearer ${token}`},
      }).then(r => r.json());
      const raw = Array.isArray(res) ? res : res?.data ?? res?.products ?? [];
      setTrendingProducts(raw.map(normaliseProduct));
    } catch (e) {
      console.error('loadTrendingProducts:', e);
      setTrendingProducts([]);
    } finally {
      setIsLoadingTrending(false);
    }
  };

  const loadActivityFeed = async (userId, uid) => {
    setIsLoadingActivity(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const url = `https://biniq.onrender.com/api/products/activity${
        userId ? `?user_id=${userId}` : ''
      }`;
      const res = await fetch(url, {
        headers: {Authorization: `Bearer ${token}`},
      }).then(r => r.json());
      const raw = Array.isArray(res) ? res : res?.data ?? res?.products ?? [];
      const normalised = raw.map(normaliseProduct);
      setActivityFeed(stampLikes(normalised, uid));
    } catch (e) {
      console.error('loadActivityFeed:', e);
      setActivityFeed([]);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const loadPromotions = async userId => {
    setIsLoadingPromotions(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const url = `https://biniq.onrender.com/api/promotions${
        userId ? `?user_id=${userId}` : ''
      }`;
      const res = await fetch(url, {
        headers: {Authorization: `Bearer ${token}`},
      }).then(r => r.json());
      const raw =
        res?.data ??
        res?.results ??
        res?.promotions ??
        (Array.isArray(res) ? res : []);
      setPromotions(raw.map(normalisePromotion));
    } catch (e) {
      console.error('loadPromotions:', e);
      setPromotions([]);
    } finally {
      setIsLoadingPromotions(false);
    }
  };

  // ─── handleProductLike ────────────────────────────────────────────────────
  const handleProductLike = useCallback(
    async productId => {
      const uid = currentUserIdRef.current;
      if (!uid) return;
      if (likingIds.has(productId)) return;

      setLikingIds(prev => new Set([...prev, productId]));

      let snapshot = null;

      setActivityFeed(prev =>
        prev.map(item => {
          if (item._id !== productId) return item;
          snapshot = item;
          const willLike = !item.isLikedByMe;
          return {
            ...item,
            isLikedByMe: willLike,
            likes: willLike ? item.likes + 1 : Math.max(0, item.likes - 1),
            liked_by: willLike
              ? [...item.liked_by, uid]
              : item.liked_by.filter(id => id !== uid),
          };
        }),
      );

      try {
        const result = await productsAPI.like(productId);

        setActivityFeed(prev =>
          prev.map(item => {
            if (item._id !== productId) return item;
            const updatedLikedBy = result.isLiked
              ? [...new Set([...item.liked_by, uid])]
              : item.liked_by.filter(id => id !== uid);
            return {
              ...item,
              isLikedByMe: result.isLiked,
              likes: result.likes,
              liked_by: updatedLikedBy,
              type: result.type ?? item.type,
            };
          }),
        );

        if (result.trending_notice) {
          const confirmedUserId =
            resolveUserId(activeStore.user_id) || activeStore._id?.toString();
          loadTrendingProducts(confirmedUserId);
          Alert.alert('🔥 Now Trending!', result.trending_notice);
        }
      } catch (e) {
        console.error('handleProductLike error:', e);
        if (snapshot) {
          setActivityFeed(prev =>
            prev.map(item => (item._id === productId ? snapshot : item)),
          );
        }
        Alert.alert('Error', 'Could not update like. Please try again.');
      } finally {
        setLikingIds(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }
    },
    [likingIds, activeStore],
  );

  // ─── Store interactions ────────────────────────────────────────────────────
  const handleStoreLike = async () => {
    const prev = {liked: isStoreLiked, count: storeLikes};
    setIsStoreLiked(!isStoreLiked);
    setStoreLikes(n => (isStoreLiked ? Math.max(0, n - 1) : n + 1));
    try {
      await storesAPI.like(store._id);
    } catch {
      setIsStoreLiked(prev.liked);
      setStoreLikes(prev.count);
    }
  };

  const handleFollow = async () => {
    const prev = {following: isFollowing, count: followers};
    setIsFollowing(!isFollowing);
    setFollowers(n => (isFollowing ? Math.max(0, n - 1) : n + 1));
    try {
      await storesAPI.follow(store._id);
    } catch {
      setIsFollowing(prev.following);
      setFollowers(prev.count);
    }
  };

  const handleCheckIn = async () => {
    const was = isCheckedIn;
    setIsCheckedIn(!was);
    try {
      await storesAPI.checkIn(store._id);
      Alert.alert(
        was ? 'Checked Out' : 'Checked In!',
        was
          ? `You have checked out of ${activeStore.store_name}`
          : `You are now checked in at ${activeStore.store_name}`,
      );
    } catch {
      setIsCheckedIn(was);
      Alert.alert('Error', 'Check-in failed. Please try again.');
    }
  };

  const handleSocialPress = url => {
    if (!url?.trim()) return;
    const full = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(full).catch(() =>
      Alert.alert('Error', 'Could not open this link.'),
    );
  };

  // ─── Navigation helpers ────────────────────────────────────────────────────
  const navigateToProduct = (item, sourceList, sectionLabel) => {
    navigation.navigate('SinglePageItem', {
      productId: item._id,
      initialData: item,
      section: sectionLabel || 'Products',
      data: sourceList || [],
    });
  };

  const navigateToPromotion = item => {
    navigation.navigate('SinglePageItem', {
      productId: item.product_id || item._id,
      initialData: item.product_id ? null : item,
      section: 'Promotions',
      data: promotions,
    });
  };

  const fmtCount = n => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

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

  // ─── Tab renderers ─────────────────────────────────────────────────────────
  const renderTrendingSection = () =>
    isLoadingTrending ? (
      <LoadingRow />
    ) : (
      <FlatList
        data={trendingProducts}
        renderItem={({item}) => (
          <TrendingCard
            item={item}
            cardHeight={trendingCardHeight}
            onCardLayout={onTrendingCardLayout}
            onPress={() =>
              navigateToProduct(item, trendingProducts, 'Trending Products')
            }
          />
        )}
        keyExtractor={(item, i) => item.id?.toString() || `trending-${i}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hListPad}
        ListEmptyComponent={
          <EmptyRow message="No trending products for this store" />
        }
      />
    );

  const renderActivitySection = () =>
    isLoadingActivity ? (
      <LoadingRow />
    ) : (
      <FlatList
        data={activityFeed}
        renderItem={({item}) => (
          <ActivityCard
            item={item}
            cardHeight={activityCardHeight}
            onCardLayout={onActivityCardLayout}
            onLike={handleProductLike}
            likingIds={likingIds}
            onPress={() =>
              navigateToProduct(item, activityFeed, 'Activity Feed')
            }
          />
        )}
        keyExtractor={(item, i) => item.id?.toString() || `activity-${i}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hListPad}
        ListEmptyComponent={
          <EmptyRow message="No activity feed items for this store" />
        }
      />
    );

  const renderPromotionsSection = () =>
    isLoadingPromotions ? (
      <LoadingRow />
    ) : (
      <FlatList
        data={promotions}
        renderItem={({item}) => (
          <PromoCard
            item={item}
            cardHeight={promoCardHeight}
            onCardLayout={onPromoCardLayout}
            onPress={() => navigateToPromotion(item)}
          />
        )}
        keyExtractor={(item, i) => item.id?.toString() || `promo-${i}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hListPad}
        ListEmptyComponent={<EmptyRow message="No promotions for this store" />}
      />
    );

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
            <Pressable onPress={handleStoreLike} style={styles.headerHeart}>
              <Ionicons
                name={isStoreLiked ? 'heart' : 'heart-outline'}
                size={hp(3.5)}
                color={isStoreLiked ? '#EE2525' : '#C4C4C4'}
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
              {/* Blue tick — only when verified */}
              {isBinVerified && <BoldTick width={20} />}
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
                  {fmtCount(storeLikes)}
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

        {/* ── Verify My Bin — status badge only, no tap action ── */}
        <View
          style={[
            styles.actionBtnVerifyBase,
            isBinVerified
              ? styles.actionBtnVerified
              : styles.actionBtnNotVerified,
          ]}>
          {isBinVerified ? (
            <GreenTick width={15} height={15} />
          ) : (
            <MaterialIcons name="cancel" size={15} color="#FF3B30" />
          )}
          <Text
            style={[
              styles.verifyBtnText,
              isBinVerified
                ? styles.verifiedBtnText
                : styles.notVerifiedBtnText,
            ]}>
            {isBinVerified ? 'Verified' : 'Not Verified'}
          </Text>
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

      {/* ── Tab Switcher ── */}
      <View style={styles.tabRow}>
        {[
          {key: 'trending', label: 'Trending'},
          {key: 'activity', label: 'Items'},
          {key: 'promotions', label: 'Promotions'},
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabBtn,
              activeTab === tab.key && styles.tabBtnActive,
            ]}
            onPress={() => setActiveTab(tab.key)}>
            <Text
              style={[
                styles.tabBtnText,
                activeTab === tab.key && styles.tabBtnTextActive,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Tab Content ── */}
      <View style={styles.section}>
        {activeTab === 'trending' && (
          <>
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
            {renderTrendingSection()}
          </>
        )}

        {activeTab === 'activity' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Items</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('AllProductsScreen', {
                    section: 'Activity Feed',
                    data: activityFeed,
                  })
                }>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            {renderActivitySection()}
          </>
        )}

        {activeTab === 'promotions' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Promotions</Text>
            </View>
            {renderPromotionsSection()}
          </>
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
  actionBtnVerifyBase: {
    width: '48%',
    borderWidth: 0.8,
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  actionBtnVerified: {
    backgroundColor: '#E8FBF5',
    borderColor: '#00B813',
  },
  actionBtnNotVerified: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FF3B30',
  },
  verifyBtnText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.9),
  },
  verifiedBtnText: {
    color: '#00B813',
  },
  notVerifiedBtnText: {
    color: '#FF3B30',
  },
  actionBtnText: {
    fontFamily: 'Nunito-SemiBold',
    color: '#000',
    fontSize: hp(1.9),
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
  tabRow: {
    flexDirection: 'row',
    marginTop: hp(3),
    marginHorizontal: '4%',
    borderRadius: 10,
    backgroundColor: '#F2F2F2',
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: hp(1.2),
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {backgroundColor: '#130160'},
  tabBtnText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.7),
    color: '#524B6B',
  },
  tabBtnTextActive: {color: '#fff', fontFamily: 'Nunito-Bold'},
  section: {marginTop: hp(2), paddingHorizontal: '4%'},
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
  activityHeart: {
    position: 'absolute',
    right: wp(2),
    top: hp(10),
    zIndex: 10,
    alignItems: 'center',
  },
  heartBg: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  trendingBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FF6B00',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  trendingBadgeText: {
    fontFamily: 'Nunito-Bold',
    color: '#fff',
    fontSize: hp(1.2),
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
