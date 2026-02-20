import {
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  FlatList,
  Pressable,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import BinIQIcon from '../../../assets/BinIQIcon.svg';
import GetButton from '../../../assets/GetButton.svg';
import Notification from '../../../assets/Notification.svg';
import CameraIcon from '../../../assets/CameraIcon.svg';
import SearchIcon from '../../../assets/SearchIcon.svg';
import SettingsIcon from '../../../assets/SettingsIcon.svg';
import Dashboard from './Dashboard';
import Dashboard2 from './Dashboard2';
import Dashboard3 from './Dashboard3';
import {storesAPI, productsAPI, userAPI} from '../../api/apiService';

const {width} = Dimensions.get('window');

// ─── Gradient placeholder colours per index ────────────────────
const GRAD_COLORS = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#a18cd1'];
const placeholderBg = (i) => GRAD_COLORS[i % GRAD_COLORS.length];

// ─── Section Header ────────────────────────────────────────────
const SectionHeader = ({title, count, onViewAll}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>
      {title} {count != null ? `(${count})` : ''}
    </Text>
    <TouchableOpacity onPress={onViewAll}>
      <Text style={styles.viewAll}>View All</Text>
    </TouchableOpacity>
  </View>
);

// ─── Store Card (Bin Stores Near Me) ──────────────────────────
const StoreCard = ({item, index, userProfile, onLike, onPress}) => {
  const distance = (() => {
    if (!item.user_latitude || !item.user_longitude) return 'N/A';
    const R = 6371;
    const dLat = (item.user_latitude - 37.78825) * Math.PI / 180;
    const dLon = (item.user_longitude - (-122.4324)) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(37.78825 * Math.PI / 180) *
      Math.cos(item.user_latitude * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  })();

  const avgRating =
    item.comments?.length > 0
      ? (item.comments.reduce((s, c) => s + (c.rating || 0), 0) / item.comments.length).toFixed(1)
      : '4.2';

  const isLiked = item.liked_by?.includes(userProfile?._id);

  return (
    <Pressable style={styles.storeCard} onPress={onPress}>
      {/* Store Image */}
      {item.store_image ? (
        <Image source={{uri: item.store_image}} style={styles.storeCardImage} resizeMode="cover" />
      ) : (
        <View style={[styles.storeCardImage, {backgroundColor: placeholderBg(index), justifyContent: 'center', alignItems: 'center'}]}>
          <Ionicons name="storefront" size={36} color="rgba(255,255,255,0.85)" />
          <Text style={styles.placeholderStoreName} numberOfLines={1}>
            {item.store_name || 'Store'}
          </Text>
        </View>
      )}

      {/* Like button */}
      <Pressable style={styles.cardHeart} onPress={() => onLike(item._id)}>
        <View style={styles.heartBg}>
          <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={hp(2.4)} color="#EE2525" />
        </View>
      </Pressable>

      {/* Info row */}
      <View style={styles.storeCardInfo}>
        <View style={{flex: 1}}>
          <Text style={styles.storeName} numberOfLines={1}>{item.store_name || 'Store'}</Text>
          <Text style={styles.storeAddress} numberOfLines={1}>{item.address || 'Location'}</Text>
          <Text style={styles.storeDistance}>{distance === 'N/A' ? 'N/A' : `${distance}KM`}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <FontAwesome name="star" size={10} color="#fff" />
          <Text style={styles.ratingText}>{avgRating}</Text>
        </View>
      </View>
    </Pressable>
  );
};

// ─── Product Card (Top Bin Items) ─────────────────────────────
const ProductCard = ({item, index, onPress}) => (
  <Pressable style={styles.productCard} onPress={onPress}>
    {item.images?.[0] || item.image ? (
      <Image
        source={{uri: item.images?.[0] || item.image}}
        style={styles.productCardImage}
        resizeMode="cover"
      />
    ) : (
      <View style={[styles.productCardImage, {backgroundColor: placeholderBg(index + 2), justifyContent: 'center', alignItems: 'center'}]}>
        <Ionicons name="pricetag" size={30} color="rgba(255,255,255,0.85)" />
      </View>
    )}
    <Ionicons name="heart" size={hp(2.4)} color="#EE2525" style={styles.productHeart} />
    <View style={styles.productInfo}>
      <Text style={styles.productName} numberOfLines={1}>
        {item.name || item.title || item.store_name || 'Product'}
      </Text>
      <Text style={styles.productDesc} numberOfLines={1}>
        {item.description || item.address || ''}
      </Text>
      <Text style={styles.productPrice}>${item.price || '0'}</Text>
    </View>
  </Pressable>
);

// ─── Favourite Card ────────────────────────────────────────────
const FavouriteCard = ({item, index, onToggle}) => (
  <Pressable style={styles.favCard}>
    {item.store_image ? (
      <Image source={{uri: item.store_image}} style={styles.favCardImage} resizeMode="cover" />
    ) : (
      <View style={[styles.favCardImage, {backgroundColor: placeholderBg(index + 1), justifyContent: 'center', alignItems: 'center'}]}>
        <Ionicons name="storefront" size={30} color="rgba(255,255,255,0.85)" />
      </View>
    )}
    <Pressable style={styles.cardHeart} onPress={() => onToggle(item._id)}>
      <View style={styles.heartBg}>
        <Ionicons name="heart" size={hp(2.4)} color="#EE2525" />
      </View>
    </Pressable>
    <View style={styles.favInfo}>
      <Text style={styles.favName} numberOfLines={1}>{item.store_name || 'Store'}</Text>
      <Text style={styles.favSub}>Featured Store</Text>
    </View>
  </Pressable>
);

// ─── Reseller Card ─────────────────────────────────────────────
const ResellerCard = ({title, subtitle, onPress}) => (
  <TouchableOpacity style={styles.resellerCard} onPress={onPress}>
    <Image source={require('../../../assets/reseller_training.png')} style={styles.resellerImage} resizeMode="cover" />
    <View style={styles.resellerInfo}>
      <Text style={styles.resellerCategory}>How to start a Bin Store</Text>
      <Text style={styles.resellerTitle}>{title}</Text>
      <Text style={styles.resellerMeta}>Full Video • With PDF</Text>
    </View>
  </TouchableOpacity>
);

// ─── Empty placeholder for horizontal lists ────────────────────
const HorizontalEmpty = ({message}) => (
  <View style={styles.horizontalEmpty}>
    <Ionicons name="alert-circle-outline" size={30} color="#ccc" />
    <Text style={styles.horizontalEmptyText}>{message}</Text>
  </View>
);

// ─── Main HomeScreen ───────────────────────────────────────────
const HomeScreen = ({openDrawer}) => {
  const navigation = useNavigation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [nearbyStores, setNearbyStores] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [favoriteStores, setFavoriteStores] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUserProfile(),
        fetchNearbyStores(),
        fetchTrendingProducts(),
        fetchFavoriteStores(),
      ]);
    } catch (e) {
      console.error('fetchAllData error:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      setUserProfile(res);
    } catch (e) {
      console.error('fetchUserProfile:', e);
    }
  };

  const fetchNearbyStores = async () => {
    try {
      const res = await storesAPI.getAll();
      let stores = Array.isArray(res) ? res : res?.stores ?? res?.data ?? [];
      console.log('✅ Setting', stores.length, 'nearby stores');
      setNearbyStores(stores);
    } catch (e) {
      console.error('fetchNearbyStores:', e);
      setNearbyStores([]);
    }
  };

  const fetchTrendingProducts = async () => {
    try {
      const res = await productsAPI.getTrending();
      setTrendingProducts(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error('fetchTrendingProducts:', e);
      setTrendingProducts([]);
    }
  };

  const fetchFavoriteStores = async () => {
    try {
      const res = await storesAPI.getFavorites();
      setFavoriteStores(Array.isArray(res) ? res : res?.favorites ?? []);
    } catch (e) {
      console.error('fetchFavoriteStores:', e);
      setFavoriteStores([]);
    }
  };

  const handleToggleFavorite = async (storeId) => {
    try {
      await storesAPI.favorite(storeId);
      fetchFavoriteStores();
    } catch (e) {
      console.error('toggleFavorite:', e);
    }
  };

  const handleToggleLike = async (storeId) => {
    try {
      await storesAPI.like(storeId);
      fetchNearbyStores();
    } catch (e) {
      console.error('toggleLike:', e);
    }
  };

  const carouselImages = [
    {id: 1, isMap: true},
    {id: 2, isDashboard: true},
    {id: 3, isSlider: true},
  ];

  const renderCarouselItem = ({item}) => {
    const inner = item.isMap ? (
      <Dashboard2 />
    ) : item.isDashboard ? (
      <Dashboard userProfile={userProfile} />
    ) : (
      <Dashboard3 />
    );
    return (
      <View style={{width: wp(90), height: '100%', overflow: 'hidden', alignSelf: 'center'}}>
        {inner}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.fullLoader}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{flex: 1, backgroundColor: '#fff'}}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <StatusBar translucent backgroundColor="transparent" />

      {/* ── Header + Carousel ── */}
      <ImageBackground source={require('../../../assets/vector_1.png')} style={styles.vector}>
        <View style={{marginTop: '6%'}}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <BinIQIcon />
            </View>
            <View style={styles.topBarRight}>
              <Pressable onPress={() => navigation.navigate('ReferFriend')}>
                <GetButton height={hp(3.5)} />
              </Pressable>
              <Pressable onPress={() => navigation.navigate('Notifications')}>
                <Notification height={hp(10)} />
              </Pressable>
            </View>
          </View>

          {/* Search bar */}
          <View style={styles.searchRow}>
            <Pressable
              style={styles.searchContainer}
              onPress={() => navigation.navigate('SearchScreen')}>
              <View style={styles.iconPad}><CameraIcon /></View>
              <Text style={styles.searchPlaceholder}>search for anything</Text>
              <View style={styles.iconPad}><SearchIcon /></View>
            </Pressable>
            <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
              <SettingsIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Carousel */}
        <Carousel
          data={carouselImages}
          renderItem={renderCarouselItem}
          sliderWidth={width}
          itemWidth={width}
          layout="default"
          loop
          onSnapToItem={setActiveSlide}
        />
        <Pagination
          dotsLength={carouselImages.length}
          activeDotIndex={activeSlide}
          containerStyle={styles.paginationContainer}
          dotStyle={styles.paginationDot}
          inactiveDotStyle={styles.paginationInactiveDot}
          inactiveDotOpacity={0.3}
          inactiveDotScale={0.7}
        />
      </ImageBackground>

      {/* ── BIN STORES NEAR ME ── */}
      <View style={styles.section}>
        <SectionHeader
          title="Bin Stores Near Me"
          count={nearbyStores.length}
          onViewAll={() => navigation.navigate('TopBinsNearMe')}
        />
        <FlatList
          data={nearbyStores.slice(0, 10)} // show up to 10, scroll to see all
          renderItem={({item, index}) => (
            <StoreCard
              item={item}
              index={index}
              userProfile={userProfile}
              onLike={handleToggleLike}
              onPress={() => navigation.navigate('TopBinsNearMe', {storeId: item._id})}
            />
          )}
          keyExtractor={(item, i) => item._id?.toString() || i.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}          // ✅ horizontal scroll ON
          contentContainerStyle={styles.hListContent}
          ListEmptyComponent={<HorizontalEmpty message="No stores found nearby" />}
        />
      </View>

      {/* ── TOP BIN ITEMS ── */}
      <View style={styles.section}>
        <SectionHeader
          title="TOP BIN ITEMS"
          count={trendingProducts.length}
          onViewAll={() => navigation.navigate('TopBinItems')}
        />
        <FlatList
          data={trendingProducts.slice(0, 10)}
          renderItem={({item, index}) => (
            <ProductCard
              item={item}
              index={index}
              onPress={() => navigation.navigate('TopBinItems', {productId: item._id})}
            />
          )}
          keyExtractor={(item, i) => item._id?.toString() || i.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}          // ✅ horizontal scroll ON
          contentContainerStyle={styles.hListContent}
          ListEmptyComponent={<HorizontalEmpty message="No trending products" />}
        />
      </View>

      {/* ── MY FAVOURITES ── */}
      <View style={styles.section}>
        <SectionHeader
          title="MY FAVORITES"
          count={favoriteStores.length}
          onViewAll={() => navigation.navigate('FavouritesScreen')}
        />
        <FlatList
          data={favoriteStores.slice(0, 10)}
          renderItem={({item, index}) => (
            <FavouriteCard
              item={item}
              index={index}
              onToggle={handleToggleFavorite}
            />
          )}
          keyExtractor={(item, i) => item._id?.toString() || i.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}          // ✅ horizontal scroll ON
          contentContainerStyle={styles.hListContent}
          ListEmptyComponent={<HorizontalEmpty message="No favorites yet" />}
        />
      </View>

      {/* ── RESELLER IQ PORTAL ── */}
      <View style={styles.section}>
        <SectionHeader
          title="RESELLER IQ PORTAL"
          onViewAll={() => navigation.navigate('IQPortal')}
        />
        <FlatList
          data={[
            {id: '1', title: 'Bin Store', onPress: () => {}},
            {id: '2', title: 'Reseller Training', onPress: () => navigation.navigate('IQPortal')},
            {id: '3', title: 'Advanced Flipping', onPress: () => navigation.navigate('IQPortal')},
          ]}
          renderItem={({item}) => (
            <ResellerCard title={item.title} onPress={item.onPress} />
          )}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}          // ✅ horizontal scroll ON
          contentContainerStyle={styles.hListContent}
        />
      </View>

      <View style={{height: 30}} />
    </ScrollView>
  );
};

export default HomeScreen;

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Full-page loader
  fullLoader: {flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'},
  loadingText: {marginTop: 10, fontFamily: 'Nunito-Regular', color: '#000'},

  // Header area
  vector: {flex: 1, width: wp(100), height: hp(78)},
  topBar: {
    width: wp(90),
    height: hp(5),
    alignSelf: 'center',
    marginVertical: '4%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topBarLeft: {width: '28%', justifyContent: 'center'},
  topBarRight: {
    width: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingRight: '4%',
  },
  searchRow: {flexDirection: 'row', alignItems: 'center', marginHorizontal: '3%'},
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginRight: 10,
    borderColor: '#99ABC678',
    height: hp(6),
    backgroundColor: '#F2F2F2',
  },
  iconPad: {padding: 10},
  searchPlaceholder: {flex: 1, fontSize: hp(2.2), fontFamily: 'Nunito-Regular', color: '#999'},
  menuButton: {
    backgroundColor: '#130160',
    padding: 10,
    borderRadius: 12,
    height: hp(6),
    width: wp(14),
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Pagination
  paginationContainer: {position: 'absolute', left: '43%', bottom: '-8%', width: wp(10), zIndex: 2},
  paginationDot: {width: 10, height: 10, borderRadius: 5, backgroundColor: '#130160'},
  paginationInactiveDot: {backgroundColor: 'rgba(0,0,0,0.3)'},

  // Section wrapper
  section: {marginTop: hp(2), paddingHorizontal: '4%'},
  sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp(1.5)},
  sectionTitle: {fontFamily: 'Nunito-Bold', fontSize: hp(2.3), color: '#000'},
  viewAll: {color: '#524B6B', fontSize: hp(1.9), textDecorationLine: 'underline'},
  hListContent: {paddingRight: 16, paddingVertical: 8},

  // Empty horizontal state
  horizontalEmpty: {
    width: wp(50),
    height: hp(20),
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  horizontalEmptyText: {fontFamily: 'Nunito-Regular', color: '#aaa', fontSize: hp(1.8)},

  // Heart button
  cardHeart: {position: 'absolute', right: '3%', top: '3%', zIndex: 10},
  heartBg: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },

  // Store Card
  storeCard: {
    width: wp(47),
    height: hp(23),
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  storeCardImage: {width: '100%', height: hp(12), borderTopLeftRadius: 12, borderTopRightRadius: 12},
  placeholderStoreName: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Nunito-Bold',
    fontSize: hp(1.5),
    marginTop: 4,
    paddingHorizontal: 8,
  },
  storeCardInfo: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: '4%'},
  storeName: {fontFamily: 'Nunito-SemiBold', color: '#0049AF', fontSize: hp(1.8)},
  storeAddress: {fontFamily: 'Nunito-Regular', color: '#555', fontSize: hp(1.4)},
  storeDistance: {fontFamily: 'Nunito-SemiBold', color: '#14BA9C', fontSize: hp(1.4), marginTop: 2},
  ratingBadge: {
    backgroundColor: '#FFBB36',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ratingText: {color: '#fff', fontFamily: 'Nunito-Bold', fontSize: hp(1.3)},

  // Product Card
  productCard: {
    width: wp(42),
    height: hp(22),
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  productCardImage: {width: '100%', height: hp(12)},
  productHeart: {position: 'absolute', right: '4%', top: '3%'},
  productInfo: {padding: '4%'},
  productName: {fontFamily: 'Nunito-SemiBold', color: '#0049AF', fontSize: hp(1.7)},
  productDesc: {fontFamily: 'Nunito-Regular', color: '#777', fontSize: hp(1.4), marginTop: 2},
  productPrice: {fontFamily: 'Nunito-Bold', color: '#000', fontSize: hp(1.7), marginTop: 4},

  // Favourite Card
  favCard: {
    width: wp(40),
    height: hp(22),
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  favCardImage: {width: '100%', height: hp(13)},
  favInfo: {padding: '5%'},
  favName: {fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(1.7)},
  favSub: {fontFamily: 'Nunito-Bold', color: '#130160', fontSize: hp(1.5), marginTop: 3},

  // Reseller Card
  resellerCard: {
    width: wp(44),
    height: hp(22),
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  resellerImage: {width: '100%', height: hp(11)},
  resellerInfo: {padding: '5%'},
  resellerCategory: {fontFamily: 'Nunito-ExtraBold', color: '#0049AF', fontSize: hp(1.5)},
  resellerTitle: {fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(1.9), marginVertical: 2},
  resellerMeta: {fontFamily: 'Nunito-SemiBold', color: '#14BA9C', fontSize: hp(1.4)},
});