import { Dimensions, Image, ImageBackground, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import React, { useRef, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import PhoneInput from 'react-native-phone-number-input';

const { width, height } = Dimensions.get('window')
const SuccessScreen = () => {
    const navigation = useNavigation();
    const [isEmailSelected, setIsEmailSelected] = useState(true);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [formattedValue, setFormattedValue] = useState(0);

    const phoneInput = useRef(null)
    return (
        <ScrollView style={styles.container}>
            <StatusBar translucent={true} backgroundColor={'transparent'} />
            <ImageBackground source={require('../../../assets/vector_1.png')} style={styles.vector}>
                <View style={{ height: hp(7) }} />
                <View style={{ height: hp(15), width: wp(100), padding: '5%' }}>
                    <Text style={{ fontFamily: 'Nunito-Bold', fontSize: hp(3.6), color: '#14BA9C' }}>Successfully</Text>
                    <Text style={{ fontFamily: 'Nunito-Regular', fontSize: hp(2), color: '#524B6B', marginTop: '5%' }}>Your password had been updated</Text>
                </View>
                <View style={{ alignItems: 'center', marginVertical: '10%'}}>
                    <Image source={require('../../../assets/success_vector.png')} style={{ width: wp(48), height: hp(20)}} />
                </View>
            </ImageBackground>
            <TouchableOpacity style={styles.gettingStarted} onPress={() => navigation.navigate('OTPEntry')}>
                <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#fff', fontSize: hp(2.5) }}>Back to Login</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}

export default SuccessScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: wp(40),
        height: hp(10.5),
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
        height: hp(7),
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',

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

})