import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
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
  Share,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Heart_Icon from '../../../assets/heart_icon.svg';
import Share_Icon from '../../../assets/share_icon.svg';

// Import API services
import { productsAPI, storesAPI } from '../../api/apiService';

const {width} = Dimensions.get('window');

const SingleItemPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get productId from navigation params
  const { productId } = route.params || {};
  
  // State
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
      fetchSimilarItems();
    } else {
      Alert.alert('Error', 'No product ID provided');
      navigation.goBack();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getById(productId);
      
      console.log('Product Details Response:', response);
      
      if (response) {
        setProduct(response);
        // Check if product is in favorites
        // setIsFavorite(response.isFavorited || false);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarItems = async () => {
    try {
      // Fetch products from same category or all products
      const response = await productsAPI.getAll();
      
      console.log('Similar Items Response:', response);
      
      if (Array.isArray(response)) {
        // Filter out current product and limit to 4-6 items
        const filtered = response
          .filter(item => item._id !== productId)
          .slice(0, 6);
        setSimilarItems(filtered);
      }
    } catch (error) {
      console.error('Error fetching similar items:', error);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      // Call your favorite API endpoint
      // const response = await productsAPI.toggleFavorite(productId);
      
      setIsFavorite(!isFavorite);
      Alert.alert('Success', isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this item: ${product?.title || 'Product'}\nPrice: $${product?.price || '0'}`,
        title: product?.title || 'Product',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAddToLibrary = () => {
    Alert.alert('Success', 'Added to your library');
  };

  const renderStars = (rating = 4.5) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`full-${i}`} name="star" size={18} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={18} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={18} color="#FFD700" />
      );
    }

    return stars;
  };

  const calculateDiscount = (originalPrice, discountedPrice) => {
    if (!originalPrice || !discountedPrice) return '0';
    const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
    return Math.round(discount);
  };

  const renderSimilarItem = ({item}) => {
    const discount = calculateDiscount(item.original_price, item.price);
    
    return (
      <Pressable
        style={{width: wp(45), height: hp(26), alignItems: 'center', marginVertical: '1%'}}
        onPress={() => {
          // Navigate to this product's detail page
          navigation.push('SingleItemPage', { productId: item._id });
        }}>
        <View
          style={{
            width: wp(43),
            height: hp(26),
            borderRadius: 5,
            borderWidth: 1,
            borderColor: '#e6e6e6',
            backgroundColor: '#fff',
          }}>
          <Image
            source={
              item.product_image 
                ? { uri: item.product_image }
                : require('../../../assets/gray_img.png')
            }
            style={{width: wp(43), height: hp(13), borderRadius: 5}}
          />
          <Pressable
            onPress={() => handleToggleFavorite()}
            style={{position: 'absolute', right: '2%', top: '2%'}}>
            <Ionicons
              name="heart"
              size={hp(3)}
              color={'#EE2525'}
            />
          </Pressable>
          <View style={{paddingHorizontal: '1%'}}>
            <Text
              numberOfLines={2}
              style={{
                fontFamily: 'Nunito-SemiBold',
                color: '#000',
                fontSize: hp(1.7),
                margin: '0.5%',
              }}>
              {item.title || item.description || 'Product'}
            </Text>
          </View>
          <View
            style={{position: 'absolute', bottom: '2%', paddingHorizontal: '3%'}}>
            <View>
              <Text
                style={{
                  fontFamily: 'Nunito-Bold',
                  color: '#000',
                  fontSize: hp(1.8),
                }}>
                ${item.price || '0'}
              </Text>
              {item.original_price && item.original_price > item.price && (
                <Text style={{color: 'red'}}>
                  <Text
                    style={{
                      fontFamily: 'Nunito-Bold',
                      color: '#808488',
                      fontSize: hp(1.8),
                      textDecorationLine: 'line-through',
                    }}>
                    ${item.original_price}
                  </Text>
                  {'  '}
                  {discount}% off
                </Text>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E6F3F5' }}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={{ marginTop: 10, fontFamily: 'Nunito-Regular', color: '#000' }}>
          Loading product...
        </Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E6F3F5' }}>
        <Text style={{ fontFamily: 'Nunito-Regular', color: '#000' }}>
          Product not found
        </Text>
        <TouchableOpacity 
          style={{ marginTop: 20, padding: 10, backgroundColor: '#130160', borderRadius: 8 }}
          onPress={() => navigation.goBack()}>
          <Text style={{ color: '#fff', fontFamily: 'Nunito-SemiBold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const discount = calculateDiscount(product.original_price, product.price);
  const rating = product.rating || 4.5;
  const reviewCount = product.review_count || 56890;

  return (
    <ScrollView style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}
        resizeMode="stretch">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color={'#0D0D26'} size={25} />
            </Pressable>
            <Text style={styles.headerText}>Item</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '23%',
            }}>
            <Pressable onPress={handleToggleFavorite}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={hp(3.5)} 
                color={isFavorite ? "#EE2525" : "#0D0D26"} 
              />
            </Pressable>
            <Pressable onPress={handleShare}>
              <Share_Icon height={hp(4)} />
            </Pressable>
          </View>
        </View>

        {/* Product Image */}
        <View
          style={{
            width: '90%',
            height: hp(27),
            marginHorizontal: '5%',
            borderRadius: 10,
            marginVertical: '5%',
          }}>
          <Image
            source={
              product.product_image 
                ? { uri: product.product_image }
                : require('../../../assets/specific_item.png')
            }
            style={{width: '100%', height: '100%', borderRadius: 10}}
            resizeMode="cover"
          />
        </View>

        <View style={{paddingHorizontal: '5%'}}>
          {/* Rating */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}>
            <View style={styles.ratingContainer}>
              {renderStars(rating)}
              <Text style={styles.ratingText}>{reviewCount.toLocaleString()}</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            {product.original_price && product.original_price > product.price && (
              <Text style={styles.originalPrice}>${product.original_price}</Text>
            )}
            <Text style={styles.discountedPrice}>${product.price || '0'}</Text>
            {discount > 0 && (
              <Text style={styles.discount}>{discount}% Off</Text>
            )}
          </View>

          {/* Product Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>
              {product.title || 'Product Title'}
            </Text>
            
            <View style={{marginVertical: '1%'}}>
              <Text style={styles.detailsTitle}>Item Details</Text>
              <Text style={styles.detailsText}>
                {product.description || 'No description available'}
              </Text>
            </View>

            <View style={{marginVertical: '1%'}}>
              {product.category_id && (
                <Text
                  style={{
                    fontFamily: 'Nunito-Bold',
                    fontSize: hp(2),
                    color: '#000',
                    marginBottom: 4,
                  }}>
                  Category:{' '}
                  <Text
                    style={{
                      fontFamily: 'Nunito-SemiBold',
                      fontSize: hp(1.9),
                      color: '#666',
                    }}>
                    {product.category_id.category_name || 'N/A'}
                  </Text>
                </Text>
              )}
              
              {product.upc_id && (
                <Text
                  style={{
                    fontFamily: 'Nunito-Bold',
                    fontSize: hp(2),
                    color: '#000',
                    marginBottom: 4,
                  }}>
                  UPC #:{' '}
                  <Text
                    style={{
                      fontFamily: 'Nunito-SemiBold',
                      fontSize: hp(1.7),
                      color: '#666',
                    }}>
                    {product.upc_id}
                  </Text>
                </Text>
              )}

              {product.tags && product.tags.length > 0 && (
                <Text
                  style={{
                    fontFamily: 'Nunito-Bold',
                    fontSize: hp(2),
                    color: '#000',
                    marginTop: 8,
                  }}>
                  Tags:{' '}
                  <Text
                    style={{
                      fontFamily: 'Nunito-SemiBold',
                      fontSize: hp(1.7),
                      color: '#666',
                    }}>
                    {product.tags.join(', ')}
                  </Text>
                </Text>
              )}

              {product.status && (
                <View style={{
                  alignSelf: 'flex-start',
                  backgroundColor: product.status === 'active' ? '#e0f2f1' : '#ffebee',
                  borderRadius: 16,
                  paddingVertical: 4,
                  paddingHorizontal: 12,
                  marginTop: 8,
                }}>
                  <Text style={{
                    fontFamily: 'Nunito-SemiBold',
                    fontSize: 12,
                    color: product.status === 'active' ? '#00897b' : '#c62828',
                    textTransform: 'capitalize',
                  }}>
                    {product.status}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={handleToggleFavorite}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={18} 
                color="#000" 
              />
              <Text style={styles.buttonText}>
                {isFavorite ? 'Favorited' : 'My Fav'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.button}
              onPress={handleAddToLibrary}>
              <Text style={styles.buttonText}>Add library</Text>
            </TouchableOpacity>
          </View>

          {/* Similar Items */}
          <View style={{marginVertical: '3%'}}>
            <Text
              style={{
                fontFamily: 'Nunito-Bold',
                fontSize: hp(2.3),
                color: '#000000',
                marginVertical: '5%',
              }}>
              SIMILAR ITEMS ({similarItems.length})
            </Text>
            {similarItems.length > 0 ? (
              <View style={{flex: 1, width: '100%', alignItems: 'center'}}>
                <FlatList
                  data={similarItems}
                  renderItem={renderSimilarItem}
                  keyExtractor={item => item._id?.toString()}
                  numColumns={2}
                />
              </View>
            ) : (
              <Text style={{
                fontFamily: 'Nunito-Regular',
                color: '#666',
                textAlign: 'center',
                marginVertical: 20,
              }}>
                No similar items found
              </Text>
            )}
          </View>
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: wp(100),
    height: hp(100),
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
    justifyContent: 'space-between',
  },
  headerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(3),
    textAlign: 'left',
    color: '#0D0140',
  },
  vector: {
    flex: 1,
    width: wp(100),
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.5),
    marginBottom: 8,
    color: 'black',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontFamily: 'Nunito-Regular',
    marginLeft: 8,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '1%',
    marginTop: '3.5%',
  },
  originalPrice: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    textDecorationLine: 'line-through',
    color: '#666',
    marginRight: 8,
  },
  discountedPrice: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: '#000',
    marginRight: 8,
  },
  discount: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: '#e63946',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 4,
    flex: 1,
    marginHorizontal: '2%',
    elevation: 2,
    height: hp(7),
    marginVertical: '5%',
  },
  buttonText: {
    fontFamily: 'Nunito-SemiBold',
    marginLeft: 4,
    color: '#000',
  },
  detailsContainer: {
    marginVertical: '6%',
  },
  detailsTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.2),
    color: '#000',
    marginBottom: 4,
  },
  detailsText: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.8),
    color: '#666',
    lineHeight: hp(2.5),
  },
});

export default SingleItemPage;