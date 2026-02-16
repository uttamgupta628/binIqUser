import { Dimensions, ImageBackground, StatusBar, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { TextInput } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'

const { width, height } = Dimensions.get('window')
const ReferFriend = () => {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <StatusBar translucent={true} backgroundColor={'transparent'} />
            <View style={styles.header}>
                <Text style={{ color: '#fff', fontFamily: 'Nunito-SemiBold', fontSize: hp(2.4), textAlign: 'center' }}>Refer A Friend And You’ll Both Be Rewarded!</Text>
            </View>
            <View style={styles.middleContainer}>
                <Image source={require('../../../assets/refer_friend.png')} style={{ width: '50%', height: '100%' }} />
            </View>
            <View style={{ width: wp(100), paddingHorizontal: '5%' }}>
                <View>
                    <Text style={{ color: '#524B6B', fontSize: hp(2.1) }}>
                        Register below to get your referral link and start referring friends.{'\n'}{'\n'}
                        Once your friend claims their offer, you'll both be rewarded!
                    </Text>
                </View>
                <View style={styles.footerContainer}>
                    <Text style={{ color: '#130160', fontWeight: '500', fontSize: hp(3.1), textAlign: 'center' }}>Get Your Referral Link</Text>
                    <View>
                        <TextInput
                            placeholder='First Name'
                            placeholderTextColor={'#000'}
                            style={{ width: '100%', backgroundColor: '#fff', paddingHorizontal: '5%', borderRadius: 8, marginVertical: '2%', height: hp(5), color: '#000', fontSize: hp(2.1) }}
                        />
                        <TextInput
                            placeholder='First Name'
                            placeholderTextColor={'#000'}
                            style={{ width: '100%', backgroundColor: '#fff', paddingHorizontal: '5%', borderRadius: 8, marginVertical: '2%', height: hp(5), color: '#000', fontSize: hp(2.1) }}
                        />
                        <TextInput
                            placeholder='First Name'
                            placeholderTextColor={'#000'}
                            style={{ width: '100%', backgroundColor: '#fff', paddingHorizontal: '5%', borderRadius: 8, marginVertical: '2%', height: hp(5), color: '#000', fontSize: hp(2.1) }}
                        />
                    </View>
                    <TouchableOpacity style={styles.gettingStarted} onPress={() => navigation.navigate('ShareReferLink')}>
                    <Text style={{ fontFamily: 'Nunito-Regular', color: '#fff', fontSize: hp(2.5) }}>Get Referral Link</Text>
                </TouchableOpacity>
                </View>
            </View>
            <ImageBackground source={require('../../../assets/vector_2.png')} style={styles.vector2} />
        </View>
    )
}

export default ReferFriend

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
        height: hp(34),
        marginVertical: '5%'
    },
    gettingStarted: {
        backgroundColor: '#130160',
        width: '100%',
        height: hp(6.4),
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        margin: '4%'
    },
})