import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';
import {storesAPI} from '../../api/apiService';

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

// ─── Custom store marker ───────────────────────────────────────
const StoreMarkerDot = () => (
  <View style={markerStyles.wrapper}>
    <View style={markerStyles.dot}>
      <MaterialIcons name="store" size={10} color="#130160" />
    </View>
    <View style={markerStyles.tail} />
  </View>
);

const markerStyles = StyleSheet.create({
  wrapper: {alignItems: 'center'},
  dot: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#130160',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#130160',
    marginTop: -1,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Dashboard2 = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null);

  const [userLocation, setUserLocation] = useState(null);
  const [allStores, setAllStores] = useState([]);       // all geocoded stores
  const [nearbyStores, setNearbyStores] = useState([]); // filtered by distance
  const [isLocating, setIsLocating] = useState(true);
  const [isLoadingStores, setIsLoadingStores] = useState(true);

  const isLoading = isLocating || isLoadingStores;

  // ── Step 1: Get user's current GPS location ────────────────────
  useEffect(() => {
    const getLocation = async () => {
      setIsLocating(true);

      let hasPermission = true;
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
        hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
      }

      if (!hasPermission) {
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
          setIsLocating(false);
        },
        // maximumAge: 0 forces a fresh GPS fix, not a cached one
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 0},
      );
    };

    getLocation();
  }, []);

  // ── Step 2: Fetch & geocode all stores ─────────────────────────
  useEffect(() => {
    const fetchStores = async () => {
      setIsLoadingStores(true);
      try {
        const res = await storesAPI.getAll();
        const raw = Array.isArray(res) ? res : res?.stores ?? res?.data ?? [];

        const geocoded = await Promise.all(
          raw.map(async store => {
            // Prefer explicit lat/lon fields on the store object
            if (store.user_latitude && store.user_longitude) {
              return {
                ...store,
                coords: {
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
              if (coords) return {...store, coords};
            }
            return null;
          }),
        );

        setAllStores(geocoded.filter(Boolean));
      } catch (e) {
        console.error('fetchStores error:', e);
      } finally {
        setIsLoadingStores(false);
      }
    };

    fetchStores();
  }, []);

  // ── Step 3: Once BOTH user location + stores are ready, filter ──
  // This runs whenever either userLocation or allStores changes,
  // so whichever resolves last will trigger the final filter.
  useEffect(() => {
    if (!userLocation || allStores.length === 0) return;

    const RADIUS_KM = 50;

    const filtered = allStores
      .map(store => ({
        ...store,
        distance: haversine(
          userLocation.latitude,
          userLocation.longitude,
          store.coords.latitude,
          store.coords.longitude,
        ),
      }))
      .filter(store => store.distance <= RADIUS_KM)
      .sort((a, b) => a.distance - b.distance);

    setNearbyStores(filtered);
  }, [userLocation, allStores]);

  // ── Step 4: Fit map to user + nearby stores ────────────────────
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    const coords = [userLocation, ...nearbyStores.map(s => s.coords)];

    setTimeout(() => {
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: {top: 50, right: 50, bottom: 60, left: 50},
        animated: true,
      });
    }, 400);
  }, [nearbyStores, userLocation]);

  // ── Navigate to fullscreen map ─────────────────────────────────
  const handleFullscreen = useCallback(() => {
    navigation.navigate('StoreMapScreen');
  }, [navigation]);

  return (
    <View style={styles.container}>

      {/* ── Google Map ── */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={
          userLocation
            ? {...userLocation, latitudeDelta: 0.15, longitudeDelta: 0.15}
            : {latitude: 20, longitude: 0, latitudeDelta: 60, longitudeDelta: 60}
        }
        showsUserLocation={true}        // blue dot = user's position
        showsMyLocationButton={false}
        showsCompass={false}
        scrollEnabled={false}           // locked — tap fullscreen to explore
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        loadingEnabled
        loadingColor="#130160">

        {/* One marker per nearby store */}
        {nearbyStores.map((store, index) => (
          <Marker
            key={store._id || index}
            coordinate={store.coords}
            tracksViewChanges={false}
            anchor={{x: 0.5, y: 1}}>
            <StoreMarkerDot />
          </Marker>
        ))}

      </MapView>

      {/* ── Loading overlay ── */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#130160" />
          <Text style={styles.loadingText}>
            {isLocating ? 'Getting your location…' : 'Loading stores…'}
          </Text>
        </View>
      )}

      {/* ── Nearby store count badge (bottom-left) ── */}
      {!isLoading && (
        <View style={styles.badge}>
          <MaterialIcons name="store" size={12} color="#130160" />
          <Text style={styles.badgeText}>
            {nearbyStores.length > 0
              ? `${nearbyStores.length} store${nearbyStores.length !== 1 ? 's' : ''} nearby`
              : 'No stores nearby'}
          </Text>
        </View>
      )}

      {/* ── Fullscreen button (bottom-right) ── */}
      <TouchableOpacity
  style={styles.fullscreenBtn}
  onPress={handleFullscreen}
  activeOpacity={0.85}
>
  <MaterialCommunityIcons 
    name="arrow-expand"   // 🔥 EXACT MATCH
    size={22} 
    color="#000" 
  />
</TouchableOpacity>

    </View>
  );
};

export default Dashboard2;

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: hp(55),
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#e8e8e8',
    marginTop: '2%', 
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.6),
    color: '#130160',
  },
  badge: {
    position: 'absolute',
    bottom: hp(1.5),
    left: wp(3),
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.65),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  badgeText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.45),
    color: '#130160',
  },
  fullscreenBtn: {
    position: 'absolute',
    top: hp(1.5),
    right: wp(3),
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: '#fff',     
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});