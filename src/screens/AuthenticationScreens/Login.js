import {
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authAPI} from '../../api/apiService'; 

const {width, height} = Dimensions.get('window');

const Login = () => {
  const navigation = useNavigation();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = async () => {
    // Validate form
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Prepare login data
      const loginData = {
        email: formData.email,
        password: formData.password,
      };

      console.log('Attempting login:', {email: loginData.email});

      // Call login API
      const response = await authAPI.login(loginData);

      console.log('Login successful:', response);

      // Store user data in AsyncStorage
      if (response.token) {
        await AsyncStorage.setItem('authToken', response.token);
      }
      if (response.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));
      }
      if (response.user_id) {
        await AsyncStorage.setItem('userId', response.user_id);
      }

      // Navigate based on user role or verification status
      if (response.verified === false) {
        // If user is not verified, navigate to verification screen
        Alert.alert(
          'Email Verification Required',
          'Please verify your email to continue.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('VerificationScreen', {
                  email: formData.email,
                  userId: response.user_id,
                });
              },
            },
          ]
        );
      } else {
        // Navigate to main app
        Alert.alert('Success!', 'Welcome back!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.replace('HomeNavigataor');
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Login error:', error);

      // Handle specific error messages
      let errorMessage = 'Login failed. Please try again.';

      if (error.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.status === 404) {
        errorMessage = 'Account not found. Please register first.';
      } else if (error.status === 403) {
        errorMessage = 'Account is not active. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}>
        <View style={{height: hp(7)}} />
        <View style={{height: hp(15), width: wp(100), padding: '5%'}}>
          <Text
            style={{
              fontFamily: 'Nunito-Bold',
              fontSize: hp(3.6),
              color: '#14BA9C',
            }}>
            Welcome Back
          </Text>
          <Text
            style={{
              fontFamily: 'Nunito-Regular',
              fontSize: hp(2),
              color: '#524B6B',
              marginTop: '5%',
            }}>
            Great to see you-{'\n'}
            Let's pick up where you left off!
          </Text>
        </View>

        <View style={{padding: '5%'}}>
          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View
            style={{
              backgroundColor: '#fff',
              width: '100%',
              height: hp(7.5),
              alignSelf: 'center',
              borderRadius: 8,
              marginVertical: '2%',
              paddingHorizontal: '5%',
              justifyContent: 'center',
              borderWidth: 0.4,
              borderColor: errors.email ? '#FF0000' : '#524B6B',
            }}>
            <TextInput
              placeholder="johndoe@gmail.com"
              style={{
                fontFamily: 'Nunito-Regular',
                color: '#000',
                fontSize: hp(2.2),
              }}
              placeholderTextColor={'gray'}
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={text => handleInputChange('email', text.toLowerCase())}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View
            style={{
              backgroundColor: '#fff',
              width: '100%',
              height: hp(7.5),
              alignSelf: 'center',
              borderRadius: 8,
              marginVertical: '2%',
              paddingHorizontal: '5%',
              justifyContent: 'center',
              borderWidth: 0.4,
              borderColor: errors.password ? '#FF0000' : '#524B6B',
            }}>
            <TextInput
              placeholder="Enter your password"
              style={{
                fontFamily: 'Nunito-Regular',
                color: '#000',
                fontSize: hp(2.2),
              }}
              placeholderTextColor={'gray'}
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={text => handleInputChange('password', text)}
            />
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.gettingStarted}
          onPress={handleLogin}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text
              style={{
                fontFamily: 'Nunito-SemiBold',
                color: '#fff',
                fontSize: hp(2.5),
              }}>
              Login
            </Text>
          )}
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity
          style={{
            backgroundColor: 'transparent',
            justifyContent: 'center',
            marginVertical: '5%',
          }}
          onPress={() => navigation.navigate('ForgotPassword')}>
          <Text
            style={{
              color: '#356899',
              fontSize: 17,
              fontFamily: 'Nunito-SemiBold',
              textAlign: 'center',
            }}>
            Forgot Password ?
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: '5%',
          }}>
          <View style={styles.line} />
          <Text style={styles.text}>Or continue with</Text>
          <View style={styles.line} />
        </View>

        {/* Social Login */}
        <View
          style={{
            marginHorizontal: '5%',
            marginVertical: '5%',
            height: height * 0.08,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
          <TouchableOpacity
            style={{
              width: wp(17),
              height: '100%',
              backgroundColor: '#D9D9D93B',
              borderRadius: 50,
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: '2%',
            }}
            onPress={() => {
              // TODO: Implement Google Sign In
              Alert.alert('Coming Soon', 'Google Sign In will be available soon');
            }}>
            <Image
              source={require('../../../assets/google.jpg')}
              style={{width: 45, height: 45}}
            />
          </TouchableOpacity>
        </View>

        {/* Register Link */}
        <View style={{flexDirection: 'row', alignSelf: 'center', marginTop: '2%'}}>
          <Text
            style={{
              fontSize: hp(2.3),
              color: '#AFB0B6',
              textAlign: 'center',
              fontFamily: 'Nunito-SemiBold',
            }}>
            Haven't an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SelectPlan')}>
            <Text
              style={{
                fontSize: hp(2.3),
                color: '#14BA9C',
                textAlign: 'center',
                fontFamily: 'Nunito-SemiBold',
                textDecorationLine: 'underline',
              }}>
              Register
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    height: hp(100),
  },
  logoText: {
    fontFamily: 'Nunito-SemiBold',
    color: '#000',
    fontSize: hp(2.5),
  },
  cityVector: {
    position: 'absolute',
    width: wp(100),
    bottom: 0,
  },
  label: {
    color: 'black',
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(2.2),
    marginTop: '3%',
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
    backgroundColor: '#C0C0C0',
  },
  text: {
    marginHorizontal: 10,
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#A9A9A9',
  },
  errorText: {
    color: '#FF0000',
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.8),
    marginTop: -5,
    marginLeft: 5,
  },
});