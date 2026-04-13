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

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }
    setLoading(true);
    try {
      const loginData = {
        email: formData.email,
        password: formData.password,
        role: 2,
      };
      const response = await authAPI.login(loginData);
      if (response.token) {
        await AsyncStorage.setItem('authToken', response.token);
      }
      if (response.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));
      }
      if (response.user_id) {
        await AsyncStorage.setItem('userId', response.user_id);
      }
      if (response.verified === false) {
        Alert.alert(
          'Email Verification Required',
          'Please verify your email to continue.',
          [{
            text: 'OK',
            onPress: () => navigation.navigate('VerificationScreen', {
              email: formData.email,
              userId: response.user_id,
            }),
          }],
        );
      } else {
        navigation.replace('HomeNavigataor');
      }
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      const status = error.status || error.response?.status;
      if (status === 400) {
        errorMessage = 'Invalid email or password.';
      } else if (status === 403) {
        errorMessage = 'Access denied. This app is for resellers only.';
      } else if (status === 404) {
        errorMessage = 'Account not found. Please register first.';
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

        {/* Top spacer */}
        <View style={{height: hp(6)}} />

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Welcome Back heading */}
        <View style={styles.headingContainer}>
          <Text style={styles.welcomeText}>WELCOME BACK</Text>
        </View>

        {/* Form */}
        <View style={{paddingHorizontal: '5%', marginTop: hp(1)}}>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View
            style={[
              styles.inputWrapper,
              {borderColor: errors.email ? '#FF0000' : '#524B6B'},
            ]}>
            <TextInput
              placeholder="johndoe@gmail.com"
              style={styles.input}
              placeholderTextColor={'gray'}
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={text => handleInputChange('email', text.toLowerCase())}
            />
          </View>
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View
            style={[
              styles.inputWrapper,
              {borderColor: errors.password ? '#FF0000' : '#524B6B'},
            ]}>
            <TextInput
              placeholder="Enter your password"
              style={styles.input}
              placeholderTextColor={'gray'}
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={text => handleInputChange('password', text)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(prev => !prev)}
              style={styles.eyeIcon}>
              <Text style={{fontSize: 18}}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
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
            <Text style={styles.loginBtnText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity
          style={{justifyContent: 'center', marginVertical: '5%'}}
          onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotText}>Forgot Password ?</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.line} />
        </View>

        {/* Google Sign In */}
        <View style={styles.socialRow}>
          <TouchableOpacity
            style={styles.socialBtn}
            onPress={() =>
              Alert.alert('Coming Soon', 'Google Sign In will be available soon')
            }>
            <Image
              source={require('../../../assets/google.jpg')}
              style={{width: 45, height: 45}}
            />
          </TouchableOpacity>
        </View>

        {/* Register Link */}
        <View style={styles.registerRow}>
          <Text style={styles.registerPrompt}>Haven't an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SelectPlan')}>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>

        <View style={{height: hp(4)}} />
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
  vector: {
    flex: 1,
    width: wp(100),
    minHeight: hp(100),
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(1.5),
  },
  logo: {
    width: wp(45),
    height: hp(10),
  },
  headingContainer: {
    alignItems: 'center',
    marginBottom: hp(1),
  },
  welcomeText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(3.8),
    color: '#14BA9C',
  },
  label: {
    color: 'black',
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(2.2),
    marginTop: '3%',
  },
  inputWrapper: {
    backgroundColor: '#fff',
    width: '100%',
    height: hp(7.5),
    borderRadius: 8,
    marginVertical: '2%',
    paddingHorizontal: '5%',
    justifyContent: 'center',
    borderWidth: 0.4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontFamily: 'Nunito-Regular',
    color: '#000',
    fontSize: hp(2.2),
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: '#FF0000',
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.8),
    marginTop: -5,
    marginLeft: 5,
  },
  gettingStarted: {
    backgroundColor: '#130160',
    width: '90%',
    height: hp(7),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: hp(1),
  },
  loginBtnText: {
    fontFamily: 'Nunito-SemiBold',
    color: '#fff',
    fontSize: hp(2.5),
  },
  forgotText: {
    color: '#356899',
    fontSize: 17,
    fontFamily: 'Nunito-SemiBold',
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: '5%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#C0C0C0',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#A9A9A9',
  },
  socialRow: {
    marginHorizontal: '5%',
    marginVertical: '5%',
    height: height * 0.08,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialBtn: {
    width: wp(17),
    height: '100%',
    backgroundColor: '#D9D9D93B',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: '2%',
  },
  registerRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: '2%',
  },
  registerPrompt: {
    fontSize: hp(2.3),
    color: '#AFB0B6',
    fontFamily: 'Nunito-SemiBold',
  },
  registerLink: {
    fontSize: hp(2.3),
    color: '#14BA9C',
    fontFamily: 'Nunito-SemiBold',
    textDecorationLine: 'underline',
  },
});