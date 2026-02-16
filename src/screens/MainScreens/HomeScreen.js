import {
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  FlatList,
  Pressable,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BinIQIcon from '../../../assets/BinIQIcon.svg';
import GetButton from '../../../assets/GetButton.svg';
import Notification from '../../../assets/Notification.svg';
import CameraIcon from '../../../assets/CameraIcon.svg';
import SearchIcon from '../../../assets/SearchIcon.svg';
import SettingsIcon from '../../../assets/SettingsIcon.svg';
import Dashboard from './Dashboard';
import Dashboard2 from './Dashboard2';
import Dashboard3 from './Dashboard3';

// Import API services
import { storesAPI, productsAPI, userAPI } from '../../api/apiService';

const {width, height} = Dimensions.get('window');

const HomeScreen = ({openDrawer}) => {
  const navigation = useNavigation();
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // State for backend data
  const [nearbyStores, setNearbyStores] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [favoriteStores, setFavoriteStores] = useState([]);

  // Fetch data from backend
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUserProfile(),
        fetchNearbyStores(),
        fetchTrendingProducts(),
        fetchFavoriteStores(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      console.log('User Profile Response:', response);
      setUserProfile(response);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchNearbyStores = async () => {
    try {
      const response = await storesAPI.getAll();
      
      console.log('🏪 Nearby Stores Response Type:', typeof response);
      console.log('🏪 Is Array?:', Array.isArray(response));
      console.log('🏪 Response:', response);
      
      let stores = [];
      
      if (Array.isArray(response)) {
        stores = response;
      } else if (response?.stores && Array.isArray(response.stores)) {
        stores = response.stores;
      } else if (response?.data && Array.isArray(response.data)) {
        stores = response.data;
      }
      
      console.log('✅ Setting', stores.length, 'nearby stores');
      setNearbyStores(stores);
    } catch (error) {
      console.error('❌ Error fetching nearby stores:', error);
      setNearbyStores([]);
    }
  };

  const fetchTrendingProducts = async () => {
    try {
      const response = await productsAPI.getTrending();
      
      console.log('📦 Trending Products Response Type:', typeof response);
      console.log('📦 Is Array?:', Array.isArray(response));
      console.log('📦 Response:', response);
      
      if (Array.isArray(response)) {
        console.log('✅ Setting', response.length, 'trending products');
        setTrendingProducts(response);
      } else {
        console.log('⚠️ Response is not an array');
        setTrendingProducts([]);
      }
    } catch (error) {
      console.error('❌ Error fetching trending products:', error);
      setTrendingProducts([]);
    }
  };

  const fetchFavoriteStores = async () => {
    try {
      const response = await storesAPI.getFavorites();
      
      console.log('❤️ Favorites Response Type:', typeof response);
      console.log('❤️ Is Array?:', Array.isArray(response));
      console.log('❤️ Response:', response);
      
      if (Array.isArray(response)) {
        console.log('✅ Setting', response.length, 'favorite stores');
        setFavoriteStores(response);
      } else {
        console.log('⚠️ Response is not an array');
        setFavoriteStores([]);
      }
    } catch (error) {
      console.error('❌ Error fetching favorites:', error);
      setFavoriteStores([]);
    }
  };

  const handleToggleFavorite = async (storeId) => {
    try {
      const response = await storesAPI.favorite(storeId);
      console.log('Toggle favorite response:', response);
      await fetchFavoriteStores();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleToggleLike = async (storeId) => {
    try {
      const response = await storesAPI.like(storeId);
      console.log('Toggle like response:', response);
      await fetchNearbyStores();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const carouselImages = [
    {
      id: 1,
      isMap: true,
      styles: {width: wp(100), height: hp(100)},
    },
    {
      id: 2,
      isDashboard: true,
      styles: {width: wp(90), height: hp(43)},
    },
    {
      id: 3,
      image: require('../../../assets/slider_1.png'),
      styles: {width: wp(90), height: hp(53)},
    },
  ];

  const renderCarouselItem = ({item, index}) => {
    if (item.isMap) {
      return (
        <View style={{width: wp(90), height: '100%', overflow: 'hidden', alignSelf: 'center'}}>
          <Dashboard2 />
        </View>
      );
    }
    if (item.isDashboard) {
      return (
        <View style={{width: wp(90), height: '100%', overflow: 'hidden', alignSelf: 'center'}}>
          <Dashboard userProfile={userProfile} />
        </View>
      );
    }
    return (
      <View style={{width: wp(90), height: '100%', overflow: 'hidden', alignSelf: 'center'}}>
        <Dashboard3 />
      </View>
    );
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat2 || !lon2) return 'N/A';
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  const renderItem = ({item}) => {
    const distance = calculateDistance(37.78825, -122.4324, item.user_latitude, item.user_longitude);
    const avgRating = item.comments && item.comments.length > 0
      ? (item.comments.reduce((sum, c) => sum + (c.rating || 0), 0) / item.comments.length).toFixed(1)
      : '4.2';

    return (
      <Pressable
        style={{width: wp(50), height: hp(23), marginVertical: '7%'}}
        onPress={() => navigation.navigate('TopBinsNearMe', { storeId: item._id })}>
        <View style={{width: wp(47), height: hp(21.5), borderRadius: 10, elevation: 2, backgroundColor: '#fff'}}>
          <Image
            source={require('../../../assets/flip_find.png')}
            style={{width: wp(47), height: hp(12), borderRadius: 10}}
          />
          <Pressable
            onPress={() => handleToggleLike(item._id)}
            style={{position: 'absolute', right: '2%', top: '2%'}}>
            <Ionicons
              name={item.liked_by && item.liked_by.includes(userProfile?._id) ? "heart" : "heart-outline"}
              size={hp(3)}
              color={'#EE2525'}
            />
          </Pressable>
          <View style={{margin: '5%', flexDirection: 'row', justifyContent: 'space-between'}}>
            <View>
              <Text style={{fontFamily: 'Nunito-SemiBold', color: '#0049AF', fontSize: hp(2)}}>
                {item.store_name || 'Store'}
              </Text>
              <Text style={{fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(1.6)}}>
                {item.address || 'Location'}
              </Text>
              <Text style={{fontFamily: 'Nunito-SemiBold', color: '#14BA9C', fontSize: hp(1.4)}}>
                {distance}KM
              </Text>
            </View>
            <View style={{backgroundColor: '#FFBB36', height: hp(2.3), width: wp(11), flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: '1.4%', borderRadius: 4}}>
              <FontAwesome name="star" size={12} color={'#fff'} />
              <Text style={{color: '#fff', fontFamily: 'Nunito-Regular', fontSize: hp(1.6)}}>
                {avgRating}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderProductsItem = ({item}) => (
    <Pressable
      style={{width: wp(51), height: hp(23), marginVertical: '5%'}}
      onPress={() => navigation.navigate('TopBinItems', { productId: item._id })}>
      <View style={{width: wp(47), height: hp(21), borderRadius: 10, elevation: 2, backgroundColor: '#fff', paddingLeft: '1%'}}>
        <Image 
          source={require('../../../assets/colgate.png')} 
          style={{width: wp(46), height: hp(12)}} 
        />
        <Ionicons
          name="heart"
          size={hp(3)}
          color={'#EE2525'}
          style={{position: 'absolute', right: '2%', top: '2%'}}
        />
        <View style={{margin: '3%', flexDirection: 'row', justifyContent: 'space-between'}}>
          <View>
            <Text style={{fontFamily: 'Nunito-SemiBold', color: '#0049AF', fontSize: hp(1.6)}}>
              {item.title || item.store_name || 'Product'}
            </Text>
            <Text style={{fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(1.3)}}>
              {item.description || item.address || 'Description'}
            </Text>
            <Text style={{fontFamily: 'Nunito-Bold', color: '#000', fontSize: hp(1.5)}}>
              ${item.price || '0'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const renderMyFavourites = ({item}) => (
    <Pressable style={{width: wp(45), height: hp(26)}}>
      <View style={{width: wp(42), height: hp(25), borderRadius: 5, elevation: 2, backgroundColor: '#fff'}}>
        <Image
          source={require('../../../assets/gray_img.png')}
          style={{width: wp(42), height: hp(13), borderRadius: 5}}
        />
        <Pressable
          onPress={() => handleToggleFavorite(item._id)}
          style={{position: 'absolute', right: '2%', top: '2%'}}>
          <Ionicons name="heart" size={hp(3)} color={'#EE2525'} />
        </Pressable>
        <View style={{paddingHorizontal: '2.5%'}}>
          <Text style={{fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(1.5), margin: '0.5%'}}>
            {item.store_name || item.description}
          </Text>
        </View>
        <View style={{position: 'absolute', bottom: '2%', paddingHorizontal: '3%'}}>
          <View>
            <Text style={{fontFamily: 'Nunito-Bold', color: '#000', fontSize: hp(1.8)}}>
              Featured Store
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const pagination = () => {
    return (
      <Pagination
        dotsLength={carouselImages.length}
        activeDotIndex={activeSlide}
        containerStyle={styles.paginationContainer}
        dotStyle={styles.paginationDot}
        inactiveDotStyle={styles.paginationInactiveDot}
        inactiveDotOpacity={0.3}
        inactiveDotScale={0.7}
      />
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={{ marginTop: 10, fontFamily: 'Nunito-Regular', color: '#000' }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{flex: 1, backgroundColor: '#fff'}}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ImageBackground source={require('../../../assets/vector_1.png')} style={styles.vector}>
        <View style={{marginTop: '6%'}}>
          <View style={{width: wp(90), height: hp(5), alignSelf: 'center', marginVertical: '4%', flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{width: '28%', height: '100%', justifyContent: 'center', alignItems: 'flex-start'}}>
              <BinIQIcon />
            </View>
            <View style={{width: '45%', height: '100%', flexDirection: 'row', alignItems: 'center', paddingRight: '4%'}}>
              <Pressable onPress={() => navigation.navigate('ReferFriend')}>
                <GetButton height={hp(3.5)} />
              </Pressable>
              <Pressable
                style={{width: '23%', height: '100%', justifyContent: 'center', alignItems: 'flex-end', paddingRight: '2%'}}
                onPress={() => navigation.navigate('Notifications')}>
                <Notification height={hp(10)} />
              </Pressable>
            </View>
          </View>
          <View style={styles.container}>
            <Pressable style={styles.searchContainer} onPress={() => navigation.navigate('SearchScreen')}>
              <View style={styles.cameraButton}><CameraIcon /></View>
              <Text style={styles.input}>search for anything</Text>
              <View style={styles.searchButton}><SearchIcon /></View>
            </Pressable>
            <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
              <SettingsIcon />
            </TouchableOpacity>
          </View>
        </View>
        <Carousel
          data={carouselImages}
          renderItem={renderCarouselItem}
          sliderWidth={width}
          itemWidth={width}
          layout={'default'}
          loop={true}
          onSnapToItem={index => setActiveSlide(index)}
        />
        {pagination()}
      </ImageBackground>

      {/* TOP BINS NEAR ME */}
      <View style={{flex: 1, width: '100%', minHeight: hp(35), marginTop: '4%'}}>
        <View style={{marginTop: '7%', paddingHorizontal: '5%'}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginVertical: '2.5%'}}>
            <Text style={{fontFamily: 'Nunito-Bold', fontSize: hp(2.3), color: '#000000'}}>
              Bin Stores Near Me ({nearbyStores.length})
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('TopBinsNearMe')}>
              <Text style={{color: '#524B6B', fontSize: hp(1.9), textDecorationLine: 'underline'}}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={nearbyStores}
            renderItem={renderItem}
            keyExtractor={item => item._id?.toString()}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={{ fontFamily: 'Nunito-Regular', color: '#666', padding: 20 }}>
                No stores found nearby
              </Text>
            }
          />
        </View>
      </View>

      {/* PRODUCTS */}
      <View style={{flex: 1, width: '100%', minHeight: hp(30)}}>
        <View style={{marginVertical: '0%', paddingHorizontal: '5%'}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginVertical: '2.5%'}}>
            <Text style={{fontFamily: 'Nunito-Bold', fontSize: hp(2.3), color: '#000000'}}>
              TOP BIN ITEMS ({trendingProducts.length})
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('TopBinItems')}>
              <Text style={{color: '#524B6B', fontSize: hp(1.9), textDecorationLine: 'underline'}}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={trendingProducts}
            renderItem={renderProductsItem}
            keyExtractor={item => item._id?.toString()}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={{ fontFamily: 'Nunito-Regular', color: '#666', padding: 20 }}>
                No trending products
              </Text>
            }
          />
        </View>
      </View>

      {/* MY FAVOURITES */}
      <View style={{flex: 1, width: '100%', minHeight: hp(35)}}>
        <View style={{marginVertical: '0%', paddingHorizontal: '3%'}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginVertical: '2.5%'}}>
            <Text style={{fontFamily: 'Nunito-Bold', fontSize: hp(2.3), color: '#000000'}}>
              MY FAVORITES ({favoriteStores.length})
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('FavouritesScreen')}>
              <Text style={{color: '#524B6B', fontSize: hp(1.9), textDecorationLine: 'underline'}}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{marginVertical: '3%'}}>
            <FlatList
              data={favoriteStores}
              renderItem={renderMyFavourites}
              keyExtractor={item => item._id?.toString()}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text style={{ fontFamily: 'Nunito-Regular', color: '#666', padding: 20 }}>
                  No favorites yet
                </Text>
              }
            />
          </View>
        </View>
      </View>

      {/* RESELLER IQ PORTAL */}
      <View style={{flex: 1, width: '100%', height: hp(42)}}>
        <View style={{marginVertical: '0%', paddingHorizontal: '3%'}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginVertical: '2.5%'}}>
            <Text style={{fontFamily: 'Nunito-Bold', fontSize: hp(2.3), color: '#000000'}}>
              RESELLER IQ PORTAL
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('IQPortal')}>
              <Text style={{color: '#524B6B', fontSize: hp(1.9), textDecorationLine: 'underline'}}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{marginVertical: '4%', flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
            <TouchableOpacity style={{width: wp(45), height: hp(24)}}>
              <Pressable style={{width: wp(45), height: hp(22), borderRadius: 5, elevation: 2, backgroundColor: '#fff', paddingLeft: '1%'}}>
                <Image source={require('../../../assets/reseller_training.png')} style={{width: wp(45), height: hp(11), borderRadius: 5}} />
                <View style={{margin: '3%', flexDirection: 'row', justifyContent: 'space-between'}}>
                  <View>
                    <Text style={{fontFamily: 'Nunito-ExtraBold', color: '#0049AF', fontSize: hp(1.7)}}>
                      How to start a Bin Store
                    </Text>
                    <Text style={{fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(2.2), marginVertical: '1%'}}>
                      Bin Store
                    </Text>
                    <Text style={{fontFamily: 'Nunito-SemiBold', color: '#14BA9C', fontSize: hp(1.5), marginTop: '5%'}}>
                      Full Video • With PDF
                    </Text>
                  </View>
                </View>
              </Pressable>
            </TouchableOpacity>
            <TouchableOpacity style={{width: wp(45), height: hp(24)}} onPress={() => navigation.navigate('IQPortal')}>
              <Pressable style={{width: wp(45), height: hp(22), borderRadius: 5, elevation: 2, backgroundColor: '#fff', paddingLeft: '1%'}}>
                <Image source={require('../../../assets/reseller_training.png')} style={{width: wp(45), height: hp(11), borderRadius: 5}} />
                <View style={{margin: '3%', flexDirection: 'row', justifyContent: 'space-between'}}>
                  <View>
                    <Text style={{fontFamily: 'Nunito-ExtraBold', color: '#0049AF', fontSize: hp(1.7)}}>
                      How to start a Bin Store
                    </Text>
                    <Text style={{fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(2.2), marginVertical: '1%'}}>
                      Reseller Training
                    </Text>
                    <Text style={{fontFamily: 'Nunito-SemiBold', color: '#14BA9C', fontSize: hp(1.5), marginTop: '5%'}}>
                      Full Video • With PDF
                    </Text>
                  </View>
                </View>
              </Pressable>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  vector: { flex: 1, width: wp(100), height: hp(78) },
  container: { flexDirection: 'row', alignItems: 'center', marginHorizontal: '3%' },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, marginRight: 10, borderColor: '#99ABC678', height: hp(6) },
  cameraButton: { padding: 10 },
  input: { flex: 1, fontSize: hp(2.2), fontFamily: 'Nunito-Regular', paddingVertical: 8, color: '#999' },
  searchButton: { padding: 10 },
  menuButton: { backgroundColor: '#130160', padding: 10, borderRadius: 12, height: hp(6), width: wp(14), justifyContent: 'center', alignItems: 'center' },
  paginationContainer: { position: 'absolute', left: '43%', bottom: '-8%', width: wp(10), zIndex: 2 },
  paginationDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#130160' },
  paginationInactiveDot: { backgroundColor: 'rgba(0, 0, 0, 0.3)' },
});