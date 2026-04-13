import {useNavigation, useFocusEffect, useRoute} from '@react-navigation/native';
import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ImageBackground,
  StatusBar,
  Pressable,
  Image,
  TouchableOpacity,
  Switch,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SearchIcon from '../../../assets/SearchIcon.svg';
import {promotionsAPI, productsAPI, storesAPI} from '../../api/apiService';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const PRODUCT_FALLBACK = require('../../../assets/colgate.png');

// ── Haversine distance ─────────────────────────────────────────
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

// ── Smart image with fallback ──────────────────────────────────
const SmartImage = ({uri, fallback, style}) => {
  const [failed, setFailed] = useState(false);
  if (uri && !failed) {
    return (
      <Image
        source={{uri}}
        style={style}
        resizeMode="cover"
        onError={() => setFailed(true)}
      />
    );
  }
  return <Image source={fallback} style={style} resizeMode="cover" />;
};

// ── Product / Promotion Card ───────────────────────────────────
const ProductCard = ({item, isFavorite, onToggleFavorite, onPress}) => {
  const imageUri    = item.banner_image || item.images?.[0] || item.image || null;
  const isPromotion = !!item.upc_id || !!item.start_date;
  const hasDiscount =
    item.original_price && item.price && item.original_price > item.price;
  const discountPct = hasDiscount
    ? Math.round(
        ((item.original_price - item.price) / item.original_price) * 100,
      )
    : item.discount_percentage || null;
  const isExpired = item.end_date && new Date(item.end_date) < new Date();
  const isActive  = item.status === 'Active' || !item.status;

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={onPress}
      activeOpacity={0.92}>
      <View style={styles.imageContainer}>
        <SmartImage
          uri={imageUri}
          fallback={PRODUCT_FALLBACK}
          style={styles.productImage}
        />
        <View style={styles.imageOverlay} />

        {/* Promo badge — only when no discount badge */}
        {isPromotion && isActive && !isExpired && !discountPct && (
          <View style={styles.promoBadge}>
            <Ionicons name="pricetag" size={9} color="#fff" />
            <Text style={styles.promoBadgeText}>PROMO</Text>
          </View>
        )}

        {/* Discount badge */}
        {discountPct ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{discountPct}% OFF</Text>
          </View>
        ) : null}

        {/* Expired overlay */}
        {isExpired && (
          <View style={styles.expiredOverlay}>
            <Text style={styles.expiredText}>EXPIRED</Text>
          </View>
        )}

        {/* Sold overlay */}
        {item.sold && !isExpired && (
          <View style={styles.soldOverlay}>
            <View style={styles.soldBadge}>
              <Text style={styles.soldText}>SOLD</Text>
            </View>
          </View>
        )}

        {/* Heart / Favourite */}
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={() => onToggleFavorite(item._id || item.id)}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={hp(2.4)}
            color="#EE2525"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.title || item.name || item.product_name || 'Item'}
        </Text>

        {item.store_name && (
          <View style={styles.storeRow}>
            <Ionicons name="storefront-outline" size={11} color="#14BA9C" />
            <Text style={styles.storeName} numberOfLines={1}>
              {item.store_name}
            </Text>
          </View>
        )}

        {(item.category_id?.name || item.category) && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {item.category_id?.name || item.category}
            </Text>
          </View>
        )}

        <View style={styles.priceRow}>
          <Text style={styles.price}>${item.price || '0'}</Text>
          {item.original_price ? (
            <Text style={styles.originalPrice}>${item.original_price}</Text>
          ) : null}
        </View>

        {item.end_date && (
          <Text style={styles.expiryText}>
            {isExpired
              ? '⚠ Expired'
              : `Ends ${new Date(item.end_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day:   'numeric',
                })}`}
          </Text>
        )}

        {/* Distance pill */}
        {item._distanceKm !== null && item._distanceKm !== undefined && (
          <View style={styles.distancePill}>
            <Ionicons name="navigate-outline" size={10} color="#14BA9C" />
            <Text style={styles.distanceText}>{item._distanceKm} km</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ── Main Screen ────────────────────────────────────────────────
const TopBinsItems = () => {
  const navigation = useNavigation();
  const route      = useRoute();

  const [loading, setLoading]                   = useState(true);
  const [allProducts, setAllProducts]           = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [searchQuery, setSearchQuery]           = useState('');
  const [showSoldItems, setShowSoldItems]       = useState(false);
  const [showExpired, setShowExpired]           = useState(true); // default ON — API data may be expired

  // keep latest filter state accessible inside async callbacks
  const filterStateRef = useRef({showSoldItems, showExpired, searchQuery});
  filterStateRef.current = {showSoldItems, showExpired, searchQuery};

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
      fetchFavorites();
    }, []),
  );

  // ── Fetch ──────────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const userLocation = route.params?.userLocation;

      // 1. Promotions
      const promoRes = await promotionsAPI.getAll();
      let list = Array.isArray(promoRes)
        ? promoRes
        : promoRes?.promotions ?? promoRes?.data ?? [];

      // 2. Stores
      const storeRes = await storesAPI.getAll();
      const stores   = Array.isArray(storeRes)
        ? storeRes
        : storeRes?.stores ?? [];

      const storeLookup = {};
      stores.forEach(s => {
        if (s.user_id) storeLookup[s.user_id] = s;
      });

      // 3. Enrich with store info + distance
      list = list.map(promo => {
        const store    = storeLookup[promo.user_id];
        const storeLat = parseFloat(store?.user_latitude);
        const storeLon = parseFloat(store?.user_longitude);
        const dist =
          store && storeLat && storeLon && !isNaN(storeLat) && userLocation
            ? parseFloat(
                getDistanceKm(
                  userLocation.latitude,
                  userLocation.longitude,
                  storeLat,
                  storeLon,
                ),
              )
            : null;
        return {
          ...promo,
          store_name:  store?.store_name  || promo.store_name  || 'Unknown Store',
          store_image: store?.store_image || promo.store_image || null,
          store_city:  store?.city        || store?.state      || null,
          _distanceKm: dist,
        };
      });

      // 4. Sort by distance
      if (userLocation) {
        list.sort((a, b) => {
          if (a._distanceKm !== null && b._distanceKm !== null)
            return a._distanceKm - b._distanceKm;
          if (a._distanceKm !== null) return -1;
          if (b._distanceKm !== null) return 1;
          return 0;
        });
      }

      // 5. Fallback to trending products
      if (list.length === 0) {
        const pRes = await productsAPI.getTrending().catch(() => []);
        list = Array.isArray(pRes) ? pRes : [];
      }

      setAllProducts(list);
      const {showSoldItems: sold, showExpired: expired, searchQuery: q} =
        filterStateRef.current;
      applyFilters(list, sold, expired, q);
    } catch (err) {
      console.error('fetchProducts error:', err);
      Alert.alert('Error', 'Failed to load items: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await storesAPI.getFavorites();
      if (res?.favorites) {
        setFavoriteProducts(
          res.favorites
            .filter(f => f.type === 'product' || f.product_id)
            .map(f => f.product_id || f._id),
        );
      }
    } catch (_) {}
  };

  // ── Filter logic (pure, no setState side-effects) ──────────
  const applyFilters = (products, includeSold, includeExpired, query) => {
    let filtered = [...products];

    if (!includeSold)    filtered = filtered.filter(p => !p.sold);
    if (!includeExpired)
      filtered = filtered.filter(
        p => !p.end_date || new Date(p.end_date) >= new Date(),
      );

    const q = query.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(p =>
        (p.title           || p.name || p.product_name || '')
          .toLowerCase()
          .includes(q) ||
        (p.description     || '').toLowerCase().includes(q) ||
        (p.store_name      || '').toLowerCase().includes(q) ||
        (p.upc_id          || '').toLowerCase().includes(q) ||
        (p.category_id?.name || p.category || '').toLowerCase().includes(q),
      );
    }

    setFilteredProducts(filtered);
  };

  // ── Handlers ───────────────────────────────────────────────
  const handleSearch = text => {
    setSearchQuery(text);
    applyFilters(allProducts, showSoldItems, showExpired, text);
  };

  const handleClearSearch = () => handleSearch('');

  const handleToggleSold = () => {
    const next = !showSoldItems;
    setShowSoldItems(next);
    applyFilters(allProducts, next, showExpired, searchQuery);
  };

  const handleToggleExpired = () => {
    const next = !showExpired;
    setShowExpired(next);
    applyFilters(allProducts, showSoldItems, next, searchQuery);
  };

  const handleToggleFavorite = async productId => {
    setFavoriteProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId],
    );
    try {
      await storesAPI.favorite(productId);
    } catch (_) {}
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}
        resizeMode="stretch">

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <MaterialIcons name="arrow-back-ios" color="#0D0D26" size={25} />
            </Pressable>
            <Text style={styles.headerText}>Top Bin Items</Text>
          </View>
          {!loading && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{filteredProducts.length}</Text>
            </View>
          )}
        </View>

        {/* ── Search Bar (no filter button) ── */}
        <View style={styles.searchParent}>
          <View style={styles.searchContainer}>
            <View style={styles.iconPad}>
              <SearchIcon />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Search items, stores, promos..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
              clearButtonMode="never" // handled manually for Android parity
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={handleClearSearch}
                style={styles.iconPad}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Controls Row ── */}
        <View style={styles.controlsRow}>
          <View style={styles.resultsInfo}>
            <Text style={styles.resultsText}>
              {loading ? '...' : `${filteredProducts.length} items`}
            </Text>
            {route.params?.userLocation && (
              <View style={styles.nearbyBadge}>
                <Ionicons name="location-sharp" size={11} color="#14BA9C" />
                <Text style={styles.nearbyBadgeText}>Near you</Text>
              </View>
            )}
          </View>
          <View style={styles.togglesRow}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Sold</Text>
              <Switch
                trackColor={{false: '#ddd', true: '#56CD54'}}
                thumbColor="#fff"
                onValueChange={handleToggleSold}
                value={showSoldItems}
              />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Expired</Text>
              <Switch
                trackColor={{false: '#ddd', true: '#E8A020'}}
                thumbColor="#fff"
                onValueChange={handleToggleExpired}
                value={showExpired}
              />
            </View>
          </View>
        </View>

        {/* ── Content ── */}
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#130160" />
            <Text style={styles.loadingText}>Loading items...</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="pricetag-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery.trim()
                ? `No results for "${searchQuery}"`
                : 'No items found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery.trim()
                ? 'Try a different search term'
                : 'Try adjusting your filters'}
            </Text>
            {searchQuery.trim() && (
              <TouchableOpacity
                style={styles.clearSearchBtn}
                onPress={handleClearSearch}>
                <Text style={styles.clearSearchText}>Clear search</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={({item}) => (
              <ProductCard
                item={item}
                isFavorite={favoriteProducts.includes(item._id || item.id)}
                onToggleFavorite={handleToggleFavorite}
                onPress={() =>
                  navigation.navigate('SinglePageItem', {product: item})
                }
              />
            )}
            keyExtractor={(item, i) =>
              (item._id || item.id || i).toString()
            }
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
          />
        )}
      </ImageBackground>
    </View>
  );
};

export default TopBinsItems;

// ── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#E6F3F5'},
  vector:    {flex: 1, width: wp(100)},

  // Header
  header:      {
    width: wp(100),
    height: hp(7),
    marginTop: '10%',
    paddingHorizontal: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerChild: {flexDirection: 'row', alignItems: 'center', gap: 10},
  headerText:  {fontFamily: 'Nunito-Bold', fontSize: hp(3), color: '#0D0140'},
  countBadge:  {
    backgroundColor:  '#130160',
    borderRadius:     12,
    paddingHorizontal: 10,
    paddingVertical:  4,
  },
  countText: {color: '#fff', fontFamily: 'Nunito-Bold', fontSize: hp(1.7)},

  // Search — full width, no filter button
  searchParent: {
    flexDirection:   'row',
    alignItems:      'center',
    marginHorizontal: '3%',
    marginVertical:  '3%',
  },
  searchContainer: {
    flex:            1,
    flexDirection:   'row',
    alignItems:      'center',
    borderWidth:     1,
    borderRadius:    12,
    borderColor:     '#99ABC678',
    height:          hp(6.5),
    backgroundColor: '#F2F2F2',
  },
  iconPad: {padding: 10},
  input: {
    flex:        1,
    fontSize:    hp(2),
    fontFamily:  'Nunito-Regular',
    color:       '#000',
  },

  // Controls row
  controlsRow: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingHorizontal: '4%',
    marginBottom:    hp(1.5),
  },
  resultsInfo: {flexDirection: 'row', alignItems: 'center', gap: 8},
  resultsText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize:   hp(1.8),
    color:      '#666',
  },
  nearbyBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             3,
    backgroundColor: '#14BA9C22',
    borderRadius:    6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  nearbyBadgeText: {
    fontFamily: 'Nunito-SemiBold',
    color:      '#14BA9C',
    fontSize:   hp(1.4),
  },
  togglesRow: {flexDirection: 'row', gap: 12},
  toggleRow:  {flexDirection: 'row', alignItems: 'center', gap: 4},
  toggleLabel: {
    fontFamily: 'Nunito-SemiBold',
    color:      '#333',
    fontSize:   hp(1.6),
  },

  // List
  listContent:   {paddingHorizontal: wp(3), paddingBottom: hp(10)},
  columnWrapper: {justifyContent: 'space-between', marginBottom: hp(1.5)},

  // Loader / Empty
  loaderContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {
    marginTop:  10,
    fontFamily: 'Nunito-Regular',
    fontSize:   hp(2),
    color:      '#666',
  },
  emptyContainer: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
    paddingTop:     hp(10),
  },
  emptyText: {
    fontFamily: 'Nunito-Bold',
    fontSize:   hp(2.5),
    color:      '#666',
    marginTop:  16,
    textAlign:  'center',
    paddingHorizontal: '10%',
  },
  emptySubtext: {
    fontFamily: 'Nunito-Regular',
    fontSize:   hp(1.8),
    color:      '#999',
    marginTop:  6,
  },
  clearSearchBtn: {
    marginTop:       16,
    backgroundColor: '#130160',
    borderRadius:    8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  clearSearchText: {
    color:      '#fff',
    fontFamily: 'Nunito-Bold',
    fontSize:   hp(1.8),
  },

  // Product Card
  productCard: {
    width:           wp(44),
    borderRadius:    16,
    backgroundColor: '#fff',
    elevation:       5,
    shadowColor:     '#000',
    shadowOffset:    {width: 0, height: 4},
    shadowOpacity:   0.12,
    shadowRadius:    8,
    overflow:        'hidden',
  },
  imageContainer: {position: 'relative'},
  productImage:   {width: '100%', height: hp(15)},
  imageOverlay:   {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    height:          hp(4),
    backgroundColor: 'rgba(0,0,0,0.08)',
  },

  promoBadge: {
    position:        'absolute',
    top:             8,
    left:            8,
    backgroundColor: '#130160',
    borderRadius:    6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    flexDirection:   'row',
    alignItems:      'center',
    gap:             3,
  },
  promoBadgeText: {
    color:      '#fff',
    fontFamily: 'Nunito-Bold',
    fontSize:   hp(1.1),
  },
  discountBadge: {
    position:        'absolute',
    top:             8,
    left:            8,
    backgroundColor: '#FF4444',
    borderRadius:    6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  discountBadgeText: {
    color:      '#fff',
    fontFamily: 'Nunito-Bold',
    fontSize:   hp(1.2),
  },

  expiredOverlay: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    bottom:          0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent:  'center',
    alignItems:      'center',
  },
  expiredText: {
    color:       '#fff',
    fontFamily:  'Nunito-Bold',
    fontSize:    hp(2.2),
    letterSpacing: 1,
  },
  soldOverlay: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    bottom:          0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent:  'center',
    alignItems:      'center',
  },
  soldBadge: {
    backgroundColor:  '#fff',
    borderRadius:     8,
    paddingHorizontal: 16,
    paddingVertical:  6,
  },
  soldText: {
    color:      '#130160',
    fontFamily: 'Nunito-Bold',
    fontSize:   hp(2),
  },

  heartBtn: {
    position:        'absolute',
    right:           8,
    top:             8,
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         5,
    elevation:       3,
  },

  productInfo:   {padding: 10},
  productName:   {
    fontFamily: 'Nunito-Bold',
    color:      '#130160',
    fontSize:   hp(1.8),
    marginBottom: 3,
    lineHeight: hp(2.4),
  },
  storeRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           3,
    marginBottom:  4,
  },
  storeName: {
    fontFamily: 'Nunito-Regular',
    color:      '#14BA9C',
    fontSize:   hp(1.4),
    flex:       1,
  },
  categoryBadge: {
    backgroundColor:  '#F0F4FF',
    borderRadius:     4,
    paddingHorizontal: 6,
    paddingVertical:  2,
    alignSelf:        'flex-start',
    marginBottom:     6,
  },
  categoryText: {
    fontFamily: 'Nunito-SemiBold',
    color:      '#0049AF',
    fontSize:   hp(1.2),
  },
  priceRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  price: {
    fontFamily: 'Nunito-Bold',
    color:      '#130160',
    fontSize:   hp(2.1),
  },
  originalPrice: {
    fontFamily:         'Nunito-Regular',
    color:              '#bbb',
    fontSize:           hp(1.5),
    textDecorationLine: 'line-through',
  },
  expiryText: {
    fontFamily: 'Nunito-Regular',
    color:      '#E8A020',
    fontSize:   hp(1.3),
    marginTop:  4,
  },
  distancePill: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              3,
    marginTop:        4,
    backgroundColor:  '#14BA9C15',
    borderRadius:     4,
    paddingHorizontal: 5,
    paddingVertical:  2,
    alignSelf:        'flex-start',
  },
  distanceText: {
    fontFamily: 'Nunito-SemiBold',
    color:      '#14BA9C',
    fontSize:   hp(1.2),
  },
});