import { useNavigation } from "@react-navigation/native"
import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native"
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen"
import Ionicons from "react-native-vector-icons/Ionicons"
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditProfile from '../../assets/EditProfile.svg';
import Feedback from '../../assets/FeedBack.svg';
import ChangePassword from '../../assets/ChangePassword.svg';
import Help from '../../assets/Help.svg';
import ReferallProgram from '../../assets/ReferallProgram.svg';
import Settings from '../../assets/Settings.svg';
import { userAPI } from '../api/apiService';

const { width } = Dimensions.get("window")

const CustomDrawer = ({ isOpen, closeDrawer }) => {
  const navigation = useNavigation();
  const translateX = React.useRef(new Animated.Value(-width)).current;
  
  // State for user data
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -width,
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [isOpen])

  // Fetch user profile when drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      console.log('CustomDrawer - User Profile:', response);
      
      if (response) {
        const userData = response.user || response;
        setUserProfile(userData);
      }
    } catch (err) {
      console.error('Error fetching user profile in drawer:', err);
      // Don't show alert, just use fallback data
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    closeDrawer();
    
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
              // Clear auth token
              await AsyncStorage.removeItem('@auth_token');
              
              // Navigate to login
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (err) {
              console.error('Error during logout:', err);
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  const handleMenuPress = (screen) => {
    closeDrawer();
    navigation.navigate(screen);
  };

  const menuItems = [
    { icon: <EditProfile />, label: "Edit Profile", goto: 'EditProfileScreen' },
    { icon: <Feedback />, label: "Feedback", goto: 'Feedback' },
    { icon: <ChangePassword />, label: "Change Password", goto: 'ChangePassword' },
    { icon: <Help />, label: "Help", goto: 'HelpAndSupport' },
    { icon: <ReferallProgram />, label: "Referral Program", goto: 'ReferFriend' },
    { icon: <Settings />, label: "Settings", goto: 'SettingsScreen' },
  ]

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX }] }]}>
      <TouchableOpacity style={styles.closeButton} onPress={closeDrawer}>
        <Ionicons name="close" size={hp(3.4)} color="black" />
      </TouchableOpacity>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#130160" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.profileImageContainer}
              onPress={() => handleMenuPress('EditProfileScreen')}
            >
              <Image
                source={
                  userProfile?.profile_image
                    ? { uri: userProfile.profile_image }
                    : require("../../assets/profile_img.png")
                }
                style={styles.profilePicture}
              />
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={styles.profileName}>
              {userProfile?.full_name || 'User Name'}
            </Text>
            <Text style={styles.profileEmail}>
              {userProfile?.email || 'user@email.com'}
            </Text>

            {/* User Stats */}
            {userProfile && (
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {userProfile.total_scans || 0}
                  </Text>
                  <Text style={styles.statLabel}>Scans</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {userProfile.promotions?.length || 0}
                  </Text>
                  <Text style={styles.statLabel}>Promos</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {userProfile.used_promotions || 0}
                  </Text>
                  <Text style={styles.statLabel}>Used</Text>
                </View>
              </View>
            )}

            {/* Subscription Badge */}
            {userProfile?.subscription && (
              <View style={styles.subscriptionBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.subscriptionText}>
                  {userProfile.subscription} Member
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuItems} showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.menuItem} 
            onPress={() => handleMenuPress(item.goto)}
          >
            <View style={{ width: '9%' }}>
              {item.icon}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="red" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>BinIQ v1.0.0</Text>
        </View>
      </ScrollView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.8,
    backgroundColor: "white",
    paddingTop: 50,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
    paddingVertical: '5%'
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 20
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.8),
    color: '#666',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profilePicture: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    borderWidth: 3,
    borderColor: '#130160',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#14BA9C',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: hp(2.2),
    color: '#0D0D26',
    fontFamily: 'Nunito-Bold',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: hp(1.6),
    color: '#666',
    fontFamily: 'Nunito-Regular',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: hp(2.2),
    fontFamily: 'Nunito-Bold',
    color: '#130160',
  },
  statLabel: {
    fontSize: hp(1.4),
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: '#ddd',
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 10,
  },
  subscriptionText: {
    fontSize: hp(1.4),
    fontFamily: 'Nunito-Bold',
    color: '#130160',
    marginLeft: 5,
  },
  menuItems: {
    flex: 1
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: '4.5%',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLabel: {
    marginLeft: 15,
    fontSize: hp(2),
    color: '#0D0D26',
    fontFamily: 'Nunito-SemiBold'
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0"
  },
  logoutText: {
    marginLeft: 15,
    color: "red",
    fontSize: hp(2),
    fontFamily: 'Nunito-SemiBold'
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: hp(1.4),
    fontFamily: 'Nunito-Regular',
    color: '#999',
  },
})

export default CustomDrawer