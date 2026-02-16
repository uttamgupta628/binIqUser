import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Dimensions,
  StatusBar,
  ImageBackground,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Slider from '@react-native-community/slider';
import { Star, Heart } from "lucide-react-native";
import SearchIcon from '../../../assets/SearchIcon.svg';
import CameraIcon from '../../../assets/CameraIcon.svg';
import FilterIcon from '../../../assets/FilterIcon.svg';
import { storesAPI } from '../../api/apiService';

const { width, height } = Dimensions.get('window');

const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const RECENT_SEARCHES_KEY = '@recent_searches';
const MAX_RECENT_SEARCHES = 10;

const SearchScreen = () => {
  const navigation = useNavigation();
  
  // State
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [topStores, setTopStores] = useState([]);
  const [favoriteStores, setFavoriteStores] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Filter Modal State
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState('active');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [priceValue, setPriceValue] = useState(0);
  const [categorySearch, setCategorySearch] = useState('');

  // Fetch data on screen focus
  useFocusEffect(
    useCallback(() => {
      loadRecentSearches();
      fetchTopStores();
      fetchCategories();
      fetchFavorites();
    }, [])
  );

  const loadRecentSearches = async () => {
    try {
      const searches = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (searches) {
        setRecentSearches(JSON.parse(searches));
      }
    } catch (err) {
      console.error('Error loading recent searches:', err);
    }
  };

  const saveRecentSearch = async (query) => {
    try {
      if (!query.trim()) return;
      
      let searches = [...recentSearches];
      
      // Remove if already exists
      searches = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
      
      // Add to beginning
      searches.unshift(query);
      
      // Limit to MAX_RECENT_SEARCHES
      searches = searches.slice(0, MAX_RECENT_SEARCHES);
      
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
      setRecentSearches(searches);
    } catch (err) {
      console.error('Error saving recent search:', err);
    }
  };

  const removeRecentSearch = async (query) => {
    try {
      const searches = recentSearches.filter(s => s !== query);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
      setRecentSearches(searches);
    } catch (err) {
      console.error('Error removing recent search:', err);
    }
  };

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    } catch (err) {
      console.error('Error clearing recent searches:', err);
    }
  };

  const fetchTopStores = async () => {
    try {
      setLoading(true);
      const response = await storesAPI.getAll();
      
      if (response && response.stores) {
        // Get top rated stores
        const sortedStores = [...response.stores].sort((a, b) => {
          const ratingA = parseFloat(a.rating || 0);
          const ratingB = parseFloat(b.rating || 0);
          return ratingB - ratingA;
        });
        
        setTopStores(sortedStores.slice(0, 6)); // Top 6 stores
      } else if (response && Array.isArray(response)) {
        setTopStores(response.slice(0, 6));
      }
    } catch (err) {
      console.error('Error fetching top stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    // Mock categories - replace with API call when available
    const mockCategories = [
      'Books', 'Pan', 'Bedsheet', 'Bins', 'Chopper', 'Clocks',
      'Electronics', 'Clothing', 'Furniture', 'Toys', 'Kitchen', 'Beauty'
    ];
    setCategories(mockCategories);
  };

  const fetchFavorites = async () => {
    try {
      const response = await storesAPI.getFavorites();
      if (response && response.favorites) {
        const favoriteStoreIds = response.favorites
          .filter(fav => fav.type === 'store' || fav.store_id)
          .map(fav => fav.store_id || fav._id);
        setFavoriteStores(favoriteStoreIds);
      }
    } catch (err) {
      console.log('Could not fetch favorites:', err);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      // Navigate to search results
      navigation.navigate('SearchResults', {
        query: searchQuery,
        filters: {
          categories: selectedCategories,
          priceRange: { min: minPrice, max: maxPrice },
          status: activeFilter,
        }
      });
    }
  };

  const handleRecentSearchPress = (query) => {
    setSearchQuery(query);
    saveRecentSearch(query);
    navigation.navigate('SearchResults', { query });
  };

  const handleStorePress = (store) => {
    navigation.navigate('BinStore', { store });
  };

  const handleToggleFavorite = async (storeId) => {
    try {
      await storesAPI.favorite(storeId);
      
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

  const toggleCategory = (category) => {
    setSelectedCategories(prevCategories =>
      prevCategories.includes(category)
        ? prevCategories.filter(c => c !== category)
        : [...prevCategories, category]
    );
  };

  const handleApplyFilters = () => {
    setShowFilterModal(false);
    
    if (searchQuery.trim()) {
      navigation.navigate('SearchResults', {
        query: searchQuery,
        filters: {
          categories: selectedCategories,
          priceRange: { min: minPrice || '0', max: maxPrice || '10000' },
          status: activeFilter,
        }
      });
    }
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setActiveFilter('active');
    setMinPrice('');
    setMaxPrice('');
    setPriceValue(0);
    setCategorySearch('');
  };

  const isFavorite = (storeId) => favoriteStores.includes(storeId);

  const filteredCategories = categories.filter(cat =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const renderRecentSearch = ({ item }) => (
    <View style={styles.recentSearchItem}>
      <Ionicons name="time-outline" size={hp(3)} color="#95969D" />
      <TouchableOpacity 
        style={{ flex: 1, marginLeft: 15 }}
        onPress={() => handleRecentSearchPress(item)}
      >
        <Text style={styles.recentSearchText}>{item}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => removeRecentSearch(item)}>
        <EvilIcons name="close" size={hp(3)} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderPopularStore = ({ item }) => {
    const storeId = item._id || item.id;
    const isFav = isFavorite(storeId);

    return (
      <TouchableOpacity
        style={styles.popularStoreItem}
        onPress={() => handleStorePress(item)}
      >
        <View style={styles.storeImageContainer}>
          <Image 
            source={
              item.store_image 
                ? { uri: item.store_image }
                : require('../../../assets/dummy_product.png')
            } 
            style={styles.storeImage} 
          />
        </View>
        <View style={styles.storeInfo}>
          <Text style={styles.storeName} numberOfLines={1}>
            {item.store_name || item.title || 'Store'}
          </Text>
          <Text style={styles.storeLocation} numberOfLines={1}>
            {item.location || item.address || 'Location'}
          </Text>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.reviews}>
            {item.distance || '3-4KM'}{' '}
          </Text>
          <Star size={12} color="#FFD700" fill="#FFD700" />
          <Text style={styles.rating}>{item.rating || '4.6'}</Text>
          <TouchableOpacity 
            style={styles.heartButton}
            onPress={() => handleToggleFavorite(storeId)}
          >
            <Heart 
              size={13} 
              color="red" 
              fill={isFav ? "red" : "transparent"}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

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
            <Text style={styles.headerText}>Search</Text>
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
              placeholder='Search stores, products...' 
              placeholderTextColor={'#C4C4C4'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <CameraIcon />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => setShowFilterModal(true)}
          >
            <FilterIcon />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Recent Searches */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              {recentSearches.length > 0 && (
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {recentSearches.length > 0 ? (
              <FlatList
                data={recentSearches}
                renderItem={renderRecentSearch}
                keyExtractor={(item, index) => `${item}-${index}`}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.noHistoryText}>
                You don't have any search history
              </Text>
            )}
          </View>

          {/* Top Stores */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Bin Stores</Text>
            
            {loading ? (
              <ActivityIndicator size="large" color="#130160" />
            ) : topStores.length > 0 ? (
              <FlatList
                data={topStores}
                renderItem={renderPopularStore}
                keyExtractor={(item, index) => item._id || item.id || index.toString()}
                numColumns={3}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.noHistoryText}>No stores available</Text>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Filters</Text>
                <TouchableOpacity onPress={handleApplyFilters}>
                  <Text style={styles.doneButton}>Done</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Category Search */}
                <Text style={styles.filterLabel}>Search Categories</Text>
                <TextInput
                  style={styles.categoryInput}
                  placeholder="Search categories..."
                  placeholderTextColor="#999"
                  value={categorySearch}
                  onChangeText={setCategorySearch}
                />

                {/* Quick Filter */}
                <Text style={styles.filterLabel}>Quick Filter</Text>
                <View style={styles.quickFilters}>
                  <View style={styles.quickFilterContainer}>
                    {['active', 'sold', 'new'].map((filter) => (
                      <TouchableOpacity
                        key={filter}
                        style={[
                          styles.filterChip,
                          activeFilter === filter && styles.activeFilterChip,
                        ]}
                        onPress={() => setActiveFilter(filter)}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            activeFilter === filter && styles.activeFilterChipText,
                          ]}
                        >
                          {filter === 'active' ? 'Active Items' : 
                           filter === 'sold' ? 'Sold Items' : 'New Arrivals'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Price Range */}
                <Text style={styles.filterLabel}>Price Range</Text>
                <View style={styles.priceInputs}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Min"
                    keyboardType="numeric"
                    placeholderTextColor={'#666'}
                    value={minPrice}
                    onChangeText={setMinPrice}
                  />
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Max"
                    keyboardType="numeric"
                    placeholderTextColor={'#666'}
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                  />
                </View>
                <View style={styles.priceRangeContainer}>
                  <Text style={styles.price}>${priceValue}</Text>
                  <Text style={styles.price}>$10,000</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={10000}
                  step={100}
                  value={priceValue}
                  onValueChange={setPriceValue}
                  minimumTrackTintColor="#14BA9C"
                  maximumTrackTintColor="#E4E5E7"
                  thumbTintColor="#14BA9C"
                />

                {/* Categories */}
                <Text style={styles.filterLabel}>Categories</Text>
                <View style={styles.categoriesContainer}>
                  {filteredCategories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        selectedCategories.includes(category) && styles.selectedCategoryChip,
                      ]}
                      onPress={() => toggleCategory(category)}
                    >
                      <Text style={styles.categoryChipText}>{category}</Text>
                      {selectedCategories.includes(category) && (
                        <Ionicons name="close" size={16} color="#007AFF" style={{ marginLeft: 8 }} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={handleResetFilters}
                  >
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={handleApplyFilters}
                  >
                    <Text style={styles.applyButtonText}>APPLY</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
};

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
  searchParent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: '3%',
    marginVertical: '3%',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 12,
    marginRight: 10,
    borderColor: '#356899',
    height: hp(6.3),
  },
  cameraButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    fontSize: hp(2.2),
    fontFamily: 'Nunito-Regular',
    color: '#0D0140'
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
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: '5%',
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: hp(2.4),
    fontFamily: 'Nunito-Bold',
    marginVertical: '4%',
    color: '#0D0D26'
  },
  clearText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.8),
    color: '#356899',
    textDecorationLine: 'underline',
  },
  noHistoryText: {
    color: '#666',
    fontStyle: 'italic',
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.9),
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '4.5%',
    paddingHorizontal: '2%',
    borderBottomWidth: 1,
    borderColor: '#CACBCE'
  },
  recentSearchText: {
    fontFamily: 'Nunito-Regular',
    color: '#95969D',
    fontSize: hp(2.1)
  },
  popularStoreItem: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
    width: (wp(85)) / 3,
    marginVertical: '2%',
    marginHorizontal: '1%',
    borderWidth: 0.5,
    borderColor: '#C4C4C4',
    height: hp(22)
  },
  storeImageContainer: {
    width: '100%',
    height: '60%'
  },
  storeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  storeInfo: {
    width: '100%',
    height: '23%'
  },
  storeName: {
    fontFamily: 'DMSans-SemiBold',
    color: '#130160',
    fontSize: hp(1.8)
  },
  storeLocation: {
    fontFamily: 'DMSans-SemiBold',
    color: '#14BA9C',
    fontSize: hp(1.5)
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: '100%'
  },
  rating: {
    fontSize: hp(1.5),
    fontWeight: "bold",
    color: '#000',
    marginLeft: 2,
  },
  reviews: {
    fontSize: hp(1.4),
    color: "#000"
  },
  heartButton: {
    position: "absolute",
    right: 0,
  },
  // Filter Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: hp(2.3),
    fontFamily: 'Nunito-Bold',
    color: '#000',
  },
  doneButton: {
    fontFamily: 'Nunito-SemiBold',
    color: '#356899',
    fontSize: hp(2)
  },
  filterLabel: {
    fontSize: hp(2),
    fontFamily: 'Nunito-Bold',
    color: '#524B6B',
    marginVertical: '3%'
  },
  categoryInput: {
    height: hp(6.1),
    borderColor: '#AFB0B6',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: hp(2.1),
    fontFamily: 'Nunito-SemiBold',
    color: '#333',
    marginBottom: '4%'
  },
  quickFilters: {
    marginBottom: 15,
  },
  quickFilterContainer: {
    width: '100%',
    height: hp(5),
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: '#f5f5f5'
  },
  filterChip: {
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    width: '33.33%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  activeFilterChip: {
    backgroundColor: '#00BFA5',
  },
  filterChipText: {
    color: '#666',
    fontSize: hp(1.7),
    fontFamily: 'Nunito-SemiBold'
  },
  activeFilterChipText: {
    color: 'white',
  },
  priceInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceInput: {
    width: '48%',
    paddingHorizontal: '3%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    color: '#000',
    height: hp(6)
  },
  priceRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  price: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2),
    color: '#14BA9C'
  },
  slider: {
    width: '100%',
    marginBottom: 15,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedCategoryChip: {
    backgroundColor: '#D9E6F2',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  resetButtonText: {
    color: '#FF6C6C',
    fontSize: 14,
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#001B6E',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SearchScreen;