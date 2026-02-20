import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
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
  TextInput,
  ActivityIndicator,
  Alert,
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

// Gradient colours for placeholder cards
const GRAD_COLORS = [
  '#667eea', '#f093fb', '#4facfe', '#43e97b',
  '#fa709a', '#a18cd1', '#fccb90', '#84fab0',
];
const placeholderBg = (i) => GRAD_COLORS[i % GRAD_COLORS.length];

// ─── Store Card ────────────────────────────────────────────────
const StoreCard = ({ item, index, isFav, onFavorite, onPress }) => {
  const storeId = item._id || item.id;
  const name = item.store_name || item.title || 'Store Name';
  const address = item.location || item.address || 'Location';
  const distance = item.distance || 'N/A';
  const rating = item.review || item.rating || item.ratings || '4.2';
  const imageUri = item.store_image || item.image || null;

  return (
    <TouchableOpacity style={styles.storeCard} onPress={onPress} activeOpacity={0.85}>

      {/* ── Image or gradient placeholder ── */}
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.storeImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.storeImage, styles.imagePlaceholder, { backgroundColor: placeholderBg(index) }]}>
          <View style={styles.placeholderIconCircle}>
            <Ionicons name="storefront" size={30} color="rgba(255,255,255,0.9)" />
          </View>
          <Text style={styles.placeholderName} numberOfLines={1}>{name}</Text>
        </View>
      )}

      {/* ── Heart button ── */}
      <TouchableOpacity
        style={styles.heartIconWrapper}
        onPress={() => onFavorite(storeId)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={styles.heartBg}>
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={hp(2.4)}
            color="#EE2525"
          />
        </View>
      </TouchableOpacity>

      {/* ── Store details ── */}
      <View style={styles.storeDetails}>
        <View style={{ flex: 1 }}>
          <Text style={styles.storeTitle} numberOfLines={1}>{name}</Text>
          <Text style={styles.storeLocation} numberOfLines={1}>{address}</Text>
          <Text style={styles.storeDistance}>{distance}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <FontAwesome name="star" size={8} color="#fff" />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ───────────────────────────────────────────────
const NearByBins = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteStoreIds, setFavoriteStoreIds] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [])
  );

  const fetchAll = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchNearbyStores(), fetchFavorites()]);
    } catch (e) {
      console.error('fetchAll:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchNearbyStores = async () => {
    try {
      const response = await storesAPI.getAll();
      console.log('Nearby stores response:', response);

      let raw = [];
      if (Array.isArray(response)) raw = response;
      else if (response?.stores) raw = response.stores;
      else if (response?.data) raw = response.data;

      // Attach calculated distance & sort nearest first
      const withDist = raw.map((store) => ({
        ...store,
        distance: calculateDistance(store),
        review: store.rating || store.ratings || '4.2',
      }));

      withDist.sort((a, b) => {
        const da = parseFloat(a.distance) || 9999;
        const db = parseFloat(b.distance) || 9999;
        return da - db;
      });

      setStores(withDist);
      applySearch(withDist, searchQuery);
    } catch (e) {
      console.error('fetchNearbyStores:', e);
      Alert.alert('Error', 'Failed to load nearby stores');
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await storesAPI.getFavorites();
      let ids = [];
      if (Array.isArray(res)) {
        ids = res.map((f) => f._id || f.id);
      } else if (Array.isArray(res?.favorites)) {
        ids = res.favorites.map((f) => f._id || f.store_id || f.id);
      }
      setFavoriteStoreIds(ids);
    } catch (e) {
      console.log('fetchFavorites:', e.message);
    }
  };

  // Real distance from a fixed user location (replace with actual GPS coords)
  const calculateDistance = (store) => {
    if (!store.user_latitude || !store.user_longitude) return 'N/A';
    const R = 6371;
    const lat1 = 23.0225; // user lat — replace with real GPS
    const lon1 = 72.5714; // user lon — replace with real GPS
    const dLat = (store.user_latitude - lat1) * Math.PI / 180;
    const dLon = (store.user_longitude - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(store.user_latitude * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return `${dist.toFixed(1)}KM`;
  };

  const applySearch = (list, query) => {
    if (!query.trim()) {
      setFilteredStores(list);
      return;
    }
    const q = query.toLowerCase();
    setFilteredStores(
      list.filter((s) =>
        (s.store_name || s.title || '').toLowerCase().includes(q) ||
        (s.address || s.location || '').toLowerCase().includes(q)
      )
    );
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    applySearch(stores, text);
  };

  const handleToggleFavorite = async (storeId) => {
    try {
      await storesAPI.favorite(storeId);
      setFavoriteStoreIds((prev) =>
        prev.includes(storeId) ? prev.filter((id) => id !== storeId) : [...prev, storeId]
      );
    } catch (e) {
      console.error('toggleFavorite:', e);
      Alert.alert('Error', 'Failed to update favorite');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}
        resizeMode="stretch"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color="#0D0D26" size={25} />
            </Pressable>
            <Text style={styles.headerText}>Top Bins Near Me</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchParent}>
          <View style={styles.searchContainer}>
            <View style={styles.cameraButton}><SearchIcon /></View>
            <TextInput
              style={styles.input}
              placeholder="search for stores"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <TouchableOpacity style={styles.searchButton}>
              <CameraIcon />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <FilterIcon />
          </TouchableOpacity>
        </View>

        {/* Results count */}
        {!loading && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              {filteredStores.length} {filteredStores.length === 1 ? 'store' : 'stores'} found
            </Text>
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Text style={styles.clearText}>Clear search</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#130160" />
            <Text style={styles.loadingText}>Finding stores near you...</Text>
          </View>
        ) : filteredStores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No stores found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'No stores available nearby'}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <FlatList
              data={filteredStores}
              renderItem={({ item, index }) => (
                <StoreCard
                  item={item}
                  index={index}
                  isFav={favoriteStoreIds.includes(item._id || item.id)}
                  onFavorite={handleToggleFavorite}
                  onPress={() => navigation.navigate('BinStore', { store: item })}
                />
              )}
              keyExtractor={(item, index) => item._id || item.id || index.toString()}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              onRefresh={fetchAll}
              refreshing={refreshing}
            />
          </View>
        )}
      </ImageBackground>
    </View>
  );
};

export default NearByBins;

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6F3F5' },
  vector: { flex: 1, width: wp(100) },

  header: {
    width: wp(100),
    height: hp(7),
    marginTop: '10%',
    paddingHorizontal: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerChild: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerText: { fontFamily: 'Nunito-Bold', fontSize: hp(3), color: '#0D0140' },

  // Search
  searchParent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: '3%',
    marginVertical: '5%',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginRight: 10,
    borderColor: '#99ABC678',
    height: hp(6.5),
    backgroundColor: '#F2F2F2',
  },
  cameraButton: { padding: 10 },
  input: { flex: 1, fontSize: hp(2.2), fontFamily: 'Nunito-Regular', color: '#000' },
  searchButton: { padding: 10 },
  menuButton: {
    backgroundColor: '#130160',
    padding: 10,
    borderRadius: 12,
    height: hp(6.5),
    width: wp(14),
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Results header
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '5%',
    marginBottom: '3%',
  },
  resultsText: { fontFamily: 'Nunito-SemiBold', fontSize: hp(1.8), color: '#666' },
  clearText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.8),
    color: '#130160',
    textDecorationLine: 'underline',
  },

  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontFamily: 'Nunito-Regular', fontSize: hp(2), color: '#666' },

  // Empty
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { fontFamily: 'Nunito-Bold', fontSize: hp(2.5), color: '#666', marginTop: 20 },
  emptySubtext: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.8),
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },

  // List
  listContainer: { flex: 1, width: '100%' },
  listContent: { paddingHorizontal: '2%', paddingBottom: 20 },

  // Store Card
  storeCard: {
    width: wp(43.6),
    height: hp(24),
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#e6e6e6',
    backgroundColor: '#fff',
    marginHorizontal: '1.7%',
    marginVertical: '3%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  storeImage: {
    width: '100%',
    height: hp(13),
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  // Gradient placeholder
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  placeholderName: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Nunito-Bold',
    fontSize: hp(1.4),
    paddingHorizontal: 8,
    textAlign: 'center',
  },

  // Heart
  heartIconWrapper: { position: 'absolute', right: '3%', top: '2%', zIndex: 10 },
  heartBg: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },

  // Store info
  storeDetails: {
    marginHorizontal: '5%',
    marginVertical: '4%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  storeTitle: { fontFamily: 'Nunito-SemiBold', color: '#0049AF', fontSize: hp(1.8) },
  storeLocation: { fontFamily: 'Nunito-Regular', color: '#555', fontSize: hp(1.3), marginTop: 2 },
  storeDistance: { fontFamily: 'Nunito-SemiBold', color: '#14BA9C', fontSize: hp(1.4), marginTop: 2 },
  ratingBadge: {
    backgroundColor: '#FFBB36',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 4,
    minWidth: wp(8),
    justifyContent: 'center',
  },
  ratingText: { color: '#fff', fontFamily: 'Nunito-Bold', fontSize: hp(1) },
});