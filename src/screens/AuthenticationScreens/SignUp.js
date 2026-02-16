import {
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

const SignUp = ({route}) => {
  const navigation = useNavigation();
  
  // Get plan details from route params (from SelectPlan screen)
  const {selectedPlan} = route?.params || {};
  const isPremiumPlan = selectedPlan === 'premium';

  // Form state - Basic fields (always required)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    // Premium plan additional fields
    dob: '',
    gender: '',
    phone_number: '',
    address: '',
    card_number: '',
    cardholder_name: '',
    expiry_month: '',
    expiry_year: '',
    cvc: '',
    expertise_level: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

    // Basic fields validation (always required)
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    // Premium plan additional validations
    if (isPremiumPlan) {
      // Date of birth
      if (!formData.dob.trim()) {
        newErrors.dob = 'Date of birth is required';
      }

      // Gender
      if (!formData.gender) {
        newErrors.gender = 'Gender is required';
      }

      // Phone number
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!formData.phone_number.trim()) {
        newErrors.phone_number = 'Phone number is required';
      } else if (!phoneRegex.test(formData.phone_number)) {
        newErrors.phone_number = 'Please enter a valid phone number';
      }

      // Address
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      }

      // Card information
      const cardNumberRegex = /^\d{16}$/;
      if (!formData.card_number.trim()) {
        newErrors.card_number = 'Card number is required';
      } else if (!cardNumberRegex.test(formData.card_number.replace(/\s/g, ''))) {
        newErrors.card_number = 'Card number must be 16 digits';
      }

      if (!formData.cardholder_name.trim()) {
        newErrors.cardholder_name = 'Cardholder name is required';
      }

      const monthRegex = /^(0[1-9]|1[0-2])$/;
      if (!formData.expiry_month.trim()) {
        newErrors.expiry_month = 'Expiry month is required';
      } else if (!monthRegex.test(formData.expiry_month)) {
        newErrors.expiry_month = 'Valid month (01-12) required';
      }

      const yearRegex = /^\d{4}$/;
      if (!formData.expiry_year.trim()) {
        newErrors.expiry_year = 'Expiry year is required';
      } else if (!yearRegex.test(formData.expiry_year)) {
        newErrors.expiry_year = 'Valid 4-digit year required';
      }

      const cvcRegex = /^\d{3,4}$/;
      if (!formData.cvc.trim()) {
        newErrors.cvc = 'CVC is required';
      } else if (!cvcRegex.test(formData.cvc)) {
        newErrors.cvc = 'CVC must be 3-4 digits';
      }

      // Expertise level
      if (!formData.expertise_level) {
        newErrors.expertise_level = 'Expertise level is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle sign up
  const handleSignUp = async () => {
    // Validate form
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Prepare registration data
      const registrationData = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        role: 2, // Role 2 = Reseller
      };

      // Add premium plan fields if premium is selected
      if (isPremiumPlan) {
        registrationData.dob = formData.dob;
        registrationData.gender = formData.gender;
        registrationData.phone_number = formData.phone_number;
        registrationData.address = formData.address;
        registrationData.card_information = {
          card_number: formData.card_number.replace(/\s/g, ''),
          cardholder_name: formData.cardholder_name,
          expiry_month: formData.expiry_month,
          expiry_year: formData.expiry_year,
          cvc: formData.cvc,
        };
        registrationData.expertise_level = formData.expertise_level;
      }

      // Add selected plan to the data
      registrationData.selected_plan = selectedPlan;

      console.log('Sending registration data:', registrationData);

      // Call registration API
      const response = await authAPI.register(registrationData);

      console.log('Registration successful:', response);

      // Show success message
      Alert.alert(
        'Success!',
        'Your account has been created successfully. Please login to continue.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate based on plan selection
              if (isPremiumPlan) {
                // For premium, go to PayWall or Quiz
                navigation.navigate('QuizScreen', {
                  userData: response,
                  selectedPlan: selectedPlan,
                });
              } else {
                // For free, go directly to Quiz or Main app
                navigation.navigate('QuizScreen', {
                  userData: response,
                  selectedPlan: selectedPlan,
                });
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Registration error:', error);

      // Handle specific error messages
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.status === 400) {
        errorMessage = error.message || 'Invalid registration data';
      } else if (error.status === 409) {
        errorMessage = 'This email is already registered';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Registration Failed', errorMessage);
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
            Start My BinIQ Profile
          </Text>
          <Text
            style={{
              fontFamily: 'Nunito-Regular',
              fontSize: hp(2),
              color: '#524B6B',
              marginTop: '5%',
            }}>
            Register your account today and gain access to comprehensive tools
            and resources designed to optimize your reselling journey.
          </Text>
        </View>

        {/* Show selected plan */}
        {selectedPlan && (
          <View style={{paddingHorizontal: '5%', marginBottom: '3%'}}>
            {/* <View style={{
              backgroundColor: '#E4F3EE',
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#14BA9C',
            }}>
              <Text
                style={{
                  fontFamily: 'Nunito-SemiBold',
                  fontSize: hp(1.9),
                  color: '#14BA9C',
                  textAlign: 'center',
                }}>
                Selected Plan: {isPremiumPlan ? 'Premium Plan' : 'Free Plan'}
              </Text>
            </View> */}
          </View>
        )}

        <View style={{padding: '5%'}}>
          {/* ========== BASIC FIELDS (ALWAYS REQUIRED) ========== */}
          
          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
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
              borderColor: errors.full_name ? '#FF0000' : '#524B6B',
            }}>
            <TextInput
              placeholder="John Doe"
              style={{
                fontFamily: 'Nunito-Regular',
                color: '#000',
                fontSize: hp(2.2),
              }}
              placeholderTextColor={'gray'}
              value={formData.full_name}
              onChangeText={text => handleInputChange('full_name', text)}
            />
          </View>
          {errors.full_name && (
            <Text style={styles.errorText}>{errors.full_name}</Text>
          )}

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
              secureTextEntry={true}
              value={formData.password}
              onChangeText={text => handleInputChange('password', text)}
            />
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
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
              borderColor: errors.confirm_password ? '#FF0000' : '#524B6B',
            }}>
            <TextInput
              placeholder="Confirm your password"
              style={{
                fontFamily: 'Nunito-Regular',
                color: '#000',
                fontSize: hp(2.2),
              }}
              placeholderTextColor={'gray'}
              secureTextEntry={true}
              value={formData.confirm_password}
              onChangeText={text => handleInputChange('confirm_password', text)}
            />
          </View>
          {errors.confirm_password && (
            <Text style={styles.errorText}>{errors.confirm_password}</Text>
          )}

          {/* ========== PREMIUM PLAN ADDITIONAL FIELDS ========== */}
          {isPremiumPlan && (
            <>
              {/* Section Header */}
              <View style={{marginTop: '5%', marginBottom: '3%'}}>
                <Text
                  style={{
                    fontFamily: 'Nunito-Bold',
                    fontSize: hp(2.8),
                    color: '#14BA9C',
                  }}>
                  Additional Information
                </Text>
                <Text
                  style={{
                    fontFamily: 'Nunito-Regular',
                    fontSize: hp(1.8),
                    color: '#524B6B',
                    marginTop: '1%',
                  }}>
                  Required for Premium Plan
                </Text>
              </View>

              {/* Date of Birth */}
              <Text style={styles.label}>Date of Birth</Text>
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
                  borderColor: errors.dob ? '#FF0000' : '#524B6B',
                }}>
                <TextInput
                  placeholder="YYYY-MM-DD (e.g., 1990-01-15)"
                  style={{
                    fontFamily: 'Nunito-Regular',
                    color: '#000',
                    fontSize: hp(2.2),
                  }}
                  placeholderTextColor={'gray'}
                  value={formData.dob}
                  onChangeText={text => handleInputChange('dob', text)}
                />
              </View>
              {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

              {/* Gender */}
              <Text style={styles.label}>Gender</Text>
              <View style={{flexDirection: 'row', marginVertical: '2%', justifyContent: 'space-between'}}>
                {['male', 'female', 'other'].map(gender => (
                  <TouchableOpacity
                    key={gender}
                    style={{
                      flex: 1,
                      marginHorizontal: 5,
                      paddingVertical: 15,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: formData.gender === gender ? '#14BA9C' : '#524B6B',
                      backgroundColor: formData.gender === gender ? '#E4F3EE' : '#fff',
                      alignItems: 'center',
                    }}
                    onPress={() => handleInputChange('gender', gender)}>
                    <Text
                      style={{
                        fontFamily: 'Nunito-SemiBold',
                        color: formData.gender === gender ? '#14BA9C' : '#524B6B',
                        fontSize: hp(2),
                        textTransform: 'capitalize',
                      }}>
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

              {/* Phone Number */}
              <Text style={styles.label}>Phone Number</Text>
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
                  borderColor: errors.phone_number ? '#FF0000' : '#524B6B',
                }}>
                <TextInput
                  placeholder="+1234567890"
                  style={{
                    fontFamily: 'Nunito-Regular',
                    color: '#000',
                    fontSize: hp(2.2),
                  }}
                  placeholderTextColor={'gray'}
                  keyboardType="phone-pad"
                  value={formData.phone_number}
                  onChangeText={text => handleInputChange('phone_number', text)}
                />
              </View>
              {errors.phone_number && (
                <Text style={styles.errorText}>{errors.phone_number}</Text>
              )}

              {/* Address */}
              <Text style={styles.label}>Address</Text>
              <View
                style={{
                  backgroundColor: '#fff',
                  width: '100%',
                  height: hp(10),
                  alignSelf: 'center',
                  borderRadius: 8,
                  marginVertical: '2%',
                  paddingHorizontal: '5%',
                  paddingVertical: '3%',
                  borderWidth: 0.4,
                  borderColor: errors.address ? '#FF0000' : '#524B6B',
                }}>
                <TextInput
                  placeholder="Enter your full address"
                  style={{
                    fontFamily: 'Nunito-Regular',
                    color: '#000',
                    fontSize: hp(2.2),
                  }}
                  placeholderTextColor={'gray'}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={formData.address}
                  onChangeText={text => handleInputChange('address', text)}
                />
              </View>
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

              {/* Card Information Section */}
              <View style={{marginTop: '5%', marginBottom: '3%'}}>
                <Text
                  style={{
                    fontFamily: 'Nunito-Bold',
                    fontSize: hp(2.8),
                    color: '#14BA9C',
                  }}>
                  Payment Information
                </Text>
                <Text
                  style={{
                    fontFamily: 'Nunito-Regular',
                    fontSize: hp(1.8),
                    color: '#524B6B',
                    marginTop: '1%',
                  }}>
                  Secure payment details
                </Text>
              </View>

              {/* Card Number */}
              <Text style={styles.label}>Card Number</Text>
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
                  borderColor: errors.card_number ? '#FF0000' : '#524B6B',
                }}>
                <TextInput
                  placeholder="1234567890123456"
                  style={{
                    fontFamily: 'Nunito-Regular',
                    color: '#000',
                    fontSize: hp(2.2),
                  }}
                  placeholderTextColor={'gray'}
                  keyboardType="number-pad"
                  maxLength={16}
                  value={formData.card_number}
                  onChangeText={text => handleInputChange('card_number', text)}
                />
              </View>
              {errors.card_number && (
                <Text style={styles.errorText}>{errors.card_number}</Text>
              )}

              {/* Cardholder Name */}
              <Text style={styles.label}>Cardholder Name</Text>
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
                  borderColor: errors.cardholder_name ? '#FF0000' : '#524B6B',
                }}>
                <TextInput
                  placeholder="John Doe"
                  style={{
                    fontFamily: 'Nunito-Regular',
                    color: '#000',
                    fontSize: hp(2.2),
                  }}
                  placeholderTextColor={'gray'}
                  value={formData.cardholder_name}
                  onChangeText={text => handleInputChange('cardholder_name', text)}
                />
              </View>
              {errors.cardholder_name && (
                <Text style={styles.errorText}>{errors.cardholder_name}</Text>
              )}

              {/* Expiry Date and CVC */}
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={{flex: 0.48}}>
                  <Text style={styles.label}>Expiry Month</Text>
                  <View
                    style={{
                      backgroundColor: '#fff',
                      width: '100%',
                      height: hp(7.5),
                      borderRadius: 8,
                      marginVertical: '2%',
                      paddingHorizontal: '5%',
                      justifyContent: 'center',
                      borderWidth: 0.4,
                      borderColor: errors.expiry_month ? '#FF0000' : '#524B6B',
                    }}>
                    <TextInput
                      placeholder="MM"
                      style={{
                        fontFamily: 'Nunito-Regular',
                        color: '#000',
                        fontSize: hp(2.2),
                      }}
                      placeholderTextColor={'gray'}
                      keyboardType="number-pad"
                      maxLength={2}
                      value={formData.expiry_month}
                      onChangeText={text => handleInputChange('expiry_month', text)}
                    />
                  </View>
                  {errors.expiry_month && (
                    <Text style={styles.errorText}>{errors.expiry_month}</Text>
                  )}
                </View>

                <View style={{flex: 0.48}}>
                  <Text style={styles.label}>Expiry Year</Text>
                  <View
                    style={{
                      backgroundColor: '#fff',
                      width: '100%',
                      height: hp(7.5),
                      borderRadius: 8,
                      marginVertical: '2%',
                      paddingHorizontal: '5%',
                      justifyContent: 'center',
                      borderWidth: 0.4,
                      borderColor: errors.expiry_year ? '#FF0000' : '#524B6B',
                    }}>
                    <TextInput
                      placeholder="YYYY"
                      style={{
                        fontFamily: 'Nunito-Regular',
                        color: '#000',
                        fontSize: hp(2.2),
                      }}
                      placeholderTextColor={'gray'}
                      keyboardType="number-pad"
                      maxLength={4}
                      value={formData.expiry_year}
                      onChangeText={text => handleInputChange('expiry_year', text)}
                    />
                  </View>
                  {errors.expiry_year && (
                    <Text style={styles.errorText}>{errors.expiry_year}</Text>
                  )}
                </View>
              </View>

              {/* CVC */}
              <Text style={styles.label}>CVC</Text>
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
                  borderColor: errors.cvc ? '#FF0000' : '#524B6B',
                }}>
                <TextInput
                  placeholder="123"
                  style={{
                    fontFamily: 'Nunito-Regular',
                    color: '#000',
                    fontSize: hp(2.2),
                  }}
                  placeholderTextColor={'gray'}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  value={formData.cvc}
                  onChangeText={text => handleInputChange('cvc', text)}
                />
              </View>
              {errors.cvc && <Text style={styles.errorText}>{errors.cvc}</Text>}

              {/* Expertise Level */}
              <Text style={styles.label}>Expertise Level</Text>
              <View style={{flexDirection: 'row', marginVertical: '2%', justifyContent: 'space-between'}}>
                {['beginner', 'intermediate', 'expert'].map(level => (
                  <TouchableOpacity
                    key={level}
                    style={{
                      flex: 1,
                      marginHorizontal: 5,
                      paddingVertical: 15,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: formData.expertise_level === level ? '#14BA9C' : '#524B6B',
                      backgroundColor: formData.expertise_level === level ? '#E4F3EE' : '#fff',
                      alignItems: 'center',
                    }}
                    onPress={() => handleInputChange('expertise_level', level)}>
                    <Text
                      style={{
                        fontFamily: 'Nunito-SemiBold',
                        color: formData.expertise_level === level ? '#14BA9C' : '#524B6B',
                        fontSize: hp(1.8),
                        textTransform: 'capitalize',
                      }}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.expertise_level && (
                <Text style={styles.errorText}>{errors.expertise_level}</Text>
              )}
            </>
          )}
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={styles.gettingStarted}
          onPress={handleSignUp}
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
              Sign Up
            </Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            marginVertical: '9%',
          }}>
          <Text
            style={{
              color: '#524B6B',
              fontSize: hp(2.3),
              fontFamily: 'Nunito-SemiBold',
              textAlign: 'center',
            }}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text
              style={{
                color: '#14BA9C',
                fontSize: hp(2.3),
                fontFamily: 'Nunito-SemiBold',
                textAlign: 'center',
                textDecorationLine: 'underline',
              }}>
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

export default SignUp;

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
    marginTop: '5%',
  },
  errorText: {
    color: '#FF0000',
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.8),
    marginTop: -5,
    marginLeft: 5,
  },
});