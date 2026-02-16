import React, { useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, StatusBar, ImageBackground } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Reseller from '../../../assets/reseller.svg';
import BinStoreOwner from '../../../assets/bin_store_owner.svg';
import FreePlan from '../../../assets/free_plan.svg';
import PremiumPlan from '../../../assets/premium_plan.svg';
import { baseGestureHandlerProps } from 'react-native-gesture-handler/lib/typescript/handlers/gestureHandlerCommon';
import { useNavigation } from '@react-navigation/native';


const { width, height } = Dimensions.get('window');
const SelectUserRole = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef(null);
    const navigation = useNavigation();

    const pagination = () => {
        return (
            <Pagination
                dotsLength={onboardingData.length}
                activeDotIndex={activeIndex}
                // containerStyle={{ paddingVertical: 8 }}
                dotStyle={{
                    width: 20,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#14BA9C',
                }}
                inactiveDotStyle={{
                    width: 10
                }}
                inactiveDotOpacity={0.4}
                inactiveDotScale={0.6}
            />
        );
    };

    const handleNext = () => {
        if (activeIndex < onboardingData.length - 1) {
            carouselRef.current.snapToNext();
        } else {
            navigation.replace('SignUp'); // Change 'HomeScreen' to your main screen
        }
    };

    const handlePrev = () => {
        if (activeIndex > 0) {
            carouselRef.current.snapToPrev();
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar translucent={true} backgroundColor="transparent" />
            <ImageBackground source={require('../../../assets/vector_1.png')} style={styles.vector}>
                <View style={styles.logoHeader}>
                    <Image source={require('../../../assets/logo.png')} style={styles.logo} />
                </View>
                <View style={{ flex: 1, top: '23%' }}>
                    <View style={{ height: hp(43), alignItems: 'center', paddingHorizontal: '5%', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <View style={{ height: hp(10), width: '100%' }}>
                            <Text style={{ fontFamily: 'Nunito-Bold', fontSize: hp(3.6), color: '#14BA9C' }}>Let's Get Started !</Text>
                            <Text style={{ fontFamily: 'Nunito-Regular', fontSize: hp(2), color: '#524B6B' }}>Choose your account type to tailor your experience.</Text>
                        </View>
                        <View style={{ height: hp(26), width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ height: hp(26), width: '48%', justifyContent: 'space-between' }}>
                                <LinearGradient
                                    colors={['#D6F0E7', '#E4F3EE']} // Gradient colors
                                    start={{ x: 0, y: 0 }} // Start position of the gradient
                                    end={{ x: 0, y: 1 }}   // End position of the gradient
                                    style={{ borderWidth: 1, height: hp(22), width: '100%', backgroundColor: 'pink', borderRadius: 15, borderColor: '#14BA9C', justifyContent: 'center', alignItems: 'center' }}
                                >
                                    <View>
                                        <Reseller />
                                    </View>
                                </LinearGradient>
                                <Text style={{ textAlign: 'center', fontFamily: 'Nunito-SemiBold', color: '#130160', fontSize: wp(4.2) }}>Reseller</Text>
                            </View>
                            <View style={{ height: hp(26), width: '48%', justifyContent: 'space-between' }}>
                                <LinearGradient
                                    colors={['#D6F0E7', '#E4F3EE']} // Gradient colors
                                    start={{ x: 0, y: 0 }} // Start position of the gradient
                                    end={{ x: 0, y: 1 }}   // End position of the gradient
                                    style={{ borderWidth: 1, height: hp(22), width: '100%', borderRadius: 15, borderColor: '#14BA9C', justifyContent: 'center', alignItems: 'center' }}
                                >
                                    <View>
                                        <BinStoreOwner />
                                    </View>
                                </LinearGradient>
                                <Text style={{ textAlign: 'center', fontFamily: 'Nunito-SemiBold', color: '#130160', fontSize: wp(4.2) }}>Reseller</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.gettingStarted} onPress={() => navigation.navigate('SelectPlan')}>
                    <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#fff', fontSize: hp(2.5) }}>Next</Text>
                </TouchableOpacity>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    slide: {
        marginTop: hp(5),
        height: hp(70),
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingHorizontal: '3%',
    },
    image: {
        width: wp(80),
        height: hp(24),
    },
    title: {
        fontSize: hp(4.2),
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'left',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: hp(2.1),
        color: '#666',
        textAlign: 'left',
    },
    arrowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '5%',
        width: '100%',
        bottom: '7%',
    },
    getStartedButton: {
        backgroundColor: '#000',
        padding: 15,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    getStartedText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoHeader: {
        position: 'absolute',
        zIndex: 1,
        alignItems: 'flex-end',
        paddingRight: '3%',
        height: hp(13),
        width: '100%',
    },
    logo: {
        marginTop: hp(7),
        width: wp(28),
        height: hp(5),
    },
    gettingStarted: {
        position: 'absolute',
        backgroundColor: '#130160',
        width: '95%',
        height: hp(7),
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        bottom: '5%'
    },
    vector: {
        flex: 1,
        width: wp(100),
        height: hp(100),
    },
});

export default SelectUserRole;
