import { 
    ImageBackground, 
    Pressable, 
    StatusBar, 
    StyleSheet, 
    Text, 
    View, 
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl
} from 'react-native'
import React, { useState, useCallback } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { userAPI } from '../../api/apiService';

const { width, height } = require('react-native').Dimensions.get('window');

const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const DELETED_NOTIFICATIONS_KEY = '@deleted_notifications';
const READ_NOTIFICATIONS_KEY = '@read_notifications';

const Notification = () => {
    const navigation = useNavigation();
    
    // State
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [deletedNotificationIds, setDeletedNotificationIds] = useState([]);
    const [readNotificationIds, setReadNotificationIds] = useState([]);

    // Fetch notifications when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadDeletedAndReadNotifications();
            fetchNotifications();
        }, [])
    );

    const loadDeletedAndReadNotifications = async () => {
        try {
            const deletedIds = await AsyncStorage.getItem(DELETED_NOTIFICATIONS_KEY);
            const readIds = await AsyncStorage.getItem(READ_NOTIFICATIONS_KEY);
            
            if (deletedIds) {
                setDeletedNotificationIds(JSON.parse(deletedIds));
            }
            
            if (readIds) {
                setReadNotificationIds(JSON.parse(readIds));
            }
        } catch (err) {
            console.error('Error loading notification state:', err);
        }
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            
            // Fetch user profile to get notifications
            const response = await userAPI.getProfile();
            console.log('Profile response for notifications:', response);
            
            if (response) {
                const userData = response.user || response;
                
                // Check for notifications in user data
                // This could be in different formats depending on your backend
                let notificationsList = [];
                
                // Option 1: Direct notifications array
                if (userData.notifications && Array.isArray(userData.notifications)) {
                    notificationsList = userData.notifications;
                }
                
                // Option 2: Promotions as notifications
                if (userData.promotions && Array.isArray(userData.promotions)) {
                    const promoNotifications = userData.promotions.map(promo => ({
                        id: promo._id || promo.id,
                        type: 'promotion',
                        title: promo.title || 'New Promotion Available',
                        description: promo.description || 'Check out our latest promotion!',
                        time: promo.created_at || promo.date,
                        read: promo.read || false,
                        icon: 'pricetag-outline'
                    }));
                    notificationsList = [...notificationsList, ...promoNotifications];
                }
                
                // Option 3: Create system notifications from user activity
                const systemNotifications = [];
                
                // Subscription notifications
                if (userData.subscription) {
                    systemNotifications.push({
                        id: 'subscription-active',
                        type: 'subscription',
                        title: 'Subscription Active',
                        description: `Your ${userData.subscription} subscription is active`,
                        time: userData.subscription_end_time,
                        read: false,
                        icon: 'checkmark-circle-outline'
                    });
                }
                
                // Scan limit notifications
                if (userData.total_scans >= 80) {
                    systemNotifications.push({
                        id: 'scan-limit-warning',
                        type: 'warning',
                        title: 'Scan Limit Warning',
                        description: `You've used ${userData.total_scans} out of 100 scans`,
                        time: new Date().toISOString(),
                        read: false,
                        icon: 'warning-outline'
                    });
                }
                
                // Verification notification
                if (!userData.verified) {
                    systemNotifications.push({
                        id: 'verify-account',
                        type: 'verification',
                        title: 'Verify Your Account',
                        description: 'Please verify your email to unlock all features',
                        time: userData.created_at,
                        read: false,
                        icon: 'mail-outline'
                    });
                }
                
                // Combine all notifications
                notificationsList = [...systemNotifications, ...notificationsList];
                
                // Filter out deleted notifications
                notificationsList = notificationsList.filter(
                    notif => !deletedNotificationIds.includes(notif.id)
                );
                
                // Mark read notifications
                notificationsList = notificationsList.map(notif => ({
                    ...notif,
                    read: readNotificationIds.includes(notif.id) || notif.read
                }));
                
                // Sort by time (newest first)
                notificationsList.sort((a, b) => {
                    const dateA = new Date(a.time || 0);
                    const dateB = new Date(b.time || 0);
                    return dateB - dateA;
                });
                
                setNotifications(notificationsList);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
            // Don't show alert on initial load
            if (notifications.length > 0) {
                Alert.alert('Error', 'Failed to load notifications');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handleDeleteNotification = async (notificationId) => {
        Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Remove from local state immediately
                            setNotifications(prev => 
                                prev.filter(notif => notif.id !== notificationId)
                            );
                            
                            // Save to deleted list in AsyncStorage
                            const updatedDeletedIds = [...deletedNotificationIds, notificationId];
                            setDeletedNotificationIds(updatedDeletedIds);
                            
                            await AsyncStorage.setItem(
                                DELETED_NOTIFICATIONS_KEY,
                                JSON.stringify(updatedDeletedIds)
                            );
                            
                            console.log('Notification deleted and persisted:', notificationId);
                        } catch (err) {
                            console.error('Error deleting notification:', err);
                            Alert.alert('Error', 'Failed to delete notification');
                            // Refresh to restore state
                            fetchNotifications();
                        }
                    }
                }
            ]
        );
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, read: true }
                        : notif
                )
            );
            
            // Save to read list in AsyncStorage
            if (!readNotificationIds.includes(notificationId)) {
                const updatedReadIds = [...readNotificationIds, notificationId];
                setReadNotificationIds(updatedReadIds);
                
                await AsyncStorage.setItem(
                    READ_NOTIFICATIONS_KEY,
                    JSON.stringify(updatedReadIds)
                );
            }
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const formatNotificationTime = (time) => {
        if (!time) return 'Just now';
        
        try {
            const date = new Date(time);
            const now = new Date();
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));
            
            if (diffInMinutes < 1) return 'Just now';
            if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
            
            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) return `${diffInHours} hours ago`;
            
            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays < 7) return `${diffInDays} days ago`;
            
            return format(date, 'MMM dd, yyyy');
        } catch (err) {
            return 'Recently';
        }
    };

    const getNotificationIcon = (notification) => {
        if (notification.icon) return notification.icon;
        
        switch (notification.type) {
            case 'promotion':
                return 'pricetag-outline';
            case 'subscription':
                return 'checkmark-circle-outline';
            case 'warning':
                return 'warning-outline';
            case 'verification':
                return 'mail-outline';
            default:
                return 'document-text-outline';
        }
    };

    const getNotificationColor = (notification) => {
        switch (notification.type) {
            case 'promotion':
                return '#FFBB36';
            case 'subscription':
                return '#14BA9C';
            case 'warning':
                return '#FF9F40';
            case 'verification':
                return '#0049AF';
            default:
                return '#14BA9C';
        }
    };

    const NotificationItem = ({ notification }) => {
        const isUnread = !notification.read;
        
        return (
            <TouchableOpacity 
                style={[
                    styles.notificationItem,
                    isUnread && styles.notificationItemUnread
                ]}
                onPress={() => handleMarkAsRead(notification.id)}
                activeOpacity={0.7}
            >
                <View 
                    style={[
                        styles.iconContainer,
                        { backgroundColor: getNotificationColor(notification) + '20' }
                    ]}
                >
                    <Ionicons 
                        name={getNotificationIcon(notification)} 
                        size={24} 
                        color={getNotificationColor(notification)} 
                    />
                </View>
                <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                        <Text style={styles.notificationTitle}>
                            {notification.title}
                        </Text>
                        {isUnread && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationDescription} numberOfLines={2}>
                        {notification.description}
                    </Text>
                    <View style={styles.deleteButton}>
                        <Text style={styles.notificationTime}>
                            {formatNotificationTime(notification.time)}
                        </Text>
                        <TouchableOpacity 
                            onPress={() => handleDeleteNotification(notification.id)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>
                You're all caught up! New notifications will appear here.
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar translucent={true} backgroundColor={'transparent'} />
            <ImageBackground
                source={require('../../../assets/vector_1.png')}
                style={styles.vector}
                resizeMode="stretch"
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerChild}>
                        <Pressable onPress={() => navigation.goBack()}>
                            <MaterialIcons name='arrow-back-ios' color={'#0D0D26'} size={25} />
                        </Pressable>
                        <Text style={styles.headerText}>Notifications</Text>
                    </View>
                    {notifications.length > 0 && (
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationBadgeText}>
                                {notifications.filter(n => !n.read).length}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Notifications List */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={['#130160']}
                        />
                    }
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#130160" />
                            <Text style={styles.loadingText}>Loading notifications...</Text>
                        </View>
                    ) : notifications.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <View style={styles.notificationsList}>
                            {notifications.map((notification) => (
                                <NotificationItem 
                                    key={notification.id} 
                                    notification={notification} 
                                />
                            ))}
                        </View>
                    )}
                    <View style={{ height: 80 }} />
                </ScrollView>
            </ImageBackground>
        </View>
    );
};

export default Notification;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E6F3F5',
    },
    vector: {
        flex: 1,
        width: wp(100),
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
        gap: 10,
    },
    headerText: {
        fontFamily: 'Nunito-Bold',
        fontSize: hp(3),
        color: '#0D0140'
    },
    notificationBadge: {
        backgroundColor: '#FF3B30',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        minWidth: 24,
        alignItems: 'center',
    },
    notificationBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
        marginTop: '2%',
    },
    notificationsList: {
        paddingBottom: 20,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: wp(5),
        marginVertical: hp(1),
        borderRadius: 10,
        padding: '4%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    notificationItemUnread: {
        backgroundColor: '#F0F8FF',
        borderLeftWidth: 4,
        borderLeftColor: '#130160',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#130160',
        marginLeft: 8,
    },
    notificationTime: {
        fontSize: 12,
        color: '#8E8E93',
    },
    notificationDescription: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 8,
        lineHeight: 20,
    },
    deleteButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    deleteText: {
        fontSize: 14,
        color: '#FF3B30',
        fontWeight: '500',
    },
    // Loading State
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    loadingText: {
        marginTop: 10,
        fontFamily: 'Nunito-Regular',
        fontSize: hp(2),
        color: '#666',
    },
    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontFamily: 'Nunito-Bold',
        fontSize: hp(2.5),
        color: '#666',
        marginTop: 20,
    },
    emptySubtext: {
        fontFamily: 'Nunito-Regular',
        fontSize: hp(1.8),
        color: '#999',
        marginTop: 10,
        textAlign: 'center',
    },
});