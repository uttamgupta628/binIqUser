import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  Alert,
  Share,
  Animated,
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
import Geolocation from '@react-native-community/geolocation';
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import LocationIcon from '../../../assets/LocationIcon.svg';
import FacebookIcon from '../../../assets/FacebookIcon.svg';
import TwitterIcon from '../../../assets/TwitterIcon.svg';
import WhatsappIcon from '../../../assets/WhatsappIcon.svg';
import InstagramIcon from '../../../assets/instagram.svg';
import Share_Icon from '../../../assets/share_icon.svg';
import HiddenFindsImg from '../../../assets/hidden_find_img.svg';
import BoldTick from '../../../assets/bold_tick.svg';
import GreenTick from '../../../assets/green_tick.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  storesAPI,
  userAPI,
  productsAPI,
  subscriptionsAPI,
} from '../../api/apiService';

const {width} = Dimensions.get('window');

const GOOGLE_MAPS_API_KEY = 'AIzaSyCY-8_-SbCN29nphT9QFtbzWV5H3asJQ4Q';
const TRENDING_LIKE_THRESHOLD = 5;

const STORE_FALLBACK = require('../../../assets/flip_find.png');
const CAROUSEL_FALLBACK = require('../../../assets/bin_store_img.png');
const PLACEHOLDER = require('../../../assets/slider_1.png');

const SOCIAL_PLATFORMS = [
  {fieldKey: 'facebook_link',   Icon: FacebookIcon},
  {fieldKey: 'instagram_link',  Icon: InstagramIcon},
  {fieldKey: 'twitter_link',    Icon: TwitterIcon},
  {fieldKey: 'whatsapp_link',   Icon: WhatsappIcon},
];

const WEEK_DAYS_ORDER = [
  'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday',
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
// StoreImageCarousel  ← NEW attractive carousel component
// ─────────────────────────────────────────────────────────────────────────────
const StoreImageCarousel = ({store}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  // Build image list from store_images array OR fallback to store_image string
  const images = (() => {
    if (Array.isArray(store.images) && store.images.length > 0)
      return store.images.map((uri, i) => ({id: i, uri: typeof uri === 'string' ? uri : uri?.url || null}));
    if (Array.isArray(store.store_images) && store.store_images.length > 0)
      return store.store_images.map((uri, i) => ({id: i, uri: typeof uri === 'string' ? uri : uri?.url || null}));
    if (store.store_image)
      return [{id: 0, uri: store.store_image}];
    return [{id: 0, uri: null}];
  })();

  const storeName  = store.store_name || '';
  const rating     = store.rating     || null;
  const address    = store.address    || '';

  const renderSlide = ({item, index}) => (
    <View style={carouselStyles.slide}>
      {/* Image */}
      {item.uri ? (
        <Image
          source={{uri: item.uri}}
          style={carouselStyles.image}
          resizeMode="cover"
        />
      ) : (
        <Image
          source={CAROUSEL_FALLBACK}
          style={carouselStyles.image}
          resizeMode="cover"
        />
      )}

      {/* Gradient-like dark overlay at bottom */}
      <View style={carouselStyles.overlay} />

      {/* Slide counter badge top-right */}
      <View style={carouselStyles.counterBadge}>
        <MaterialIcons name="photo-library" size={11} color="#fff" />
        <Text style={carouselStyles.counterText}>
          {index + 1} / {images.length}
        </Text>
      </View>

      {/* Store info overlay bottom */}
      <View style={carouselStyles.infoOverlay}>
        {storeName ? (
          <Text style={carouselStyles.overlayName} numberOfLines={1}>
            {storeName}
          </Text>
        ) : null}
        <View style={carouselStyles.overlayMeta}>
          {rating ? (
            <View style={carouselStyles.ratingPill}>
              <MaterialIcons name="star" size={11} color="#FFA500" />
              <Text style={carouselStyles.ratingText}>{Number(rating).toFixed(1)}</Text>
            </View>
          ) : null}
          {address ? (
            <View style={carouselStyles.addressRow}>
              <MaterialIcons name="location-on" size={11} color="rgba(255,255,255,0.8)" />
              <Text style={carouselStyles.addressText} numberOfLines={1}>
                {address}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );

  return (
    <View style={carouselStyles.wrapper}>
      <Carousel
        data={images}
        renderItem={renderSlide}
        sliderWidth={width}
        itemWidth={width - wp(8)}
        layout="default"
        loop={images.length > 1}
        autoplay={images.length > 1}
        autoplayInterval={3500}
        onSnapToItem={setActiveSlide}
        inactiveSlideScale={0.94}
        inactiveSlideOpacity={0.65}
        activeSlideAlignment="center"
      />
      {images.length > 1 && (
        <View style={carouselStyles.dotsRow}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[
                carouselStyles.dot,
                i === activeSlide
                  ? carouselStyles.dotActive
                  : carouselStyles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// ─── normaliseProduct ──────────────────────────────────────────
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

// ─── TrendingCard ──────────────────────────────────────────────
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
            <Text style={styles.favouriteOriginalPrice}>{item.originalPrice}</Text>
            {'  '}{item.totalDiscount}
          </Text>
        )}
      </View>
    </View>
  </Pressable>
);

// ─── ActivityCard ──────────────────────────────────────────────
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
            <Text style={styles.favouriteDiscountPrice}>{item.discountPrice}</Text>
            {item.originalPrice && (
              <Text style={styles.favouritePriceText}>
                <Text style={styles.favouriteOriginalPrice}>{item.originalPrice}</Text>
                {'  '}{item.totalDiscount}
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
    d ? new Date(d).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : '';
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
          <Text style={styles.promotionTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.promotionDescription} numberOfLines={2}>{item.shortDescription}</Text>
          <Text style={styles.promotionStatus}>
            {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Active'}
          </Text>
          {(item.start_date || item.end_date) && (
            <Text style={styles.promotionDate}>
              {fmtDate(item.start_date)}{item.start_date && item.end_date ? ' – ' : ''}{fmtDate(item.end_date)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const LoadingRow = () => (
  <ActivityIndicator size="large" color="#130160" style={{padding: hp(2)}} />
);
const EmptyRow = ({message}) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

// ─── Geocode / Polyline helpers ────────────────────────────────
const geocodeAddress = async address => {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`,
    );
    const json = await res.json();
    if (json.status === 'OK' && json.results?.length > 0) {
      const {lat, lng} = json.results[0].geometry.location;
      return {latitude: lat, longitude: lng};
    }
  } catch (e) {
    console.error('Geocode error:', e);
  }
  return null;
};

const decodePolyline = encoded => {
  const poly = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    poly.push({latitude: lat / 1e5, longitude: lng / 1e5});
  }
  return poly;
};

// ─── MapModal (unchanged) ──────────────────────────────────────
const MapModal = ({visible, onClose, destination, store = {}}) => {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [isLocating, setIsLocating] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [routeSteps, setRouteSteps] = useState([]);
  const [showSteps, setShowSteps] = useState(false);

  const fetchLocation = () => {
    setIsLocating(true); setLocationError(null); setRouteCoords([]); setDistanceInfo(null); setRouteSteps([]);
    Geolocation.getCurrentPosition(
      position => { setUserLocation({latitude: position.coords.latitude, longitude: position.coords.longitude}); setIsLocating(false); },
      err => { setLocationError('Could not get your location.\nEnable location permissions and try again.'); setIsLocating(false); },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const stripHtml = html => html ? html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ') : '';

  const loadDirections = useCallback(async (origin, dest) => {
    setIsLoadingRoute(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${dest.latitude},${dest.longitude}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status !== 'OK') { setIsLoadingRoute(false); return; }
      if (json.routes?.length > 0) {
        const route = json.routes[0];
        const leg = route.legs[0];
        setDistanceInfo({distance: leg.distance.text, duration: leg.duration.text});
        setRouteSteps(leg.steps.map((step, idx) => ({id: idx, instruction: stripHtml(step.html_instructions), distance: step.distance.text, duration: step.duration.text, maneuver: step.maneuver || ''})));
        const points = decodePolyline(route.overview_polyline.points);
        setRouteCoords(points);
        setTimeout(() => { mapRef.current?.fitToCoordinates(points, {edgePadding: {top: 100, right: 50, bottom: 280, left: 50}, animated: true}); }, 600);
      }
    } catch (e) { console.error('loadDirections error:', e); }
    finally { setIsLoadingRoute(false); }
  }, []);

  useEffect(() => {
    if (!visible) return;
    setDestCoords(null); setRouteCoords([]); setDistanceInfo(null); setUserLocation(null); setRouteSteps([]); setShowSteps(false);
    fetchLocation();
    if (destination) { geocodeAddress(destination).then(coords => { if (coords) setDestCoords(coords); }); }
  }, [visible]);

  useEffect(() => { if (userLocation && destCoords) loadDirections(userLocation, destCoords); }, [userLocation, destCoords, loadDirections]);

  const openInMapsApp = () => {
    if (!destination) return;
    const encodedDest = encodeURIComponent(destination);
    const origin = userLocation ? `${userLocation.latitude},${userLocation.longitude}` : '';
    const nativeUrl = Platform.select({ios: `maps://maps.apple.com/?saddr=${origin}&daddr=${encodedDest}&dirflg=d`, android: `google.navigation:q=${encodedDest}`});
    const browserUrl = `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin}` : ''}&destination=${encodedDest}&travelmode=driving`;
    Linking.canOpenURL(nativeUrl).then(s => Linking.openURL(s ? nativeUrl : browserUrl)).catch(() => Linking.openURL(browserUrl));
  };

  const maneuverIcon = m => {
    if (!m) return 'arrow-upward';
    if (m.includes('left')) return 'turn-left';
    if (m.includes('right')) return 'turn-right';
    if (m.includes('uturn')) return 'u-turn-left';
    if (m.includes('merge') || m.includes('ramp')) return 'merge';
    if (m.includes('roundabout')) return 'roundabout-left';
    return 'arrow-upward';
  };

  const mapRegion = destCoords ? {latitude: destCoords.latitude, longitude: destCoords.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05}
    : userLocation ? {latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05} : null;

  const storeName = store.store_name || 'Store';
  const storeImage = store.store_image || null;
  const storeRating = store.rating || null;
  const storePhone = store.phone_number || null;
  const storeHours = store.opening_hours || store.hours || null;

  const renderStars = rating => {
    if (!rating) return null;
    const full = Math.floor(rating); const half = rating - full >= 0.5; const empty = 5 - full - (half ? 1 : 0);
    return (
      <View style={mapStyles.starsRow}>
        {Array(full).fill(0).map((_, i) => <MaterialIcons key={`f${i}`} name="star" size={13} color="#FFA500" />)}
        {half && <MaterialIcons name="star-half" size={13} color="#FFA500" />}
        {Array(empty).fill(0).map((_, i) => <MaterialIcons key={`e${i}`} name="star-border" size={13} color="#FFA500" />)}
        <Text style={mapStyles.ratingNum}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={mapStyles.container}>
        <View style={mapStyles.header}>
          <Pressable onPress={onClose} style={mapStyles.closeBtn} hitSlop={{top:10,bottom:10,left:10,right:10}}>
            <MaterialIcons name="arrow-back-ios" size={22} color="#fff" />
          </Pressable>
          <Text style={mapStyles.headerTitle} numberOfLines={1}>Get Directions</Text>
          {routeSteps.length > 0 && (
            <Pressable onPress={() => setShowSteps(s => !s)} style={mapStyles.headerBtn} hitSlop={{top:10,bottom:10,left:10,right:10}}>
              <MaterialIcons name={showSteps ? 'map' : 'list'} size={22} color="#fff" />
            </Pressable>
          )}
          {userLocation && (
            <Pressable onPress={openInMapsApp} style={mapStyles.headerBtn} hitSlop={{top:10,bottom:10,left:10,right:10}}>
              <MaterialIcons name="open-in-new" size={22} color="#fff" />
            </Pressable>
          )}
        </View>
        <View style={mapStyles.destStrip}>
          <MaterialIcons name="location-on" size={16} color="#130160" />
          <Text style={mapStyles.destText} numberOfLines={2}>{destination || 'Store Address'}</Text>
        </View>
        {distanceInfo && (
          <View style={mapStyles.infoBar}>
            <View style={mapStyles.infoItem}><MaterialIcons name="straighten" size={16} color="#130160" /><Text style={mapStyles.infoText}>{distanceInfo.distance}</Text></View>
            <View style={mapStyles.infoDivider} />
            <View style={mapStyles.infoItem}><MaterialIcons name="access-time" size={16} color="#130160" /><Text style={mapStyles.infoText}>{distanceInfo.duration}</Text></View>
            <View style={mapStyles.infoDivider} />
            <View style={mapStyles.infoItem}><MaterialIcons name="directions-car" size={16} color="#130160" /><Text style={mapStyles.infoText}>Driving</Text></View>
          </View>
        )}
        {isLocating ? (
          <View style={mapStyles.centerBox}><ActivityIndicator size="large" color="#130160" /><Text style={mapStyles.statusText}>Getting your location…</Text></View>
        ) : locationError ? (
          <View style={mapStyles.centerBox}>
            <MaterialIcons name="location-off" size={56} color="#ccc" />
            <Text style={mapStyles.errorText}>{locationError}</Text>
            <TouchableOpacity style={mapStyles.retryBtn} onPress={fetchLocation}><Text style={mapStyles.retryBtnText}>Retry</Text></TouchableOpacity>
            <TouchableOpacity style={[mapStyles.retryBtn, {backgroundColor: '#14BA9C', marginTop: 8}]} onPress={openInMapsApp}><Text style={mapStyles.retryBtnText}>Open in Maps App</Text></TouchableOpacity>
          </View>
        ) : mapRegion ? (
          <View style={{flex: 1}}>
            {!showSteps && (
              <MapView ref={mapRef} provider={PROVIDER_GOOGLE} style={mapStyles.mapView} initialRegion={mapRegion} showsUserLocation showsMyLocationButton showsCompass loadingEnabled loadingColor="#130160">
                {userLocation && (<Marker coordinate={userLocation} title="You are here" anchor={{x: 0.5, y: 0.5}}><View style={mapStyles.userMarker}><View style={mapStyles.userMarkerDot} /></View></Marker>)}
                {destCoords && <Marker coordinate={destCoords} title={storeName} description={destination} pinColor="#130160" />}
                {routeCoords.length > 0 && (<><Polyline coordinates={routeCoords} strokeColor="rgba(19,1,96,0.2)" strokeWidth={8} /><Polyline coordinates={routeCoords} strokeColor="#130160" strokeWidth={4} lineDashPattern={[0]} /></>)}
              </MapView>
            )}
            {showSteps && routeSteps.length > 0 && (
              <ScrollView style={mapStyles.stepsContainer} showsVerticalScrollIndicator={false}>
                <Text style={mapStyles.stepsHeader}>Turn-by-Turn Directions</Text>
                {routeSteps.map((step, idx) => (
                  <View key={step.id} style={mapStyles.stepRow}>
                    <View style={mapStyles.stepIconCol}>
                      <View style={mapStyles.stepIconCircle}><MaterialIcons name={maneuverIcon(step.maneuver)} size={18} color="#fff" /></View>
                      {idx < routeSteps.length - 1 && <View style={mapStyles.stepConnector} />}
                    </View>
                    <View style={mapStyles.stepContent}>
                      <Text style={mapStyles.stepInstruction}>{step.instruction}</Text>
                      <Text style={mapStyles.stepMeta}>{step.distance}  ·  {step.duration}</Text>
                    </View>
                  </View>
                ))}
                <View style={mapStyles.stepsDestRow}>
                  <View style={mapStyles.stepsDestPin}><MaterialIcons name="location-on" size={20} color="#fff" /></View>
                  <Text style={mapStyles.stepsDestText} numberOfLines={2}>{destination}</Text>
                </View>
                <View style={{height: 30}} />
              </ScrollView>
            )}
            {isLoadingRoute && (
              <View style={mapStyles.routeLoader}><ActivityIndicator size="small" color="#130160" /><Text style={mapStyles.routeLoaderText}>Calculating route…</Text></View>
            )}
          </View>
        ) : (
          <View style={mapStyles.centerBox}><MaterialIcons name="map" size={56} color="#ccc" /><Text style={mapStyles.errorText}>No destination address found for this store.</Text></View>
        )}
        {!isLocating && !locationError && mapRegion && !showSteps && (
          <View style={mapStyles.storeCard}>
            <View style={mapStyles.storeCardImgWrapper}>
              {storeImage ? <Image source={{uri: storeImage}} style={mapStyles.storeCardImg} resizeMode="cover" />
                : <View style={[mapStyles.storeCardImg, mapStyles.storeCardImgPlaceholder]}><MaterialIcons name="store" size={32} color="#aaa" /></View>}
            </View>
            <View style={mapStyles.storeCardInfo}>
              <Text style={mapStyles.storeCardName} numberOfLines={1}>{storeName}</Text>
              {storeRating && renderStars(storeRating)}
              {distanceInfo && <View style={mapStyles.storeCardMetaRow}><MaterialIcons name="straighten" size={13} color="#524B6B" /><Text style={mapStyles.storeCardMeta}>{distanceInfo.distance}</Text><Text style={mapStyles.storeCardMetaDot}>·</Text><MaterialIcons name="access-time" size={13} color="#524B6B" /><Text style={mapStyles.storeCardMeta}>{distanceInfo.duration}</Text></View>}
              {storePhone && <TouchableOpacity style={mapStyles.storeCardMetaRow} onPress={() => Linking.openURL(`tel:${storePhone}`)}><MaterialIcons name="phone" size={13} color="#130160" /><Text style={[mapStyles.storeCardMeta, {color: '#130160'}]}>{storePhone}</Text></TouchableOpacity>}
              {storeHours && <View style={mapStyles.storeCardMetaRow}><MaterialIcons name="schedule" size={13} color="#524B6B" /><Text style={mapStyles.storeCardMeta} numberOfLines={1}>{storeHours}</Text></View>}
              <Text style={mapStyles.storeCardAddress} numberOfLines={2}>{destination}</Text>
            </View>
            <TouchableOpacity style={mapStyles.storeCardNavBtn} onPress={openInMapsApp} activeOpacity={0.85}>
              <MaterialIcons name="navigation" size={20} color="#fff" />
              <Text style={mapStyles.storeCardNavText}>Go</Text>
            </TouchableOpacity>
          </View>
        )}
        {!isLocating && !locationError && userLocation && !showSteps && (
          <TouchableOpacity style={mapStyles.openAppBar} onPress={openInMapsApp} activeOpacity={0.85}>
            <MaterialIcons name="directions" size={22} color="#fff" />
            <Text style={mapStyles.openAppBarText}>Start Navigation in Maps App</Text>
            <MaterialIcons name="chevron-right" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const BinStorePage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const store = route.params?.store || {};

  const [activeStore, setActiveStore] = useState(store);
  const [storeLikes, setStoreLikes] = useState(parseInt(store.likes) || 0);
  const [isStoreLiked, setIsStoreLiked] = useState(false);
  const [followers, setFollowers] = useState(parseInt(store.followers) || 0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isBinVerified, setIsBinVerified] = useState(false);
  const [favoriteStores, setFavoriteStores] = useState([]);
  const [isStoreFavorited, setIsStoreFavorited] = useState(false);
  const currentUserIdRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(true);
  const [likingIds, setLikingIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState('trending');

  const {cardHeight: trendingCardHeight, onCardLayout: onTrendingCardLayout} = useDynamicCardHeight();
  const {cardHeight: activityCardHeight, onCardLayout: onActivityCardLayout} = useDynamicCardHeight();
  const {cardHeight: promoCardHeight, onCardLayout: onPromoCardLayout} = useDynamicCardHeight();

  useEffect(() => { if (!store._id) return; loadStoreAndUser(); }, [store._id]);

  const stampLikes = useCallback(
    (items, uid) => items.map(item => ({...item, isLikedByMe: uid ? item.liked_by.includes(uid) : false})),
    [],
  );

  const deriveVerification = (details, userProfile) => {
    const now = new Date();
    const endTime = details?.subscription_end_time || userProfile?.subscription_end_time;
    const notExpired = endTime && new Date(endTime) > now;
    return details?.verified === true || userProfile?.verified === true || userProfile?.status === 'approved' || notExpired === true;
  };

  const loadStoreAndUser = async () => {
    try {
      const [details, userProfile] = await Promise.all([storesAPI.getDetails(store._id), userAPI.getProfile()]);
      if (details) {
        setActiveStore(details);
        setStoreLikes(details.likes || 0);
        setFollowers(details.followers || 0);
        const uid = userProfile?._id?.toString();
        currentUserIdRef.current = uid;
        setCurrentUserId(uid);
        setIsStoreLiked(!!details.liked_by?.some(id => id.toString() === uid));
        setIsFollowing(!!details.followed_by?.some(id => id.toString() === uid));
        setIsCheckedIn(!!details.checked_in_by?.some(id => id.toString() === uid));
        setIsBinVerified(deriveVerification(details, userProfile));
        const confirmedUserId = resolveUserId(details.user_id) || details._id?.toString();
        loadTrendingProducts(confirmedUserId);
        loadActivityFeed(confirmedUserId, uid);
        loadPromotions(confirmedUserId);
        fetchFavoriteStores();
      }
    } catch (e) { console.error('BinStorePage loadStoreAndUser:', e); }
  };

  const fetchFavoriteStores = async () => {
    try {
      const res = await storesAPI.getFavorites();
      const favs = Array.isArray(res) ? res : res?.favorites ?? [];
      setFavoriteStores(favs);
      setIsStoreFavorited(favs.some(s => s._id === store._id));
    } catch (e) { console.error('fetchFavoriteStores:', e); }
  };

  const loadTrendingProducts = async userId => {
    setIsLoadingTrending(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const url = `https://biniq.onrender.com/api/products/trending${userId ? `?user_id=${userId}` : ''}`;
      const res = await fetch(url, {headers: {Authorization: `Bearer ${token}`}}).then(r => r.json());
      const raw = Array.isArray(res) ? res : res?.data ?? res?.products ?? [];
      setTrendingProducts(raw.map(normaliseProduct));
    } catch (e) { console.error('loadTrendingProducts:', e); setTrendingProducts([]); }
    finally { setIsLoadingTrending(false); }
  };

  const loadActivityFeed = async (userId, uid) => {
    setIsLoadingActivity(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const url = `https://biniq.onrender.com/api/products/activity${userId ? `?user_id=${userId}` : ''}`;
      const res = await fetch(url, {headers: {Authorization: `Bearer ${token}`}}).then(r => r.json());
      const raw = Array.isArray(res) ? res : res?.data ?? res?.products ?? [];
      setActivityFeed(stampLikes(raw.map(normaliseProduct), uid));
    } catch (e) { console.error('loadActivityFeed:', e); setActivityFeed([]); }
    finally { setIsLoadingActivity(false); }
  };

  const loadPromotions = async userId => {
    setIsLoadingPromotions(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const url = `https://biniq.onrender.com/api/promotions${userId ? `?user_id=${userId}` : ''}`;
      const res = await fetch(url, {headers: {Authorization: `Bearer ${token}`}}).then(r => r.json());
      const raw = res?.data ?? res?.results ?? res?.promotions ?? (Array.isArray(res) ? res : []);
      setPromotions(raw.map(normalisePromotion));
    } catch (e) { console.error('loadPromotions:', e); setPromotions([]); }
    finally { setIsLoadingPromotions(false); }
  };

  const handleProductLike = useCallback(async productId => {
    const uid = currentUserIdRef.current;
    if (!uid || likingIds.has(productId)) return;
    setLikingIds(prev => new Set([...prev, productId]));
    let snapshot = null;
    setActivityFeed(prev => prev.map(item => {
      if (item._id !== productId) return item;
      snapshot = item;
      const willLike = !item.isLikedByMe;
      return {...item, isLikedByMe: willLike, likes: willLike ? item.likes + 1 : Math.max(0, item.likes - 1), liked_by: willLike ? [...item.liked_by, uid] : item.liked_by.filter(id => id !== uid)};
    }));
    try {
      const result = await productsAPI.like(productId);
      setActivityFeed(prev => prev.map(item => {
        if (item._id !== productId) return item;
        const updatedLikedBy = result.isLiked ? [...new Set([...item.liked_by, uid])] : item.liked_by.filter(id => id !== uid);
        return {...item, isLikedByMe: result.isLiked, likes: result.likes, liked_by: updatedLikedBy, type: result.type ?? item.type};
      }));
      if (result.trending_notice) {
        loadTrendingProducts(resolveUserId(activeStore.user_id) || activeStore._id?.toString());
        Alert.alert('🔥 Now Trending!', result.trending_notice);
      }
    } catch (e) {
      console.error('handleProductLike error:', e);
      if (snapshot) setActivityFeed(prev => prev.map(item => item._id === productId ? snapshot : item));
      Alert.alert('Error', 'Could not update like. Please try again.');
    } finally {
      setLikingIds(prev => { const next = new Set(prev); next.delete(productId); return next; });
    }
  }, [likingIds, activeStore]);

  const handleToggleFavorite = async () => {
    const wasFav = isStoreFavorited;
    setIsStoreFavorited(!wasFav);
    try { await storesAPI.favorite(store._id); fetchFavoriteStores(); }
    catch { setIsStoreFavorited(wasFav); }
  };

  const handleStoreLike = async () => {
    const prev = {liked: isStoreLiked, count: storeLikes};
    setIsStoreLiked(!isStoreLiked);
    setStoreLikes(n => (isStoreLiked ? Math.max(0, n - 1) : n + 1));
    try { await storesAPI.like(store._id); }
    catch { setIsStoreLiked(prev.liked); setStoreLikes(prev.count); }
  };

  const handleFollow = async () => {
    const prev = {following: isFollowing, count: followers};
    setIsFollowing(!isFollowing);
    setFollowers(n => (isFollowing ? Math.max(0, n - 1) : n + 1));
    try { await storesAPI.follow(store._id); }
    catch { setIsFollowing(prev.following); setFollowers(prev.count); }
  };

  const handleCheckIn = async () => {
    const was = isCheckedIn;
    setIsCheckedIn(!was);
    try {
      await storesAPI.checkIn(store._id);
      Alert.alert(was ? 'Checked Out' : 'Checked In!', was ? `You have checked out of ${activeStore.store_name}` : `You are now checked in at ${activeStore.store_name}`);
    } catch { setIsCheckedIn(was); Alert.alert('Error', 'Check-in failed. Please try again.'); }
  };

  const handleShare = async () => {
    try {
      const dailyRatesText = (() => {
        const rates = activeStore.daily_rates;
        if (!rates || typeof rates !== 'object') return '';
        const entries = WEEK_DAYS_ORDER.filter(day => rates[day] !== null && rates[day] !== undefined).map(day => `${day}: $${rates[day]}`);
        return entries.length > 0 ? `\n💰 Rates: ${entries.join(' | ')}` : '';
      })();
      await Share.share({
        title: storeName,
        message: `Check out ${storeName} on BinIQ!\n📍 ${address !== '—' ? address : 'Location not listed'}` +
          (activeStore.phone_number ? `\n📞 ${activeStore.phone_number}` : '') +
          (activeStore.store_email ? `\n✉️ ${activeStore.store_email}` : '') +
          (activeStore.working_days ? `\n🗓 ${activeStore.working_days}` : '') +
          (activeStore.working_time ? ` | ${activeStore.working_time}` : '') +
          dailyRatesText +
          (activeStore.website_url ? `\n🌐 ${activeStore.website_url}` : ''),
      });
    } catch (e) { console.error('Share error:', e); }
  };

  const handleSocialPress = url => {
    if (!url?.trim()) return;
    const full = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(full).catch(() => Alert.alert('Error', 'Could not open this link.'));
  };

  const navigateToProduct = (item, sourceList, sectionLabel) => {
    navigation.navigate('SinglePageItem', {productId: item._id, initialData: item, section: sectionLabel || 'Products', data: sourceList || []});
  };

  const navigateToPromotion = item => {
    navigation.navigate('SinglePageItem', {productId: item.product_id || item._id, initialData: item.product_id ? null : item, section: 'Promotions', data: promotions});
  };

  const fmtCount = n => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  const activeSocialLinks = SOCIAL_PLATFORMS.filter(p => activeStore[p.fieldKey]?.trim());
  const storeName = activeStore.store_name || 'Hidden Finds';
  const address   = activeStore.address    || '—';
  const phone     = activeStore.phone_number || '—';
  const email     = activeStore.store_email  || '—';

  const renderDailyRates = () => {
    const rates = activeStore.daily_rates;
    const hasRates = rates && typeof rates === 'object' && Object.values(rates).some(v => v !== null && v !== undefined);
    if (!hasRates) return <Text style={styles.dailyRatesEmpty}>No rates set</Text>;
    return (
      <View style={styles.dailyRatesGrid}>
        {WEEK_DAYS_ORDER.filter(day => rates[day] !== null && rates[day] !== undefined).map(day => (
          <View key={day} style={styles.dailyRateChip}>
            <Text style={styles.dailyRateDay}>{day.slice(0, 3)}</Text>
            <Text style={styles.dailyRatePrice}>${rates[day]}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderTrendingSection = () =>
    isLoadingTrending ? <LoadingRow /> : (
      <FlatList
        data={trendingProducts}
        renderItem={({item}) => <TrendingCard item={item} cardHeight={trendingCardHeight} onCardLayout={onTrendingCardLayout} onPress={() => navigateToProduct(item, trendingProducts, 'Trending Products')} />}
        keyExtractor={(item, i) => item.id?.toString() || `trending-${i}`}
        horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hListPad}
        ListEmptyComponent={<EmptyRow message="No trending products for this store" />}
      />
    );

  const renderActivitySection = () =>
    isLoadingActivity ? <LoadingRow /> : (
      <FlatList
        data={activityFeed}
        renderItem={({item}) => <ActivityCard item={item} cardHeight={activityCardHeight} onCardLayout={onActivityCardLayout} onLike={handleProductLike} likingIds={likingIds} onPress={() => navigateToProduct(item, activityFeed, 'Activity Feed')} />}
        keyExtractor={(item, i) => item.id?.toString() || `activity-${i}`}
        horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hListPad}
        ListEmptyComponent={<EmptyRow message="No activity feed items for this store" />}
      />
    );

  const renderPromotionsSection = () =>
    isLoadingPromotions ? <LoadingRow /> : (
      <FlatList
        data={promotions}
        renderItem={({item}) => <PromoCard item={item} cardHeight={promoCardHeight} onCardLayout={onPromoCardLayout} onPress={() => navigateToPromotion(item)} />}
        keyExtractor={(item, i) => item.id?.toString() || `promo-${i}`}
        horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hListPad}
        ListEmptyComponent={<EmptyRow message="No promotions for this store" />}
      />
    );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar translucent backgroundColor="transparent" />

      <MapModal visible={isMapVisible} onClose={() => setIsMapVisible(false)} destination={address !== '—' ? address : null} store={activeStore} />

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
            <Pressable onPress={handleToggleFavorite} style={styles.headerIconBtn} hitSlop={{top:8,bottom:8,left:8,right:8}}>
              <Ionicons name={isStoreFavorited ? 'heart' : 'heart-outline'} size={hp(3.2)} color={isStoreFavorited ? '#EE2525' : '#C4C4C4'} />
            </Pressable>
            <Pressable onPress={handleShare} style={styles.headerIconBtn} hitSlop={{top:8,bottom:8,left:8,right:8}}>
              <Share_Icon height={hp(3.2)} />
            </Pressable>
          </View>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.storeLogoWrapper}>
            {activeStore.store_image ? (
              <SmartImage uri={activeStore.store_image} fallback={STORE_FALLBACK} style={styles.storeLogo} />
            ) : <HiddenFindsImg width="95%" />}
          </View>
          <View style={styles.storeInfoCol}>
            <View style={styles.storeNameRow}>
              <Text style={styles.storeNameText} numberOfLines={1}>{storeName}</Text>
              {isBinVerified && <BoldTick width={20} />}
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}><Text style={styles.statNumber}>{fmtCount(followers)}{'\n'}<Text style={styles.statLabel}>Followers</Text></Text></View>
              <View style={styles.statItem}><Text style={styles.statNumber}>{fmtCount(storeLikes)}{'\n'}<Text style={styles.statLabel}>Likes</Text></Text></View>
            </View>
            <View style={styles.followBtnWrapper}>
              <TouchableOpacity style={[styles.followBtn, isFollowing && styles.followingBtn]} onPress={handleFollow}>
                <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>{isFollowing ? 'Following' : 'Follow'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* ── Actions ── */}
      <View style={styles.actionRowWrapper}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtnRed, isCheckedIn && styles.actionBtnChecked]} onPress={handleCheckIn}>
            <LocationIcon />
            <Text style={styles.actionBtnText}>{isCheckedIn ? 'Checked In ✓' : 'Check In'}</Text>
          </TouchableOpacity>
          <View style={[styles.actionBtnVerifyBase, isBinVerified ? styles.actionBtnVerified : styles.actionBtnNotVerified]}>
            {isBinVerified ? <GreenTick width={15} height={15} /> : <MaterialIcons name="cancel" size={15} color="#FF3B30" />}
            <Text style={[styles.verifyBtnText, isBinVerified ? styles.verifiedBtnText : styles.notVerifiedBtnText]}>
              {isBinVerified ? 'Verified' : 'Not Verified'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.directionsBtn} activeOpacity={0.85}
          onPress={() => { if (!address || address === '—') { Alert.alert('No Address', 'This store does not have an address listed.'); return; } setIsMapVisible(true); }}>
          <MaterialIcons name="directions" size={hp(2.6)} color="#fff" />
          <Text style={styles.directionsBtnText}>Get Directions</Text>
          <MaterialIcons name="chevron-right" size={hp(2.6)} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Store Details ── */}
      <View style={styles.detailsBox}>
        <Text style={styles.detailRow}><Text style={styles.detailLabel}>Address: </Text>{address}</Text>
        <Text style={styles.detailRow}><Text style={styles.detailLabel}>Phone Number: </Text>{phone}</Text>
        <Text style={styles.detailRow}><Text style={styles.detailLabel}>Email: </Text>{email}</Text>
        {activeSocialLinks.length > 0 && (
          <View style={styles.socialRow}>
            <Text style={styles.detailLabel}>Social Media</Text>
            <View style={styles.socialIcons}>
              {activeSocialLinks.map(({fieldKey, Icon}) => (
                <Pressable key={fieldKey} onPress={() => handleSocialPress(activeStore[fieldKey])} hitSlop={{top:8,bottom:8,left:8,right:8}} style={({pressed}) => [{opacity: pressed ? 0.6 : 1}]}>
                  <Icon width={wp(6)} height={wp(6)} />
                </Pressable>
              ))}
            </View>
          </View>
        )}
        <View style={styles.dailyRatesSection}>
          <Text style={styles.detailLabel}>Daily Rates</Text>
          {renderDailyRates()}
        </View>
      </View>

      {/* ════════════════════════════════════════════════════════════
          ✅  NEW ATTRACTIVE STORE IMAGES CAROUSEL
          Replaces old carousel. Placed right above the tabs.
      ════════════════════════════════════════════════════════════ */}
      <View style={styles.carouselSectionWrapper}>
        <View style={styles.carouselSectionHeader}>
          <View style={styles.carouselAccentBar} />
          <Text style={styles.carouselSectionTitle}>Store Gallery</Text>
        </View>
        <StoreImageCarousel store={activeStore} />
      </View>

      {/* ── Tab Switcher ── */}
      <View style={styles.tabRow}>
        {[
          {key: 'trending',    label: 'Trending'},
          {key: 'activity',    label: 'Items'},
          {key: 'promotions',  label: 'Promotions'},
        ].map(tab => (
          <TouchableOpacity key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.key)}>
            <Text style={[styles.tabBtnText, activeTab === tab.key && styles.tabBtnTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Tab Content ── */}
      <View style={styles.section}>
        {activeTab === 'trending' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Products</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AllProductsScreen', {section: 'Trending Products', data: trendingProducts})} />
            </View>
            {renderTrendingSection()}
          </>
        )}
        {activeTab === 'activity' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Items</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AllProductsScreen', {section: 'Activity Feed', data: activityFeed})}>
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

// ─────────────────────────────────────────────────────────────────────────────
// Carousel StyleSheet  ← NEW
// ─────────────────────────────────────────────────────────────────────────────
const carouselStyles = StyleSheet.create({
  wrapper: {
    marginTop: hp(1),
    paddingBottom: hp(2),
  },
  slide: {
    height: hp(26),
    borderRadius: hp(2),
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
    // subtle shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: hp(2),
  },
  // Dark gradient-like overlay at bottom
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: hp(2),
    // simulate gradient: transparent top → semi-dark bottom
    backgroundColor: 'transparent',
    // React Native doesn't support LinearGradient natively,
    // so we use a semi-transparent bottom strip
    borderBottomLeftRadius: hp(2),
    borderBottomRightRadius: hp(2),
  },
  // Counter badge top-right
  counterBadge: {
    position: 'absolute',
    top: hp(1.2),
    right: wp(3),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
    backgroundColor: 'rgba(0,0,0,0.52)',
    borderRadius: hp(1.5),
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
  },
  counterText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.4),
    color: '#fff',
  },
  // Info overlay bottom
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: wp(4),
    paddingBottom: hp(1.5),
    paddingTop: hp(3),
    // dark gradient bottom
    backgroundColor: 'rgba(0,0,0,0.48)',
    borderBottomLeftRadius: hp(2),
    borderBottomRightRadius: hp(2),
  },
  overlayName: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2),
    color: '#fff',
    marginBottom: hp(0.5),
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  overlayMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
    flexWrap: 'wrap',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
    backgroundColor: 'rgba(255,165,0,0.22)',
    borderRadius: hp(1),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderWidth: 0.5,
    borderColor: 'rgba(255,165,0,0.5)',
  },
  ratingText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(1.4),
    color: '#FFD580',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
    flex: 1,
  },
  addressText: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.4),
    color: 'rgba(255,255,255,0.85)',
    flex: 1,
  },
  // Custom dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(1.5),
    gap: wp(1.5),
  },
  dot: {
    height: hp(0.9),
    borderRadius: hp(0.45),
  },
  dotActive: {
    width: wp(5),
    backgroundColor: '#130160',
  },
  dotInactive: {
    width: wp(2),
    backgroundColor: '#C4C4D4',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MapModal StyleSheet
// ─────────────────────────────────────────────────────────────────────────────
const mapStyles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {height: hp(8), backgroundColor: '#130160', flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: wp(4), paddingBottom: hp(1.2), gap: wp(2.5)},
  closeBtn: {padding: wp(1)},
  headerTitle: {flex: 1, fontFamily: 'Nunito-Bold', fontSize: hp(2.2), color: '#fff'},
  headerBtn: {padding: wp(1)},
  destStrip: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F8', paddingHorizontal: wp(4), paddingVertical: hp(1.2), gap: wp(1.5), borderBottomWidth: 1, borderBottomColor: '#E0E0E0'},
  destText: {flex: 1, fontFamily: 'Nunito-SemiBold', fontSize: hp(1.8), color: '#130160'},
  infoBar: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: wp(3), paddingVertical: hp(1), borderBottomWidth: 1, borderBottomColor: '#E8E8E8', elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.08, shadowRadius: 2},
  infoItem: {flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(1.5)},
  infoText: {fontFamily: 'Nunito-Bold', fontSize: hp(1.8), color: '#130160'},
  infoDivider: {width: wp(0.3), height: hp(2.5), backgroundColor: '#E0E0E0', marginHorizontal: wp(1)},
  mapView: {flex: 1},
  routeLoader: {position: 'absolute', bottom: hp(2), alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: hp(2.5), flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(5), paddingVertical: hp(1), gap: wp(2), elevation: 4, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.15, shadowRadius: 4},
  routeLoaderText: {fontFamily: 'Nunito-SemiBold', fontSize: hp(1.7), color: '#130160'},
  centerBox: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: wp(8), gap: hp(2)},
  statusText: {fontFamily: 'Nunito-SemiBold', fontSize: hp(1.8), color: '#524B6B', marginTop: hp(1), textAlign: 'center'},
  errorText: {fontFamily: 'Nunito-SemiBold', fontSize: hp(1.8), color: '#524B6B', textAlign: 'center', lineHeight: hp(3)},
  retryBtn: {backgroundColor: '#130160', paddingHorizontal: wp(8), paddingVertical: hp(1.5), borderRadius: wp(2), marginTop: hp(1)},
  retryBtnText: {fontFamily: 'Nunito-Bold', color: '#fff', fontSize: hp(2)},
  storeCard: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: wp(4), marginVertical: hp(1.2), borderRadius: wp(3.5), padding: wp(3), elevation: 6, shadowColor: '#000', shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.12, shadowRadius: 6, borderWidth: 0.5, borderColor: '#E8E8F0'},
  storeCardImgWrapper: {width: wp(18), height: wp(18), borderRadius: wp(2.5), overflow: 'hidden', marginRight: wp(3), backgroundColor: '#F2F2F2'},
  storeCardImg: {width: '100%', height: '100%'},
  storeCardImgPlaceholder: {justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F2'},
  storeCardInfo: {flex: 1, gap: hp(0.8)},
  storeCardName: {fontFamily: 'Nunito-Bold', fontSize: hp(2), color: '#1A1A2E'},
  starsRow: {flexDirection: 'row', alignItems: 'center', gap: wp(0.5)},
  ratingNum: {fontFamily: 'Nunito-SemiBold', fontSize: hp(1.5), color: '#524B6B', marginLeft: wp(1)},
  storeCardMetaRow: {flexDirection: 'row', alignItems: 'center', gap: wp(1), flexWrap: 'wrap'},
  storeCardMeta: {fontFamily: 'Nunito-SemiBold', fontSize: hp(1.5), color: '#524B6B'},
  storeCardMetaDot: {fontFamily: 'Nunito-Regular', fontSize: hp(1.5), color: '#aaa', marginHorizontal: wp(0.5)},
  storeCardAddress: {fontFamily: 'Nunito-Regular', fontSize: hp(1.4), color: '#888', marginTop: hp(0.5)},
  storeCardNavBtn: {width: wp(12), height: wp(12), borderRadius: wp(6), backgroundColor: '#130160', justifyContent: 'center', alignItems: 'center', marginLeft: wp(2), gap: hp(0.5), elevation: 3, shadowColor: '#130160', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.3, shadowRadius: 4},
  storeCardNavText: {fontFamily: 'Nunito-Bold', fontSize: hp(1.4), color: '#fff'},
  openAppBar: {height: hp(7), backgroundColor: '#14BA9C', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: wp(5), gap: wp(2)},
  openAppBarText: {fontFamily: 'Nunito-Bold', color: '#fff', fontSize: hp(2), flex: 1, textAlign: 'center'},
  userMarker: {width: wp(5.5), height: wp(5.5), borderRadius: wp(2.75), backgroundColor: 'rgba(19,1,96,0.2)', justifyContent: 'center', alignItems: 'center'},
  userMarkerDot: {width: wp(3), height: wp(3), borderRadius: wp(1.5), backgroundColor: '#130160', borderWidth: wp(0.5), borderColor: '#fff'},
  stepsContainer: {flex: 1, backgroundColor: '#fff', paddingHorizontal: wp(4)},
  stepsHeader: {fontFamily: 'Nunito-Bold', fontSize: hp(2.2), color: '#130160', marginTop: hp(2), marginBottom: hp(1.5)},
  stepRow: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0},
  stepIconCol: {width: wp(9), alignItems: 'center'},
  stepIconCircle: {width: wp(8), height: wp(8), borderRadius: wp(4), backgroundColor: '#130160', justifyContent: 'center', alignItems: 'center'},
  stepConnector: {width: wp(0.5), flex: 1, minHeight: hp(3), backgroundColor: '#E0E0E8', marginVertical: hp(0.5)},
  stepContent: {flex: 1, paddingLeft: wp(3), paddingBottom: hp(1.5)},
  stepInstruction: {fontFamily: 'Nunito-SemiBold', fontSize: hp(1.8), color: '#1A1A2E', lineHeight: hp(2.8)},
  stepMeta: {fontFamily: 'Nunito-Regular', fontSize: hp(1.5), color: '#888', marginTop: hp(0.5)},
  stepsDestRow: {flexDirection: 'row', alignItems: 'center', marginTop: hp(1), paddingBottom: hp(1)},
  stepsDestPin: {width: wp(8), height: wp(8), borderRadius: wp(4), backgroundColor: '#FF3B30', justifyContent: 'center', alignItems: 'center'},
  stepsDestText: {flex: 1, paddingLeft: wp(3), fontFamily: 'Nunito-Bold', fontSize: hp(1.8), color: '#130160'},
});

// ─────────────────────────────────────────────────────────────────────────────
// Main StyleSheet
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  heroBg: {width: '100%', minHeight: hp(41), borderBottomEndRadius: hp(2.5), borderBottomLeftRadius: hp(2.5), backgroundColor: '#130160', paddingBottom: '5%'},
  header: {width: wp(100), height: hp(7), marginTop: hp(5), paddingHorizontal: wp(5), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  headerText: {fontFamily: 'Nunito-Bold', fontSize: hp(3), color: '#C4C4C4'},
  headerIconBtn: {padding: wp(1)},
  profileRow: {width: '95%', alignSelf: 'center', flexDirection: 'row', marginTop: hp(3), minHeight: hp(23)},
  storeLogoWrapper: {width: '45%', justifyContent: 'center', alignItems: 'center'},
  storeLogo: {width: '90%', height: hp(18), borderRadius: hp(1.5)},
  storeInfoCol: {width: '55%', paddingLeft: '2%'},
  storeNameRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: '5%', marginBottom: '3%'},
  storeNameText: {fontFamily: 'Roboto-SemiBold', color: '#fff', fontSize: hp(2.8), flex: 1},
  statsRow: {flexDirection: 'row', marginBottom: '3%'},
  statItem: {width: '50%'},
  statNumber: {fontFamily: 'Roboto-ExtraBold', color: '#fff', fontSize: hp(3)},
  statLabel: {fontSize: hp(1.8), fontFamily: 'Roboto-Regular'},
  followBtnWrapper: {width: '90%'},
  followBtn: {borderWidth: hp(0.2), borderColor: '#14BA9C', borderRadius: hp(0.9), paddingVertical: hp(0.8), alignItems: 'center', backgroundColor: '#fff'},
  followingBtn: {backgroundColor: '#14BA9C', borderColor: '#14BA9C'},
  followBtnText: {color: '#14BA9C', fontSize: hp(2.2), fontFamily: 'DMSans-SemiBold'},
  followingBtnText: {color: '#fff'},
  actionRowWrapper: {width: '90%', alignSelf: 'center', marginTop: hp(3), gap: hp(1.5)},
  actionRow: {flexDirection: 'row', justifyContent: 'space-between', height: hp(6)},
  actionBtnRed: {width: '48%', borderWidth: hp(0.1), borderColor: 'red', borderRadius: hp(0.9), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: '9%'},
  actionBtnChecked: {backgroundColor: '#FF3B30', borderColor: '#FF3B30'},
  actionBtnVerifyBase: {width: '48%', borderWidth: hp(0.1), borderRadius: hp(0.9), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(1.5)},
  actionBtnVerified: {backgroundColor: '#E8FBF5', borderColor: '#00B813'},
  actionBtnNotVerified: {backgroundColor: '#FFF0F0', borderColor: '#FF3B30'},
  verifyBtnText: {fontFamily: 'Nunito-SemiBold', fontSize: hp(1.9)},
  verifiedBtnText: {color: '#00B813'},
  notVerifiedBtnText: {color: '#FF3B30'},
  actionBtnText: {fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(1.9)},
  directionsBtn: {width: '100%', height: hp(6), backgroundColor: '#130160', borderRadius: hp(0.9), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(2)},
  directionsBtnText: {fontFamily: 'Nunito-Bold', color: '#fff', fontSize: hp(2), flex: 1, textAlign: 'center'},
  detailsBox: {width: '90%', marginHorizontal: '5%', marginTop: hp(2)},
  detailRow: {fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(1.8), marginVertical: hp(0.5)},
  detailLabel: {fontFamily: 'Nunito-Bold', color: '#000', fontSize: hp(1.8)},
  socialRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: hp(0.8)},
  socialIcons: {flexDirection: 'row', alignItems: 'center', gap: wp(3)},
  dailyRatesSection: {marginTop: hp(1.2)},
  dailyRatesGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: wp(2), marginTop: hp(0.8)},
  dailyRateChip: {alignItems: 'center', backgroundColor: '#F0EEF8', borderRadius: hp(1), paddingHorizontal: wp(3), paddingVertical: hp(0.8), borderWidth: 0.5, borderColor: '#130160', minWidth: wp(18)},
  dailyRateDay: {fontFamily: 'Nunito-Bold', fontSize: hp(1.5), color: '#130160'},
  dailyRatePrice: {fontFamily: 'Nunito-ExtraBold', fontSize: hp(1.9), color: '#130160', marginTop: hp(0.2)},
  dailyRatesEmpty: {fontFamily: 'Nunito-Regular', fontSize: hp(1.7), color: '#999', marginTop: hp(0.5)},

  // ── Carousel section wrapper ─────────────────────────────────
  carouselSectionWrapper: {
    marginTop: hp(3),
    marginBottom: hp(0.5),
  },
  carouselSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    paddingHorizontal: wp(4),
    marginBottom: hp(1.5),
  },
  carouselAccentBar: {
    width: wp(1),
    height: hp(2.4),
    borderRadius: wp(0.5),
    backgroundColor: '#130160',
  },
  carouselSectionTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.3),
    color: '#0a0a2e',
  },

  // ── Tabs ─────────────────────────────────────────────────────
  tabRow: {flexDirection: 'row', marginTop: hp(3), marginHorizontal: wp(4), borderRadius: hp(1.2), backgroundColor: '#F2F2F2', padding: wp(1)},
  tabBtn: {flex: 1, paddingVertical: hp(1.2), alignItems: 'center', borderRadius: hp(1)},
  tabBtnActive: {backgroundColor: '#130160'},
  tabBtnText: {fontFamily: 'Nunito-SemiBold', fontSize: hp(1.7), color: '#524B6B'},
  tabBtnTextActive: {color: '#fff', fontFamily: 'Nunito-Bold'},
  section: {marginTop: hp(2), paddingHorizontal: wp(4)},
  sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp(1.5)},
  sectionTitle: {fontFamily: 'Nunito-Bold', fontSize: hp(2.3), color: '#000'},
  viewAll: {color: '#524B6B', fontSize: hp(1.9), textDecorationLine: 'underline'},
  hListPad: {paddingRight: wp(4), paddingVertical: hp(0.8)},
  emptyContainer: {padding: hp(2), alignItems: 'center'},
  emptyText: {fontFamily: 'Nunito-Regular', color: '#524B6B', fontSize: hp(1.8)},
  imageWrapper: {width: '100%', borderTopLeftRadius: hp(1.2), borderTopRightRadius: hp(1.2), overflow: 'hidden'},
  favouritePressable: {width: wp(46), marginRight: wp(3), marginVertical: hp(1)},
  favouriteCard: {width: '100%', borderRadius: hp(1.2), elevation: 3, backgroundColor: '#fff', overflow: 'hidden', shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 3},
  favouriteImage: {width: '100%', height: hp(15)},
  activityHeart: {position: 'absolute', right: wp(2), top: hp(10), zIndex: 10, alignItems: 'center'},
  heartBg: {backgroundColor: '#fff', borderRadius: hp(2.5), padding: hp(0.6), elevation: 4, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.2, shadowRadius: 2},
  trendingBadge: {position: 'absolute', top: hp(0.8), left: hp(0.8), backgroundColor: '#FF6B00', borderRadius: hp(0.8), paddingHorizontal: wp(1.5), paddingVertical: hp(0.3)},
  trendingBadgeText: {fontFamily: 'Nunito-Bold', color: '#fff', fontSize: hp(1.2)},
  favouriteDescriptionContainer: {padding: wp(2.5)},
  favouriteDescription: {fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(1.5), marginBottom: hp(0.5)},
  favouriteDiscountPrice: {fontFamily: 'Nunito-Bold', color: '#000', fontSize: hp(1.8), marginBottom: hp(0.2)},
  favouritePriceText: {color: 'red', fontSize: hp(1.4), fontFamily: 'Nunito-Regular'},
  favouriteOriginalPrice: {fontFamily: 'Nunito-Bold', color: '#808488', fontSize: hp(1.5), textDecorationLine: 'line-through'},
  promotionPressable: {width: wp(46), marginRight: wp(3), marginVertical: hp(1)},
  promotionCard: {width: '100%', borderRadius: hp(1.2), elevation: 3, backgroundColor: '#fff', overflow: 'hidden', shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 3},
  promotionImage: {width: '100%', height: hp(16)},
  promotionContent: {padding: wp(2.5)},
  promotionTitle: {fontFamily: 'DMSans-Bold', color: '#000', fontSize: hp(1.5), marginBottom: hp(0.3)},
  promotionDescription: {fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(1.3), marginBottom: hp(0.2)},
  promotionStatus: {fontFamily: 'Nunito-Bold', color: '#14BA9C', fontSize: hp(1.5), marginTop: hp(0.5)},
  promotionDate: {fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(1.4), marginTop: hp(0.3)},
});