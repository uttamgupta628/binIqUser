import { Image, ImageBackground, Pressable, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useNavigation } from '@react-navigation/native'

const CourseDetails = () => {
    const navigation = useNavigation();
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
                            <Text style={styles.headerText}>Buy Pallets</Text>
                        </View>
                    </View>
                    <View style={styles.imgContainer}>
                        <Image source={require('../../../assets/tablet_img.png')} style={styles.tabImg} />
                        <View style={styles.imgCotent}>
                            <Text style={styles.imgContentTitle}>Buy Pallets</Text>
                            <View style={styles.review}>
                                <FontAwesome name='star' color={'#FFD700'} size={hp(2.4)} />
                                <FontAwesome name='star' color={'#FFD700'} size={hp(2.4)} />
                                <FontAwesome name='star' color={'#FFD700'} size={hp(2.4)} />
                                <FontAwesome name='star' color={'#FFD700'} size={hp(2.4)} />
                                <FontAwesome name='star' color={'#e6e6e6'} size={hp(2.4)} />
                                <Text style={{ fontFamily: 'Nunito-Bold', color: '#000', fontSize: hp(2) }}> 4.5/5.0</Text>
                            </View>
                            <View style={styles.tutDetails}>
                                <Text style={{ fontFamily: 'Nunito-Regular', fontSize: hp(1.8), color: '#0D0140' }}><Text style={{ color: '#14BA9C' }}>10</Text> Video{' '}•</Text>
                                <Text style={{ fontFamily: 'Nunito-Regular', fontSize: hp(1.8), color: '#0D0140' }}><Text style={{ color: '#14BA9C' }}>FULL</Text> PDF{' '}•</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.buyPalletsDetails}>
                        <Text style={{ fontFamily: 'Nunito-Bold', color: '#150B3D', fontSize: hp(2.3) }}>About Course</Text>
                        <Text style={{ fontFamily: 'Nunito-Regular', color: '#524B6B', fontSize: hp(2.1), marginVertical: '0.5%' }}>
                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem ...
                        </Text>
                        <View style={{ borderRadius: 6, width: '35%', height: hp(5.2), justifyContent: 'center', alignItems: 'center', backgroundColor: '#e3dcff', marginVertical: '3%' }}>
                            <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#0D0140', fontSize: hp(2.1) }}>Read more</Text>
                        </View>
                    </View>
                    <View style={{ marginBottom: hp(16) }}>
                        <View style={styles.buyPalletsDetails}>
                            <Text style={{ fontFamily: 'Nunito-Bold', color: '#150B3D', fontSize: hp(2.3), marginVertical: '2%' }}>Requirements</Text>
                        </View>
                        <View style={styles.pointContainer}>
                            <Text style={styles.bullet}>{'\u2022'}</Text>
                            <Text style={styles.pointText}>
                                Sed ut perspiciatis unde omnis iste natus error sit.
                            </Text>
                        </View>
                        <View style={styles.pointContainer}>
                            <Text style={styles.bullet}>{'\u2022'}</Text>
                            <Text style={styles.pointText}>
                                Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur & adipisci velit.
                            </Text>
                        </View>
                        <View style={styles.pointContainer}>
                            <Text style={styles.bullet}>{'\u2022'}</Text>
                            <Text style={styles.pointText}>
                                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.
                            </Text>
                        </View>
                        <View style={styles.pointContainer}>
                            <Text style={styles.bullet}>{'\u2022'}</Text>
                            <Text style={styles.pointText}>
                                Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.
                            </Text>
                        </View>
                    </View>
                </ImageBackground>
            </ScrollView>
            <View style={styles.enrollNowContainer}>
                <Pressable style={styles.button} onPress={() => navigation.navigate('Tutorials')}>
                    <Text style={styles.buttonText}>ENROLL NOW</Text>
                </Pressable>
            </View>
        </>

    )
}

export default CourseDetails

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