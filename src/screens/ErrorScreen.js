import { Dimensions, Image, ImageBackground, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import React, { useRef, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import OTPTextView from 'react-native-otp-textinput';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

const { width, height } = Dimensions.get('window')
const ErrorScreen = () => {
  const navigation = useNavigation();
  const [isEmailSelected, setIsEmailSelected] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedValue, setFormattedValue] = useState(0);

  const phoneInput = useRef(null)
  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ImageBackground source={require('../../assets/vector_1.png')} style={styles.vector}>
        <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', marginTop: hp(7), paddingHorizontal: '5%' }}>
          <Pressable>
            <MaterialIcons name='arrow-back-ios' size={24} color={'#0D0D26'} />
          </Pressable>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', height: hp(70)}}>
          <Image source={require('../../assets/error_404.png')} style={{ width: wp(60), height: hp(27.5) }} />
          <View style={{paddingVertical: '4%'}}>
            <Text style={{textAlign: 'center', fontSize: hp(5), fontFamily: 'Nunito-Bold', color:'#524B6B'}}>Oh No!</Text>
            <Text style={{textAlign: 'center', fontSize: hp(2.5), fontFamily: 'Nunito-SemiBold', color: '#524B6B'}}>Something went wrong</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.gettingStarted} onPress={() => navigation.navigate('SuccessScreen')}>
          <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#fff', fontSize: hp(2.5) }}>Back To Homepage</Text>
        </TouchableOpacity>
      </ImageBackground>
      <ImageBackground source={require('../../assets/vector_2.png')} style={styles.vector2} />
    </View>
  )
}

export default ErrorScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  logoHeader: {
    alignItems: 'flex-end',
    paddingRight: '3%',
    height: hp(13),
    width: '100%',
  },
  logo: {
    width: wp(30),
    height: hp(6),
  },
  vector: {
    flex: 1,
    width: wp(100),
    height: hp(50),
  },
  logoText: {
    fontFamily: 'Nunito-SemiBold',
    color: '#000',
    fontSize: hp(2.5)
  },
  cityVector: {
    position: 'absolute',
    width: wp(100),
    bottom: 0
  },
  label: {
    color: 'black',
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(2.2),
    marginTop: '3%'
  },
  gettingStarted: {
    backgroundColor: '#130160',
    width: '90%',
    height: hp(6.5),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#C0C0C0', // Gray color for the lines
  },
  text: {
    marginHorizontal: 10,
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#A9A9A9', // Light gray color for the text
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1),
    backgroundColor: '#DDF4F3',
    width: wp(85),
    height: hp(7.5),
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 10
  },
  toggleButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    height: '82%',
    marginHorizontal: '2%'
  },
  activeToggle: {
    backgroundColor: '#fff',
  },
  toggleText: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(2),
    color: '#0D0D26'
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  mobileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    marginRight: 10,
    fontSize: 16,
    lineHeight: 50, // Aligns vertically with the input
  },
  sendCodeButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  sendCodeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  vector2: {
    flex: 1,
    width: wp(100),
    height: height * 0.5,
    position: 'absolute',
    bottom: 0,
    zIndex: -1
    // backgroundColor: 'green',
  },

})