import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  StatusBar,
  Dimensions,
  Pressable,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import AntDesign from 'react-native-vector-icons/AntDesign'
import DatePicker from 'react-native-date-picker'
import { format } from 'date-fns'
import { userAPI } from '../../api/apiService'

const { width, height } = Dimensions.get('window')

const wp = (percentage) => (width * percentage) / 100
const hp = (percentage) => (height * percentage) / 100

export default function UserProfileScreen({ openDrawer }) {
  const navigation = useNavigation()
  
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [location, setLocation] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [selectedGender, setSelectedGender] = useState(null)
  const [expertiseLevel, setExpertiseLevel] = useState('')
  const [profileImage, setProfileImage] = useState(null)
  
  const [openDateModal, setOpenDateModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const genders = [
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
    { id: 'others', label: 'Others' },
  ]

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await userAPI.getProfile()
      
      console.log('User Profile Response:', response)
      
      if (response) {
        const userData = response.user || response
        
        setFullName(userData.full_name || '')
        setEmail(userData.email || '')
        setPhoneNumber(userData.phone_number || '')
        setLocation(userData.address || '')
        setDateOfBirth(userData.dob || '')
        setSelectedGender(userData.gender?.toLowerCase() || null)
        setExpertiseLevel(userData.expertise_level || '')
        setProfileImage(userData.profile_image || null)
        
        if (userData.dob) {
          try {
            const parsedDate = new Date(userData.dob)
            if (!isNaN(parsedDate.getTime())) {
              setSelectedDate(parsedDate)
              setDateOfBirth(format(parsedDate, 'dd-MM-yyyy'))
            }
          } catch (err) {
            console.log('Error parsing date:', err)
          }
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError(err.message || 'Failed to load profile')
      Alert.alert('Error', 'Failed to load profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      if (!fullName.trim()) {
        Alert.alert('Validation Error', 'Please enter your full name')
        return
      }
      
      if (!email.trim()) {
        Alert.alert('Validation Error', 'Please enter your email')
        return
      }
      
      setUpdating(true)
      setError(null)
      
      // Convert dd-MM-yyyy to ISO date format for backend
      let isoDate = null
      if (dateOfBirth) {
        try {
          const parts = dateOfBirth.split('-')
          if (parts.length === 3) {
            const day = parts[0]
            const month = parts[1]
            const year = parts[2]
            // Create ISO date string
            isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`
          }
        } catch (err) {
          console.log('Error converting date:', err)
        }
      }
      
      const updateData = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim() || null,
        address: location.trim() || null,
        dob: isoDate,
        gender: selectedGender || null,
        // Only send expertise_level if it's a valid value (not empty and not default "Beginner")
        expertise_level: expertiseLevel && expertiseLevel.trim() !== '' ? expertiseLevel.trim() : null,
      }
      
      console.log('Updating profile with:', updateData)
      
      const response = await userAPI.updateProfile(updateData)
      
      console.log('Update response:', response)
      
      if (response) {
        Alert.alert(
          'Success',
          'Profile updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                fetchUserProfile()
              }
            }
          ]
        )
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err.message || 'Failed to update profile')
      Alert.alert(
        'Error',
        err.message || 'Failed to update profile. Please try again.'
      )
    } finally {
      setUpdating(false)
    }
  }

  const handleDateConfirm = (date) => {
    setOpenDateModal(false)
    setSelectedDate(date)
    setDateOfBirth(format(date, 'dd-MM-yyyy'))
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ImageBackground 
          source={require('../../../assets/vector_1.png')} 
          style={styles.vector}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerChild}>
              <Pressable onPress={() => navigation.goBack()}>
                <MaterialIcons name='arrow-back-ios' color={'#0D0D26'} size={23} />
              </Pressable>
              <Text style={styles.headerText}>Profile</Text>
            </View>
          </View>
          
          {/* Profile Picture */}
          <View style={styles.profileSection}>
            <Image
              source={
                profileImage 
                  ? { uri: profileImage }
                  : require("../../../assets/profile_img.png")
              }
              style={styles.profilePicture}
            />
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => navigation.navigate('EditProfileScreen')}
            >
              <MaterialIcons name="edit" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Form */}
          <View style={styles.formContainer}>
            {/* Expertise Level */}
            <View style={styles.expertiseContainer}>
              <Text style={styles.expertiseLabel}>Expertise Level:</Text>
              <Text style={styles.expertiseValue}> {expertiseLevel || 'Not Set'}</Text>
            </View>
            
            {/* Full Name */}
            <Text style={styles.label}>Full name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder='John Doe'
                value={fullName}
                onChangeText={setFullName}
                style={styles.textInput}
                placeholderTextColor={'gray'}
              />
            </View>
            
            {/* Date of Birth */}
            <Text style={styles.label}>Date of Birth</Text>
            <View style={styles.dateInputWrapper}>
              <TextInput
                placeholder='Select your DOB'
                value={dateOfBirth}
                style={styles.dateInput}
                placeholderTextColor={'gray'}
                editable={false}
              />
              <TouchableOpacity onPress={() => setOpenDateModal(true)}>
                <AntDesign name='calendar' size={25} color={'#000'} />
              </TouchableOpacity>
            </View>
            
            {/* Email */}
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder='johndoe@gmail.com'
                value={email}
                onChangeText={setEmail}
                style={styles.textInput}
                placeholderTextColor={'gray'}
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </View>
            
            {/* Gender */}
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              {genders.map((gender) => (
                <TouchableOpacity
                  key={gender.id}
                  onPress={() => setSelectedGender(gender.id)}
                  style={styles.genderButton}
                >
                  <View style={styles.radioOuter}>
                    <View
                      style={[
                        styles.radioInner,
                        selectedGender === gender.id && styles.radioInnerSelected
                      ]}
                    />
                  </View>
                  <Text style={styles.genderLabel}>{gender.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Phone Number */}
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder='+91 1234567890'
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                style={styles.textInput}
                placeholderTextColor={'gray'}
                keyboardType='phone-pad'
              />
            </View>
            
            {/* Location */}
            <Text style={styles.label}>Location</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder='Enter your location'
                value={location}
                onChangeText={setLocation}
                style={styles.textInput}
                placeholderTextColor={'gray'}
              />
            </View>
          </View>
        </ImageBackground>
        
        {/* Divider */}
        <View style={styles.divider} />
        
        {/* Update Button */}
        <TouchableOpacity 
          style={[styles.updateButton, updating && styles.updateButtonDisabled]} 
          onPress={handleUpdateProfile}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>Update Profile</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.bottomSpace} />
      </ScrollView>
      
      {/* Date Picker Modal */}
      <DatePicker
        modal
        open={openDateModal}
        date={selectedDate}
        onConfirm={handleDateConfirm}
        onCancel={() => setOpenDateModal(false)}
        mode='date'
        maximumDate={new Date()}
      />
      
      {/* Bottom Background */}
      <ImageBackground 
        source={require('../../../assets/vector_2.png')} 
        style={styles.vector2} 
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Nunito-Regular',
    color: '#000'
  },
  scrollContent: {
    flexGrow: 1
  },
  vector: {
    width: width,
    minHeight: height * 0.9
  },
  vector2: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: height * 2,
    zIndex: -1
  },
  header: {
    width: width,
    height: 60,
    marginTop: 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerChild: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    color: '#0D0140',
    marginLeft: 10
  },
  profileSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editBtn: {
    width: 30,
    height: 30,
    backgroundColor: '#130160',
    position: 'absolute',
    bottom: 0,
    right: width / 2 - 65,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  formContainer: {
    padding: 20
  },
  expertiseContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  expertiseLabel: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: '#14BA9C',
    textDecorationLine: 'underline'
  },
  expertiseValue: {
    fontFamily: 'Nunito-Regular',
    fontSize: 18,
    color: '#000'
  },
  label: {
    color: '#000',
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5
  },
  inputWrapper: {
    backgroundColor: '#fff',
    width: '100%',
    height: 50,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderWidth: 0.4,
    borderColor: '#524B6B'
  },
  dateInputWrapper: {
    backgroundColor: '#fff',
    width: '100%',
    height: 50,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 15,
    borderWidth: 0.4,
    borderColor: '#524B6B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInput: {
    fontFamily: 'Nunito-Regular',
    color: '#000',
    fontSize: 16,
    flex: 1
  },
  textInput: {
    fontFamily: 'Nunito-Regular',
    color: '#000',
    fontSize: 16
  },
  genderContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  genderButton: {
    backgroundColor: '#fff',
    width: '31%',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 8,
    justifyContent: 'center',
    borderWidth: 0.4,
    borderColor: '#524B6B',
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: 12,
    padding: 3,
    marginRight: 6
  },
  radioInner: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#fff'
  },
  radioInnerSelected: {
    backgroundColor: '#14BA9C'
  },
  genderLabel: {
    fontFamily: 'DMSans-Regular',
    color: '#000',
    fontSize: 14
  },
  divider: {
    borderWidth: 0.3,
    borderColor: '#C4C4C4',
    width: wp(90),
    alignSelf: 'center',
    marginTop: 40
  },
  updateButton: {
    backgroundColor: '#130160',
    width: '90%',
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20
  },
  updateButtonDisabled: {
    opacity: 0.7
  },
  updateButtonText: {
    fontFamily: 'Nunito-SemiBold',
    color: '#fff',
    fontSize: 18
  },
  bottomSpace: {
    height: 60
  }
})