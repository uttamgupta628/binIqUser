import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import MapView, {Marker, Circle, PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';
import {storesAPI} from '../../api/apiService';

const {width} = Dimensions.get('window');

const GOOGLE_MAPS_API_KEY = 'AIzaSyCY-8_-SbCN29nphT9QFtbzWV5H3asJQ4Q';
// const DEFAULT_RADIUS_KM = 50;

// ─── Haversine distance (km) ───────────────────────────────────
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── Geocode address ──────────────────────────────────────────
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

const fmtCount = n => {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const fmtDist = km => {
  if (km == null) return '';
  const miles = km * 0.621371;
  if (miles < 0.1) return `${Math.round(miles * 5280)} ft`;
  return `${miles.toFixed(1)} mi`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Custom Marker
// ─────────────────────────────────────────────────────────────────────────────
const StoreMarker = ({store, isSelected, onPress}) => (
  <Marker
    coordinate={store.coords}
    onPress={onPress}
    tracksViewChanges={false}
    anchor={{x: 0.5, y: 1}}>
    <View style={[mStyles.bubble, isSelected && mStyles.bubbleSel]}>
      <MaterialIcons
        name="store"
        size={isSelected ? 18 : 14}
        color={isSelected ? '#fff' : '#130160'}
      />
    </View>
    <View style={[mStyles.tail, isSelected && mStyles.tailSel]} />
  </Marker>
);

const mStyles = StyleSheet.create({
  bubble: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#130160',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  bubbleSel: {backgroundColor: '#130160', padding: 9, borderColor: '#fff'},
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#130160',
    alignSelf: 'center',
    marginTop: -1,
  },
  tailSel: {borderTopColor: '#130160'},
});

// ─────────────────────────────────────────────────────────────────────────────
// Store Card
// ─────────────────────────────────────────────────────────────────────────────
const StoreCard = ({store, isSelected, onPress, onFavorite, isFavorited}) => (
  <TouchableOpacity
    style={[cStyles.card, isSelected && cStyles.cardSelected]}
    onPress={onPress}
    activeOpacity={0.92}>
    <View style={cStyles.imgWrapper}>
      {store.store_image ? (
        <Image
          source={{uri: store.store_image}}
          style={cStyles.img}
          resizeMode="cover"
        />
      ) : (
        <View style={[cStyles.img, cStyles.imgPlaceholder]}>
          <MaterialIcons name="store" size={30} color="#bbb" />
        </View>
      )}
      <TouchableOpacity
        style={cStyles.heartBtn}
        onPress={onFavorite}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
        <Ionicons
          name={isFavorited ? 'heart' : 'heart-outline'}
          size={16}
          color={isFavorited ? '#EE2525' : '#555'}
        />
      </TouchableOpacity>
    </View>

    <View style={cStyles.info}>
      <Text style={cStyles.name} numberOfLines={1}>
        {store.store_name || 'Store'}
      </Text>

      <View style={cStyles.row}>
        {store.ratings > 0 &&
          Array(5)
            .fill(0)
            .map((_, i) => (
              <MaterialIcons
                key={i}
                name={
                  i < Math.floor(store.ratings)
                    ? 'star'
                    : i < store.ratings
                    ? 'star-half'
                    : 'star-border'
                }
                size={12}
                color="#FFA500"
              />
            ))}
        {store.rating_count > 0 && (
          <Text style={cStyles.rCount}> {fmtCount(store.rating_count)}</Text>
        )}
        {store.distance != null && (
          <Text style={cStyles.dist}>
            {store.ratings > 0 ? '   ' : ''}
            {fmtDist(store.distance)}
          </Text>
        )}
      </View>

      {(store.city || store.address) && (
        <Text style={cStyles.addr} numberOfLines={1}>
          {store.city || store.address}
        </Text>
      )}

      {store.working_time && (
        <View style={cStyles.row}>
          <MaterialIcons name="schedule" size={11} color="#524B6B" />
          <Text style={cStyles.meta} numberOfLines={1}>
            {' '}
            {store.working_days
              ? `${store.working_days} · ${store.working_time}`
              : store.working_time}
          </Text>
        </View>
      )}

      <View style={cStyles.row}>
        <MaterialIcons name="people" size={11} color="#130160" />
        <Text style={cStyles.stat}> {fmtCount(store.followers)}</Text>
        <Text style={cStyles.dot}>  ·  </Text>
        <Ionicons name="heart" size={11} color="#EE2525" />
        <Text style={cStyles.stat}> {fmtCount(store.likes)}</Text>
      </View>
    </View>

    <View style={cStyles.chevron}>
      <MaterialIcons name="chevron-right" size={20} color="#130160" />
    </View>
  </TouchableOpacity>
);

const cStyles = StyleSheet.create({
  card: {
    width: wp(74),
    backgroundColor: '#fff',
    borderRadius: 14,
    flexDirection: 'row',
    marginRight: wp(3),
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardSelected: {borderColor: '#130160', elevation: 8},
  imgWrapper: {width: wp(22), minHeight: hp(14), position: 'relative'},
  img: {width: '100%', height: '100%'},
  imgPlaceholder: {
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtn: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 14,
    padding: 4,
    elevation: 2,
  },
  info: {flex: 1, padding: wp(2.5), justifyContent: 'center', gap: 3},
  name: {fontFamily: 'Nunito-Bold', fontSize: hp(1.9), color: '#1A1A2E', marginBottom: 2},
  row: {flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'},
  rCount: {fontFamily: 'Nunito-Regular', fontSize: hp(1.35), color: '#524B6B'},
  dist: {fontFamily: 'Nunito-Bold', fontSize: hp(1.4), color: '#130160'},
  addr: {fontFamily: 'Nunito-Regular', fontSize: hp(1.4), color: '#888'},
  meta: {fontFamily: 'Nunito-Regular', fontSize: hp(1.3), color: '#524B6B', flex: 1},
  stat: {fontFamily: 'Nunito-SemiBold', fontSize: hp(1.3), color: '#333'},
  dot: {fontFamily: 'Nunito-Regular', fontSize: hp(1.3), color: '#bbb'},
  chevron: {justifyContent: 'center', paddingRight: wp(1)},
});

// ─────────────────────────────────────────────────────────────────────────────
// Radius Pill Picker
// ─────────────────────────────────────────────────────────────────────────────
const RADIUS_OPTIONS = [5, 10, 25, 50, 100]; // these are now MILES
const DEFAULT_RADIUS_KM = 50 * 1.60934; 

const RadiusPicker = ({selected, onChange}) => (
  <View style={rpStyles.row}>
    {RADIUS_OPTIONS.map(r => (
      <TouchableOpacity
        key={r}
        style={[rpStyles.pill, selected === r && rpStyles.pillActive]}
        onPress={() => onChange(r)}>
        <Text style={[rpStyles.label, selected === r && rpStyles.labelActive]}>
          {r} mi
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const rpStyles = StyleSheet.create({
  row: {flexDirection: 'row', gap: wp(1.5), flexWrap: 'wrap'},
  pill: {
    paddingHorizontal: wp(2.8),
    paddingVertical: hp(0.6),
    borderRadius: 20,
    backgroundColor: '#F0EEF8',
    borderWidth: 1,
    borderColor: '#D0CCE8',
  },
  pillActive: {backgroundColor: '#130160', borderColor: '#130160'},
  label: {fontFamily: 'Nunito-SemiBold', fontSize: hp(1.5), color: '#524B6B'},
  labelActive: {color: '#fff'},
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
const StoreMapScreen = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const flatListRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(true);

  const [allStores, setAllStores] = useState([]);
  const [nearbyStores, setNearbyStores] = useState([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [cardVisible, setCardVisible] = useState(false);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);

  // ── Request Android location permission ────────────────────────
  const requestPermission = async () => {
    if (Platform.OS === 'android') {
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
    }
    return true;
  };

  // ── Get user location ──────────────────────────────────────────
  const fetchUserLocation = useCallback(async () => {
    setIsLocating(true);
    setLocationError(null);
    const ok = await requestPermission();
    if (!ok) {
      setLocationError('Location permission denied.');
      setIsLocating(false);
      return;
    }
    Geolocation.getCurrentPosition(
      pos => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      err => {
        console.warn('Location error:', err.message);
        setLocationError('Could not get your location.');
        setIsLocating(false);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  }, []);

  // ── Load all stores + geocode missing coords ───────────────────
  const loadStores = useCallback(async () => {
    setIsLoadingStores(true);
    try {
      const res = await storesAPI.getAll();
      const raw = Array.isArray(res) ? res : res?.stores ?? res?.data ?? [];

      const geocoded = await Promise.all(
        raw.map(async store => {
          if (store.user_latitude && store.user_longitude) {
            return {
              ...store,
              coords: {
                latitude: parseFloat(store.user_latitude),
                longitude: parseFloat(store.user_longitude),
              },
            };
          }
          if (store.address) {
            const coords = await geocodeAddress(
              [store.address, store.city, store.country]
                .filter(Boolean)
                .join(', '),
            );
            if (coords) return {...store, coords};
          }
          return null;
        }),
      );

      setAllStores(geocoded.filter(Boolean));
    } catch (e) {
      console.error('loadStores:', e);
    } finally {
      setIsLoadingStores(false);
    }
  }, []);

  // ── On mount ───────────────────────────────────────────────────
  useEffect(() => {
    fetchUserLocation();
    loadStores();
  }, []);

  // ── Filter + sort by distance whenever deps change ─────────────
  useEffect(() => {
    if (allStores.length === 0) return;

    if (!userLocation) {
      // No location yet — show all, no distance
      setNearbyStores(allStores.map(s => ({...s, distance: null})));
      return;
    }

    const withDist = allStores
      .map(s => ({
        ...s,
        distance: haversine(
          userLocation.latitude,
          userLocation.longitude,
          s.coords.latitude,
          s.coords.longitude,
        ),
      }))
      .filter(s => s.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    setNearbyStores(withDist);
  }, [allStores, userLocation, radiusKm]);

  // ── Auto-show cards when nearby stores arrive ──────────────────
  useEffect(() => {
    if (nearbyStores.length > 0) {
      setSelectedIndex(0);
      if (!cardVisible) showCard();
    } else if (nearbyStores.length === 0 && cardVisible) {
      hideCard();
    }
  }, [nearbyStores.length]);

  // ── Fit map to user + stores ───────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    if (nearbyStores.length === 0 && userLocation) {
      mapRef.current.animateToRegion(
        {...userLocation, latitudeDelta: 0.15, longitudeDelta: 0.15},
        600,
      );
      return;
    }

    if (nearbyStores.length > 0) {
      const coords = [
        ...(userLocation ? [userLocation] : []),
        ...nearbyStores.map(s => s.coords),
      ];
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: {top: 120, right: 50, bottom: 300, left: 50},
          animated: true,
        });
      }, 700);
    }
  }, [nearbyStores.length, userLocation]);

  // ── Card animations ────────────────────────────────────────────
  const showCard = useCallback(() => {
    setCardVisible(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [slideAnim]);

  const hideCard = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setCardVisible(false));
  }, [slideAnim]);

  // ── Marker press ───────────────────────────────────────────────
  const handleMarkerPress = useCallback(
    index => {
      setSelectedIndex(index);
      if (!cardVisible) showCard();

      const store = nearbyStores[index];
      if (store?.coords && mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: store.coords.latitude - 0.008,
            longitude: store.coords.longitude,
            latitudeDelta: 0.06,
            longitudeDelta: 0.06,
          },
          400,
        );
      }
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({index, animated: true});
      }, 180);
    },
    [nearbyStores, cardVisible, showCard],
  );

  // ── Card scroll → sync marker ──────────────────────────────────
  const handleCardScroll = useCallback(
    event => {
      const x = event.nativeEvent.contentOffset.x;
      const cardW = wp(74) + wp(3);
      const index = Math.round(x / cardW);
      if (index >= 0 && index < nearbyStores.length && index !== selectedIndex) {
        setSelectedIndex(index);
        const store = nearbyStores[index];
        if (store?.coords && mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: store.coords.latitude - 0.008,
              longitude: store.coords.longitude,
              latitudeDelta: 0.06,
              longitudeDelta: 0.06,
            },
            350,
          );
        }
      }
    },
    [nearbyStores, selectedIndex],
  );

  // ── Favorite ───────────────────────────────────────────────────
  const handleFavorite = useCallback(async store => {
    const id = store._id;
    setFavoritedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    try {
      await storesAPI.favorite(id);
    } catch {
      setFavoritedIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    }
  }, []);

  // ── Navigate to store detail ───────────────────────────────────
  const handleStorePress = useCallback(
    store => navigation.navigate('BinStore', {store}),
    [navigation],
  );

  // ── Recenter on user ───────────────────────────────────────────
  const handleRecenter = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {...userLocation, latitudeDelta: 0.1, longitudeDelta: 0.1},
        500,
      );
    } else {
      fetchUserLocation();
    }
  }, [userLocation, fetchUserLocation]);

  const cardTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [hp(30), 0],
  });

  const isLoading = isLocating || isLoadingStores;

  return (
    <View style={styles.container}>

      {/* ── Google Map ── */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation?.latitude ?? 20,
          longitude: userLocation?.longitude ?? 0,
          latitudeDelta: 60,
          longitudeDelta: 60,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        loadingEnabled
        loadingColor="#130160">

        {/* Radius circle around user */}
        {userLocation && (
          <Circle
            center={userLocation}
            radius={radiusKm * 1000}
            strokeColor="rgba(19,1,96,0.3)"
            fillColor="rgba(19,1,96,0.05)"
            strokeWidth={1.5}
          />
        )}

        {/* Store markers */}
        {nearbyStores.map((store, index) => (
          <StoreMarker
            key={store._id || index}
            store={store}
            isSelected={selectedIndex === index}
            onPress={() => handleMarkerPress(index)}
          />
        ))}
      </MapView>

      {/* ── Header ── */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#130160" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <MaterialIcons name="location-on" size={16} color="#EE2525" />
          <Text style={styles.headerTitle} numberOfLines={1}>
            {isLoading
              ? 'Finding stores…'
              : nearbyStores.length === 0
              ? 'No stores nearby'
              : `${nearbyStores.length} store${nearbyStores.length !== 1 ? 's' : ''} near you`}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.recenterBtn}
          onPress={handleRecenter}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <MaterialIcons name="my-location" size={20} color="#130160" />
        </TouchableOpacity>
      </View>

      {/* ── Radius picker bar ── */}
      <View style={styles.radiusBar}>
        <RadiusPicker selected={radiusKm / 1.60934} onChange={r => {
  setRadiusKm(r * 1.60934);  // convert miles to km for internal calculations
  setSelectedIndex(0);
}} />
      </View>

      {/* ── Loading pill ── */}
      {isLoading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#130160" />
          <Text style={styles.loadingText}>
            {isLocating ? 'Getting your location…' : 'Loading stores…'}
          </Text>
        </View>
      )}

      {/* ── No stores pill ── */}
      {!isLoading && nearbyStores.length === 0 && (
        <View style={styles.emptyBox}>
          <MaterialIcons name="store" size={28} color="#aaa" />
          <Text style={styles.emptyText}>
  No stores within {Math.round(radiusKm / 1.60934)} mi.{'\n'}Try a larger radius.
</Text>
        </View>
      )}

      {/* ── Bottom sheet with store cards ── */}
      {cardVisible && (
        <Animated.View
          style={[
            styles.bottomSheet,
            {transform: [{translateY: cardTranslateY}]},
          ]}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Sheet header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>
  {nearbyStores.length} store
  {nearbyStores.length !== 1 ? 's' : ''} within {Math.round(radiusKm / 1.60934)} mi
</Text>
              {userLocation && nearbyStores[selectedIndex]?.distance != null && (
                <Text style={styles.sheetSub}>
                  {nearbyStores[selectedIndex].store_name}
                  {'  ·  '}
                  {fmtDist(nearbyStores[selectedIndex].distance)} away
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={hideCard}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <MaterialIcons name="keyboard-arrow-down" size={26} color="#524B6B" />
            </TouchableOpacity>
          </View>

          {/* Horizontal cards */}
          <FlatList
            ref={flatListRef}
            data={nearbyStores}
            keyExtractor={(item, i) => item._id || String(i)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardList}
            onMomentumScrollEnd={handleCardScroll}
            snapToInterval={wp(74) + wp(3)}
            decelerationRate="fast"
            getItemLayout={(_, index) => ({
              length: wp(74) + wp(3),
              offset: (wp(74) + wp(3)) * index,
              index,
            })}
            renderItem={({item, index}) => (
              <StoreCard
                store={item}
                isSelected={selectedIndex === index}
                onPress={() => handleStorePress(item)}
                onFavorite={() => handleFavorite(item)}
                isFavorited={favoritedIds.has(item._id)}
              />
            )}
          />
        </Animated.View>
      )}

      {/* ── Show stores FAB (when sheet is hidden) ── */}
      {!cardVisible && !isLoading && nearbyStores.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={showCard}>
          <MaterialIcons name="store" size={18} color="#fff" />
          <Text style={styles.fabText}>Show {nearbyStores.length} stores</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default StoreMapScreen;

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff' },
  map: {...StyleSheet.absoluteFillObject},

  headerBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? hp(6) : hp(3),
    left: wp(4),
    right: wp(4),
    height: hp(6.5),
    backgroundColor: '#fff',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    gap: wp(2),
  },
  backBtn: {padding: wp(1)},
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
  },
  headerTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(1.9),
    color: '#130160',
  },
  recenterBtn: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(4.5),
    backgroundColor: '#F0EEF8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radiusBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? hp(14.5) : hp(11.5),
    left: wp(4),
    right: wp(4),
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 12,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  loadingBox: {
    position: 'absolute',
    bottom: hp(14),
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 16,
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2.5),
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  loadingText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.8),
    color: '#130160',
  },

  emptyBox: {
    position: 'absolute',
    bottom: hp(14),
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 16,
    paddingHorizontal: wp(8),
    paddingVertical: hp(2),
    alignItems: 'center',
    gap: hp(1),
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  emptyText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.8),
    color: '#524B6B',
    textAlign: 'center',
    lineHeight: hp(2.8),
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: hp(1),
    paddingBottom: Platform.OS === 'ios' ? hp(4) : hp(2),
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  handle: {
    width: wp(10),
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: hp(1),
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    marginBottom: hp(1.2),
  },
  sheetTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2),
    color: '#130160',
  },
  sheetSub: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.5),
    color: '#524B6B',
    marginTop: 2,
  },
  cardList: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(0.5),
  },

  fab: {
    position: 'absolute',
    bottom: hp(3),
    alignSelf: 'center',
    backgroundColor: '#130160',
    borderRadius: 25,
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.4),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    elevation: 8,
    shadowColor: '#130160',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  fabText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(1.8),
    color: '#fff',
  },
});