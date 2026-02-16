import { Dimensions, Image, ImageBackground, StatusBar, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import React, { useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native';
import OTPTextView from 'react-native-otp-textinput';
import { authAPI } from '../../api/apiService';

const { width, height } = Dimensions.get('window')

const OTPEntry = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Get email from navigation params
    const { email, isEmail } = route.params || {};

    const showAlert = (title, message, onPress = null) => {
        Alert.alert(title, message, [{ text: 'OK', onPress: onPress }]);
    };

    const handleSubmit = async () => {
        // Validate OTP - CHANGED TO 6 DIGITS
        if (!otp || otp.length !== 6) {
            showAlert('Error', 'Please enter the complete 6-digit OTP');
            return;
        }

        if (!email) {
            showAlert('Error', 'Email not found. Please go back and try again.');
            return;
        }

        setLoading(true);

        try {
            console.log('Verifying OTP...');
            console.log('Email:', email);
            console.log('OTP:', otp);
            
            const response = await authAPI.verifyOTP({ email, otp });
            
            console.log('Verify OTP Response:', response);
            
            if (response.message === 'OTP verified successfully') {
                showAlert(
                    'Success',
                    'OTP verified successfully!',
                    () => {
                        navigation.navigate('ChangePassword', { 
                            email: email,
                            otp: otp,
                            isResetFlow: true 
                        });
                    }
                );
            } else {
                showAlert('Error', response.message || 'Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.error('Verify OTP Error:', error);
            showAlert('Error', error.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!email) {
            showAlert('Error', 'Email not found. Please go back and try again.');
            return;
        }

        setLoading(true);

        try {
            console.log('Resending OTP to:', email);
            
            const response = await authAPI.forgotPassword({ email });
            
            if (response.message === 'OTP sent to email') {
                showAlert('Success', 'New OTP has been sent to your email');
                setOtp('');
            } else {
                showAlert('Error', response.message || 'Failed to resend OTP');
            }
        } catch (error) {
            console.error('Resend OTP Error:', error);
            showAlert('Error', error.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar translucent={true} backgroundColor={'transparent'} />
            <ImageBackground source={require('../../../assets/vector_1.png')} style={styles.vector}>
                <View style={{ height: hp(7) }} />
                <View style={{ height: hp(15), width: wp(100), padding: '5%' }}>
                    <Text style={{ fontFamily: 'Nunito-Bold', fontSize: hp(3.6), color: '#14BA9C' }}>
                        Enter OTP
                    </Text>
                    <Text style={{ fontFamily: 'Nunito-Regular', fontSize: hp(2), color: '#524B6B', marginTop: '5%' }}>
                        Verification code has been sent to {email || 'your email'}, Please verify!
                    </Text>
                </View>
                <View style={{ width: '90%', height: hp(7.5), alignSelf: 'center', borderRadius: 8, marginVertical: '10%' }}>
                    <OTPTextView
                        inputCount={6}
                        inputCellLength={1}
                        tintColor={'#130160'}
                        offTintColor={'gray'}
                        textInputStyle={{ 
                            borderWidth: 0.4, 
                            borderBottomWidth: 1, 
                            backgroundColor: '#fff', 
                            borderRadius: 5,
                            color: '#000',
                            fontFamily: 'Nunito-SemiBold'
                        }}
                        handleTextChange={setOtp}
                        editable={!loading}
                    />
                </View>

                <TouchableOpacity 
                    style={styles.resendButton}
                    onPress={handleResendOTP}
                    disabled={loading}
                >
                    <Text style={styles.resendText}>
                        Didn't receive code? Resend
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.gettingStarted, loading && styles.buttonDisabled]} 
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#fff', fontSize: hp(2.5) }}>
                            Submit
                        </Text>
                    )}
                </TouchableOpacity>
            </ImageBackground>
            <ImageBackground source={require('../../../assets/vector_2.png')} style={styles.vector2} />
        </View>
    )
}

export default OTPEntry

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    vector: {
        flex: 1,
        width: wp(100),
        height: hp(50),
    },
    gettingStarted: {
        backgroundColor: '#130160',
        width: '90%',
        height: hp(7),
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    buttonDisabled: {
        opacity: 0.6
    },
    resendButton: {
        alignSelf: 'center',
        marginVertical: hp(2)
    },
    resendText: {
        fontFamily: 'Nunito-SemiBold',
        fontSize: hp(1.8),
        color: '#130160',
        textDecorationLine: 'underline'
    },
    vector2: {
        flex: 1,
        width: wp(100),
        height: height * 0.5,
        position: 'absolute',
        bottom: 0,
        zIndex: -1
    },
});