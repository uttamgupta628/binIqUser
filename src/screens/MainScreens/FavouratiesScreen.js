import {useNavigation, useFocusEffect} from '@react-navigation/native';
import React, {useState, useCallback, useMemo, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ImageBackground,
  StatusBar,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  Animated,
  Keyboard,
  Platform,
  PermissionsAndroid,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Geolocation from '@react-native-community/geolocation';
import MapView, {Marker, Circle, PROVIDER_GOOGLE} from 'react-native-maps';
import FilterIcon from '../../../assets/FilterIcon.svg';
import {storesAPI} from '../../api/apiService';

const {width, height} = Dimensions.get('window');
const wp = p => (width * p) / 100;
const hp = p => (height * p) / 100;

const STORE_FALLBACK = require('../../../assets/flip_find.png');
const GOOGLE_MAPS_API_KEY = 'AIzaSyCY-8_-SbCN29nphT9QFtbzWV5H3asJQ4Q';

// ─────────────────────────────────────────────────────────────────────────────
// SmartImage
// ─────────────────────────────────────────────────────────────────────────────
const SmartImage = ({uri, fallback, style, resizeMode = 'cover'}) => {
  const [failed, setFailed] = useState(false);
  const hasValidUri = typeof uri === 'string' && uri.trim().length > 0 && !failed;
  return (
    <Image
      source={hasValidUri ? {uri: uri.trim()} : fallback}
      style={style}
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Animated Search Bar
// ─────────────────────────────────────────────────────────────────────────────
const SearchBar = ({value, onChangeText, onClear, placeholder}) => {
  const inputRef = useRef(null);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () =>
    Animated.spring(focusAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 120,
      friction: 8,
    }).start();

  const handleBlur = () => {
    if (!value)
      Animated.spring(focusAnim, {
        toValue: 0,
        useNativeDriver: false,
        tension: 120,
        friction: 8,
      }).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E4E7ED', '#130160'],
  });

  return (
    <View style={styles.searchParent}>
      <Animated.View style={[styles.searchContainer, {borderColor}]}>
        <Ionicons
          name="search-outline"
          size={hp(2.3)}
          color={value ? '#130160' : '#AAAFBC'}
          style={{marginLeft: wp(3.5)}}
        />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder={placeholder || 'Search stores…'}
          placeholderTextColor="#AAAFBC"
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          onSubmitEditing={Keyboard.dismiss}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              onClear();
              inputRef.current?.focus();
            }}
            style={{paddingRight: wp(3.5)}}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <View style={styles.clearCircle}>
              <Ionicons name="close" size={hp(1.5)} color="#fff" />
            </View>
          </TouchableOpacity>
        )}
      </Animated.View>
      {/* <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
        <FilterIcon />
      </TouchableOpacity> */}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Highlight matched text
// ─────────────────────────────────────────────────────────────────────────────
const HighlightText = ({text = '', query, style, boldStyle}) => {
  if (!query?.trim()) return <Text style={style}>{text}</Text>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase().trim());
  if (idx === -1) return <Text style={style}>{text}</Text>;
  const q = query.trim();
  return (
    <Text style={style}>
      {text.slice(0, idx)}
      <Text style={boldStyle}>{text.slice(idx, idx + q.length)}</Text>
      {text.slice(idx + q.length)}
    </Text>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────────────────────
const EmptyState = ({icon, title, subtitle, isSearch}) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconCircle}>
      <Ionicons name={icon} size={hp(5)} color="#C2C8D8" />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySubtitle}>{subtitle}</Text>
    {isSearch && (
      <Text style={styles.emptyHint}>
        Try different keywords or check the spelling
      </Text>
    )}
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// Results Pill
// ─────────────────────────────────────────────────────────────────────────────
const ResultsPill = ({count, query}) => {
  if (!query) return null;
  return (
    <View style={styles.resultsPill}>
      <Ionicons name="search" size={hp(1.5)} color="#130160" />
      <Text style={styles.resultsPillText}>
        {count} result{count !== 1 ? 's' : ''} for{' '}
        <Text style={styles.resultsPillQuery}>"{query}"</Text>
      </Text>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MY FAVORITE ITEMS TAB
// ─────────────────────────────────────────────────────────────────────────────
const FavoritesTab = ({
  loading,
  favoriteStores,
  onRemoveFavorite,
  onCardPress,
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return favoriteStores;
    const q = query.toLowerCase().trim();
    return favoriteStores.filter(
      s =>
        (s.store_name || '').toLowerCase().includes(q) ||
        (s.address || s.city || '').toLowerCase().includes(q) ||
        (s.store_email || '').toLowerCase().includes(q),
    );
  }, [favoriteStores, query]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={styles.loadingText}>Loading favorites…</Text>
      </View>
    );
  }

  if (!favoriteStores?.length) {
    return (
      <EmptyState
        icon="heart-outline"
        title="No favorites yet"
        subtitle="Heart a store to see it here!"
      />
    );
  }

  return (
    <View style={{flex: 1}}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
        placeholder="Search favorite stores…"
      />

      <View style={styles.sectionRow}>
        <Text style={styles.sectionLabel}>FAVORITE ITEMS</Text>
        <View style={styles.countPill}>
          <Text style={styles.countPillText}>{favoriteStores.length}</Text>
        </View>
      </View>

      <ResultsPill count={filtered.length} query={query} />

      {filtered.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No results"
          subtitle={`Nothing matched "${query}"`}
          isSearch
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => item._id || String(i)}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridPad}
          keyboardShouldPersistTaps="handled"
          renderItem={({item}) => {
            const name = item.store_name || 'Store Name';
            const addr = item.address || item.city || 'No address';
            return (
              <TouchableOpacity
                style={styles.favCard}
                activeOpacity={0.88}
                onPress={() => onCardPress(item)}>
                <SmartImage
                  uri={item.store_image || item.image || null}
                  fallback={STORE_FALLBACK}
                  style={styles.favCardImage}
                />
                <TouchableOpacity
                  style={styles.cardActionBtn}
                  onPress={e => {
                    e.stopPropagation();
                    onRemoveFavorite(item._id);
                  }}
                  hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
                  <View style={styles.actionBtnBg}>
                    <Ionicons name="heart" size={hp(2)} color="#EE2525" />
                  </View>
                </TouchableOpacity>
                <View style={styles.cardInfo}>
                  <HighlightText
                    text={name}
                    query={query}
                    style={styles.cardName}
                    boldStyle={styles.cardNameHL}
                  />
                  <View style={styles.cardAddrRow}>
                    <Ionicons
                      name="location-outline"
                      size={hp(1.5)}
                      color="#AAAFBC"
                    />
                    <HighlightText
                      text={addr}
                      query={query}
                      style={styles.cardAddr}
                      boldStyle={styles.cardAddrHL}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Reverse‑geocode: {lat, lng} → readable address string
// ─────────────────────────────────────────────────────────────────────────────
const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`,
    );
    const json = await res.json();
    if (json.status === 'OK' && json.results?.length > 0) {
      return json.results[0].formatted_address;
    }
  } catch (e) {
    console.warn('reverseGeocode error:', e);
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION TAB  —  live GPS map  +  checked-in stores list
// ─────────────────────────────────────────────────────────────────────────────
const LocationTab = ({loading, checkedInStores, onCheckOut, onCardPress}) => {
  const mapRef = useRef(null);
  const [query, setQuery] = useState('');

  // GPS
  const [userCoords, setUserCoords] = useState(null);
  const [userAddress, setUserAddress] = useState('Locating…');
  const [gpsLoading, setGpsLoading] = useState(true);
  const [gpsError, setGpsError] = useState(null);
  const [mapExpanded, setMapExpanded] = useState(false);

  // Pulse animation for the user dot
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.7,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  useEffect(() => {
    requestLocationAndFetch();
  }, []);

  const requestLocationAndFetch = async () => {
    setGpsLoading(true);
    setGpsError(null);

    // Android permission
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'We need your location to show it on the map.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setGpsError(
            'Location permission denied.\nPlease enable it in Settings.',
          );
          setGpsLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Permission error:', e);
      }
    }

    Geolocation.getCurrentPosition(
      async pos => {
        const {latitude, longitude} = pos.coords;
        const coords = {latitude, longitude};
        setUserCoords(coords);
        setGpsLoading(false);

        // Animate map to user
        setTimeout(() => {
          mapRef.current?.animateToRegion(
            {...coords, latitudeDelta: 0.012, longitudeDelta: 0.012},
            800,
          );
        }, 400);

        // Human-readable address
        const addr = await reverseGeocode(latitude, longitude);
        setUserAddress(
          addr || `${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°`,
        );
      },
      err => {
        console.warn('GPS error:', err.code, err.message);
        setGpsError(
          err.code === 1
            ? 'Location permission denied.\nPlease enable it in Settings.'
            : 'Could not determine your location.\nMake sure GPS is enabled.',
        );
        setGpsLoading(false);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 5000},
    );
  };

  const recenterMap = () => {
    if (!userCoords) return;
    mapRef.current?.animateToRegion(
      {...userCoords, latitudeDelta: 0.012, longitudeDelta: 0.012},
      600,
    );
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return checkedInStores;
    const q = query.toLowerCase().trim();
    return checkedInStores.filter(
      s =>
        (s.store_name || '').toLowerCase().includes(q) ||
        (s.address || s.city || '').toLowerCase().includes(q),
    );
  }, [checkedInStores, query]);

  const mapHeight = mapExpanded ? hp(52) : hp(30);

  return (
    <ScrollView
      style={{flex: 1}}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">

      {/* ── Live Location Info Card ────────────────────────────── */}
      <View style={styles.locationCard}>
        {/* Card header row */}
        <View style={styles.locationCardHeader}>
          <View style={styles.locationCardTitleRow}>
            <View style={styles.liveChip}>
              <View style={styles.liveDot} />
              <Text style={styles.liveChipText}>LIVE</Text>
            </View>
            <Text style={styles.locationCardTitle}>My Current Location</Text>
          </View>
          <TouchableOpacity
            onPress={requestLocationAndFetch}
            style={styles.gpsRefreshBtn}
            activeOpacity={0.75}>
            <MaterialIcons name="my-location" size={hp(2.4)} color="#130160" />
          </TouchableOpacity>
        </View>

        {/* Status */}
        {gpsLoading ? (
          <View style={styles.gpsStatusRow}>
            <ActivityIndicator size="small" color="#130160" />
            <Text style={styles.gpsStatusText}>Acquiring GPS signal…</Text>
          </View>
        ) : gpsError ? (
          <View style={styles.gpsErrorBox}>
            <Ionicons name="warning-outline" size={hp(2.2)} color="#FF3B30" />
            <Text style={styles.gpsErrorText}>{gpsError}</Text>
            <TouchableOpacity
              onPress={requestLocationAndFetch}
              style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.addressRow}>
              <Ionicons name="location" size={hp(2.2)} color="#14BA9C" />
              <Text style={styles.addressText} numberOfLines={3}>
                {userAddress}
              </Text>
            </View>
            {userCoords && (
              <View style={styles.coordsBadge}>
                <MaterialIcons name="gps-fixed" size={hp(1.6)} color="#130160" />
                <Text style={styles.coordsText}>
                  {userCoords.latitude.toFixed(6)}°,{' '}
                  {userCoords.longitude.toFixed(6)}°
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* ── Map ───────────────────────────────────────────────── */}
      <View style={[styles.mapWrapper, {height: mapHeight}]}>
        {gpsLoading && !userCoords ? (
          <View style={styles.mapPlaceholder}>
            <ActivityIndicator size="large" color="#130160" />
            <Text style={styles.mapPlaceholderText}>Loading map…</Text>
          </View>
        ) : gpsError && !userCoords ? (
          <View style={styles.mapPlaceholder}>
            <MaterialIcons name="location-off" size={hp(6)} color="#D0D5DD" />
            <Text style={styles.mapPlaceholderText}>
              Map unavailable — location access required
            </Text>
            <TouchableOpacity
              style={styles.mapEnableBtn}
              onPress={requestLocationAndFetch}>
              <Text style={styles.mapEnableBtnText}>Enable Location</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={
              userCoords
                ? {
                    ...userCoords,
                    latitudeDelta: 0.012,
                    longitudeDelta: 0.012,
                  }
                : {
                    latitude: 0,
                    longitude: 0,
                    latitudeDelta: 90,
                    longitudeDelta: 90,
                  }
            }
            showsCompass={true}
            showsScale={true}
            loadingEnabled={true}
            loadingColor="#130160">

            {/* User location marker with animated pulse */}
            {userCoords && (
              <Marker
                coordinate={userCoords}
                title="You are here"
                anchor={{x: 0.5, y: 0.5}}>
                <View style={styles.userMarkerWrap}>
                  <Animated.View
                    style={[
                      styles.userMarkerPulse,
                      {transform: [{scale: pulseAnim}]},
                    ]}
                  />
                  <View style={styles.userMarkerRing}>
                    <View style={styles.userMarkerDot} />
                  </View>
                </View>
              </Marker>
            )}

            {/* Accuracy radius circle */}
            {userCoords && (
              <Circle
                center={userCoords}
                radius={100}
                fillColor="rgba(19,1,96,0.06)"
                strokeColor="rgba(19,1,96,0.18)"
                strokeWidth={1}
              />
            )}

            {/* Checked-in store markers */}
            {checkedInStores.map(store => {
              if (!store.latitude || !store.longitude) return null;
              return (
                <Marker
                  key={store._id}
                  coordinate={{
                    latitude: Number(store.latitude),
                    longitude: Number(store.longitude),
                  }}
                  title={store.store_name || 'Store'}
                  description={store.address || ''}
                  onPress={() => onCardPress(store)}>
                  <View style={styles.storeMapMarker}>
                    <MaterialIcons name="store" size={hp(2)} color="#fff" />
                  </View>
                </Marker>
              );
            })}
          </MapView>
        )}

        {/* Map controls overlay */}
        {userCoords && (
          <View style={styles.mapControls}>
            <TouchableOpacity style={styles.mapCtrlBtn} onPress={recenterMap}>
              <MaterialIcons name="my-location" size={hp(2.4)} color="#130160" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mapCtrlBtn, {marginTop: 8}]}
              onPress={() => setMapExpanded(e => !e)}>
              <MaterialIcons
                name={mapExpanded ? 'fullscreen-exit' : 'fullscreen'}
                size={hp(2.4)}
                color="#130160"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Checked-in Stores List ────────────────────────────── */}
      {/* <View style={styles.checkinsSection}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          placeholder="Search visited stores…"
        />

        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>MY CHECK-INS</Text>
          {checkedInStores.length > 0 && (
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{checkedInStores.length}</Text>
            </View>
          )}
        </View>

        <ResultsPill count={filtered.length} query={query} />

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#130160" />
            <Text style={styles.loadingText}>Loading check-ins…</Text>
          </View>
        ) : !checkedInStores.length ? (
          <EmptyState
            icon="location-outline"
            title="No check-ins yet"
            subtitle={'Visit a store and tap "Check In" to see it here!'}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No results"
            subtitle={`Nothing matched "${query}"`}
            isSearch
          />
        ) : (
          <View style={styles.checkinsGrid}>
            {filtered.map(item => {
              const name = item.store_name || 'Store Name';
              const addr = item.address || item.city || 'Location not set';
              const rating =
                item.ratings != null
                  ? Number(item.ratings).toFixed(1)
                  : '—';
              return (
                <TouchableOpacity
                  key={item._id}
                  style={styles.storeCard}
                  activeOpacity={0.88}
                  onPress={() => onCardPress(item)}>
                  <SmartImage
                    uri={item.store_image || item.image || null}
                    fallback={STORE_FALLBACK}
                    style={styles.storeCardImage}
                  />
                  <TouchableOpacity
                    style={styles.cardActionBtn}
                    onPress={e => {
                      e.stopPropagation();
                      onCheckOut(item._id, name);
                    }}
                    hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
                    <View style={styles.actionBtnBg}>
                      <Ionicons name="location" size={hp(2)} color="#FF3B30" />
                    </View>
                  </TouchableOpacity>
                  <View style={styles.storeCardInfo}>
                    <View style={{flex: 1, marginRight: 6}}>
                      <HighlightText
                        text={name}
                        query={query}
                        style={styles.storeCardName}
                        boldStyle={styles.storeCardNameHL}
                      />
                      <View style={styles.cardAddrRow}>
                        <Ionicons
                          name="location-outline"
                          size={hp(1.4)}
                          color="#AAAFBC"
                        />
                        <HighlightText
                          text={addr}
                          query={query}
                          style={styles.cardAddr}
                          boldStyle={styles.cardAddrHL}
                        />
                      </View>
                    </View>
                    <View style={styles.ratingBadge}>
                      <FontAwesome name="star" size={8} color="#fff" />
                      <Text style={styles.ratingText}>{rating}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{height: hp(4)}} />
      </View> */}
    </ScrollView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
const FavouritesScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('favorites');
  const tabAnim = useRef(new Animated.Value(0)).current;

  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [favoriteStores, setFavoriteStores] = useState([]);
  const [loadingCheckIns, setLoadingCheckIns] = useState(true);
  const [checkedInStores, setCheckedInStores] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
      fetchCheckIns();
    }, []),
  );

  const switchTab = key => {
    setActiveTab(key);
    Animated.spring(tabAnim, {
      toValue: key === 'favorites' ? 0 : 1,
      useNativeDriver: false,
      tension: 200,
      friction: 14,
    }).start();
  };

  const fetchFavorites = async () => {
    try {
      setLoadingFavorites(true);
      const res = await storesAPI.getFavorites();
      const stores = Array.isArray(res)
        ? res
        : res?.favorites ?? res?.data ?? [];
      setFavoriteStores(stores);
    } catch (e) {
      console.error('fetchFavorites:', e);
      Alert.alert('Error', 'Failed to load favorites.');
    } finally {
      setLoadingFavorites(false);
    }
  };

  const fetchCheckIns = async () => {
    try {
      setLoadingCheckIns(true);
      const res = await storesAPI.getCheckIns();
      const stores = Array.isArray(res) ? res : res?.data ?? [];
      setCheckedInStores(stores);
    } catch (e) {
      console.error('fetchCheckIns:', e);
    } finally {
      setLoadingCheckIns(false);
    }
  };

  const handleCardPress = store => navigation.navigate('BinStore', {store});

  const handleRemoveFavorite = id => {
    Alert.alert('Remove Favorite', 'Remove this store from favorites?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await storesAPI.favorite(id);
            setFavoriteStores(p => p.filter(s => s._id !== id));
          } catch {
            Alert.alert('Error', 'Failed to remove from favorites.');
          }
        },
      },
    ]);
  };

  const handleCheckOut = (id, name) => {
    Alert.alert('Check Out', `Check out of ${name}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Check Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await storesAPI.checkIn(id);
            setCheckedInStores(p => p.filter(s => s._id !== id));
          } catch {
            Alert.alert('Error', 'Failed to check out.');
          }
        },
      },
    ]);
  };

  // Animated sliding pill position
  const indicatorLeft = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['1.5%', '50%'],
  });

  return (
    <View style={styles.screen}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.bg}
        resizeMode="stretch">

        {/* ── Header ───────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <MaterialIcons name="arrow-back-ios" color="#0D0140" size={20} />
            </Pressable>
            <View>
              <Text style={styles.headerTitle}> MY FAVORITE</Text>
              <Text style={styles.headerSub}>& Visited Locations</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => {
              fetchFavorites();
              fetchCheckIns();
            }}
            activeOpacity={0.75}>
            <MaterialIcons name="refresh" size={hp(2.8)} color="#130160" />
          </TouchableOpacity>
        </View>

        {/* ── Tab Bar ──────────────────────────────────────────── */}
        <View style={styles.tabBar}>
          <Animated.View style={[styles.tabPill, {left: indicatorLeft}]} />

          {/* Favorites */}
          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => switchTab('favorites')}
            activeOpacity={0.85}>
            <Ionicons
              name={activeTab === 'favorites' ? 'heart' : 'heart-outline'}
              size={hp(2.1)}
              color={activeTab === 'favorites' ? '#fff' : '#8A8FA8'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'favorites' && styles.tabLabelActive,
              ]}>
              FAVORITE
            </Text>
            {favoriteStores.length > 0 && (
              <View
                style={[
                  styles.tabCount,
                  activeTab === 'favorites' && styles.tabCountActive,
                ]}>
                <Text
                  style={[
                    styles.tabCountTxt,
                    activeTab === 'favorites' && styles.tabCountTxtActive,
                  ]}>
                  {favoriteStores.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Location */}
          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => switchTab('location')}
            activeOpacity={0.85}>
            <Ionicons
              name={activeTab === 'location' ? 'location' : 'location-outline'}
              size={hp(2.1)}
              color={activeTab === 'location' ? '#fff' : '#8A8FA8'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'location' && styles.tabLabelActive,
              ]}>
              Location
            </Text>
            {checkedInStores.length > 0 && (
              <View
                style={[
                  styles.tabCount,
                  activeTab === 'location' && styles.tabCountActive,
                ]}>
                <Text
                  style={[
                    styles.tabCountTxt,
                    activeTab === 'location' && styles.tabCountTxtActive,
                  ]}>
                  {checkedInStores.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Content ──────────────────────────────────────────── */}
        <View style={styles.content}>
          {activeTab === 'favorites' ? (
            <FavoritesTab
              loading={loadingFavorites}
              favoriteStores={favoriteStores}
              onRemoveFavorite={handleRemoveFavorite}
              onCardPress={handleCardPress}
            />
          ) : (
            <LocationTab
              loading={loadingCheckIns}
              checkedInStores={checkedInStores}
              onCheckOut={handleCheckOut}
              onCardPress={handleCardPress}
            />
          )}
        </View>
      </ImageBackground>
    </View>
  );
};

export default FavouritesScreen;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F0F4FF'},
  bg: {flex: 1, width: wp(100)},

  // ── Header ──────────────────────────────────────────────────────
  header: {
    width: '100%',
    paddingHorizontal: wp(5),
    paddingTop: hp(6),
    paddingBottom: hp(1.5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {flexDirection: 'row', alignItems: 'center', gap: 10},
  backBtn: {
    width: hp(4.4),
    height: hp(4.4),
    borderRadius: hp(2.2),
    backgroundColor: 'rgba(19,1,96,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.4),
    color: '#0D0140',
    lineHeight: hp(3),
  },
  headerSub: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.5),
    color: '#8A8FA8',
  },
  headerActionBtn: {
    width: hp(4.4),
    height: hp(4.4),
    borderRadius: hp(2.2),
    backgroundColor: 'rgba(19,1,96,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Tab Bar ──────────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: wp(5),
    marginBottom: hp(2),
    height: hp(6.5),
    backgroundColor: '#E8EAF4',
    borderRadius: 14,
    padding: 4,
    position: 'relative',
  },
  tabPill: {
    position: 'absolute',
    top: 4,
    width: '48%',
    height: hp(6.5) - 8,
    backgroundColor: '#130160',
    borderRadius: 11,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    zIndex: 1,
  },
  tabLabel: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(2),
    color: '#8A8FA8',
  },
  tabLabelActive: {color: '#fff', fontFamily: 'Nunito-Bold'},
  tabCount: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    minWidth: hp(2.6),
    height: hp(2.6),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  tabCountActive: {backgroundColor: 'rgba(255,255,255,0.22)'},
  tabCountTxt: {fontFamily: 'Nunito-Bold', fontSize: hp(1.3), color: '#8A8FA8'},
  tabCountTxtActive: {color: '#fff'},

  // ── Content ──────────────────────────────────────────────────────
  content: {flex: 1, paddingHorizontal: wp(4)},

  // ── Search Bar ───────────────────────────────────────────────────
  searchParent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    height: hp(6.2),
    backgroundColor: '#fff',
    marginRight: wp(2.5),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: hp(1.9),
    fontFamily: 'Nunito-Regular',
    color: '#1A1A2E',
    paddingHorizontal: wp(2),
    height: '100%',
  },
  clearCircle: {
    width: hp(2.6),
    height: hp(2.6),
    borderRadius: hp(1.3),
    backgroundColor: '#B0B5C5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtn: {
    backgroundColor: '#130160',
    width: wp(13),
    height: hp(6.2),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Section header ────────────────────────────────────────────────
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: hp(1),
  },
  sectionLabel: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: hp(1.8),
    color: '#0D0140',
    letterSpacing: 1,
  },
  countPill: {
    backgroundColor: '#130160',
    borderRadius: 10,
    minWidth: hp(2.8),
    height: hp(2.8),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  countPillText: {fontFamily: 'Nunito-Bold', fontSize: hp(1.3), color: '#fff'},

  // ── Results pill ──────────────────────────────────────────────────
  resultsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: hp(1.5),
    backgroundColor: '#EEF0FB',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  resultsPillText: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.5),
    color: '#524B6B',
  },
  resultsPillQuery: {fontFamily: 'Nunito-Bold', color: '#130160'},

  // ── Empty / Loading ────────────────────────────────────────────────
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(5),
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.9),
    color: '#888',
  },
  emptyContainer: {
    paddingVertical: hp(5),
    alignItems: 'center',
    paddingHorizontal: wp(10),
  },
  emptyIconCircle: {
    width: hp(11),
    height: hp(11),
    borderRadius: hp(5.5),
    backgroundColor: '#F0F2FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  emptyTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.3),
    color: '#333',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.8),
    color: '#999',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: hp(2.8),
  },
  emptyHint: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.5),
    color: '#BCC0CE',
    marginTop: 4,
    textAlign: 'center',
  },

  // ── Grid padding ────────────────────────────────────────────────────
  gridPad: {paddingBottom: hp(4)},

  // ── Shared card action button ──────────────────────────────────────
  cardActionBtn: {position: 'absolute', right: wp(2), top: hp(1), zIndex: 10},
  actionBtnBg: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.14,
    shadowRadius: 3,
  },

  // ── Shared address row ─────────────────────────────────────────────
  cardAddrRow: {flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2},
  cardAddr: {
    fontFamily: 'Nunito-Regular',
    color: '#AAAFBC',
    fontSize: hp(1.35),
    flex: 1,
  },
  cardAddrHL: {color: '#130160', fontFamily: 'Nunito-SemiBold'},

  // ── Favorites grid card ────────────────────────────────────────────
  favCard: {
    width: wp(43),
    marginHorizontal: wp(1),
    marginBottom: hp(2),
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#130160',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.09,
    shadowRadius: 8,
  },
  favCardImage: {width: '100%', height: hp(14)},
  cardInfo: {paddingHorizontal: wp(3), paddingVertical: hp(1.2)},
  cardName: {
    fontFamily: 'Nunito-Bold',
    color: '#1A1A2E',
    fontSize: hp(1.75),
    marginBottom: 2,
  },
  cardNameHL: {
    color: '#130160',
    backgroundColor: 'rgba(19,1,96,0.07)',
    borderRadius: 2,
  },

  // ── Live location card ─────────────────────────────────────────────
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: wp(4),
    marginBottom: hp(1.5),
    elevation: 3,
    shadowColor: '#130160',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  locationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(1.2),
  },
  locationCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationCardTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.1),
    color: '#0D0140',
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8FBF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#14BA9C',
  },
  liveChipText: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: hp(1.2),
    color: '#14BA9C',
    letterSpacing: 0.5,
  },
  gpsRefreshBtn: {
    width: hp(4.2),
    height: hp(4.2),
    borderRadius: hp(2.1),
    backgroundColor: 'rgba(19,1,96,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  gpsStatusText: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.7),
    color: '#8A8FA8',
  },
  gpsErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  gpsErrorText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.6),
    color: '#FF3B30',
    flex: 1,
  },
  retryBtn: {
    backgroundColor: '#130160',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  retryBtnText: {
    fontFamily: 'Nunito-Bold',
    color: '#fff',
    fontSize: hp(1.5),
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: hp(1),
  },
  addressText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.75),
    color: '#1A1A2E',
    flex: 1,
    lineHeight: hp(2.6),
  },
  coordsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F2FA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  coordsText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.45),
    color: '#130160',
    letterSpacing: 0.2,
  },

  // ── Map ──────────────────────────────────────────────────────────
  mapWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: hp(2),
    backgroundColor: '#E8EAF4',
    elevation: 3,
    shadowColor: '#130160',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.09,
    shadowRadius: 8,
  },
  map: {flex: 1},
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: hp(1.5),
    padding: wp(8),
  },
  mapPlaceholderText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.8),
    color: '#8A8FA8',
    textAlign: 'center',
    lineHeight: hp(2.8),
  },
  mapEnableBtn: {
    backgroundColor: '#130160',
    paddingHorizontal: wp(7),
    paddingVertical: hp(1.3),
    borderRadius: 10,
    marginTop: hp(1),
  },
  mapEnableBtnText: {
    fontFamily: 'Nunito-Bold',
    color: '#fff',
    fontSize: hp(1.9),
  },
  mapControls: {
    position: 'absolute',
    right: wp(3),
    bottom: hp(2),
  },
  mapCtrlBtn: {
    width: hp(5),
    height: hp(5),
    borderRadius: hp(2.5),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    marginTop: 8,
  },

  // ── User location marker ─────────────────────────────────────────
  userMarkerWrap: {
    width: hp(5),
    height: hp(5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerPulse: {
    position: 'absolute',
    width: hp(4),
    height: hp(4),
    borderRadius: hp(2),
    backgroundColor: 'rgba(19,1,96,0.13)',
  },
  userMarkerRing: {
    width: hp(2.6),
    height: hp(2.6),
    borderRadius: hp(1.3),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#130160',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  userMarkerDot: {
    width: hp(1.5),
    height: hp(1.5),
    borderRadius: hp(0.75),
    backgroundColor: '#130160',
  },

  // ── Store map marker ────────────────────────────────────────────
  storeMapMarker: {
    backgroundColor: '#14BA9C',
    borderRadius: 10,
    padding: 5,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 3,
  },

  // ── Check-ins section ────────────────────────────────────────────
  checkinsSection: {marginTop: hp(0.5)},
  checkinsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  storeCard: {
    width: wp(43),
    marginBottom: hp(2),
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#130160',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.09,
    shadowRadius: 8,
  },
  storeCardImage: {width: '100%', height: hp(13)},
  storeCardInfo: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.2),
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  storeCardName: {
    fontFamily: 'Nunito-Bold',
    color: '#0049AF',
    fontSize: hp(1.75),
    marginBottom: 2,
  },
  storeCardNameHL: {
    color: '#130160',
    backgroundColor: 'rgba(0,73,175,0.08)',
    borderRadius: 2,
  },
  ratingBadge: {
    backgroundColor: '#FFBB36',
    height: hp(2.4),
    minWidth: wp(9),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginTop: 2,
  },
  ratingText: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
    fontSize: hp(1.1),
  },
});