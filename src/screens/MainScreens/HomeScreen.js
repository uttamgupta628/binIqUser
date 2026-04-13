import {
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  FlatList,
  Pressable,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  PermissionsAndroid,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import Geolocation from '@react-native-community/geolocation';
import BinIQIcon from '../../../assets/BinIQIcon.svg';
import GetButton from '../../../assets/GetButton.svg';
import SettingsIcon from '../../../assets/SettingsIcon.svg';
import CameraIcon from '../../../assets/CameraIcon.svg';
import SearchIcon from '../../../assets/SearchIcon.svg';
import Dashboard from './Dashboard';
import Dashboard2 from './Dashboard2';
import Dashboard3 from './Dashboard3';
import {
  storesAPI,
  productsAPI,
  userAPI,
  notificationsAPI,
  promotionsAPI,
} from '../../api/apiService';
import {getAuthToken} from '../../api/apiService';

const {width} = Dimensions.get('window');

const STORE_FALLBACK = require('../../../assets/flip_find.png');
const PRODUCT_FALLBACK = require('../../../assets/colgate.png');
const RESELLER_IMG = require('../../../assets/reseller_training.png');

Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'whenInUse',
  locationProvider: 'android',
});

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const already = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (already) return true;
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'BinIQ needs your location to show nearby stores.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (e) {
      return false;
    }
  }
  return true;
};

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

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

const SectionHeader = ({title, count, onViewAll}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>
      {title}
      {count != null ? ` (${count})` : ''}
    </Text>
    <TouchableOpacity onPress={onViewAll}>
      <Text style={styles.viewAll}>View All</Text>
    </TouchableOpacity>
  </View>
);

// ── Store Card ─────────────────────────────────────────────────
const StoreCard = ({
  item,
  favoriteStores,
  userLocation,
  onFavorite,
  onPress,
}) => {
  const distance = (() => {
    const storeLat = parseFloat(
      item.user_latitude ?? item.latitude ?? item.location?.latitude,
    );
    const storeLon = parseFloat(
      item.user_longitude ?? item.longitude ?? item.location?.longitude,
    );
    if (
      !userLocation ||
      !storeLat ||
      !storeLon ||
      isNaN(storeLat) ||
      isNaN(storeLon)
    )
      return null;
    return getDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      storeLat,
      storeLon,
    );
  })();

  const avgRating =
    item.comments?.length > 0
      ? (
          item.comments.reduce((s, c) => s + (c.rating || 0), 0) /
          item.comments.length
        ).toFixed(1)
      : '4.2';

  const isFavorited = favoriteStores?.some(s => s._id === item._id) ?? false;
  const imageUri = item.store_image || item.image || null;

  return (
    <Pressable style={styles.storeCard} onPress={onPress}>
      <SmartImage
        uri={imageUri}
        fallback={STORE_FALLBACK}
        style={styles.storeCardImage}
      />
      <Pressable style={styles.cardHeart} onPress={() => onFavorite(item._id)}>
        <View style={styles.heartBg}>
          <Ionicons
            name={isFavorited ? 'heart' : 'heart-outline'}
            size={hp(2.4)}
            color="#EE2525"
          />
        </View>
      </Pressable>
      <View style={styles.storeCardInfo}>
        <View style={{flex: 1}}>
          <Text style={styles.storeName} numberOfLines={1}>
            {item.store_name || 'Store'}
          </Text>
          <Text style={styles.storeAddress} numberOfLines={1}>
            {item.address || 'Location'}
          </Text>
          {distance !== null ? (
            <View style={styles.distanceRow}>
              <Ionicons name="location-sharp" size={11} color="#14BA9C" />
              <Text style={styles.storeDistance}>{distance} km away</Text>
            </View>
          ) : (
            <Text style={styles.storeDistance}>Distance N/A</Text>
          )}
        </View>
        <View style={styles.ratingBadge}>
          <FontAwesome name="star" size={10} color="#fff" />
          <Text style={styles.ratingText}>{avgRating}</Text>
        </View>
      </View>
    </Pressable>
  );
};

// ── Product Card (attractive) ──────────────────────────────────
const ProductCard = ({item, onPress}) => {
  const imageUri =
    item.images?.[0] ||
    item.image ||
    item.banner_image ||
    item.product_image ||
    null;
  const hasDiscount =
    item.original_price && item.price && item.original_price > item.price;
  const discountPct = hasDiscount
    ? Math.round(
        ((item.original_price - item.price) / item.original_price) * 100,
      )
    : item.discount_percentage || null;

  return (
    <Pressable style={styles.productCard} onPress={onPress}>
      <View style={styles.productImageWrap}>
        <SmartImage
          uri={imageUri}
          fallback={PRODUCT_FALLBACK}
          style={styles.productCardImage}
        />
        {discountPct && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{discountPct}% OFF</Text>
          </View>
        )}
        <View style={styles.productHeartBtn}>
          <Ionicons name="heart-outline" size={hp(2)} color="#EE2525" />
        </View>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.title || item.name || item.product_name || 'Product'}
        </Text>
        {item.store_name && (
          <Text style={styles.productStore} numberOfLines={1}>
            <Ionicons name="storefront-outline" size={10} color="#14BA9C" />{' '}
            {item.store_name}
          </Text>
        )}
        <View style={styles.productPriceRow}>
          <Text style={styles.productPrice}>
            ${item.price || item.discounted_price || '0'}
          </Text>
          {item.original_price && (
            <Text style={styles.productOriginalPrice}>
              ${item.original_price}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

// ── Favourite Card ─────────────────────────────────────────────
const FavouriteCard = ({item, onToggle, onPress}) => {
  const imageUri = item.store_image || item.image || null;
  return (
    <Pressable style={styles.favCard} onPress={onPress}>
      <SmartImage
        uri={imageUri}
        fallback={STORE_FALLBACK}
        style={styles.favCardImage}
      />
      <Pressable
        style={styles.cardHeart}
        onPress={e => {
          e.stopPropagation();
          onToggle(item._id);
        }}>
        <View style={styles.heartBg}>
          <Ionicons name="heart" size={hp(2.4)} color="#EE2525" />
        </View>
      </Pressable>
      <View style={styles.favInfo}>
        <Text style={styles.favName} numberOfLines={1}>
          {item.store_name || 'Store'}
        </Text>
        <Text style={styles.favSub}>Featured Store</Text>
      </View>
    </Pressable>
  );
};

// ── Reseller Card ──────────────────────────────────────────────
const ResellerCard = ({title, onPress}) => (
  <TouchableOpacity style={styles.resellerCard} onPress={onPress}>
    <Image
      source={RESELLER_IMG}
      style={styles.resellerImage}
      resizeMode="cover"
    />
    <View style={styles.resellerOverlay} />
    <View style={styles.resellerInfo}>
      <Text style={styles.resellerCategory}>How to start a Bin Store</Text>
      <Text style={styles.resellerTitle}>{title}</Text>
      <View style={styles.resellerMetaRow}>
        <View style={styles.resellerMetaBadge}>
          <Text style={styles.resellerMeta}>Full Video</Text>
        </View>
        <View
          style={[styles.resellerMetaBadge, {backgroundColor: '#14BA9C22'}]}>
          <Text style={[styles.resellerMeta, {color: '#14BA9C'}]}>
            With PDF
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const HorizontalEmpty = ({message}) => (
  <View style={styles.horizontalEmpty}>
    <Ionicons name="alert-circle-outline" size={30} color="#ccc" />
    <Text style={styles.horizontalEmptyText}>{message}</Text>
  </View>
);

// ── Search Modal ───────────────────────────────────────────────
const SearchModal = ({
  visible,
  onClose,
  allStores,
  allPromotions,
  navigation,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
    }
  }, [visible]);

  const handleSearch = text => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      return;
    }
    const q = text.toLowerCase();

    const storeResults = allStores
      .filter(
        s =>
          (s.store_name || '').toLowerCase().includes(q) ||
          (s.address || '').toLowerCase().includes(q) ||
          (s.city || '').toLowerCase().includes(q),
      )
      .slice(0, 5)
      .map(s => ({...s, _type: 'store'}));

    const promoResults = allPromotions
      .filter(
        p =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.upc_id || '').toLowerCase().includes(q),
      )
      .slice(0, 5)
      .map(p => ({...p, _type: 'promotion'}));

    setResults([...storeResults, ...promoResults]);
  };

  const handleSelect = item => {
    onClose();
    if (item._type === 'store') {
      navigation.navigate('BinStore', {store: item});
    } else {
      navigation.navigate('SinglePageItem', {product: item});
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}>
      <View style={styles.searchModalOverlay}>
        <View style={styles.searchModalBox}>
          {/* Search Input */}
          <View style={styles.searchModalInputRow}>
            <Ionicons
              name="search"
              size={20}
              color="#999"
              style={{marginRight: 8}}
            />
            <TextInput
              ref={inputRef}
              style={styles.searchModalInput}
              placeholder="Search stores, promotions..."
              placeholderTextColor="#999"
              value={query}
              onChangeText={handleSearch}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setQuery('');
                  setResults([]);
                }}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Results */}
          {results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item, i) => item._id || i.toString()}
              style={styles.searchResultsList}
              renderItem={({item}) => {
                const isStore = item._type === 'store';
                const imageUri = isStore
                  ? item.store_image || null
                  : item.banner_image || item.images?.[0] || null;
                return (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => handleSelect(item)}>
                    <SmartImage
                      uri={imageUri}
                      fallback={isStore ? STORE_FALLBACK : PRODUCT_FALLBACK}
                      style={styles.searchResultImage}
                    />
                    <View style={{flex: 1}}>
                      <Text style={styles.searchResultTitle} numberOfLines={1}>
                        {isStore ? item.store_name : item.title || item.name}
                      </Text>
                      <Text style={styles.searchResultSub} numberOfLines={1}>
                        {isStore
                          ? item.address || item.city || 'Store'
                          : `$${item.price || '0'} · ${
                              item.category_id?.name || 'Promotion'
                            }`}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.searchTypeBadge,
                        {backgroundColor: isStore ? '#0049AF22' : '#14BA9C22'},
                      ]}>
                      <Text
                        style={[
                          styles.searchTypeBadgeText,
                          {color: isStore ? '#0049AF' : '#14BA9C'},
                        ]}>
                        {isStore ? 'Store' : 'Promo'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          ) : query.length > 0 ? (
            <View style={styles.searchNoResults}>
              <Ionicons name="search-outline" size={40} color="#ddd" />
              <Text style={styles.searchNoResultsText}>
                No results for "{query}"
              </Text>
            </View>
          ) : (
            <View style={styles.searchNoResults}>
              <Ionicons name="search-outline" size={40} color="#ddd" />
              <Text style={styles.searchNoResultsText}>
                Search for stores or promotions
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.searchCloseBtn} onPress={onClose}>
            <Text style={styles.searchCloseBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ── Main HomeScreen ────────────────────────────────────────────
const HomeScreen = ({openDrawer}) => {
  const navigation = useNavigation();

  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [allStores, setAllStores] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [allPromotions, setAllPromotions] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [favoriteStores, setFavoriteStores] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLabel, setLocationLabel] = useState('Fetching location...');
  const [showSearch, setShowSearch] = useState(false);

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
        fetchUnreadCount(),
        fetchPromotions(),
      ]);
    } catch (e) {
      console.error('fetchAllData:', e);
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

  const fetchPromotions = async () => {
    try {
      const res = await promotionsAPI.getAll();
      const list = Array.isArray(res) ? res : res?.promotions ?? [];
      setAllPromotions(list);
    } catch (e) {
      console.error('fetchPromotions:', e);
    }
  };

  const fetchNearbyStores = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setLocationLabel('Location unavailable');
      return loadAllStores(null);
    }
    Geolocation.getCurrentPosition(
      async position => {
        const {latitude, longitude} = position.coords;
        setUserLocation({latitude, longitude});
        setLocationLabel('');
        loadAllStores({latitude, longitude});
      },
      error => {
        setLocationLabel('Location unavailable');
        loadAllStores(null);
      },
      {enableHighAccuracy: false, timeout: 30000, maximumAge: 300000},
    );
  };
  const GOOGLE_MAPS_API_KEY = 'AIzaSyCY-8_-SbCN29nphT9QFtbzWV5H3asJQ4Q';

  const geocodeAddress = async address => {
    if (!address) return null;
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address,
        )}&key=${GOOGLE_MAPS_API_KEY}`,
      );
      const json = await res.json();
      if (json.status === 'OK' && json.results?.length > 0) {
        const {lat, lng} = json.results[0].geometry.location;
        return {latitude: lat, longitude: lng};
      }
    } catch (e) {
      console.warn('Geocode error:', e);
    }
    return null;
  };
  const loadAllStores = async location => {
    try {
      const res = await storesAPI.getAll();
      const stores = Array.isArray(res) ? res : res?.stores ?? res?.data ?? [];

      if (!location) {
        setAllStores(stores);
        return;
      }

      const {latitude, longitude} = location;
      const RADIUS_KM = 50;

      // ── Geocode stores that are missing lat/lon (same as Dashboard2) ──
      const geocoded = await Promise.all(
        stores.map(async store => {
          if (store.user_latitude && store.user_longitude) {
            return {
              ...store,
              _coords: {
                latitude: parseFloat(store.user_latitude),
                longitude: parseFloat(store.user_longitude),
              },
            };
          }
          // Fallback: geocode the address string
          if (store.address) {
            const coords = await geocodeAddress(
              [store.address, store.city, store.country]
                .filter(Boolean)
                .join(', '),
            );
            if (coords) return {...store, _coords: coords};
          }
          return null;
        }),
      );

      const withCoords = geocoded
        .filter(Boolean)
        .map(s => ({
          ...s,
          _distanceKm: parseFloat(
            getDistanceKm(
              latitude,
              longitude,
              s._coords.latitude,
              s._coords.longitude,
            ),
          ),
        }))
        .filter(s => s._distanceKm <= RADIUS_KM)
        .sort((a, b) => a._distanceKm - b._distanceKm);

      setAllStores(withCoords);
    } catch (e) {
      console.error('loadAllStores:', e);
      setAllStores([]);
    }
  };
  const fetchTrendingProducts = async () => {
    try {
      // Wait for auth token to be ready before calling the API
      const token = await getAuthToken();
      if (!token) {
        console.log('No auth token yet — skipping promotions fetch');
        return;
      }

      const promoRes = await promotionsAPI.getAll();
      let list = Array.isArray(promoRes)
        ? promoRes
        : promoRes?.promotions ?? promoRes?.data ?? [];

      if (list.length === 0) {
        setTrendingProducts([]);
        return;
      }

      // Enrich with store names (same logic as TopBinsItems)
      const storeRes = await storesAPI.getAll();
      const stores = Array.isArray(storeRes)
        ? storeRes
        : storeRes?.stores ?? [];

      const storeLookup = {};
      stores.forEach(s => {
        if (s.user_id) storeLookup[s.user_id] = s;
      });

      list = list.map(promo => {
        const store = storeLookup[promo.user_id];
        return {
          ...promo,
          store_name: store?.store_name || promo.store_name || 'Unknown Store',
          store_image: store?.store_image || promo.store_image || null,
        };
      });

      console.log('✅ Promotions for home:', list.length);
      setTrendingProducts(list);
    } catch (e) {
      console.error('fetchTrendingProducts:', e);
      setTrendingProducts([]);
    }
  };
  const fetchUnreadCount = async () => {
    try {
      const data = await notificationsAPI.getAll();
      const list = Array.isArray(data) ? data : data.notifications || [];
      setUnreadCount(list.filter(n => !n.read).length);
    } catch (e) {
      console.error('fetchUnreadCount:', e);
    }
  };

  const fetchFavoriteStores = async () => {
    try {
      const res = await storesAPI.getFavorites();
      setFavoriteStores(Array.isArray(res) ? res : res?.favorites ?? []);
    } catch (e) {
      console.error('fetchFavoriteStores:', e);
    }
  };

  const handleToggleFavorite = async storeId => {
    const alreadyFav = favoriteStores.some(s => s._id === storeId);
    if (alreadyFav) {
      setFavoriteStores(prev => prev.filter(s => s._id !== storeId));
    } else {
      const store = allStores.find(s => s._id === storeId);
      if (store) setFavoriteStores(prev => [...prev, store]);
    }
    try {
      await storesAPI.favorite(storeId);
      fetchFavoriteStores();
    } catch (e) {
      fetchFavoriteStores();
    }
  };

  const carouselImages = [
    {id: 1, isMap: true},
    {id: 2, isDashboard: true},
    {id: 3, isSlider: true},
  ];

  const renderCarouselItem = ({item}) => {
    const isFullWidth = item.isMap;

    const inner = item.isMap ? (
      <Dashboard2 />
    ) : item.isDashboard ? (
      <Dashboard userProfile={userProfile} />
    ) : (
      <Dashboard3 />
    );

    return (
      <View
        style={{
          width: width, // all items same width for carousel
          height: '100%',
          overflow: 'hidden',
          paddingHorizontal: isFullWidth ? 0 : wp(5), // 👈 padding on non-full
        }}>
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
    <>
      {/* Search Modal */}
      <SearchModal
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        allStores={allStores}
        allPromotions={allPromotions}
        navigation={navigation}
      />

      <ScrollView
        style={{flex: 1, backgroundColor: '#fff'}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <StatusBar translucent backgroundColor="transparent" />

        <ImageBackground
          source={require('../../../assets/vector_1.png')}
          style={styles.vector}>
          <View style={{marginTop: '6%'}}>
            <View style={styles.topBar}>
              {/* Hamburger on top-left */}
              <TouchableOpacity
                style={styles.hamburgerBtn}
                onPress={openDrawer}>
                <Ionicons name="menu" size={hp(3.2)} color="#fff" />
              </TouchableOpacity>
              <View style={styles.topBarRight}>
                <Pressable onPress={() => navigation.navigate('ReferFriend')}>
                  <GetButton height={hp(3.5)} />
                </Pressable>
                <Pressable
                  onPress={() => navigation.navigate('Notifications')}
                  style={styles.notifButton}>
                  <Ionicons
                    name="notifications-outline"
                    size={hp(3.2)}
                    color="#000"
                  />
                  {unreadCount > 0 && (
                    <View style={styles.notifBadge}>
                      <Text style={styles.notifBadgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>

            {/* <View style={styles.locationBar}>
              <Ionicons name="location-sharp" size={14} color="#14BA9C" />
              <Text style={styles.locationText} numberOfLines={1}>{locationLabel}</Text>
            </View> */}

            {/* Search Bar — opens modal on tap */}
            <View style={styles.searchRow}>
              <Pressable
                style={styles.searchContainer}
                onPress={() => setShowSearch(true)}>
                <View style={styles.iconPad}>
                  <SearchIcon />
                </View>
                <Text style={styles.searchPlaceholder}>
                  search stores, promotions...
                </Text>
              </Pressable>
              {/* menuButton removed from here */}
            </View>
          </View>

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
            count={allStores.length}
            onViewAll={() =>
              navigation.navigate('TopBinsNearMe', {
                stores: allStores,
                userLocation: userLocation,
              })
            }
          />
          {!userLocation && (
            <View style={styles.locationWarning}>
              <Ionicons name="warning-outline" size={14} color="#E8A020" />
              <Text style={styles.locationWarningText}>
                Enable location for accurate nearby results
              </Text>
            </View>
          )}
          <FlatList
            data={allStores.slice(0, 6)}
            renderItem={({item, index}) => (
              <StoreCard
                item={item}
                index={index}
                favoriteStores={favoriteStores}
                userLocation={userLocation}
                onFavorite={handleToggleFavorite}
                onPress={() => navigation.navigate('BinStore', {store: item})}
              />
            )}
            keyExtractor={(item, i) => item._id?.toString() || i.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hListContent}
            ListEmptyComponent={<HorizontalEmpty message="No stores found" />}
          />
        </View>

        {/* ── TOP BIN ITEMS (Promotions) ── */}
        <View style={styles.section}>
          <SectionHeader
            title="TOP BIN ITEMS"
            count={trendingProducts.length}
            onViewAll={() =>
              navigation.navigate('TopBinItems', {
                products: trendingProducts,
                userLocation: userLocation,
              })
            }
          />
          <FlatList
            data={trendingProducts.slice(0, 8)}
            renderItem={({item}) => (
              <ProductCard
                item={item}
                onPress={() =>
                  navigation.navigate('TopBinItems', {
                    products: trendingProducts,
                    productId: item._id,
                  })
                }
              />
            )}
            keyExtractor={(item, i) => item._id?.toString() || i.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hListContent}
            ListEmptyComponent={
              <HorizontalEmpty message="No items available" />
            }
          />
        </View>

        {/* ── MY FAVOURITES ── */}
        <View style={styles.section}>
          <SectionHeader
            title=" MY FAVORITE"
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
                onPress={() => navigation.navigate('BinStore', {store: item})}
              />
            )}
            keyExtractor={(item, i) => item._id?.toString() || i.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
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
              {
                id: '2',
                title: 'Reseller Training',
                onPress: () => navigation.navigate('IQPortal'),
              },
              {
                id: '3',
                title: 'Advanced Flipping',
                onPress: () => navigation.navigate('IQPortal'),
              },
            ]}
            renderItem={({item}) => (
              <ResellerCard title={item.title} onPress={item.onPress} />
            )}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hListContent}
          />
        </View>

        <View style={{height: 30}} />
      </ScrollView>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  fullLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {marginTop: 10, fontFamily: 'Nunito-Regular', color: '#000'},
  vector: {flex: 1, width: wp(100), height: hp(80)},

  topBar: {
    width: wp(90),
    height: hp(5),
    alignSelf: 'center',
    marginVertical: '4%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // topBarLeft:  {width: '28%', justifyContent: 'center'},
  topBarRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },

  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: '5%',
    marginBottom: 6,
  },
  locationText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.6),
    color: '#555',
    flex: 1,
  },
  locationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8E7',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8A020',
  },
  locationWarningText: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.5),
    color: '#E8A020',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: '3%',
  },
  hamburgerBtn: {
    backgroundColor: '#130160',
    padding: 6,
    borderRadius: 12,
    height: hp(5),
    width: wp(12),
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Update searchContainer — remove marginRight since no sibling button
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#99ABC678',
    height: hp(6),
    backgroundColor: '#F2F2F2',
  },
  iconPad: {padding: 10},
  searchPlaceholder: {
    flex: 1,
    fontSize: hp(2),
    fontFamily: 'Nunito-Regular',
    color: '#aaa',
  },
  menuButton: {
    backgroundColor: '#130160',
    padding: 10,
    borderRadius: 12,
    height: hp(6),
    width: wp(14),
    justifyContent: 'center',
    alignItems: 'center',
  },

  paginationContainer: {
    position: 'absolute',
    left: '43%',
    bottom: '-2%',
    width: wp(10),
    zIndex: 2,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#130160',
  },
  paginationInactiveDot: {backgroundColor: 'rgba(0,0,0,0.3)'},

  section: {marginTop: hp(1), paddingHorizontal: '4%'},
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
  hListContent: {paddingRight: 16, paddingVertical: 8},

  horizontalEmpty: {
    width: wp(50),
    height: hp(20),
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  horizontalEmptyText: {
    fontFamily: 'Nunito-Regular',
    color: '#aaa',
    fontSize: hp(1.8),
  },

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
  storeCardImage: {
    width: '100%',
    height: hp(12),
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  storeCardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '4%',
  },
  storeName: {
    fontFamily: 'Nunito-SemiBold',
    color: '#0049AF',
    fontSize: hp(1.8),
  },
  storeAddress: {
    fontFamily: 'Nunito-Regular',
    color: '#555',
    fontSize: hp(1.4),
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  storeDistance: {
    fontFamily: 'Nunito-SemiBold',
    color: '#14BA9C',
    fontSize: hp(1.4),
  },
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
    width: wp(44),
    marginRight: 12,
    borderRadius: 14,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  productImageWrap: {position: 'relative'},
  productCardImage: {width: wp(44), height: hp(14)},
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF4444',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  discountBadgeText: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
    fontSize: hp(1.2),
  },
  productHeartBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 5,
    elevation: 2,
  },
  productInfo: {padding: 10},
  productName: {
    fontFamily: 'Nunito-Bold',
    color: '#130160',
    fontSize: hp(1.7),
    marginBottom: 3,
    lineHeight: hp(2.3),
  },
  productStore: {
    fontFamily: 'Nunito-Regular',
    color: '#14BA9C',
    fontSize: hp(1.4),
    marginBottom: 4,
  },
  productPriceRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  productPrice: {
    fontFamily: 'Nunito-Bold',
    color: '#130160',
    fontSize: hp(1.9),
  },
  productOriginalPrice: {
    fontFamily: 'Nunito-Regular',
    color: '#bbb',
    fontSize: hp(1.5),
    textDecorationLine: 'line-through',
  },

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
  favSub: {
    fontFamily: 'Nunito-Bold',
    color: '#130160',
    fontSize: hp(1.5),
    marginTop: 3,
  },

  // Reseller Card
  resellerCard: {
    width: wp(48),
    height: hp(22),
    marginRight: 12,
    borderRadius: 14,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  resellerImage: {width: '100%', height: '60%'},
  resellerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(19,1,96,0.15)',
  },
  resellerInfo: {padding: '5%'},
  resellerCategory: {
    fontFamily: 'Nunito-ExtraBold',
    color: '#0049AF',
    fontSize: hp(1.4),
  },
  resellerTitle: {
    fontFamily: 'Nunito-Bold',
    color: '#130160',
    fontSize: hp(1.9),
    marginVertical: 3,
  },
  resellerMetaRow: {flexDirection: 'row', gap: 6},
  resellerMetaBadge: {
    backgroundColor: '#13016012',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  resellerMeta: {
    fontFamily: 'Nunito-SemiBold',
    color: '#130160',
    fontSize: hp(1.3),
  },

  notifButton: {position: 'relative', padding: 4},
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  notifBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Nunito-Bold',
    lineHeight: 13,
  },

  // Search Modal
  searchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
  },
  searchModalBox: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: hp(7),
    paddingHorizontal: 16,
    paddingBottom: 16,
    maxHeight: hp(80),
  },
  searchModalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: hp(6.5),
    marginBottom: 12,
  },
  searchModalInput: {
    flex: 1,
    fontFamily: 'Nunito-Regular',
    fontSize: hp(2),
    color: '#000',
  },
  searchResultsList: {maxHeight: hp(50)},
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: 10,
  },
  searchResultImage: {width: wp(12), height: wp(12), borderRadius: 8},
  searchResultTitle: {
    fontFamily: 'Nunito-SemiBold',
    color: '#130160',
    fontSize: hp(1.8),
  },
  searchResultSub: {
    fontFamily: 'Nunito-Regular',
    color: '#999',
    fontSize: hp(1.5),
    marginTop: 2,
  },
  searchTypeBadge: {borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3},
  searchTypeBadgeText: {fontFamily: 'Nunito-Bold', fontSize: hp(1.3)},
  searchNoResults: {alignItems: 'center', paddingVertical: hp(5)},
  searchNoResultsText: {
    fontFamily: 'Nunito-Regular',
    color: '#999',
    fontSize: hp(1.9),
    marginTop: 10,
  },
  searchCloseBtn: {alignItems: 'center', paddingVertical: 14, marginTop: 4},
  searchCloseBtnText: {
    fontFamily: 'Nunito-SemiBold',
    color: '#130160',
    fontSize: hp(1.9),
  },
});
