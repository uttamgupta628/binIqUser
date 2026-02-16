import { FlatList, Image, ImageBackground, Pressable, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useNavigation } from '@react-navigation/native'
import UserIcon from '../../../assets/user_green_icon.svg'
import GraduationCap from '../../../assets/tutorial_hat.svg'
import AboutBinIq from '../../../assets/AboutBinIq.svg'

const Tutorials = () => {
  const navigation = useNavigation();
  const resellerIQPortal = [
    {
      id: 1,
      image: require('../../../assets/reseller_training.png'),
      miniHeader: 'Buy Pallets',
      title: 'Buy Pallets',
      tutDetails: 'Full Video • With PDF'
    },
    {
      id: 2,
      image: require('../../../assets/reseller_training.png'),
      miniHeader: 'Buy Pallets',
      title: 'Buy Pallets',
      tutDetails: 'Full Video • With PDF'
    }
  ]
  const renderResellerPortal = ({ item }) => (
    <TouchableOpacity style={{ width: wp(46), height: hp(24) }}>
      <Pressable style={{ width: wp(44), height: hp(22), borderRadius: 5, borderWidth: 0.5, borderColor: '#e6e6e6', backgroundColor: '#fff', elevation: 1 }}>
        <Image source={item.image} style={{ width: wp(44), height: hp(11), borderRadius: 5 }} />
        <View style={{ margin: '5%', flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontFamily: 'Nunito-ExtraBold', color: '#0049AF', fontSize: hp(1.7) }}>{item.miniHeader}</Text>
            <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(2.2) }}>{item.title}</Text>
            <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#14BA9C', fontSize: hp(1.5), marginTop: '5%' }}>{item.tutDetails}</Text>
          </View>
        </View>
      </Pressable>
    </TouchableOpacity>
  )
  return (
    <>
      <ScrollView style={styles.container}>
        <StatusBar translucent={true} backgroundColor={'transparent'} />
        <ImageBackground source={require('../../../assets/vector_1.png')} style={styles.vector}>
          <View style={styles.header}>
            <View style={styles.headerChild}>
              <Pressable onPress={() => navigation.goBack()}>
                <MaterialIcons name='arrow-back-ios' color={'#0D0D26'} size={25} />
              </Pressable>
              <Text style={styles.headerText}>Tutorials</Text>
            </View>
          </View>
          <View style={{ width: '90%', borderColor: '#000', alignSelf: 'center', height: hp(8), marginVertical: '5%', flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: '48.5%', height: '100%', borderRadius: 8, backgroundColor: '#d9e4f0', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ width: '30%', alignItems: 'center' }}>
                <UserIcon width={'72%'} />
              </View>
              <View style={{ width: '65%' }}>
                <Text style={{ fontFamily: 'DMSans-SemiBold', color: '#130160', fontSize: hp(2.2) }}>Customers</Text>
                <Text style={{ fontFamily: 'DMSans-Regular', color: '#524B6B', fontSize: hp(2.2) }}>4,258</Text>
              </View>
            </View>
            <View style={{ width: '48.5%', height: '100%', borderRadius: 8, backgroundColor: '#d9e4f0', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ width: '30%', alignItems: 'center' }}>
                <GraduationCap width={'72%'} />
              </View>
              <View style={{ width: '65%' }}>
                <Text style={{ fontFamily: 'DMSans-SemiBold', color: '#130160', fontSize: hp(2.2) }}>Tutorials</Text>
                <Text style={{ fontFamily: 'DMSans-Regular', color: '#524B6B', fontSize: hp(2.2) }}>1/1</Text>
              </View>
            </View>
          </View>
          <View style={styles.buyPalletsDetails}>
            <Text style={{ fontFamily: 'Nunito-Bold', color: '#150B3D', fontSize: hp(2.5) }}>Description</Text>
            <Text style={{ fontFamily: 'Nunito-Regular', color: '#524B6B', fontSize: hp(2.1), marginVertical: '4%' }}>
              The BinIQ Training Course is designed to help you master every feature of the BinIQ app. From locating the best bin stores and comparing prices to saving your favorite items and reselling for profit, this course covers it all. Whether you're a beginner or looking to enhance your skills, you'll learn how to navigate the app efficiently and unlock strategies to maximize your reselling potential. Complete the course and become a BinIQ pro, ready to find deals and grow your business with confidence.
            </Text>
          </View>
          <View style={{ width: '92%', alignSelf: 'center', marginVertical: '2%', height: hp(37) }}>
            <AboutBinIq width={'100%'} height={'100%'} />
          </View>
          <View style={{ flex: 1, width: '100%', height: hp(36), alignSelf: 'center' }}>
            <View style={{ marginVertical: '0%', paddingHorizontal: '5%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: '2.5%' }}>
                <Text style={{ fontFamily: 'Nunito-Bold', fontSize: hp(2.3), color: '#000000' }}>RESELLER IQ PORTAL</Text>
                <TouchableOpacity onPress={() => navigation.navigate('IQPortal')}>
                  <Text style={{ color: '#524B6B', fontSize: hp(1.9), textDecorationLine: 'underline' }}>View All</Text>
                </TouchableOpacity>
              </View>
              <View style={{ marginVertical: '4%' }}>
                <FlatList
                  data={resellerIQPortal}
                  renderItem={renderResellerPortal}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            </View>
          </View>
        </ImageBackground>
      </ScrollView>
    </>

  )
}

export default Tutorials

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0'
  },
  vector: {
    flex: 1,
    width: wp(100),
    // height: hp(100),
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
    justifyContent: 'space-between'
  },
  headerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(3),
    textAlign: 'left',
    color: '#0D0140'
  },
  imgContainer: {
    width: wp(90),
    marginHorizontal: wp(5),
    marginVertical: hp(2),
    height: hp(47),
  },
  tabImg: {
    width: '100%',
    height: '100%',
    borderRadius: 25
  },
  imgCotent: {
    position: 'absolute',
    width: wp(90),
    backgroundColor: '#F3F2F2',
    height: '25%',
    bottom: 0,
    borderTopLeftRadius: 25,
    borderBottomRightRadius: 25,
    paddingVertical: '3%'
  },
  imgContentTitle: {
    fontSize: hp(2.2),
    color: '#0D0140',
    fontFamily: 'Nunito-Bold',
    textAlign: 'center'
  },
  review: {
    width: '47%',
    marginVertical: '1%',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  tutDetails: {
    width: '90%',
    marginHorizontal: '5%',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  buyPalletsDetails: {
    marginHorizontal: '5%',
  },
  pointContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    marginHorizontal: '5%'
  },
  bullet: {
    fontSize: hp(3),
    lineHeight: 24,
    marginRight: hp(2),
    color: '#524B6B'
  },
  pointText: {
    fontSize: hp(2),
    lineHeight: 24,
    flex: 1,
    color: '#524B6B',
    fontFamily: 'Nunito-SemiBold'
  },
  enrollNowContainer: {
    position: 'absolute',
    elevation: 5,
    width: wp(90),
    height: hp(16),
    backgroundColor: '#fff',
    bottom: 0,
    alignSelf: 'center',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#14BA9C', // Dark purple color
    width: '80%',
    height: hp(5.6),
    borderRadius: 10,
    justifyContent: 'center',
    elevation: 3, // This creates the shadow for the button
  },
  buttonText: {
    color: 'white',
    fontSize: hp(1.9),
    fontFamily: 'Nunito-Bold',
    textAlign: 'center',
  },
})