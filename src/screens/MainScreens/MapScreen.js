import React, {useState} from 'react';
import {
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  AccessibilityInfo,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import MapFilterIcon from '../../../assets/MapFilterIcon.svg';
import SearchIcon from '../../../assets/SearchIcon.svg';
import CameraIcon from '../../../assets/CameraIcon.svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const MapScreen = () => {
  const navigation = useNavigation();

  // Dummy location data
  const [markers, setMarkers] = useState([
    {
      id: 1,
      title: 'Location 1',
      coordinate: {latitude: 37.78825, longitude: -122.4324},
    },
    {
      id: 2,
      title: 'Location 2',
      coordinate: {latitude: 37.78925, longitude: -122.4354},
    },
    {
      id: 3,
      title: 'Location 3',
      coordinate: {latitude: 37.79025, longitude: -122.4364},
    },
    {
      id: 4,
      title: 'Location 4',
      coordinate: {latitude: 37.79125, longitude: -122.4374},
    },
    {
      id: 5,
      title: 'Location 5',
      coordinate: {latitude: 37.79225, longitude: -122.4384},
    },
    {
      id: 6,
      title: 'Location 6',
      coordinate: {latitude: 37.79325, longitude: -122.4394},
    },
    {
      id: 7,
      title: 'Location 7',
      coordinate: {latitude: 37.79425, longitude: -122.4404},
    },
    {
      id: 8,
      title: 'Location 8',
      coordinate: {latitude: 37.79525, longitude: -122.4414},
    },
    {
      id: 9,
      title: 'Location 9',
      coordinate: {latitude: 37.79625, longitude: -122.4424},
    },
    {
      id: 10,
      title: 'Location 10',
      coordinate: {latitude: 37.79725, longitude: -122.4434},
    },
  ]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState('active');
  const [value, setValue] = useState(0);
  const handleFilterButtonPress = () => {
    setShowFilterModal(true);
    AccessibilityInfo.announceForAccessibility('Filter modal opened');
  };

  const handleCloseFilterModal = () => {
    setShowFilterModal(false);
    AccessibilityInfo.announceForAccessibility('Filter modal closed');
  };
  const dummyCategories = [
    'Books',
    'Pan',
    'Bedsheet',
    'Bins',
    'Chopper',
    'Clocks',
  ];
  const topBins = [
    {
      id: 1,
      image: require('../../../assets/flip_find.png'),
      title: 'FLIP $ FIND',
      location: 'Florida US',
      distance: '3.4KM',
      review: '4.2',
    },
    {
      id: 2,
      image: require('../../../assets/hidden_finds.png'),
      title: 'HIDDED FINDS',
      location: 'Florida US',
      distance: '3.4KM',
      review: '4.2',
    },
    {
      id: 3,
      image: require('../../../assets/flip_find.png'),
      title: 'FLIP $ FIND',
      location: 'Florida US',
      distance: '3.4KM',
      review: '4.2',
    },
    {
      id: 4,
      image: require('../../../assets/hidden_finds.png'),
      title: 'HIDDED FINDS',
      location: 'Florida US',
      distance: '3.4KM',
      review: '4.2',
    },
    {
      id: 5,
      image: require('../../../assets/flip_find.png'),
      title: 'FLIP $ FIND',
      location: 'Florida US',
      distance: '3.4KM',
      review: '4.2',
    },
    {
      id: 6,
      image: require('../../../assets/hidden_finds.png'),
      title: 'HIDDED FINDS',
      location: 'Florida US',
      distance: '3.4KM',
      review: '4.2',
    },
    {
      id: 7,
      image: require('../../../assets/flip_find.png'),
      title: 'FLIP $ FIND',
      location: 'Florida US',
      distance: '3.4KM',
      review: '4.2',
    },
    {
      id: 8,
      image: require('../../../assets/hidden_finds.png'),
      title: 'HIDDED FINDS',
      location: 'Florida US',
      distance: '3.4KM',
      review: '4.2',
    },
  ];
  const renderItem = ({item}) => (
    // <View style={{paddingHorizontal: '0.1%'}}>
    <Pressable
      style={{width: wp(50), height: hp(23), marginVertical: '4%'}}
      onPress={() => navigation.navigate('TopBinsNearMe')}>
      <View
        style={{
          width: wp(47),
          height: hp(21.5),
          borderRadius: 10,
          borderWidth: 0.4,
          borderColor: '#999',
        }}>
        <Image
          source={item.image}
          style={{width: wp(47), height: hp(12), borderRadius: 10}}
        />
        <Ionicons
          name="heart"
          size={hp(3)}
          color={'#EE2525'}
          style={{position: 'absolute', right: '2%', top: '2%'}}
        />
        <View
          style={{
            margin: '5%',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <View>
            <Text
              style={{
                fontFamily: 'Nunito-SemiBold',
                color: '#0049AF',
                fontSize: hp(2),
              }}>
              {item.title}
            </Text>
            <Text
              style={{
                fontFamily: 'Nunito-SemiBold',
                color: '#000',
                fontSize: hp(1.6),
              }}>
              {item.location}
            </Text>
            <Text
              style={{
                fontFamily: 'Nunito-SemiBold',
                color: '#14BA9C',
                fontSize: hp(1.4),
              }}>
              {item.distance}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: '#FFBB36',
              height: hp(2.3),
              width: wp(11),
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              padding: '1.4%',
              borderRadius: 4,
            }}>
            <FontAwesome name="star" size={12} color={'#fff'} />
            <Text
              style={{
                color: '#fff',
                fontFamily: 'Nunito-Regular',
                fontSize: hp(1.6),
              }}>
              {item.review}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <View>
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons
                name="arrow-back-ios"
                color={'#0D0D26'}
                size={25}
              />
            </Pressable>
            <Text style={styles.headerText}>Bin Finder</Text>
          </View>
        </View>
        <View style={styles.searchParent}>
          <Pressable style={styles.searchContainer}>
            <View style={styles.cameraButton}>
              <SearchIcon />
            </View>
            <Text style={styles.input}>search for anything</Text>
            <Pressable
              style={styles.searchButton}
              onPress={() => launchCamera()}>
              <CameraIcon />
            </Pressable>
          </Pressable>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleFilterButtonPress}>
            <MapFilterIcon />
          </TouchableOpacity>
        </View>
        {/* <MapView
          style={styles.map}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {markers.map(marker => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              pinColor={'red'} // Custom pin color
            />
          ))}
        </MapView> */}
        {/* <Modal
          visible={showFilterModal}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCloseFilterModal}
        >
          <View style={styles.modalContainer} onPress={handleCloseFilterModal}>
            <View style={styles.modalContent}>
              <View style={{ flex: 1, width: '100%', height: hp(35), marginTop: '4%' }}>
                <View style={{ marginTop: '7%', paddingHorizontal: '5%' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: '6%' }}>
                    <Text style={{ fontFamily: 'Nunito-Bold', fontSize: hp(2.3), color: '#000000' }}>Bins Near Me</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('TopBinsNearMe')}>
                      <Text style={{ color: '#524B6B', fontSize: hp(1.9), textDecorationLine: 'underline' }}>View All</Text>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={topBins}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                  />
                </View>
                <View style={{ paddingHorizontal: '5%' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  </View>
                  <FlatList
                    data={topBins}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal> */}
        <Modal
          visible={showFilterModal}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCloseFilterModal}>
          <TouchableWithoutFeedback onPress={handleCloseFilterModal}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View
                  style={{
                    flex: 1,
                    width: '100%',
                    height: hp(35),
                    marginTop: '4%',
                  }}>
                  <View style={{marginTop: '7%', paddingHorizontal: '5%'}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginVertical: '6%',
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Nunito-Bold',
                          fontSize: hp(2.3),
                          color: '#000000',
                        }}>
                        Bins Near Me
                      </Text>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('TopBinsNearMe')}>
                        <Text
                          style={{
                            color: '#524B6B',
                            fontSize: hp(1.9),
                            textDecorationLine: 'underline',
                          }}>
                          View All
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <FlatList
                      data={topBins}
                      renderItem={renderItem}
                      keyExtractor={item => item.id.toString()}
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                    />
                  </View>
                  <View style={{paddingHorizontal: '5%'}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}></View>
                    <FlatList
                      data={topBins}
                      renderItem={renderItem}
                      keyExtractor={item => item.id.toString()}
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                    />
                  </View>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </View>
  );
};

export default MapScreen;

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
    justifyContent: 'space-between',
  },
  headerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(3),
    textAlign: 'left',
    color: '#0D0140',
  },
  searchParent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: '3%',
    marginTop: '3%',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginRight: 10,
    borderColor: '#99ABC678',
    height: hp(6),
    backgroundColor: '#F2F2F2',
  },
  cameraButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    fontSize: hp(2.2),
    fontFamily: 'Nunito-Regular',
    paddingVertical: 8,
    color: '#999',
  },
  searchButton: {
    padding: 10,
  },
  menuButton: {
    backgroundColor: '#130160',
    padding: 10,
    borderRadius: 12,
    height: hp(6),
    width: wp(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  vector: {
    flex: 1,
  },
  map: {
    position: 'absolute',
    width: wp(100),
    height: hp(100),
    zIndex: -1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darken background when modal is open
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '65%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    marginVertical: '5%',
    // marginBottom: 20,
  },
  modalTitle: {
    fontSize: hp(2.3),
    fontFamily: 'Nunito-Bold',
    color: '#000',
  },
  doneButton: {
    fontFamily: 'Nunito-SemiBold',
    color: '#356899',
    fontSize: hp(2),
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
    marginVertical: '4%',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  categoryCloseIcon: {
    marginLeft: 8,
  },
  priceRangeTitle: {
    fontFamily: 'Nunito-SemiBold',
    color: '#95969D',
    fontSize: hp(2.2),
  },
  priceRangeSubtitle: {
    fontFamily: 'Nunito-SemiBold',
    color: '#494A50',
    fontSize: hp(2.1),
  },
  priceRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceRangeValue: {
    fontSize: 16,
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
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
  price: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2),
    color: '#14BA9C',
  },
  slider: {
    width: '100%',
    marginVertical: '2%',
    borderColor: '#000',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    width: '100%',
  },
  rating: {
    // marginLeft: 4,
    fontSize: hp(1.5),
    fontWeight: 'bold',
    color: '#000',
  },
  reviews: {
    // marginLeft: 4,
    fontSize: hp(1.4),
    color: '#000',
  },
  heartButton: {
    position: 'absolute',
    bottom: '2%',
    right: '1%',
    borderRadius: 15,
    // padding: 5
  },
  filterChip: {
    paddingVertical: 8,
    // paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    width: '32%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterChip: {
    backgroundColor: '#00BFA5',
  },
  filterChipText: {
    color: '#666',
    fontSize: hp(1.7),
    fontFamily: 'Nunito-SemiBold',
  },
  activeFilterChipText: {
    color: 'white',
  },
  quickFilters: {
    flexDirection: 'row',
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
    height: hp(6),
  },
});
