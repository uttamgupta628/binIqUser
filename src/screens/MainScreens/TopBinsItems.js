import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import CameraIcon from '../../../assets/CameraIcon.svg';
import FilterIcon from '../../../assets/FilterIcon.svg';
import { productsAPI, storesAPI } from '../../api/apiService';

const { width, height } = require('react-native').Dimensions.get('window');

const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const TopBinItemsList = ({ 
  loading, 
  products, 
  favoriteProducts,
  onToggleFavorite,
  onProductPress 
}) => {
  const renderMyFavourites = ({ item }) => {
    const isFavorite = favoriteProducts.includes(item._id || item.id);
    
    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => onProductPress(item)}
      >
        <View style={styles.productCardInner}>
          <Image 
            source={
              item.images && item.images[0]
                ? { uri: item.images[0] }
                : require('../../../assets/gray_img.png')
            } 
            style={styles.productImage} 
          />
          <TouchableOpacity
            style={styles.heartIcon}
            onPress={() => onToggleFavorite(item._id || item.id)}
          >
            <Ionicons 
              name={isFavorite ? 'heart' : 'heart-outline'} 
              size={hp(3)} 
              color={'#EE2525'} 
            />
          </TouchableOpacity>
          <View style={styles.productDescription}>
            <Text style={styles.productDescriptionText} numberOfLines={2}>
              {item.name || item.product_name || 'Product Name'}
            </Text>
          </View>
          <View style={styles.productPriceContainer}>
            <Text style={styles.productDiscountPrice}>
              ${item.price || item.discounted_price || '0'}
            </Text>
            {item.original_price && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.productOriginalPrice}>
                  ${item.original_price}
                </Text>
                <Text style={styles.productDiscount}>
                  {'  '}{item.discount_percentage || '60'}% off
                </Text>
              </View>
            )}
          </View>
          {item.sold && (
            <View style={styles.soldBadge}>
              <Text style={styles.soldText}>SOLD</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={styles.loadingText}>Loading items...</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="pricetag-outline" size={80} color="#ccc" />
        <Text style={styles.emptyText}>No items found</Text>
        <Text style={styles.emptySubtext}>
          No products available at the moment
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={products}
        renderItem={renderMyFavourites}
        keyExtractor={(item, index) => item._id || item.id || index.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const TopBinsItems = () => {
  const navigation = useNavigation();
  
  // State
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSoldItems, setShowSoldItems] = useState(false);

  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProducts();
      fetchFavorites();
    }, [])
  );

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Since there's no dedicated products API, we'll fetch from stores
      // and extract their products, or use the stores themselves as items
      const response = await storesAPI.getAll();
      console.log('Products/Items response:', response);
      
      let productsList = [];
      
      if (response && response.stores) {
        // If stores have products array, extract them
        response.stores.forEach(store => {
          if (store.products && Array.isArray(store.products)) {
            productsList = [...productsList, ...store.products.map(p => ({
              ...p,
              store_name: store.store_name,
              store_id: store._id,
            }))];
          }
        });
        
        // If no products found, use stores as items for display
        if (productsList.length === 0) {
          productsList = response.stores.map(store => ({
            _id: store._id,
            id: store._id,
            name: store.store_name || 'Store Item',
            images: store.store_image ? [store.store_image] : [],
            price: Math.floor(Math.random() * 100) + 20, // Mock price
            original_price: Math.floor(Math.random() * 150) + 100,
            discount_percentage: Math.floor(Math.random() * 50) + 30,
            sold: Math.random() > 0.7,
            category: 'Store Items',
            description: store.description || '',
          }));
        }
      } else if (response && Array.isArray(response)) {
        productsList = response;
      }
      
      // Add sold status if not present
      productsList = productsList.map(product => ({
        ...product,
        sold: product.sold !== undefined ? product.sold : Math.random() > 0.7,
      }));
      
      setAllProducts(productsList);
      filterProducts(productsList, showSoldItems, searchQuery);
    } catch (err) {
      console.error('Error fetching products:', err);
      Alert.alert('Error', 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await storesAPI.getFavorites();
      
      if (response && response.favorites) {
        const favoriteProductIds = response.favorites
          .filter(fav => fav.type === 'product' || fav.product_id)
          .map(fav => fav.product_id || fav._id);
        setFavoriteProducts(favoriteProductIds);
      }
    } catch (err) {
      console.log('Could not fetch favorites:', err);
    }
  };

  const filterProducts = (products, includeSold, query) => {
    let filtered = products;
    
    // Filter by sold status
    if (!includeSold) {
      filtered = filtered.filter(product => !product.sold);
    }
    
    // Filter by search query
    if (query.trim() !== '') {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(product => {
        const name = product.name || product.product_name || '';
        const description = product.description || '';
        const category = product.category || '';
        
        return (
          name.toLowerCase().includes(searchLower) ||
          description.toLowerCase().includes(searchLower) ||
          category.toLowerCase().includes(searchLower)
        );
      });
    }
    
    setFilteredProducts(filtered);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    filterProducts(allProducts, showSoldItems, text);
  };

  const handleToggleSoldItems = () => {
    const newValue = !showSoldItems;
    setShowSoldItems(newValue);
    filterProducts(allProducts, newValue, searchQuery);
  };

  const handleToggleFavorite = async (productId) => {
    try {
      // Toggle favorite on backend
      await storesAPI.favorite(productId);
      
      // Update local state
      setFavoriteProducts(prev => {
        if (prev.includes(productId)) {
          return prev.filter(id => id !== productId);
        } else {
          return [...prev, productId];
        }
      });
    } catch (err) {
      console.error('Error toggling favorite:', err);
      Alert.alert('Error', 'Failed to update favorite');
    }
  };

  const handleProductPress = (product) => {
    navigation.navigate('SinglePageItem', { product });
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
            <Text style={styles.headerText}>Top Bins Items</Text>
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
              placeholder='search for anything' 
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

        {/* Sold Items Toggle */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Show Sold Items</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#56CD54" }}
            thumbColor={"#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleToggleSoldItems}
            value={showSoldItems}
          />
        </View>

        {/* Results Count */}
        {!loading && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found
            </Text>
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Text style={styles.clearText}>Clear search</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Products List */}
        <View style={styles.content}>
          <TopBinItemsList
            loading={loading}
            products={filteredProducts}
            favoriteProducts={favoriteProducts}
            onToggleFavorite={handleToggleFavorite}
            onProductPress={handleProductPress}
          />
        </View>
      </ImageBackground>
    </View>
  );
};

export default TopBinsItems;

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
  // Toggle Container
  toggleContainer: {
    width: '90%',
    alignSelf: 'center',
    height: hp(3),
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: '3%'
  },
  toggleText: {
    fontFamily: 'DMSans-Regular',
    color: '#191D23',
    fontSize: hp(2),
    marginRight: 10,
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
  content: {
    flex: 1,
  },
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
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
  // Product List
  listContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: '2.5%',
  },
  listContent: {
    paddingBottom: 20,
  },
  // Product Card
  productCard: {
    width: wp(47),
    height: hp(26),
    alignItems: 'center',
    marginVertical: '1%',
  },
  productCardInner: {
    width: wp(45),
    height: hp(26),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: wp(45),
    height: hp(13),
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  heartIcon: {
    position: 'absolute',
    right: '2%',
    top: '2%',
    zIndex: 10,
  },
  productDescription: {
    paddingHorizontal: '3%',
    marginTop: 5,
  },
  productDescriptionText: {
    fontFamily: 'Nunito-SemiBold',
    color: '#000',
    fontSize: hp(1.7),
  },
  productPriceContainer: {
    position: 'absolute',
    bottom: '3%',
    paddingHorizontal: '3%',
  },
  productDiscountPrice: {
    fontFamily: 'Nunito-Bold',
    color: '#000',
    fontSize: hp(1.8),
  },
  productOriginalPrice: {
    fontFamily: 'Nunito-Bold',
    color: '#808488',
    fontSize: hp(1.6),
    textDecorationLine: 'line-through',
  },
  productDiscount: {
    color: 'red',
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.6),
  },
  // Sold Badge
  soldBadge: {
    position: 'absolute',
    top: hp(6),
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 5,
    alignItems: 'center',
  },
  soldText: {
    color: '#fff',
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2),
  },
});