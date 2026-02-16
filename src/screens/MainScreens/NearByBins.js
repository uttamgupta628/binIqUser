import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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

const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const NearByBins = () => {
  const navigation = useNavigation();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteStores, setFavoriteStores] = useState([]);

  // Fetch stores when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchNearbyStores();
    }, [])
  );

  const fetchNearbyStores = async () => {
    try {
      setLoading(true);
      
      // Fetch stores from API using getAll()
      const response = await storesAPI.getAll();
      console.log('Nearby stores response:', response);
      
      let storesWithDistance = [];
      
      if (response && response.stores) {
        storesWithDistance = response.stores.map(store => ({
          ...store,
          distance: calculateDistance(store),
          review: store.rating || '4.2',
        }));
      } else if (response && Array.isArray(response)) {
        storesWithDistance = response.map(store => ({
          ...store,
          distance: calculateDistance(store),
          review: store.rating || '4.2',
        }));
      }
      
      // Sort by distance (nearest first)
      storesWithDistance.sort((a, b) => {
        const distA = parseFloat(a.distance);
        const distB = parseFloat(b.distance);
        return distA - distB;
      });
      
      setStores(storesWithDistance);
      setFilteredStores(storesWithDistance);
      
      // Fetch user favorites
      try {
        const favResponse = await storesAPI.getFavorites();
        console.log('Favorites response:', favResponse);
        
        if (favResponse && favResponse.favorites) {
          const favoriteStoreIds = favResponse.favorites
            .filter(fav => fav.type === 'store' || fav.store_id)
            .map(fav => fav.store_id || fav._id);
          setFavoriteStores(favoriteStoreIds);
        } else if (favResponse && Array.isArray(favResponse)) {
          setFavoriteStores(favResponse.map(fav => fav._id || fav.id));
        }
      } catch (err) {
        console.log('Could not fetch favorites:', err.message);
      }
    } catch (err) {
      console.error('Error fetching nearby stores:', err);
      Alert.alert('Error', 'Failed to load nearby stores');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateDistance = (store) => {
    // Mock distance calculation
    // In production, use actual geolocation and calculate real distance
    if (store.distance) return store.distance;
    
    // Generate random distance between 0.5 and 10 km
    const randomDistance = (Math.random() * 9.5 + 0.5).toFixed(1);
    return `${randomDistance}KM`;
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      setFilteredStores(stores);
    } else {
      const filtered = stores.filter(store => {
        const storeName = store.store_name || store.title || '';
        const location = store.location || store.address || '';
        const searchText = text.toLowerCase();
        
        return (
          storeName.toLowerCase().includes(searchText) ||
          location.toLowerCase().includes(searchText)
        );
      });
      setFilteredStores(filtered);
    }
  };

  const handleToggleFavorite = async (storeId) => {
    try {
      // Toggle favorite on backend
      await storesAPI.favorite(storeId);
      
      // Update local state
      setFavoriteStores(prev => {
        if (prev.includes(storeId)) {
          return prev.filter(id => id !== storeId);
        } else {
          return [...prev, storeId];
        }
      });
    } catch (err) {
      console.error('Error toggling favorite:', err);
      Alert.alert('Error', 'Failed to update favorite');
    }
  };

  const isFavorite = (storeId) => {
    return favoriteStores.includes(storeId);
  };

  const renderItem = ({ item }) => {
    const storeId = item._id || item.id;
    const isFav = isFavorite(storeId);
    
    return (
      <TouchableOpacity 
        style={styles.storeCard} 
        onPress={() => navigation.navigate('BinStore', { store: item })}
      >
        <Image 
          source={
            item.store_image || item.image
              ? { uri: item.store_image || item.image }
              : require('../../../assets/flip_find.png')
          } 
          style={styles.storeImage} 
        />
        <TouchableOpacity 
          style={styles.heartIcon}
          onPress={() => handleToggleFavorite(storeId)}
        >
          <Ionicons 
            name={isFav ? 'heart' : 'heart-outline'} 
            size={hp(3)} 
            color={'#EE2525'} 
          />
        </TouchableOpacity>
        <View style={styles.storeDetails}>
          <View style={{ flex: 1 }}>
            <Text style={styles.storeTitle} numberOfLines={1}>
              {item.store_name || item.title || 'Store Name'}
            </Text>
            <Text style={styles.storeLocation} numberOfLines={1}>
              {item.location || item.address || 'Location'}
            </Text>
            <Text style={styles.storeDistance}>
              {item.distance || '0.0KM'}
            </Text>
          </View>
          <View style={styles.ratingBadge}>
            <FontAwesome name='star' size={8} color={'#fff'} />
            <Text style={styles.ratingText}>
              {item.review || item.rating || '4.2'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="location-outline" size={80} color="#ccc" />
      <Text style={styles.emptyText}>No stores found</Text>
      <Text style={styles.emptySubtext}>
        {searchQuery ? 'Try a different search term' : 'No stores available nearby'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}
        resizeMode="stretch"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name='arrow-back-ios' color={'#0D0D26'} size={25} />
            </Pressable>
            <Text style={styles.headerText}>Top Bins Near Me</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchParent}>
          <View style={styles.searchContainer}>
            <View style={styles.cameraButton}>
              <SearchIcon />
            </View>
            <TextInput 
              style={styles.input} 
              placeholder='search for stores' 
              placeholderTextColor={'#999'}
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

        {/* Results Count */}
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

        {/* Store List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#130160" />
            <Text style={styles.loadingText}>Finding stores near you...</Text>
          </View>
        ) : filteredStores.length === 0 ? (
          <EmptyState />
        ) : (
          <View style={styles.listContainer}>
            <FlatList
              data={filteredStores}
              renderItem={renderItem}
              keyExtractor={(item, index) => item._id || item.id || index.toString()}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              onRefresh={fetchNearbyStores}
              refreshing={refreshing}
            />
          </View>
        )}
      </ImageBackground>
    </View>
  );
};

export default NearByBins;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F3F5',
  },
  vector: {
    flex: 1,
    width: wp(100),
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
  headerChild: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(3),
    color: '#0D0140'
  },
  // Search Bar
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
    backgroundColor: '#F2F2F2'
  },
  cameraButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    fontSize: hp(2.2),
    fontFamily: 'Nunito-Regular',
    paddingVertical: 8,
    color: '#000'
  },
  searchButton: {
    padding: 10,
  },
  menuButton: {
    backgroundColor: '#130160',
    padding: 10,
    borderRadius: 12,
    height: hp(6.5),
    width: wp(14),
    justifyContent: 'center',
    alignItems: 'center'
  },
  // Results Header
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '5%',
    marginBottom: '3%',
  },
  resultsText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.8),
    color: '#666',
  },
  clearText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.8),
    color: '#130160',
    textDecorationLine: 'underline',
  },
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Nunito-Regular',
    fontSize: hp(2),
    color: '#666',
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.5),
    color: '#666',
    marginTop: 20,
  },
  emptySubtext: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.8),
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  // Store List
  listContainer: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    paddingHorizontal: '2%',
    paddingBottom: 20,
  },
  // Store Card
  storeCard: {
    width: wp(43.6),
    height: hp(23),
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#e6e6e6',
    backgroundColor: '#fff',
    marginHorizontal: '1.7%',
    marginVertical: '3%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeImage: {
    width: wp(43.6),
    height: hp(13),
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  heartIcon: {
    position: 'absolute',
    right: '3%',
    top: '2%',
    zIndex: 10,
  },
  storeDetails: {
    margin: '6%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  storeTitle: {
    fontFamily: 'Nunito-SemiBold',
    color: '#0049AF',
    fontSize: hp(1.8),
  },
  storeLocation: {
    fontFamily: 'Nunito-SemiBold',
    color: '#000',
    fontSize: hp(1.3),
    marginTop: 2,
  },
  storeDistance: {
    fontFamily: 'Nunito-SemiBold',
    color: '#14BA9C',
    fontSize: hp(1.5),
    marginTop: 2,
  },
  ratingBadge: {
    backgroundColor: '#FFBB36',
    height: hp(2),
    width: wp(8),
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '1.5%',
    borderRadius: 4,
  },
  ratingText: {
    color: '#fff',
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1),
  },
});