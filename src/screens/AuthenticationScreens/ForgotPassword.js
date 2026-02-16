import { Dimensions, Image, ImageBackground, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import React, { useRef, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import PhoneInput from 'react-native-phone-number-input';
import { authAPI } from '../../api/apiService';

const { width, height } = Dimensions.get('window')

const ForgotPassword = () => {
    const navigation = useNavigation();
    const [isEmailSelected, setIsEmailSelected] = useState(true);
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [formattedValue, setFormattedValue] = useState('');
    const [loading, setLoading] = useState(false);
    const phoneInput = useRef(null);

    const showAlert = (title, message, onPress = null) => {
        Alert.alert(title, message, [{ text: 'OK', onPress: onPress }]);
    };

    const handleSendCode = async () => {
        // Validate input
        if (isEmailSelected) {
            if (!email || !email.trim()) {
                showAlert('Error', 'Please enter your email address');
                return;
            }
            
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showAlert('Error', 'Please enter a valid email address');
                return;
            }
        } else {
            if (!phoneNumber || !phoneNumber.trim()) {
                showAlert('Error', 'Please enter your phone number');
                return;
            }
        }

        setLoading(true);

        try {
            console.log('Sending OTP request to backend...');
            console.log('Email:', email);
            
            const response = await authAPI.forgotPassword({ email });
            
            console.log('Response received:', response);
            
            if (response.message === 'OTP sent to email') {
                showAlert(
                    'Success', 
                    'Verification code has been sent to your email',
                    () => {
                        navigation.navigate('OTPEntry', { 
                            email: email,
                            isEmail: isEmailSelected 
                        });
                    }
                );
            } else {
                showAlert('Error', response.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Send Code Error:', error);
            
            // More detailed error handling
            let errorMessage = 'Failed to send OTP. ';
            
            if (error.message === 'Request timeout') {
                errorMessage = 'Connection timeout. Please check:\n\n1. Backend server is running\n2. Network connection\n3. Server IP is accessible';
            } else if (error.message === 'Network request failed') {
                errorMessage = 'Network error. Please check:\n\n1. Your internet connection\n2. Backend server is running\n3. Server IP: 10.218.181.74:3001';
            } else if (error.status === 404) {
                errorMessage = 'Email not found in system';
            } else if (error.status === 500) {
                errorMessage = 'Server error. Please try again later';
            } else if (error.message) {
                errorMessage = error.message;
            } else {
                errorMessage = 'An unexpected error occurred';
            }
            
            showAlert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <StatusBar translucent={true} backgroundColor={'transparent'} />
            <ImageBackground source={require('../../../assets/vector_1.png')} style={styles.vector}>
                <View style={{ height: hp(7) }} />
                <View style={{ height: hp(15), width: wp(100), padding: '5%' }}>
                    <Text style={{ fontFamily: 'Nunito-Bold', fontSize: hp(3.6), color: '#14BA9C' }}>Forgot Password?</Text>
                    <Text style={{ fontFamily: 'Nunito-Regular', fontSize: hp(2), color: '#524B6B', marginTop: '5%' }}>
                        Enter your email or phone number, we will send you verification code.
                    </Text>
                </View>
                <View style={{ alignItems: 'center', marginVertical: '10%' }}>
                    <Image source={require('../../../assets/forgot_pass.png')} style={{ width: wp(48), height: hp(18) }} />
                </View>
            </ImageBackground>

            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.toggleButton, isEmailSelected && styles.activeToggle]}
                    onPress={() => setIsEmailSelected(true)}
                >
                    <Text style={styles.toggleText}>E-mail</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, !isEmailSelected && styles.activeToggle]}
                    onPress={() => setIsEmailSelected(false)}
                >
                    <Text style={styles.toggleText}>Mobile Number</Text>
                </TouchableOpacity>
            </View>

            {isEmailSelected ? (
                <View style={{ padding: '5%' }}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder='johndoe@gmail.com'
                            style={styles.input}
                            placeholderTextColor={'gray'}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </View>
                </View>
            ) : (
                <View style={{ padding: '5%', flexDirection: 'row' }}>
                    <View style={styles.phoneInputContainer}>
                        <PhoneInput
                            ref={phoneInput}
                            defaultValue={phoneNumber}
                            defaultCode="IN"
                            layout="first"
                            onChangeText={(text) => setPhoneNumber(text)}
                            onChangeFormattedText={(text) => setFormattedValue(text)}
                            textContainerStyle={{ backgroundColor: 'transparent' }}
                            placeholder='Phone Number'
                            disabled={loading}
                        />
                    </View>
                </View>
            )}

            <TouchableOpacity 
                style={[styles.gettingStarted, loading && styles.buttonDisabled]} 
                onPress={handleSendCode}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#fff', fontSize: hp(2.5) }}>
                        Send Code
                    </Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    )
}

export default ForgotPassword

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
    inputContainer: {
        backgroundColor: '#fff',
        width: '100%',
        height: hp(7.5),
        alignSelf: 'center',
        borderRadius: 8,
        marginVertical: '2%',
        paddingHorizontal: '5%',
        justifyContent: 'center',
        borderWidth: 0.4,
        borderColor: '#524B6B'
    },
    input: {
        fontFamily: 'Nunito-Regular',
        color: '#000',
        fontSize: hp(2.2)
    },
    phoneInputContainer: {
        backgroundColor: '#fff',
        width: '100%',
        height: hp(9),
        alignSelf: 'center',
        borderRadius: 8,
        paddingHorizontal: '5%',
        justifyContent: 'center',
        borderWidth: 0.4,
        borderColor: '#524B6B'
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
    buttonDisabled: {
        opacity: 0.6
    }
});