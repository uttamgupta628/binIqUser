import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions,
  ImageBackground, StatusBar, Pressable, Image, TextInput,
} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SearchIcon from '../../../assets/SearchIcon.svg';
import CameraIcon from '../../../assets/CameraIcon.svg';
import FilterIcon from '../../../assets/FilterIcon.svg';

const {width} = Dimensions.get('window');
const STORE_FALLBACK = require('../../../assets/flip_find.png');

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

const SmartImage = ({uri, fallback, style}) => {
  const [failed, setFailed] = useState(false);
  if (uri && !failed) {
    return <Image source={{uri}} style={style} resizeMode="cover" onError={() => setFailed(true)} />;
  }
  return <Image source={fallback} style={style} resizeMode="cover" />;
};

const NearByBins = () => {
  const navigation                = useNavigation();
  const route                     = useRoute();
  const stores                    = route.params?.stores      ?? [];
  const userLocation              = route.params?.userLocation ?? null;
  const [search, setSearch]       = useState('');

  const filtered = stores.filter(s =>
    (s.store_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.address    || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.city       || '').toLowerCase().includes(search.toLowerCase()),
  );

  const renderItem = ({item}) => {
    const storeLat = parseFloat(item.user_latitude ?? item.latitude);
    const storeLon = parseFloat(item.user_longitude ?? item.longitude);
    const distance =
      userLocation && storeLat && storeLon && !isNaN(storeLat) && !isNaN(storeLon)
        ? getDistanceKm(userLocation.latitude, userLocation.longitude, storeLat, storeLon)
        : null;

    const avgRating =
      item.comments?.length > 0
        ? (item.comments.reduce((s, c) => s + (c.rating || 0), 0) / item.comments.length).toFixed(1)
        : '4.2';

    const imageUri = item.store_image || item.image || null;

    return (
      <TouchableOpacity
        style={styles.storeCard}
        onPress={() => navigation.navigate('BinStore', {store: item})}>
        <SmartImage uri={imageUri} fallback={STORE_FALLBACK} style={styles.storeImage} />
        <Ionicons name="heart-outline" size={hp(3)} color="#EE2525" style={styles.heartIcon} />
        <View style={styles.storeInfo}>
          <View style={{flex: 1}}>
            <Text style={styles.storeName} numberOfLines={1}>{item.store_name || 'Store'}</Text>
            <Text style={styles.storeLocation} numberOfLines={1}>
              {item.city || item.address || 'Location'}
            </Text>
            {distance !== null ? (
              <View style={styles.distanceRow}>
                <Ionicons name="location-sharp" size={11} color="#14BA9C" />
                <Text style={styles.storeDistance}>{distance} km away</Text>
              </View>
            ) : (
              <Text style={styles.storeDistance}>Distance N/A</Text>
            )}
          </View>
          <View style={styles.ratingBadge}>
            <FontAwesome name="star" size={8} color="#fff" />
            <Text style={styles.ratingText}>{avgRating}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}
        resizeMode="stretch">

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color="#0D0D26" size={25} />
            </Pressable>
            <Text style={styles.headerText}>Bin Stores Near Me</Text>
          </View>
          <Text style={styles.storeCount}>{filtered.length} stores</Text>
        </View>

        {/* Search */}
        <View style={styles.searchParent}>
          <View style={styles.searchContainer}>
            <View style={styles.cameraButton}><SearchIcon /></View>
            <TextInput
              style={styles.input}
              placeholder="Search stores..."
              placeholderTextColor="#C4C4C4"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={styles.cameraButton}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <FilterIcon size={10} />
          </TouchableOpacity>
        </View>

        {/* Location info */}
        {userLocation && (
          <View style={styles.locationInfo}>
            <Ionicons name="location-sharp" size={13} color="#14BA9C" />
            <Text style={styles.locationInfoText}>Sorted by distance from your location</Text>
          </View>
        )}

        {/* Store Grid */}
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item, i) => item._id?.toString() || i.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="storefront-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No stores found</Text>
              <Text style={styles.emptySubText}>Try a different search</Text>
            </View>
          }
        />
      </ImageBackground>
    </View>
  );
};

export default NearByBins;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#E6F3F5'},
  vector:    {flex: 1, width: wp(100)},

  header: {
    width: wp(100), height: hp(7), marginTop: '10%',
    paddingHorizontal: '5%', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  headerChild:  {flexDirection: 'row', alignItems: 'center', gap: 10},
  headerText:   {fontFamily: 'Nunito-Bold', fontSize: hp(2.8), color: '#0D0140'},
  storeCount:   {fontFamily: 'Nunito-SemiBold', fontSize: hp(1.8), color: '#524B6B'},

  searchParent: {flexDirection: 'row', alignItems: 'center', marginHorizontal: '3%', marginVertical: '3%'},
  searchContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 12, marginRight: 10,
    borderColor: '#99ABC678', height: hp(6.5), backgroundColor: '#F2F2F2',
  },
  cameraButton: {padding: 10},
  input:        {flex: 1, fontSize: hp(2), fontFamily: 'Nunito-Regular', color: '#333'},
  menuButton:   {backgroundColor: '#130160', padding: 10, borderRadius: 12, height: hp(6.5), width: wp(14), justifyContent: 'center', alignItems: 'center'},

  locationInfo:     {flexDirection: 'row', alignItems: 'center', gap: 4, marginHorizontal: '4%', marginBottom: hp(1)},
  locationInfoText: {fontFamily: 'Nunito-Regular', fontSize: hp(1.5), color: '#666'},

  listContent: {paddingHorizontal: wp(2), paddingBottom: hp(10)},

  storeCard: {
    width: wp(44), height: hp(24), borderRadius: 10,
    backgroundColor: '#fff', marginHorizontal: wp(1.5), marginVertical: hp(1),
    elevation: 3, shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08, shadowRadius: 4, overflow: 'hidden',
  },
  storeImage:   {width: '100%', height: hp(13), borderTopLeftRadius: 10, borderTopRightRadius: 10},
  heartIcon:    {position: 'absolute', right: '3%', top: '2%'},
  storeInfo:    {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: '4%'},
  storeName:    {fontFamily: 'Nunito-SemiBold', color: '#0049AF', fontSize: hp(1.8)},
  storeLocation:{fontFamily: 'Nunito-Regular', color: '#555', fontSize: hp(1.4)},
  distanceRow:  {flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2},
  storeDistance:{fontFamily: 'Nunito-SemiBold', color: '#14BA9C', fontSize: hp(1.4)},
  ratingBadge:  {backgroundColor: '#FFBB36', flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4},
  ratingText:   {color: '#fff', fontFamily: 'Nunito-Bold', fontSize: hp(1.2)},

  emptyContainer: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: hp(15)},
  emptyText:      {fontFamily: 'Nunito-Bold', fontSize: hp(2.2), color: '#666', marginTop: hp(2)},
  emptySubText:   {fontFamily: 'Nunito-Regular', fontSize: hp(1.8), color: '#999', marginTop: 6},
});