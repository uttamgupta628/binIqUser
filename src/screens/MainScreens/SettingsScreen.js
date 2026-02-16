import { useNavigation } from "@react-navigation/native"
import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  StatusBar,
  Dimensions,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native"
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen"
import Ionicons from "react-native-vector-icons/Ionicons"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import ProfileIcon from '../../../assets/ProfileIcon';
import NotificationIcon from '../../../assets/NotificationIcon'
import ChangePasswordIcon from '../../../assets/ChangePasswordIcon'
import LanguageIcon from '../../../assets/LanguageIcon'
import ThemeIcon from '../../../assets/ThemeIcon'
import DeleteIcon from '../../../assets/DeleteIcon'
import PrivacyIcon from '../../../assets/PrivacyIcon'
import TermsAndConditionIcon from '../../../assets/TermsAndConditionIcon'
import HelpCenterIcon from '../../../assets/HelpCenterIcon'
import SupportIcon from '../../../assets/SupportIcon'
import AboutIcon from '../../../assets/AboutIcon'

// Import API services
import { userAPI, authAPI, getAuthToken, removeAuthToken } from '../../api/apiService'

const { width, height } = Dimensions.get('window')

export default function SettingsScreen({ openDrawer }) {
  const navigation = useNavigation();
  
  // State
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getProfile()
      console.log('User Profile in Settings:', response)
      setUserProfile(response)
      
      // Set notifications preference from user profile if available
      // Assuming you might add this field to user model
      setIsNotificationsEnabled(response.notifications_enabled || false)
    } catch (error) {
      console.error('Error fetching profile:', error)
      Alert.alert('Error', 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const toggleNotifications = async () => {
    try {
      const newValue = !isNotificationsEnabled
      setIsNotificationsEnabled(newValue)
      
      // Update on backend
      await userAPI.updateProfile({
        notifications_enabled: newValue
      })
      
      Alert.alert(
        'Success',
        `Notifications ${newValue ? 'enabled' : 'disabled'}`
      )
    } catch (error) {
      console.error('Error updating notifications:', error)
      // Revert on error
      setIsNotificationsEnabled(!isNotificationsEnabled)
      Alert.alert('Error', 'Failed to update notification settings')
    }
  }

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword')
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteAccount
        }
      ]
    )
  }

  const confirmDeleteAccount = async () => {
    try {
      // Show loading
      Alert.alert('Please wait', 'Deleting your account...')
      
      // Call delete API
      await userAPI.deleteAccount()
      
      // Logout and clear token
      await authAPI.logout()
      
      // Navigate to login
      Alert.alert(
        'Account Deleted',
        'Your account has been successfully deleted.',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Login')
          }
        ]
      )
    } catch (error) {
      console.error('Error deleting account:', error)
      Alert.alert(
        'Error',
        error.message || 'Failed to delete account. Please try again.'
      )
    }
  }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await authAPI.logout()
              navigation.replace('Login')
            } catch (error) {
              console.error('Logout error:', error)
            }
          }
        }
      ]
    )
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={{ marginTop: 10, fontFamily: 'Nunito-Regular', color: '#000' }}>
          Loading settings...
        </Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ImageBackground source={require('../../../assets/vector_1.png')} style={styles.vector}>
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name='arrow-back-ios' color={'#0D0D26'} size={25} />
            </Pressable>
            <Text style={styles.headerText}>Settings</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* User Info Summary */}
          {userProfile && (
            <View style={styles.userInfoCard}>
              <Text style={styles.userName}>{userProfile.full_name}</Text>
              <Text style={styles.userEmail}>{userProfile.email}</Text>
              <View style={styles.userRoleBadge}>
                <Text style={styles.userRoleText}>
                  {userProfile.role === 1 ? 'Admin' : 
                   userProfile.role === 2 ? 'Reseller' : 
                   userProfile.role === 3 ? 'Store Owner' : 'User'}
                </Text>
              </View>
            </View>
          )}

          {/* Applications Section */}
          <Text style={styles.sectionTitle}>Applications</Text>
          
          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => navigation.navigate('UserProfileScreen')}>
            <View style={styles.settingLeft}>
              <ProfileIcon />
              <Text style={styles.settingText}>My Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={hp(3.1)} color="#150B3D" />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <NotificationIcon />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: "#56CD54" }}
              thumbColor={"#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleNotifications}
              value={isNotificationsEnabled}
            />
          </View>

          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={handleChangePassword}>
            <View style={styles.settingLeft}>
              <ChangePasswordIcon />
              <Text style={styles.settingText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={hp(3.1)} color="#150B3D" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleDeleteAccount}>
            <View style={styles.settingLeft}>
              <DeleteIcon />
              <Text style={[styles.settingText, { color: '#FF0000' }]}>Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={hp(3.1)} color="#FF0000" />
          </TouchableOpacity>

          {/* Account Section */}
          <View style={{ height: hp(3) }} />
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('HelpAndSupport')}>
            <View style={styles.settingLeft}>
              <HelpCenterIcon />
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={hp(3.1)} color="#150B3D" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('PrivacyPolicy')}>
            <View style={styles.settingLeft}>
              <PrivacyIcon />
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={hp(3.1)} color="#150B3D" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('TermsAndConditions')}>
            <View style={styles.settingLeft}>
              <TermsAndConditionIcon />
              <Text style={styles.settingText}>Terms & Conditions</Text>
            </View>
            <Ionicons name="chevron-forward" size={hp(3.1)} color="#150B3D" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('About')}>
            <View style={styles.settingLeft}>
              <AboutIcon />
              <Text style={styles.settingText}>About BinIQ</Text>
            </View>
            <Ionicons name="chevron-forward" size={hp(3.1)} color="#150B3D" />
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity 
            style={[styles.settingItem, styles.logoutButton]}
            onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="logout" size={24} color="#FF0000" />
              <Text style={[styles.settingText, { color: '#FF0000' }]}>Logout</Text>
            </View>
          </TouchableOpacity>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>

          <View style={{ height: hp(8) }} />
        </View>
      </ImageBackground>
      <ImageBackground source={require('../../../assets/vector_2.png')} style={styles.vector2} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  vector: {
    flex: 1,
    width: wp(100),
    minHeight: hp(104),
  },
  vector2: {
    flex: 1,
    width: wp(100),
    height: height * 0.5,
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
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
    width: wp(35),
    justifyContent: 'space-between'
  },
  headerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(3.2),
    textAlign: 'left',
    color: '#0D0140'
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16
  },
  userInfoCard: {
    backgroundColor: '#130160',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  userName: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.5),
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.8),
    color: '#E0E0E0',
    marginBottom: 8,
  },
  userRoleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#14BA9C',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userRoleText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.6),
    color: '#fff',
  },
  sectionTitle: {
    fontFamily: 'Nunito-SemiBold',
    color: '#95969D',
    fontSize: wp(4.6),
    marginVertical: '1%',
    marginTop: '3%',
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: '4%',
    elevation: 1,
    backgroundColor: '#fff',
    marginVertical: '2%',
    borderRadius: 10,
    paddingHorizontal: '5%'
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  settingText: {
    marginLeft: 16,
    fontSize: hp(2),
    color: '#150B3D',
    fontFamily: 'DMSans-Regular'
  },
  logoutButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FF000020',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  versionText: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.6),
    color: '#95969D',
  },
})