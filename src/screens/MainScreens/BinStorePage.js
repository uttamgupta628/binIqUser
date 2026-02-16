import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import React, {useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import LocationIcon from '../../../assets/LocationIcon.svg';
import HeartIcon from '../../../assets/HeartIcon.svg';
import FacebookIcon from '../../../assets/FacebookIcon.svg';
import TwitterIcon from '../../../assets/TwitterIcon.svg';
import WhatsappIcon from '../../../assets/WhatsappIcon.svg';
import LinkedinIcon from '../../../assets/LinkedinIcon.svg';
import SharedIcon from '../../../assets/SharedIcon.svg';
import RatingsSummary from '../../Components/RatingsSummary';
import Heart_Icon from '../../../assets/heart_icon.svg';
import Share_Icon from '../../../assets/share_icon.svg';
import HiddenFindsImg from '../../../assets/hidden_find_img.svg';
import BoldTick from '../../../assets/bold_tick.svg';
import GreenTick from '../../../assets/green_tick.svg';
import {Star, Heart} from 'lucide-react-native';

const {width, height} = Dimensions.get('window');
const BinStorePage = () => {
  const navigation = useNavigation();
  const [favouritePress, setFavouritePressed] = useState(false);
  const [activeSlide, setActiveSlide] = useState(1);
  const carouselImages = [
    {
      id: 1,
      image: require('../../../assets/bin_store_img.png'),
    },
    {
      id: 2,
      image: require('../../../assets/bin_store_img.png'),
    },
    {
      id: 3,
      image: require('../../../assets/bin_store_img.png'),
    },
  ];
  const myFavourites = [
    {
      id: 1,
      image: require('../../../assets/gray_img.png'),
      title: 'COLGATE',
      description: `IWC Schaffhausen 2021 Pilot's Watch "SIHH 2019" 44mm`,
      discountPrice: '$65',
      originalPrice: '$151',
      totalDiscount: '60% off',
    },
    {
      id: 2,
      image: require('../../../assets/gray_img.png'),
      title: 'COLGATE',
      description: `Labbin White Sneakers For Men and Female`,
      discountPrice: '$650',
      originalPrice: '$125',
      totalDiscount: '70% off',
    },
    {
      id: 3,
      image: require('../../../assets/gray_img.png'),
      title: 'COLGATE',
      description: `Mammon Women's Handbag (Set of 3, Beige)`,
      discountPrice: '$75',
      originalPrice: '$199',
      totalDiscount: '60% off',
    },
    {
      id: 4,
      image: require('../../../assets/gray_img.png'),
      title: 'COLGATE',
      description: `IWC Schaffhausen 2021 Pilot's Watch "SIHH 2019" 44mm`,
      discountPrice: '$65',
      originalPrice: '$151',
      totalDiscount: '60% off',
    },
    {
      id: 5,
      image: require('../../../assets/gray_img.png'),
      title: 'COLGATE',
      description: `Labbin White Sneakers For Men and Female`,
      discountPrice: '$650',
      originalPrice: '$125',
      totalDiscount: '70% off',
    },
    {
      id: 6,
      image: require('../../../assets/gray_img.png'),
      title: 'COLGATE',
      description: `Mammon Women's Handbag (Set of 3, Beige)`,
      discountPrice: '$75',
      originalPrice: '$199',
      totalDiscount: '60% off',
    },
  ];
  const products = [
    {
      id: '1',
      name: 'TMA-2 HD Wireless',
      subtitle: 'Hidden Finds',
      rating: 4.8,
      reviews: 88,
      image: 'https://placeholder.com/150',
    },
    {
      id: '2',
      name: 'TMA-2 HD Wireless',
      subtitle: 'ANC Store',
      rating: 4.8,
      reviews: 88,
      image: 'https://placeholder.com/150',
    },
    {
      id: '3',
      name: 'TMA-2 HD Wireless',
      subtitle: 'Hidden Finds',
      rating: 4.8,
      reviews: 88,
      image: 'https://placeholder.com/150',
    },
  ];
  const renderItem = ({item, index}) => {
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} />
      </View>
    );
  };
  const renderMyFavourites = ({item}) => (
    <View style={{width: wp(47), height: hp(26)}}>
      <View
        style={{
          width: wp(45),
          height: hp(26),
          borderRadius: 5,
          borderWidth: 0.5,
          borderColor: '#e6e6e6',
        }}>
        <Image
          source={item.image}
          style={{width: wp(45), height: hp(13), borderRadius: 5}}
        />
        <View style={{paddingHorizontal: '1%'}}>
          <Text
            style={{
              fontFamily: 'Nunito-SemiBold',
              color: '#000',
              fontSize: hp(1.7),
              margin: '0.5%',
            }}>
            {item.description}
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
              {item.discountPrice}
            </Text>
            <Text style={{color: 'red'}}>
              <Text
                style={{
                  fontFamily: 'Nunito-Bold',
                  color: '#808488',
                  fontSize: hp(1.8),
                  textDecorationLine: 'line-through',
                }}>
                {item.originalPrice}
              </Text>
              {'  '}
              {item.totalDiscount}
            </Text>
          </View>
        </View>
      </View>
    </View>
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imgBg}>
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <View style={{flexDirection: 'row'}}>
              <Pressable onPress={() => navigation.goBack()}>
                <MaterialIcons
                  name="arrow-back-ios"
                  color={'#768190'}
                  size={25}
                />
              </Pressable>
              <Text style={styles.headerText}>Hidden Finds</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '23%',
            }}>
            <Pressable onPress={() => navigation.goBack()}>
              <Heart_Icon height={hp(4)} />
            </Pressable>
            <Pressable onPress={() => navigation.goBack()}>
              <Share_Icon height={hp(4)} />
            </Pressable>
          </View>
        </View>
        <View
          style={{
            width: '95%',
            alignSelf: 'center',
            justifyContent: 'space-between',
            height: hp(23),
            flexDirection: 'row',
            marginTop: '5%',
          }}>
          <View
            style={{width: '45%', height: '100%', justifyContent: 'center'}}>
            <HiddenFindsImg width={'95%'} />
          </View>
          <View style={{width: '55%'}}>
            <View
              style={{
                width: '97%',
                alignSelf: 'flex-end',
                height: '100%',
                flexDirection: 'column',
              }}>
              <View
                style={{
                  height: '23%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: '2%',
                  width: '93%',
                }}>
                <Text
                  style={{
                    fontFamily: 'Roboto-SemiBold',
                    borderColor: '#fff',
                    color: '#fff',
                    fontSize: hp(3),
                  }}>
                  Hidden Finds
                </Text>
                <BoldTick width={20} />
              </View>
              <View style={{height: '35%', flexDirection: 'row'}}>
                <View
                  style={{
                    width: '50%',
                    height: '100%',
                    paddingLeft: '1%',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Roboto-ExtraBold',
                      borderColor: '#fff',
                      color: '#fff',
                      fontSize: hp(3.2),
                    }}>
                    11K {'\n'}
                    <Text style={{fontSize: hp(1.8)}}>Followers</Text>
                  </Text>
                </View>
                <View
                  style={{
                    width: '50%',
                    height: '100%',
                    paddingLeft: '1%',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Roboto-ExtraBold',
                      borderColor: '#fff',
                      color: '#fff',
                      fontSize: hp(3.2),
                    }}>
                    12K {'\n'}
                    <Text style={{fontSize: hp(1.8)}}>Likes</Text>
                  </Text>
                </View>
              </View>
              <View style={{height: '15%', justifyContent: 'center'}}>
                <Text
                  style={{
                    fontFamily: 'Roboto-Thin',
                    color: '#F8F8F8',
                    fontSize: hp(1.9),
                  }}>
                  www.hiddenfinds.com
                </Text>
              </View>
              <View
                style={{
                  height: '23%',
                  marginTop: '3%',
                  justifyContent: 'center',
                  width: '90%',
                }}>
                <View
                  style={{
                    width: '100%',
                    height: '85%',
                    backgroundColor: '#fff',
                    borderRadius: 7,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: '#14BA9C',
                  }}>
                  <Text
                    style={{
                      color: '#14BA9C',
                      fontSize: hp(2.3),
                      fontFamily: 'DMSans-SemiBold',
                    }}>
                    Follow
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
      <View
        style={{
          width: '90%',
          marginTop: '5%',
          height: hp(7),
          alignSelf: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        {/* <View style={styles.storeButtonsContainer}> */}
        <View style={styles.nearestStore}>
          <LocationIcon />
          <Text
            style={{
              fontFamily: 'Nunito-SemiBold',
              color: '#000',
              fontSize: hp(1.9),
            }}>
            Check In
          </Text>
        </View>
        <View style={styles.nearestStoreBtn2}>
          <GreenTick />
          <Text
            style={{
              fontFamily: 'Nunito-SemiBold',
              color: '#000',
              fontSize: hp(1.9),
            }}>
            Verify My Bin
          </Text>
        </View>
        {/* </View> */}
      </View>
      <View style={styles.contentHeader}>
        <View style={styles.content}>
          <Text
            style={{
              fontFamily: 'Nunito-Bold',
              color: '#000',
              fontSize: hp(2.4),
            }}>
            HIDDEN FINDS
          </Text>
        </View>
        <View style={styles.review}>
          <FontAwesome name="star" color={'#FFD700'} size={16} />
          <FontAwesome name="star" color={'#FFD700'} size={16} />
          <FontAwesome name="star" color={'#FFD700'} size={16} />
          <FontAwesome name="star" color={'#FFD700'} size={16} />
          <FontAwesome name="star" color={'#e6e6e6'} size={16} />
          <Text
            style={{
              fontFamily: 'Nunito-SemiBold',
              color: '#828282',
              fontSize: hp(2),
            }}>
            {' '}
            56,890
          </Text>
        </View>
      </View>
      <View style={styles.contentDetails}>
        <Text
          style={{
            color: '#000',
            fontFamily: 'Nunito-SemiBold',
            fontSize: hp(1.8),
            marginVertical: '1%',
          }}>
          Address:{' '}
        </Text>
        <Text
          style={{
            color: '#000',
            fontFamily: 'Nunito-SemiBold',
            fontSize: hp(1.8),
            marginVertical: '1%',
          }}>
          Phone Number:{' '}
        </Text>
        <Text
          style={{
            color: '#000',
            fontFamily: 'Nunito-SemiBold',
            fontSize: hp(1.8),
            marginVertical: '1%',
          }}>
          Email{' '}
        </Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text
            style={{
              color: '#000',
              fontFamily: 'Nunito-SemiBold',
              fontSize: hp(1.8),
              marginVertical: '1%',
            }}>
            Social Media Page{' '}
          </Text>
          <View style={styles.socialMediaIcons}>
            <FacebookIcon />
            <TwitterIcon />
            <WhatsappIcon />
            <LinkedinIcon />
          </View>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text
            style={{
              color: '#000',
              fontFamily: 'Nunito-SemiBold',
              fontSize: hp(1.9),
              marginVertical: '1%',
            }}>
            Daily Rates:{' '}
          </Text>
          <View style={styles.totalAmounts}>
            <Text
              style={{
                color: '#524B6B',
                fontFamily: 'Nunito-SemiBold',
                fontSize: hp(1.9),
                marginVertical: '1%',
              }}>
              $10, $8, $6, $4, $2, $1
            </Text>
          </View>
        </View>
      </View>
      {/* TRENDING PRODUCTS  */}
      <View style={{flex: 1, width: '100%', height: hp(35), marginTop: '5%'}}>
        <View style={{paddingHorizontal: '5%'}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginVertical: '2.5%',
            }}>
            <Text
              style={{
                fontFamily: 'Nunito-Bold',
                fontSize: hp(2.3),
                color: '#000000',
              }}>
              Trending Products
            </Text>
            <TouchableOpacity>
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
          <View style={{marginVertical: '3%'}}>
            <FlatList
              data={myFavourites}
              renderItem={renderMyFavourites}
              keyExtractor={item => item.id.toString()}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>
      </View>
      {/* TRENDING PRODUCTS  */}
      {/* <View style={{ flex: 1, width: '100%', height: hp(35), marginTop: '2%' }}> */}
      <View style={{paddingHorizontal: '5%'}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: '2.5%',
          }}>
          <Text
            style={{
              fontFamily: 'Nunito-Bold',
              fontSize: hp(2.3),
              color: '#000000',
            }}>
            PROMOTIONS
          </Text>
        </View>
        <View style={{flex: 1, width: '100%', marginTop: '10%'}}>
          <FlatList
            data={products}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('SinglePageItem')}>
                <Image
                  source={require('../../../assets/dummy_product.png')}
                  style={styles.image}
                />
                <Ionicons
                  name="heart"
                  size={hp(2.5)}
                  color={'#EE2525'}
                  style={{position: 'absolute', right: '9%', top: '4%'}}
                />
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
                <View style={styles.ratingContainer}>
                  <Star size={12} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.rating}>{item.rating}</Text>
                  <Text style={styles.reviews}>{item.reviews} Reviews</Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
            numColumns={3}
            contentContainerStyle={styles.grid}
          />
        </View>
      </View>
      {/* </View> */}
    </ScrollView>
  );
};

export default BinStorePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  vector: {
    flex: 1,
    width: wp(100),
    height: hp(42),
  },
  imgBg: {
    borderWidth: 1,
    borderColor: 'black',
    width: '100%',
    height: hp(41),
    // position: 'absolute',
    borderBottomEndRadius: 20,
    borderBottomLeftRadius: 20,
    backgroundColor: '#130160',
    // backgroundColor: 'red'
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
    width: wp(100),
    justifyContent: 'space-between',
    flex: 1,
  },
  headerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(3.4),
    textAlign: 'left',
    color: '#0D0140',
  },
  slider: {
    width: '90%',
    borderColor: '#000',
    marginHorizontal: '5%',
    height: height * 0.25,
    marginTop: '4%',
  },
  slide: {
    flex: 1,
    width: '90%',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: height * 0.25,
  },
  paginationContainer: {
    position: 'absolute',
    left: '43%',
    bottom: '-25%',
    width: wp(10),
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#130160',
  },
  paginationInactiveDot: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  contentHeader: {
    width: '90%',
    marginHorizontal: '5%',
    marginVertical: '4%',
    flexDirection: 'row',
    marginTop: '7%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '50%',
  },
  review: {
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  contentDetails: {
    width: '90%',
    marginHorizontal: '5%',
  },
  storeButtonsContainer: {
    width: '80%',
    height: hp(4),
    alignSelf: 'center',
    // marginVertical: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nearestStore: {
    width: '48%',
    borderWidth: 0.4,
    borderColor: '#828282',
    height: '90%',
    borderRadius: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '9%',
    borderColor: 'red',
    borderWidth: 0.8,
  },
  nearestStoreBtn2: {
    width: '48%',
    borderWidth: 0.4,
    borderColor: '#828282',
    height: '90%',
    borderRadius: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '5%',
    borderColor: '#00B813',
    borderWidth: 0.8,
  },
  bottomButtons: {
    width: '90%',
    height: hp(7.5),
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: '3%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewSimilar: {
    width: '48%',
    borderWidth: 0.4,
    borderColor: '#828282',
    height: hp(5.4),
    borderRadius: 7,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: '3%',
  },
  socialMediaIcons: {
    width: '35%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalAmounts: {
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    color: '#C4C4C4',
  },
  card: {
    width: '30%', // Adjust the width to allow space between columns
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: '2%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: '0.5%',
    marginBottom: '2%', // Add spacing between rows
  },
  image: {
    width: '100%',
    marginBottom: 10,
  },
  name: {
    fontSize: hp(1.45),
    fontWeight: '500',
    marginBottom: 4,
    color: '#000',
  },
  subtitle: {
    fontSize: hp(1.7),
    color: '#14BA9C',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    // marginLeft: 4,
    fontSize: hp(1.5),
    fontWeight: 'bold',
    color: '#000',
  },
  reviews: {
    marginLeft: 4,
    fontSize: hp(1.2),
    color: '#666',
  },
  heartButton: {
    position: 'absolute',
    bottom: '2%',
    right: '1%',
    borderRadius: 15,
    padding: 5,
  },
});
