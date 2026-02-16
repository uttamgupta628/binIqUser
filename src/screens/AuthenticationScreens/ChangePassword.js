import { Dimensions, ImageBackground, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import React, { useState, useEffect } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { authAPI, userAPI, getAuthToken } from '../../api/apiService';

const { width, height } = Dimensions.get('window')

const ChangePassword = () => {
    const navigation = useNavigation();
    const route = useRoute();
    
    // Get parameters from navigation - only used for forgot password flow
    const { email, isResetFlow } = route.params || {};
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const showAlert = (title, message, onPress = null) => {
        Alert.alert(title, message, [{ text: 'OK', onPress: onPress }]);
    };

    const handleSubmit = async () => {
        console.log('🚀 Password Update Attempt');
        console.log('   isResetFlow:', isResetFlow);
        console.log('   email:', email);
        
        // Validation
        if (!isResetFlow && !currentPassword.trim()) {
            showAlert('Error', 'Please enter your current password');
            return;
        }

        if (!newPassword.trim()) {
            showAlert('Error', 'Please enter a new password');
            return;
        }

        if (!confirmPassword.trim()) {
            showAlert('Error', 'Please confirm your new password');
            return;
        }

        if (newPassword !== confirmPassword) {
            showAlert('Error', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            showAlert('Error', 'Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            let response;
            
            if (isResetFlow) {
                // FORGOT PASSWORD FLOW - needs email
                if (!email) {
                    showAlert('Error', 'Email not found. Please start the forgot password process again.');
                    setLoading(false);
                    return;
                }
                
                console.log('📧 Reset Password Flow');
                console.log('   Email:', email);
                console.log('   Payload:', {
                    email,
                    new_password: newPassword,
                    confirm_password: confirmPassword
                });
                
                response = await authAPI.resetPassword({
                    email: email,
                    new_password: newPassword,
                    confirm_password: confirmPassword
                });
                
                console.log('✅ Reset Response:', response);
                
                showAlert(
                    'Success',
                    'Password reset successfully! You can now login with your new password.',
                    () => navigation.navigate('Login')
                );
            } else {
                // LOGGED IN USER - CHANGE PASSWORD FLOW
                console.log('🔄 Change Password Flow (Logged In User)');
                console.log('   Payload:', {
                    old_password: '***',
                    new_password: '***'
                });
                
                // Your backend expects old_password and new_password
                response = await userAPI.changePassword({
                    old_password: currentPassword,
                    new_password: newPassword
                });
                
                console.log('✅ Change Response:', response);
                
                showAlert(
                    'Success',
                    'Password changed successfully!',
                    () => navigation.goBack()
                );
            }
        } catch (error) {
            console.error('❌ Password Update Error:');
            console.error('   Status:', error.status);
            console.error('   Message:', error.message);
            console.error('   Data:', error.data);
            console.error('   Full Error:', JSON.stringify(error, null, 2));
            
            let errorMessage = 'Failed to update password. ';
            
            // Handle specific error cases
            if (error.status === 400) {
                // Bad request - validation error
                if (error.data?.errors) {
                    const errors = error.data.errors;
                    if (Array.isArray(errors) && errors.length > 0) {
                        // Extract error messages
                        errorMessage = errors.map(e => e.msg || e.message).join('\n');
                    } else {
                        errorMessage = error.data.message || 'Invalid input data';
                    }
                } else if (error.data?.message) {
                    errorMessage = error.data.message;
                } else {
                    errorMessage = 'Validation error. Please check your input.';
                }
            } else if (error.status === 401) {
                // Unauthorized - wrong current password or not logged in
                errorMessage = 'Current password is incorrect or session expired. Please try again.';
            } else if (error.status === 404) {
                // User not found
                errorMessage = 'User not found. Please login again.';
            } else if (error.message === 'Request timeout') {
                errorMessage = 'Request timeout. Please try again.';
            } else if (error.message === 'Network request failed') {
                errorMessage = 'Network error. Please check your connection.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            showAlert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Determine screen mode
    const screenTitle = isResetFlow ? 'Reset Password' : 'Change Password';

    return (
        <ScrollView style={styles.container}>
            <StatusBar translucent={true} backgroundColor={'transparent'} />
            <ImageBackground source={require('../../../assets/vector_1.png')} style={styles.vector}>
                <View style={styles.header}>
                    <View style={styles.headerChild}>
                        <Pressable onPress={() => navigation.goBack()}>
                            <MaterialIcons name='arrow-back-ios' color={'#0D0D26'} size={25} />
                        </Pressable>
                        <Text style={styles.headerText}>{screenTitle}</Text>
                    </View>
                </View>

                <View style={{ padding: '5%' }}>
                    {/* Show email if in reset mode */}
                    {isResetFlow && email && (
                        <View style={styles.infoBox}>
                            <Text style={styles.infoText}>
                                Resetting password for:
                            </Text>
                            <Text style={styles.emailText}>{email}</Text>
                        </View>
                    )}

                    {/* Current Password - only for logged-in users changing password */}
                    {!isResetFlow && (
                        <>
                            <Text style={styles.label}>Current Password</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    placeholder='Enter current password'
                                    style={styles.input}
                                    placeholderTextColor={'gray'}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    secureTextEntry={!showCurrentPassword}
                                    editable={!loading}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity 
                                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <MaterialIcons 
                                        name={showCurrentPassword ? 'visibility' : 'visibility-off'} 
                                        size={24} 
                                        color="#524B6B" 
                                    />
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* New Password */}
                    <Text style={styles.label}>New Password</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder='Enter new password'
                            style={styles.input}
                            placeholderTextColor={'gray'}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry={!showNewPassword}
                            editable={!loading}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity 
                            onPress={() => setShowNewPassword(!showNewPassword)}
                            style={styles.eyeIcon}
                        >
                            <MaterialIcons 
                                name={showNewPassword ? 'visibility' : 'visibility-off'} 
                                size={24} 
                                color="#524B6B" 
                            />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.helperText}>
                        Must be at least 6 characters
                    </Text>

                    {/* Confirm Password */}
                    <Text style={styles.label}>Confirm New Password</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder='Confirm new password'
                            style={styles.input}
                            placeholderTextColor={'gray'}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            editable={!loading}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity 
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={styles.eyeIcon}
                        >
                            <MaterialIcons 
                                name={showConfirmPassword ? 'visibility' : 'visibility-off'} 
                                size={24} 
                                color="#524B6B" 
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity 
                    style={[styles.gettingStarted, loading && styles.buttonDisabled]} 
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <View style={{ alignItems: 'center' }}>
                            <ActivityIndicator color="#fff" size="small" />
                            <Text style={{ color: '#fff', fontSize: 12, marginTop: 5, fontFamily: 'Nunito-Regular' }}>
                                Updating password...
                            </Text>
                        </View>
                    ) : (
                        <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#fff', fontSize: hp(2.5) }}>
                            {isResetFlow ? 'Reset Password' : 'Change Password'}
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Forgot Password Link - only show for logged-in users */}
                {!isResetFlow && (
                    <TouchableOpacity
                        style={styles.forgotPasswordLink}
                        onPress={() => navigation.navigate('ForgotPassword')}>
                        <Text style={styles.forgotPasswordText}>
                            Forgot your current password?
                        </Text>
                    </TouchableOpacity>
                )}
            </ImageBackground>
        </ScrollView>
    )
}

export default ChangePassword

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
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
        width: wp(61),
        justifyContent: 'space-between'
    },
    headerText: {
        fontFamily: 'Nunito-Bold',
        fontSize: hp(3),
        textAlign: 'left',
        color: '#0D0140'
    },
    vector: {
        flex: 1,
        width: wp(100),
        minHeight: hp(100),
    },
    infoBox: {
        backgroundColor: '#E3F2FD',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#130160',
    },
    infoText: {
        fontFamily: 'Nunito-Regular',
        fontSize: hp(1.8),
        color: '#666',
    },
    emailText: {
        fontFamily: 'Nunito-Bold',
        fontSize: hp(2),
        color: '#130160',
        marginTop: 4,
    },
    label: {
        color: 'black',
        fontFamily: 'Nunito-SemiBold',
        fontSize: hp(2.2),
        marginTop: '3%'
    },
    inputContainer: {
        backgroundColor: '#fff',
        width: '100%',
        height: hp(7.5),
        alignSelf: 'center',
        borderRadius: 8,
        marginVertical: '2%',
        paddingHorizontal: '5%',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0.4,
        borderColor: '#524B6B'
    },
    input: {
        flex: 1,
        fontFamily: 'Nunito-Regular',
        color: '#000',
        fontSize: hp(2.2)
    },
    eyeIcon: {
        padding: 5
    },
    helperText: {
        fontFamily: 'Nunito-Regular',
        fontSize: hp(1.7),
        color: '#666',
        marginTop: -8,
        marginBottom: 8,
    },
    gettingStarted: {
        backgroundColor: '#130160',
        width: '90%',
        height: hp(7),
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: 20,
    },
    buttonDisabled: {
        opacity: 0.6
    },
    forgotPasswordLink: {
        alignItems: 'center',
        marginTop: 20,
        padding: 10,
    },
    forgotPasswordText: {
        fontFamily: 'Nunito-SemiBold',
        fontSize: hp(1.8),
        color: '#130160',
        textDecorationLine: 'underline',
    },
});