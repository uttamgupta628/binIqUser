import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Dimensions, ImageBackground, StatusBar, Pressable,
  Image, ActivityIndicator, Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SearchIcon from '../../../assets/SearchIcon.svg';
import CameraIcon from '../../../assets/CameraIcon.svg';
import FilterIcon from '../../../assets/FilterIcon.svg';
import { storesAPI } from '../../api/apiService';

const { width, height } = Dimensions.get('window');
const wp = (p) => (width * p) / 100;
const hp = (p) => (height * p) / 100;

// ─── Static fallbacks ──────────────────────────────────────────
const STORE_FALLBACK = require('../../../assets/flip_find.png');
// const ITEM_FALLBACK  = require('../../../assets/gray_img.png');
const ITEM_FALLBACK  = STORE_FALLBACK;

// ─── SmartImage: backend URI → static fallback ─────────────────
const SmartImage = ({ uri, fallback, style, resizeMode = 'cover' }) => {
  const hasValidUri = typeof uri === 'string' && uri.trim().length > 0;

  return (
    <Image
      source={hasValidUri ? { uri: uri.trim() } : fallback}
      style={style}
      resizeMode={resizeMode}
      defaultSource={fallback}  // shows fallback while loading / on error (iOS)
      onError={(e) => console.log('Image load error:', e.nativeEvent.error, 'uri:', uri)}
    />
  );
};

// ─── Search Bar ────────────────────────────────────────────────
const SearchBar = () => (
  <View style={styles.searchParent}>
    <Pressable style={styles.searchContainer}>
      <View style={styles.cameraButton}><SearchIcon /></View>
      <Text style={styles.input}>search for anything</Text>
      <View style={styles.searchButton}><CameraIcon /></View>
    </Pressable>
    <TouchableOpacity style={styles.menuButton}>
      <FilterIcon />
    </TouchableOpacity>
  </View>
);

// ─── My Items Tab ──────────────────────────────────────────────
const TopBinItemsList = ({ loading, favoriteStores, onRemoveFavorite, onCardPress }) => {
  const renderItem = ({ item, index }) => {
    const name    = item.store_name || 'Store Name';
    const address = item.address || item.city || 'No address';
    const likes   = item.likes ?? 0;
    const views   = item.views_count ?? 0;
    const imageUri = item.store_image || item.image || null;

    return (
      <TouchableOpacity style={styles.itemCard} activeOpacity={0.85} onPress={() => onCardPress(item)}>
        <View style={styles.itemCardInner}>

          {/* Backend image first, static fallback second */}
          <SmartImage uri={imageUri} fallback={ITEM_FALLBACK} style={styles.itemImage} />

          <TouchableOpacity
            style={styles.heartIconAbsolute}
            onPress={(e) => { e.stopPropagation(); onRemoveFavorite(item._id); }}
          >
            <View style={styles.heartBg}>
              <Ionicons name="heart" size={hp(2.4)} color="#EE2525" />
            </View>
          </TouchableOpacity>

          <View style={styles.itemDescription}>
            <Text style={styles.itemDescriptionText} numberOfLines={1}>{name}</Text>
            <Text style={styles.itemAddressText} numberOfLines={1}>{address}</Text>
          </View>

          {/* <View style={styles.itemStatsRow}>
            <View style={styles.statBadge}>
              <Ionicons name="heart-outline" size={11} color="#EE2525" />
              <Text style={styles.statText}>{likes}</Text>
            </View>
            <View style={styles.statBadge}>
              <Ionicons name="eye-outline" size={11} color="#666" />
              <Text style={styles.statText}>{views}</Text>
            </View>
          </View> */}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#130160" />
      <Text style={styles.loadingText}>Loading favorites...</Text>
    </View>
  );

  if (!favoriteStores || favoriteStores.length === 0) return (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>No favorite items yet</Text>
      <Text style={styles.emptySubtext}>Start adding stores to your favorites!</Text>
    </View>
  );

  return (
    <>
      <SearchBar />
      <Text style={styles.sectionTitle}>FAV. ITEMS</Text>
      <FlatList
        data={favoriteStores}
        renderItem={renderItem}
        keyExtractor={(item, index) => item._id || index.toString()}
        numColumns={2}
        scrollEnabled
        showsVerticalScrollIndicator={false}
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
      />
    </>
  );
};

// ─── Location Tab ──────────────────────────────────────────────
const MyItemsScreen = ({ loading, favoriteStores, onRemoveFavorite, onCardPress }) => {
  const renderItem = ({ item, index }) => {
    const name     = item.store_name || 'Store Name';
    const address  = item.address || item.city || 'Location not set';
    const rating   = item.ratings != null ? item.ratings : '—';
    const imageUri = item.store_image || item.image || null;

    return (
      <TouchableOpacity style={styles.storeCard} activeOpacity={0.85} onPress={() => onCardPress(item)}>

        {/* Backend image first, static fallback second */}
        <SmartImage uri={imageUri} fallback={STORE_FALLBACK} style={styles.storeImage} />

        <TouchableOpacity
          style={styles.heartIconAbsoluteStore}
          onPress={(e) => { e.stopPropagation(); onRemoveFavorite(item._id); }}
        >
          <View style={styles.heartBg}>
            <Ionicons name="heart" size={hp(2.4)} color="#EE2525" />
          </View>
        </TouchableOpacity>

        <View style={styles.storeDetails}>
          <View style={{ flex: 1 }}>
            <Text style={styles.storeTitle} numberOfLines={1}>{name}</Text>
            <Text style={styles.storeLocation} numberOfLines={1}>{address}</Text>
            <Text style={styles.storeDistance}>
              {item.user_latitude && item.user_longitude
                ? `${Number(item.user_latitude).toFixed(2)}°, ${Number(item.user_longitude).toFixed(2)}°`
                : 'Location N/A'}
            </Text>
          </View>
          <View style={styles.ratingBadge}>
            <FontAwesome name="star" size={8} color="#fff" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#130160" />
      <Text style={styles.loadingText}>Loading favorites...</Text>
    </View>
  );

  if (!favoriteStores || favoriteStores.length === 0) return (
    <View style={styles.emptyContainer}>
      <Ionicons name="location-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>No favorite locations yet</Text>
      <Text style={styles.emptySubtext}>Start adding stores to your favorites!</Text>
    </View>
  );

  return (
    <>
      <SearchBar />
      <Text style={styles.sectionTitle}>FAV. BINS</Text>
      <FlatList
        data={favoriteStores}
        renderItem={renderItem}
        keyExtractor={(item, index) => item._id || index.toString()}
        numColumns={2}
        scrollEnabled
        showsVerticalScrollIndicator={false}
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
      />
    </>
  );
};

// ─── Main Screen ───────────────────────────────────────────────
const FavouritesScreen = () => {
  const [activeTab, setActiveTab] = useState('scan');
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [favoriteStores, setFavoriteStores] = useState([]);

  useFocusEffect(useCallback(() => { fetchFavorites(); }, [activeTab]));

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await storesAPI.getFavorites();
      let stores = [];
      if (Array.isArray(response))              stores = response;
      else if (Array.isArray(response?.favorites)) stores = response.favorites;
      else if (Array.isArray(response?.data))      stores = response.data;
      setFavoriteStores(stores);
    } catch (err) {
      console.error('fetchFavorites:', err);
      Alert.alert('Error', 'Failed to load favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardPress = (store) => navigation.navigate('BinStore', { store });

  const handleRemoveFavorite = (itemId) => {
    Alert.alert('Remove Favorite', 'Are you sure you want to remove this from favorites?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await storesAPI.favorite(itemId);
            setFavoriteStores((prev) => prev.filter((item) => item._id !== itemId));
            Alert.alert('Success', 'Removed from favorites');
          } catch (err) {
            Alert.alert('Error', 'Failed to remove from favorites');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}
        resizeMode="stretch"
      >
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color="#0D0D26" size={25} />
            </Pressable>
            <Text style={styles.headerText}>My Items & My Locations</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'scan' && styles.activeTab]}
            onPress={() => setActiveTab('scan')}
          >
            <Text style={[styles.tabText, activeTab === 'scan' && styles.activeTabText]}>My Items</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'items' && styles.activeTab]}
            onPress={() => setActiveTab('items')}
          >
            <Text style={[styles.tabText, activeTab === 'items' && styles.activeTabText]}>Location</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {activeTab === 'scan' ? (
            <TopBinItemsList
              loading={loading}
              favoriteStores={favoriteStores}
              onRemoveFavorite={handleRemoveFavorite}
              onCardPress={handleCardPress}
            />
          ) : (
            <MyItemsScreen
              loading={loading}
              favoriteStores={favoriteStores}
              onRemoveFavorite={handleRemoveFavorite}
              onCardPress={handleCardPress}
            />
          )}
        </View>

        <View style={styles.enrollNowContainer}>
          <Pressable style={styles.button} onPress={() => navigation.navigate('HomeNavigator')}>
            <Text style={styles.buttonText}>ADD TO LIBRARY</Text>
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
};

export default FavouritesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6F3F5' },
  vector: { flex: 1, width: wp(100) },
  header: { width: wp(100), height: hp(7), marginTop: '10%', paddingHorizontal: '5%', flexDirection: 'row', alignItems: 'center' },
  headerChild: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerText: { fontFamily: 'Nunito-Bold', fontSize: hp(2.5), color: '#0D0140' },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: '5%', width: wp(100), height: hp(6), paddingHorizontal: '5%' },
  tab: { width: wp(40), justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 1.2, borderColor: '#99ABC62E' },
  activeTab: { backgroundColor: '#2CCCA6' },
  tabText: { fontSize: hp(2.2), fontFamily: 'Nunito-SemiBold', color: '#000' },
  activeTabText: { color: '#fff' },
  content: { flex: 1 },
  flatList: { flex: 1, width: '100%' },
  flatListContent: { paddingHorizontal: wp(2), paddingBottom: 20, alignItems: 'center' },
  sectionTitle: { fontFamily: 'Nunito-Bold', fontSize: hp(2.3), color: '#000', marginVertical: '2%', marginHorizontal: '5.5%' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontFamily: 'Nunito-Regular', fontSize: hp(2), color: '#666' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontFamily: 'Nunito-Bold', fontSize: hp(2.5), color: '#666', marginTop: 20 },
  emptySubtext: { fontFamily: 'Nunito-Regular', fontSize: hp(1.8), color: '#999', marginTop: 10 },
  heartBg: { backgroundColor: '#fff', borderRadius: 20, padding: 4, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2 },
  // Item Cards
  itemCard: { width: wp(47), height: hp(28), alignItems: 'center', marginVertical: '1%' },
  itemCardInner: { width: wp(45), height: hp(28), borderRadius: 10, borderWidth: 1, borderColor: '#e6e6e6', backgroundColor: '#fff', overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
  itemImage: { width: '100%', height: hp(14) },
  heartIconAbsolute: { position: 'absolute', right: '3%', top: '2%', zIndex: 10 },
  itemDescription: { paddingHorizontal: '4%', marginTop: 8 },
  itemDescriptionText: { fontFamily: 'Nunito-Bold', color: '#1a1a2e', fontSize: hp(1.8) },
  itemAddressText: { fontFamily: 'Nunito-Regular', color: '#888', fontSize: hp(1.4), marginTop: 2 },
  itemStatsRow: { position: 'absolute', bottom: hp(1), left: '4%', flexDirection: 'row', gap: 10 },
  statBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: { fontFamily: 'Nunito-Regular', fontSize: hp(1.4), color: '#666' },
  // Store Cards
  storeCard: { width: wp(43.6), height: hp(24), borderRadius: 12, borderWidth: 0.5, borderColor: '#e0e0e0', backgroundColor: '#fff', marginHorizontal: '1%', marginVertical: '3%', overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
  storeImage: { width: '100%', height: hp(13) },
  heartIconAbsoluteStore: { position: 'absolute', right: '3%', top: '2%', zIndex: 10 },
  storeDetails: { margin: '5%', flexDirection: 'row', justifyContent: 'space-between' },
  storeTitle: { fontFamily: 'Nunito-Bold', color: '#0049AF', fontSize: hp(1.8) },
  storeLocation: { fontFamily: 'Nunito-Regular', color: '#555', fontSize: hp(1.3) },
  storeDistance: { fontFamily: 'Nunito-SemiBold', color: '#14BA9C', fontSize: hp(1.3), marginTop: 2 },
  ratingBadge: { backgroundColor: '#FFBB36', height: hp(2.2), minWidth: wp(9), flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 3, paddingHorizontal: 6, borderRadius: 4 },
  ratingText: { color: '#fff', fontFamily: 'Nunito-Bold', fontSize: hp(1) },
  // Search Bar
  searchParent: { flexDirection: 'row', alignItems: 'center', marginHorizontal: '3%', marginBottom: '4%' },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, marginRight: 10, borderColor: '#99ABC678', height: hp(6.5), backgroundColor: '#F2F2F2' },
  cameraButton: { padding: 10 },
  input: { flex: 1, fontSize: hp(2.2), fontFamily: 'Nunito-Regular', color: '#999' },
  searchButton: { padding: 10 },
  menuButton: { backgroundColor: '#130160', padding: 10, borderRadius: 12, height: hp(6.5), width: wp(14), justifyContent: 'center', alignItems: 'center' },
  // Bottom
  enrollNowContainer: { width: wp(85), alignSelf: 'center', alignItems: 'center', paddingVertical: hp(2), paddingBottom: hp(3) },
  button: { backgroundColor: '#1a237e', width: '77%', height: hp(5), borderRadius: 10, justifyContent: 'center', elevation: 3 },
  buttonText: { color: 'white', fontSize: hp(1.9), fontFamily: 'Nunito-Bold', textAlign: 'center' },
});