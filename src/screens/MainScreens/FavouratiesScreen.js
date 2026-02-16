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
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SearchIcon from '../../../assets/SearchIcon.svg';
import CameraIcon from '../../../assets/CameraIcon.svg';
import FilterIcon from '../../../assets/FilterIcon.svg';
import { storesAPI, productsAPI } from '../../api/apiService';

const { width, height } = Dimensions.get('window');

const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

// Component for the My Items (Favorite Products) tab
const TopBinItemsList = ({ loading, favoriteItems, onRemoveFavorite }) => {
  const renderMyFavourites = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemCardInner}>
        <Image
          source={
            item.product_image || item.images?.[0]
              ? { uri: item.product_image || item.images[0] }
              : require('../../../assets/gray_img.png')
          }
          style={styles.itemImage}
        />
        <TouchableOpacity
          style={styles.heartIconAbsolute}
          onPress={() => onRemoveFavorite(item._id || item.id, 'product')}
        >
          <Ionicons name="heart" size={hp(3)} color={'#EE2525'} />
        </TouchableOpacity>
        <View style={styles.itemDescription}>
          <Text style={styles.itemDescriptionText} numberOfLines={2}>
            {item.name || item.product_name || 'Product Name'}
          </Text>
        </View>
        <View style={styles.itemPriceContainer}>
          <Text style={styles.itemDiscountPrice}>
            ${item.price || item.discounted_price || '0'}
          </Text>
          {item.original_price && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.itemOriginalPrice}>
                ${item.original_price}
              </Text>
              <Text style={styles.itemDiscount}>
                {' '}{item.discount_percentage || '60'}% off
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  if (!favoriteItems || favoriteItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={60} color="#ccc" />
        <Text style={styles.emptyText}>No favorite items yet</Text>
        <Text style={styles.emptySubtext}>
          Start adding items to your favorites!
        </Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.searchParent}>
        <Pressable style={styles.searchContainer}>
          <View style={styles.cameraButton}>
            <SearchIcon />
          </View>
          <Text style={styles.input}>search for anything</Text>
          <View style={styles.searchButton}>
            <CameraIcon />
          </View>
        </Pressable>
        <TouchableOpacity style={styles.menuButton}>
          <FilterIcon />
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>FAV. ITEMS</Text>
      <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
        <FlatList
          data={favoriteItems}
          renderItem={renderMyFavourites}
          keyExtractor={(item, index) => item._id || item.id || index.toString()}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </>
  );
};

// Component for the Locations (Favorite Stores) tab
const MyItemsScreen = ({ loading, favoriteStores, onRemoveFavorite }) => {
  const renderItem = ({ item }) => (
    <View style={styles.storeCard}>
      <Image
        source={
          item.store_image || item.image
            ? { uri: item.store_image || item.image }
            : require('../../../assets/flip_find.png')
        }
        style={styles.storeImage}
      />
      <TouchableOpacity
        style={styles.heartIconAbsoluteStore}
        onPress={() => onRemoveFavorite(item._id || item.id, 'store')}
      >
        <Ionicons name="heart" size={hp(3)} color={'#EE2525'} />
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
            {item.distance || '3.4KM'}
          </Text>
        </View>
        <View style={styles.ratingBadge}>
          <FontAwesome name="star" size={8} color={'#fff'} />
          <Text style={styles.ratingText}>
            {item.rating || item.review || '4.2'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  if (!favoriteStores || favoriteStores.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="location-outline" size={60} color="#ccc" />
        <Text style={styles.emptyText}>No favorite locations yet</Text>
        <Text style={styles.emptySubtext}>
          Start adding stores to your favorites!
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, width: '100%' }}>
      <View style={styles.searchParent}>
        <Pressable style={styles.searchContainer}>
          <View style={styles.cameraButton}>
            <SearchIcon />
          </View>
          <Text style={styles.input}>search for anything</Text>
          <View style={styles.searchButton}>
            <CameraIcon />
          </View>
        </Pressable>
        <TouchableOpacity style={styles.menuButton}>
          <FilterIcon />
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>FAV. BINS</Text>
      <View style={{ width: '100%', alignItems: 'center' }}>
        <FlatList
          data={favoriteStores}
          renderItem={renderItem}
          keyExtractor={(item, index) => item._id || item.id || index.toString()}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </View>
  );
};

const FavouritesScreen = () => {
  const [activeTab, setActiveTab] = useState('scan');
  const navigation = useNavigation();
  
  // State
  const [loading, setLoading] = useState(true);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [favoriteStores, setFavoriteStores] = useState([]);

  // Fetch favorites when screen comes into focus or tab changes
  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [activeTab])
  );

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'scan') {
        // Fetch favorite products/items
        console.log('Fetching favorite items...');
        const response = await storesAPI.getFavorites();
        console.log('Favorite items response:', response);
        
        if (response && response.favorites) {
          // Filter for products only
          const products = response.favorites.filter(
            item => item.type === 'product' || item.product_id || item.product_name
          );
          setFavoriteItems(products);
        } else if (response && Array.isArray(response)) {
          setFavoriteItems(response);
        } else {
          setFavoriteItems([]);
        }
      } else {
        // Fetch favorite stores
        console.log('Fetching favorite stores...');
        const response = await storesAPI.getFavorites();
        console.log('Favorite stores response:', response);
        
        if (response && response.favorites) {
          // Filter for stores only
          const stores = response.favorites.filter(
            item => item.type === 'store' || item.store_id || item.store_name
          );
          setFavoriteStores(stores);
        } else if (response && Array.isArray(response)) {
          setFavoriteStores(response);
        } else {
          setFavoriteStores([]);
        }
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
      // Don't show alert on initial load, just log the error
      if (favoriteItems.length > 0 || favoriteStores.length > 0) {
        Alert.alert('Error', 'Failed to refresh favorites');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (itemId, type) => {
    try {
      console.log(`Removing ${type} from favorites:`, itemId);
      
      // Show confirmation
      Alert.alert(
        'Remove Favorite',
        `Are you sure you want to remove this ${type} from favorites?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                // Call API to unfavorite
                await storesAPI.favorite(itemId);
                
                // Update local state immediately
                if (type === 'product') {
                  setFavoriteItems(prev => prev.filter(item => (item._id || item.id) !== itemId));
                } else {
                  setFavoriteStores(prev => prev.filter(item => (item._id || item.id) !== itemId));
                }
                
                Alert.alert('Success', 'Removed from favorites');
              } catch (err) {
                console.error('Error removing favorite:', err);
                Alert.alert('Error', 'Failed to remove from favorites');
              }
            }
          }
        ]
      );
    } catch (err) {
      console.error('Error in handleRemoveFavorite:', err);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}
        resizeMode="stretch"
      >
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons
                name="arrow-back-ios"
                color={'#0D0D26'}
                size={25}
              />
            </Pressable>
            <Text style={styles.headerText}>My Items & My Locations</Text>
          </View>
        </View>

        {/* Tab navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'scan' && styles.activeTab]}
            onPress={() => setActiveTab('scan')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'scan' && styles.activeTabText,
              ]}
            >
              My Items
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'items' && styles.activeTab]}
            onPress={() => setActiveTab('items')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'items' && styles.activeTabText,
              ]}
            >
              Location
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content for the active tab */}
        <View style={styles.content}>
          {activeTab === 'scan' ? (
            <TopBinItemsList
              loading={loading}
              favoriteItems={favoriteItems}
              onRemoveFavorite={handleRemoveFavorite}
            />
          ) : (
            <MyItemsScreen
              loading={loading}
              favoriteStores={favoriteStores}
              onRemoveFavorite={handleRemoveFavorite}
            />
          )}
          <View style={styles.enrollNowContainer}>
            <Pressable
              style={styles.button}
              onPress={() => navigation.navigate('HomeNavigator')}
            >
              <Text style={styles.buttonText}>ADD TO LIBRARY</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default FavouritesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F3F5',
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
    fontSize: hp(2.5),
    color: '#0D0140',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: '5%',
    width: wp(100),
    height: hp(6),
    paddingHorizontal: '5%',
  },
  tab: {
    width: wp(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#99ABC62E',
  },
  activeTab: {
    backgroundColor: '#2CCCA6',
  },
  tabText: {
    fontSize: hp(2.2),
    fontFamily: 'Nunito-SemiBold',
    color: '#000',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.3),
    color: '#000000',
    marginVertical: '2%',
    marginHorizontal: '5.5%',
  },
  vector: {
    flex: 1,
    width: wp(100),
  },
  // Loading & Empty States
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
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
  },
  // Item Card Styles
  itemCard: {
    width: wp(47),
    height: hp(26),
    alignItems: 'center',
    marginVertical: '1%',
  },
  itemCardInner: {
    width: wp(45),
    height: hp(26),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    backgroundColor: '#fff',
  },
  itemImage: {
    width: wp(45),
    height: hp(13),
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  heartIconAbsolute: {
    position: 'absolute',
    right: '2%',
    top: '2%',
    zIndex: 10,
  },
  itemDescription: {
    paddingHorizontal: '3%',
    marginTop: 5,
  },
  itemDescriptionText: {
    fontFamily: 'Nunito-SemiBold',
    color: '#000',
    fontSize: hp(1.7),
  },
  itemPriceContainer: {
    position: 'absolute',
    bottom: '3%',
    paddingHorizontal: '3%',
  },
  itemDiscountPrice: {
    fontFamily: 'Nunito-Bold',
    color: '#000',
    fontSize: hp(1.8),
  },
  itemOriginalPrice: {
    fontFamily: 'Nunito-Bold',
    color: '#808488',
    fontSize: hp(1.6),
    textDecorationLine: 'line-through',
  },
  itemDiscount: {
    color: 'red',
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.6),
  },
  // Store Card Styles
  storeCard: {
    width: wp(43.6),
    height: hp(23),
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#e6e6e6',
    backgroundColor: '#fff',
    marginHorizontal: '1%',
    marginVertical: '3%',
  },
  storeImage: {
    width: wp(43.6),
    height: hp(13),
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  heartIconAbsoluteStore: {
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
  },
  storeDistance: {
    fontFamily: 'Nunito-SemiBold',
    color: '#14BA9C',
    fontSize: hp(1.5),
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
  // Search Bar
  searchParent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: '3%',
    marginBottom: '4%',
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
  cameraButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    fontSize: hp(2.2),
    fontFamily: 'Nunito-Regular',
    color: '#999',
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
    alignItems: 'center',
  },
  // Bottom Button
  enrollNowContainer: {
    width: wp(85),
    height: hp(13),
    alignSelf: 'center',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: '8%',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#1a237e',
    width: '77%',
    height: hp(5),
    borderRadius: 10,
    justifyContent: 'center',
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: hp(1.9),
    fontFamily: 'Nunito-Bold',
    textAlign: 'center',
  },
});