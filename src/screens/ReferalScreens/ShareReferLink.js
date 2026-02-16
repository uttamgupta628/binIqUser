import { Dimensions, ImageBackground, StatusBar, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { TextInput } from 'react-native-gesture-handler'

const { width, height } = Dimensions.get('window')
const ShareReferLink = () => {
    return (
        <View style={styles.container}>
            <StatusBar translucent={true} backgroundColor={'transparent'} />
            <View style={styles.header}>
                <Text style={{ color: '#fff', fontFamily: 'Nunito-SemiBold', fontSize: hp(2.4), textAlign: 'center' }}>Refer A Friend And You’ll Both Be Rewarded!</Text>
            </View>
            <View style={{marginHorizontal: '5%', width: wp(90), height: hp(20), justifyContent: 'center', alignItems: 'center'}}>
                <Image source={require('../../../assets/refer_screen.png')} style={{width: '97%', height: hp(16)}}/>
            </View>
            <View style={{ width: wp(100), paddingHorizontal: '5%' }}>
                <View style={styles.footerContainer}>
                    <Text style={{ color: '#130160', fontWeight: '500', fontSize: hp(3), textAlign: 'center' }}>Share your Unique Link</Text>
                    <View style={styles.cpyBtnContainer}>
                        <Text style={{color: '#000', textAlign: 'center', fontFamily: 'Nunito-Regular', fontSize: hp(2.2)}}>https://bonIQ referral-binIQ.com</Text>
                    <TouchableOpacity style={styles.gettingStarted}>
                    <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#fff', fontSize: hp(2.5) }}>Copy Link</Text>
                </TouchableOpacity>
                    </View>
                </View>
            </View>
            <View style={{width: '80%', alignSelf: 'center', height: hp(6), flexDirection: 'row', justifyContent: 'space-between'}}>
                <Image source={require('../../../assets/fb.png')} style={{height: '100%', width: wp(12)}}/>
                <Image source={require('../../../assets/x.png')} style={{height: '100%', width: wp(12)}}/>
                <Image source={require('../../../assets/whatsapp.png')} style={{height: '100%', width: wp(12)}}/>
                <Image source={require('../../../assets/telegram.png')} style={{height: '100%', width: wp(12)}}/>
                <Image source={require('../../../assets/messenger.png')} style={{height: '100%', width: wp(12)}}/>
                <Image source={require('../../../assets/ln.png')} style={{height: '100%', width: wp(12)}}/>
            </View>
            <ImageBackground source={require('../../../assets/vector_2.png')} style={styles.vector2} />
        </View>
    )
}

export default ShareReferLink

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        width: wp(100),
        height: hp(22),
        backgroundColor: '#14BA9C',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '10%'
    },
    vector2: {
        flex: 1,
        width: wp(100),
        height: height,
        position: 'absolute',
        bottom: 0,
        zIndex: -1
    },
    middleContainer: {
        height: hp(30),
        alignItems: 'center'
    },
    footerContainer: {
        width: wp(90),
        height: hp(25),
        marginVertical: '5%',
        justifyContent: 'space-between',
    },
    gettingStarted: {
        backgroundColor: '#130160',
        width: '100%',
        height: hp(6.2),
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        margin: '4%'
    },
    cpyBtnContainer : {
        backgroundColor: '#E6E6E6',
        padding: '5%',
        borderRadius: 5,
        elevation: 4
    }
})