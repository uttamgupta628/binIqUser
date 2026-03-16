import React, {useEffect, useState} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ImageBackground,
  ScrollView, StatusBar, Dimensions, Pressable, Image,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {userAPI} from '../../api/apiService';

const {width, height} = Dimensions.get('window');
const wp = percentage => (width * percentage) / 100;
const hp = percentage => (height * percentage) / 100;

// ── Cloudinary config ─────────────────────────────────────────────────
const CLOUD_NAME   = 'dbezoksfw';
const UPLOAD_PRESET = 'BinIQstore';

const uploadImageToCloudinary = async (image, folder = 'profile_images') => {
  if (!image?.uri) throw new Error('No image provided');
  const formData = new FormData();
  formData.append('file', {
    uri: image.uri,
    name: image.fileName || `profile_${Date.now()}.jpg`,
    type: image.type || 'image/jpeg',
  });
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {method: 'POST', body: formData},
  );
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error?.message || 'Image upload failed');
  }
  return data.secure_url;
};

export default function EditProfileScreen() {
  const navigation = useNavigation();

  // ── UI state ──────────────────────────────────────────────────────
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // ── Profile image ─────────────────────────────────────────────────
  const [profileImageUri, setProfileImageUri]   = useState(null); // local preview
  const [profileImageUrl, setProfileImageUrl]   = useState(null); // cloudinary URL

  // ── Personal Details ──────────────────────────────────────────────
  const [email, setEmail]               = useState('');
  const [phoneNumber, setPhoneNumber]   = useState('');

  // ── Business Address ──────────────────────────────────────────────
  const [pincode, setPincode]           = useState('');
  const [address, setAddress]           = useState('');
  const [city, setCity]                 = useState('');
  const [country, setCountry]           = useState('India');
  const [openState, setOpenState]       = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [states] = useState([
    {label: 'Madhya Pradesh', value: 'Madhya Pradesh'},
    {label: 'Maharashtra',    value: 'Maharashtra'},
    {label: 'Rajasthan',      value: 'Rajasthan'},
    {label: 'Gujarat',        value: 'Gujarat'},
    {label: 'West Bengal',    value: 'West Bengal'},
    {label: 'Karnataka',      value: 'Karnataka'},
    {label: 'Tamil Nadu',     value: 'Tamil Nadu'},
    {label: 'Delhi',          value: 'Delhi'},
  ]);

  // ── Card Information ──────────────────────────────────────────────
  const [cardNumber, setCardNumber]         = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cvc, setCvc]                       = useState('');
  const [expiryMonth, setExpiryMonth]       = useState('');
  const [expiryYear, setExpiryYear]         = useState('');
  const [openMonth, setOpenMonth]           = useState(false);
  const [openYear, setOpenYear]             = useState(false);
  const [months] = useState([
    '01','02','03','04','05','06','07','08','09','10','11','12',
  ].map(m => ({label: m, value: m})));
  const [years, setYears] = useState([]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setYears(
      Array.from({length: 20}, (_, i) => {
        const y = (currentYear + i).toString();
        return {label: y, value: y};
      }),
    );
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      if (response) {
        const userData = response.user || response;
        setEmail(userData.email || '');
        setPhoneNumber(userData.phone_number || '');
        setAddress(userData.address || '');
        // ✅ Load existing profile image from backend
        if (userData.profile_image) {
          setProfileImageUrl(userData.profile_image);
          setProfileImageUri(userData.profile_image);
        }
        if (userData.card_information) {
          setCardNumber(userData.card_information.card_number || '');
          setCardholderName(userData.card_information.cardholder_name || '');
          setExpiryMonth(userData.card_information.expiry_month || '');
          setExpiryYear(userData.card_information.expiry_year || '');
          setCvc(userData.card_information.cvc || '');
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      Alert.alert('Error', 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  // ── Image picker ──────────────────────────────────────────────────
  const handleImagePress = () => {
    Alert.alert('Change Profile Photo', 'Choose an option', [
      {
        text: 'Camera',
        onPress: () => openCamera(),
      },
      {
        text: 'Gallery',
        onPress: () => openGallery(),
      },
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const openGallery = () => {
    launchImageLibrary(
      {mediaType: 'photo', quality: 0.8, selectionLimit: 1},
      response => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (asset) handleImageSelected(asset);
      },
    );
  };

  const openCamera = () => {
    launchCamera(
      {mediaType: 'photo', quality: 0.8, saveToPhotos: false},
      response => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (asset) handleImageSelected(asset);
      },
    );
  };

  const handleImageSelected = async asset => {
  try {
    setProfileImageUri(asset.uri);
    setUploadingImage(true);

    const cloudUrl = await uploadImageToCloudinary(asset, 'profile_images');
    setProfileImageUrl(cloudUrl);
    console.log('Profile image uploaded:', cloudUrl);

    // ✅ Auto-save to backend immediately after upload
    await userAPI.updateProfile({profile_image: cloudUrl});
    console.log('Profile image saved to backend');

  } catch (err) {
    console.error('Image upload error:', err);
    Alert.alert('Upload Failed', 'Could not upload image. Try again.');
    setProfileImageUri(profileImageUrl);
  } finally {
    setUploadingImage(false);
  }
};

  // ── Save profile ──────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    try {
      if (!email.trim()) {
        Alert.alert('Validation Error', 'Email is required');
        return;
      }
      if (uploadingImage) {
        Alert.alert('Please wait', 'Image is still uploading...');
        return;
      }

      setSaving(true);

      let fullAddress = address.trim();
      if (pincode || city || selectedState || country) {
        const parts = [];
        if (address.trim()) parts.push(address.trim());
        if (city.trim()) parts.push(city.trim());
        if (selectedState) parts.push(selectedState);
        if (pincode.trim()) parts.push(pincode.trim());
        if (country.trim()) parts.push(country.trim());
        fullAddress = parts.join(', ');
      }

      const updateData = {email: email.trim()};
      if (phoneNumber.trim()) updateData.phone_number = phoneNumber.trim();
      if (fullAddress) updateData.address = fullAddress;

      // ✅ Send Cloudinary URL to backend
      if (profileImageUrl) {
        updateData.profile_image = profileImageUrl;
      }

      if (cardNumber || cardholderName || expiryMonth || expiryYear || cvc) {
        updateData.card_information = {};
        if (cardNumber.trim())     updateData.card_information.card_number = cardNumber.trim();
        if (cardholderName.trim()) updateData.card_information.cardholder_name = cardholderName.trim();
        if (expiryMonth)           updateData.card_information.expiry_month = expiryMonth;
        if (expiryYear)            updateData.card_information.expiry_year = expiryYear;
        if (cvc.trim())            updateData.card_information.cvc = cvc.trim();
      }

      const response = await userAPI.updateProfile(updateData);
      if (response) {
        Alert.alert('Success', 'Profile updated successfully!', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      Alert.alert('Error', err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color={'#0D0D26'} size={23} />
            </Pressable>
            <Text style={styles.headerText}>Edit Profile</Text>
          </View>
        </View>

        {/* ✅ Profile Picture with upload */}
        <View style={styles.profileSection}>
          <Image
            source={
              profileImageUri
                ? {uri: profileImageUri}
                : require('../../../assets/profile_img.png')
            }
            style={styles.profilePicture}
          />
          {/* Upload spinner overlay */}
          {uploadingImage && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
          <TouchableOpacity style={styles.editBtn} onPress={handleImagePress}>
            {uploadingImage
              ? <ActivityIndicator size="small" color="#fff" />
              : <MaterialIcons name="edit" size={14} color="#fff" />
            }
          </TouchableOpacity>
        </View>

        {/* Personal Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Enter email"
              value={email}
              onChangeText={setEmail}
              style={styles.textInput}
              placeholderTextColor={'gray'}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput value="************" style={styles.textInput} editable={false} />
          </View>
          <TouchableOpacity
            style={styles.changePasswordBtn}
            onPress={() => navigation.navigate('ChangePassword')}>
            <Text style={styles.changePasswordText}>Change Password</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Enter phone"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={styles.textInput}
              placeholderTextColor={'gray'}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Business Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Address Details</Text>

          <Text style={styles.label}>Pincode</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Enter pincode" value={pincode}
              onChangeText={setPincode} style={styles.textInput}
              placeholderTextColor={'gray'} keyboardType="numeric"
            />
          </View>

          <Text style={styles.label}>Address</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Enter address" value={address}
              onChangeText={setAddress} style={styles.textInput}
              placeholderTextColor={'gray'}
            />
          </View>

          <Text style={styles.label}>City</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Enter city" value={city}
              onChangeText={setCity} style={styles.textInput}
              placeholderTextColor={'gray'}
            />
          </View>

          <Text style={styles.label}>State</Text>
          <View style={styles.dropdownContainer}>
            <DropDownPicker
              open={openState} value={selectedState} items={states}
              setOpen={setOpenState} setValue={setSelectedState}
              placeholder="Select state" style={styles.dropdown}
              textStyle={styles.dropdownText}
              dropDownContainerStyle={styles.dropdownContainerStyle}
              ArrowDownIconComponent={() => <SimpleLineIcons name="arrow-down" size={20} color="#000" />}
            />
          </View>

          <Text style={styles.label}>Country</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Enter country" value={country}
              onChangeText={setCountry} style={styles.textInput}
              placeholderTextColor={'gray'}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Card Information */}
       

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, (saving || uploadingImage) && styles.saveButtonDisabled]}
          onPress={handleSaveProfile}
          disabled={saving || uploadingImage}>
          {saving
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.saveButtonText}>Save Profile</Text>
          }
        </TouchableOpacity>
      </ImageBackground>

      <View style={{height: hp(7)}} />
      <ImageBackground
        source={require('../../../assets/vector_2.png')}
        style={styles.vector2}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:        {flex: 1, backgroundColor: '#fff'},
  loadingText:      {marginTop: 10, fontFamily: 'Nunito-Regular', color: '#000'},
  vector:           {flex: 1, width: wp(100)},
  vector2:          {flex: 1, width: wp(100), height: height * 2, position: 'absolute', bottom: 0, zIndex: -1},
  header:           {width: wp(100), height: hp(7), marginTop: '10%', paddingHorizontal: '5%'},
  headerChild:      {flexDirection: 'row', alignItems: 'center'},
  headerText:       {fontFamily: 'Nunito-Bold', fontSize: hp(3.2), color: '#0D0140', marginLeft: 10},

  // Profile image
  profileSection:   {alignItems: 'center', marginTop: 20, marginBottom: 20},
  profilePicture:   {width: wp(26), height: wp(26), borderRadius: 40},
  uploadingOverlay: {
    position: 'absolute', width: wp(26), height: wp(26),
    borderRadius: 40, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  editBtn: {
    width: wp(7.5), height: wp(7.5), backgroundColor: '#130160',
    position: 'absolute', bottom: 0, right: '36.5%',
    borderRadius: 20, borderWidth: 3, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },

  section:          {padding: 20},
  sectionTitle:     {fontFamily: 'Nunito-SemiBold', fontSize: wp(5), color: '#000', marginBottom: 15},
  label:            {fontFamily: 'Nunito-SemiBold', fontSize: hp(1.8), color: '#000', marginTop: 10, marginBottom: 5},
  inputWrapper:     {
    backgroundColor: '#fff', width: '100%', height: hp(6.5),
    borderRadius: 8, marginBottom: 10, paddingHorizontal: 20,
    justifyContent: 'center', borderWidth: 0.4, borderColor: '#524B6B',
  },
  textInput:        {fontFamily: 'Nunito-Regular', fontSize: hp(2.2), color: '#000'},
  changePasswordBtn:{marginBottom: 15, alignItems: 'flex-end'},
  changePasswordText:{color: '#14BA9C', fontFamily: 'DMSans-Regular', textDecorationLine: 'underline'},
  divider:          {borderWidth: 0.3, borderColor: '#C4C4C4', width: wp(90), alignSelf: 'center', marginVertical: 20},
  dropdownContainer:{backgroundColor: '#fff', width: '100%', borderRadius: 8, marginBottom: 10, borderWidth: 0.4, borderColor: '#524B6B', zIndex: 5},
  dropdown:         {backgroundColor: '#fff', borderColor: '#524B6B', height: hp(6), borderRadius: 6, borderWidth: 0},
  dropdownText:     {fontFamily: 'Nunito-Regular', fontSize: 16, color: '#000'},
  dropdownContainerStyle: {borderColor: '#524B6B', backgroundColor: '#fff'},
  expiryRow:        {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10},
  monthDropContainer:{width: '48%', borderRadius: 8, borderWidth: 0.4, borderColor: '#524B6B', zIndex: 5},
  inputContainer:   {backgroundColor: '#fff', width: '45%', height: hp(6.5), borderRadius: 8, paddingHorizontal: 15, justifyContent: 'center', borderWidth: 0.4, borderColor: '#524B6B'},
  input:            {fontFamily: 'Nunito-Regular', fontSize: hp(2), color: '#000'},
  saveButton:       {backgroundColor: '#130160', width: '90%', height: hp(7), borderRadius: 10, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginTop: 20},
  saveButtonDisabled:{opacity: 0.7},
  saveButtonText:   {fontFamily: 'Nunito-SemiBold', color: '#fff', fontSize: hp(2.5)},
});