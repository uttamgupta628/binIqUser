import {
  ImageBackground, ScrollView, StatusBar, StyleSheet,
  Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { authAPI } from '../../api/apiService';
import DatePicker from 'react-native-date-picker';

const SignUp = ({ route }) => {
  const navigation = useNavigation();
  const { selectedPlan } = route?.params || {};
  const isPremiumPlan = selectedPlan === 'premium';

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    dob: '',
    gender: '',
    phone_number: '',
    address: '',
    expertise_level: '',
  });

  const [dobDate, setDobDate] = useState(new Date(2000, 0, 1));
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const formatDOB = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (isPremiumPlan) {
      if (!formData.dob) newErrors.dob = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';

      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!formData.phone_number.trim()) {
        newErrors.phone_number = 'Phone number is required';
      } else if (!phoneRegex.test(formData.phone_number)) {
        newErrors.phone_number = 'Please enter a valid phone number';
      }

      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.expertise_level) newErrors.expertise_level = 'Expertise level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const registrationData = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        role: 2,
        selected_plan: selectedPlan,
      };

      if (isPremiumPlan) {
        registrationData.dob = formData.dob; // YYYY-MM-DD
        registrationData.gender = formData.gender;
        registrationData.phone_number = formData.phone_number;
        registrationData.address = formData.address;
        registrationData.expertise_level = formData.expertise_level;
        // Placeholder card — real payment via Stripe on next screen
        registrationData.card_information = {
          card_number: '0000000000000000',
          cardholder_name: formData.full_name,
          expiry_month: '01',
          expiry_year: '2030',
          cvc: '000',
        };
      }

      console.log('Sending registration data:', JSON.stringify(registrationData, null, 2));

      const response = await authAPI.register(registrationData);
      console.log('Registration response:', response);

      // ✅ Navigate immediately without alert
      if (isPremiumPlan) {
        navigation.navigate('SelectPremiumPlan', {
          userData: response,
          selectedPlan,
        });
      } else {
        navigation.navigate('QuizScreen', {
          userData: response,
          selectedPlan,
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      if (error.status === 400) errorMessage = error.message || 'Invalid registration data';
      else if (error.status === 409) errorMessage = 'This email is already registered';
      else if (error.message) errorMessage = error.message;
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled">
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}>

        <View style={{ height: hp(7) }} />

        <View style={{ width: wp(100), padding: '5%' }}>
          <Text style={styles.heading}>Start My BinIQ Profile</Text>
          <Text style={styles.subheading}>
            Register your account today and gain access to comprehensive tools
            and resources designed to optimize your reselling journey.
          </Text>
        </View>

        {/* Plan Badge */}
        {selectedPlan && (
          <View style={{ paddingHorizontal: '5%', marginBottom: '2%' }}>
            <View style={[styles.planBadge, {
              borderColor: isPremiumPlan ? '#E8A020' : '#14BA9C',
              backgroundColor: isPremiumPlan ? '#FFF3E0' : '#E4F3EE',
            }]}>
              <Text style={[styles.planBadgeText, { color: isPremiumPlan ? '#E8A020' : '#14BA9C' }]}>
                {isPremiumPlan
                  ? '⭐ Premium Plan — Choose Tier & Pay After Registration'
                  : '✔ Free Plan Selected'}
              </Text>
            </View>
          </View>
        )}

        <View style={{ padding: '5%' }}>

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <View style={[styles.inputBox, errors.full_name && styles.inputError]}>
            <TextInput
              placeholder="John Doe"
              style={styles.input}
              placeholderTextColor="gray"
              value={formData.full_name}
              onChangeText={t => handleInputChange('full_name', t)}
            />
          </View>
          {errors.full_name && <Text style={styles.errorText}>{errors.full_name}</Text>}

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputBox, errors.email && styles.inputError]}>
            <TextInput
              placeholder="johndoe@gmail.com"
              style={styles.input}
              placeholderTextColor="gray"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={t => handleInputChange('email', t.toLowerCase())}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputBox, errors.password && styles.inputError]}>
            <TextInput
              placeholder="Enter your password"
              style={styles.input}
              placeholderTextColor="gray"
              secureTextEntry
              value={formData.password}
              onChangeText={t => handleInputChange('password', t)}
            />
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={[styles.inputBox, errors.confirm_password && styles.inputError]}>
            <TextInput
              placeholder="Confirm your password"
              style={styles.input}
              placeholderTextColor="gray"
              secureTextEntry
              value={formData.confirm_password}
              onChangeText={t => handleInputChange('confirm_password', t)}
            />
          </View>
          {errors.confirm_password && <Text style={styles.errorText}>{errors.confirm_password}</Text>}

          {/* ── PREMIUM ONLY FIELDS ── */}
          {isPremiumPlan && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Additional Information</Text>
                <Text style={styles.sectionSub}>Required for Premium Plan</Text>
              </View>

              {/* Date of Birth */}
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity
                style={[styles.inputBox, errors.dob && styles.inputError]}
                onPress={() => setDatePickerOpen(true)}
                activeOpacity={0.7}>
                <Text style={[styles.input, { color: formData.dob ? '#000' : 'gray' }]}>
                  {formData.dob || 'Select your date of birth'}
                </Text>
              </TouchableOpacity>
              {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

              <DatePicker
                modal
                open={datePickerOpen}
                date={dobDate}
                mode="date"
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
                onConfirm={(date) => {
                  setDatePickerOpen(false);
                  setDobDate(date);
                  handleInputChange('dob', formatDOB(date));
                }}
                onCancel={() => setDatePickerOpen(false)}
              />

              {/* Gender */}
              <Text style={styles.label}>Gender</Text>
              <View style={{ flexDirection: 'row', marginVertical: '2%' }}>
                {['male', 'female', 'other'].map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.toggleBtn, formData.gender === g && styles.toggleBtnActive]}
                    onPress={() => handleInputChange('gender', g)}>
                    <Text style={[styles.toggleText, formData.gender === g && styles.toggleTextActive]}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

              {/* Phone Number */}
              <Text style={styles.label}>Phone Number</Text>
              <View style={[styles.inputBox, errors.phone_number && styles.inputError]}>
                <TextInput
                  placeholder="+1234567890"
                  style={styles.input}
                  placeholderTextColor="gray"
                  keyboardType="phone-pad"
                  value={formData.phone_number}
                  onChangeText={t => handleInputChange('phone_number', t)}
                />
              </View>
              {errors.phone_number && <Text style={styles.errorText}>{errors.phone_number}</Text>}

              {/* Address */}
              <Text style={styles.label}>Address</Text>
              <View style={[styles.inputBox, { height: hp(10), paddingVertical: '3%' }, errors.address && styles.inputError]}>
                <TextInput
                  placeholder="Enter your full address"
                  style={styles.input}
                  placeholderTextColor="gray"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={formData.address}
                  onChangeText={t => handleInputChange('address', t)}
                />
              </View>
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

              {/* Expertise Level */}
              <Text style={styles.label}>Expertise Level</Text>
              <View style={{ flexDirection: 'row', marginVertical: '2%' }}>
                {['beginner', 'intermediate', 'expert'].map(level => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.toggleBtn, formData.expertise_level === level && styles.toggleBtnActive]}
                    onPress={() => handleInputChange('expertise_level', level)}>
                    <Text style={[styles.toggleText, formData.expertise_level === level && styles.toggleTextActive]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.expertise_level && <Text style={styles.errorText}>{errors.expertise_level}</Text>}

              {/* Payment note */}
              <View style={styles.paymentNote}>
                <Text style={styles.paymentNoteText}>
                  💳 Card details & payment collected securely on the next step via Stripe.
                </Text>
              </View>
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
            <Text style={styles.btnText}>
              {isPremiumPlan ? 'Register & Choose Tier →' : 'Sign Up'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>

      </ImageBackground>
    </ScrollView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  vector: { width: wp(100), minHeight: hp(100) },
  heading: { fontFamily: 'Nunito-Bold', fontSize: hp(3.6), color: '#14BA9C' },
  subheading: { fontFamily: 'Nunito-Regular', fontSize: hp(2), color: '#524B6B', marginTop: '5%' },
  planBadge: { padding: 10, borderRadius: 8, borderWidth: 1 },
  planBadgeText: { fontFamily: 'Nunito-SemiBold', fontSize: hp(1.9), textAlign: 'center' },
  sectionHeader: { marginTop: '5%', marginBottom: '2%' },
  sectionTitle: { fontFamily: 'Nunito-Bold', fontSize: hp(2.8), color: '#14BA9C' },
  sectionSub: { fontFamily: 'Nunito-Regular', fontSize: hp(1.8), color: '#524B6B', marginTop: '1%' },
  label: { color: 'black', fontFamily: 'Nunito-SemiBold', fontSize: hp(2.2), marginTop: '3%' },
  inputBox: {
    backgroundColor: '#fff',
    width: '100%',
    height: hp(7.5),
    borderRadius: 8,
    marginVertical: '2%',
    paddingHorizontal: '5%',
    justifyContent: 'center',
    borderWidth: 0.4,
    borderColor: '#524B6B',
  },
  inputError: { borderColor: '#FF0000', borderWidth: 1 },
  input: { fontFamily: 'Nunito-Regular', color: '#000', fontSize: hp(2.2) },
  errorText: { color: '#FF0000', fontFamily: 'Nunito-Regular', fontSize: hp(1.8), marginTop: -5, marginLeft: 5 },
  toggleBtn: {
    flex: 1, marginHorizontal: 4, paddingVertical: 14,
    borderRadius: 8, borderWidth: 1.5,
    borderColor: '#524B6B', backgroundColor: '#fff', alignItems: 'center',
  },
  toggleBtnActive: { borderColor: '#14BA9C', backgroundColor: '#E4F3EE' },
  toggleText: { fontFamily: 'Nunito-SemiBold', color: '#524B6B', fontSize: hp(1.9) },
  toggleTextActive: { color: '#14BA9C' },
  paymentNote: {
    marginTop: '4%', backgroundColor: '#F0F4FF',
    borderRadius: 8, padding: 12,
    borderLeftWidth: 3, borderLeftColor: '#130160',
  },
  paymentNoteText: { fontFamily: 'Nunito-Regular', fontSize: hp(1.8), color: '#130160' },
  gettingStarted: {
    backgroundColor: '#130160', width: '90%', height: hp(7),
    borderRadius: 10, justifyContent: 'center',
    alignItems: 'center', alignSelf: 'center', marginTop: '5%',
  },
  btnText: { fontFamily: 'Nunito-SemiBold', color: '#fff', fontSize: hp(2.5) },
  loginRow: { flexDirection: 'row', alignSelf: 'center', marginVertical: '9%' },
  loginText: { color: '#524B6B', fontSize: hp(2.3), fontFamily: 'Nunito-SemiBold' },
  loginLink: { color: '#14BA9C', fontSize: hp(2.3), fontFamily: 'Nunito-SemiBold', textDecorationLine: 'underline' },
});