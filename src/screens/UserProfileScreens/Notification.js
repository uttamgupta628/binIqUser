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
  RefreshControl,
} from 'react-native';
import React, {useState, useCallback} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {format} from 'date-fns';
import {notificationsAPI} from '../../api/apiService';

const {width, height} = require('react-native').Dimensions.get('window');
const wp = percentage => (width * percentage) / 100;
const hp = percentage => (height * percentage) / 100;

const Notifications = () => {
  const navigation = useNavigation();

  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // ── Fetch real notifications from backend ──────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, []),
  );

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsAPI.getAll();

      // Backend returns array directly
      const list = Array.isArray(data) ? data : data.notifications || [];

      // Sort newest first
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setNotifications(list);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      Alert.alert('Error', 'Failed to load notifications. Pull down to retry.');
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // ── Mark as read — calls real backend endpoint ─────────────────────────────
  const handleMarkAsRead = async notification => {
    if (notification.read) return;
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n =>
          n._id === notification._id ? {...n, read: true} : n,
        ),
      );
      await notificationsAPI.markAsRead(notification._id);
    } catch (err) {
      console.error('Mark as read error:', err);
      // Revert on failure
      setNotifications(prev =>
        prev.map(n =>
          n._id === notification._id ? {...n, read: false} : n,
        ),
      );
    }
  };

  // ── Mark all as read ───────────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (!unread.length) return;

    // Optimistic update all
    setNotifications(prev => prev.map(n => ({...n, read: true})));

    try {
      await Promise.all(unread.map(n => notificationsAPI.markAsRead(n._id)));
    } catch (err) {
      console.error('Mark all read error:', err);
      // Revert
      fetchNotifications();
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatNotificationTime = time => {
    if (!time) return 'Just now';
    try {
      const date = new Date(time);
      const now  = new Date();
      const diffMin = Math.floor((now - date) / 60000);

      if (diffMin < 1)  return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;

      const diffHrs = Math.floor(diffMin / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;

      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays < 7) return `${diffDays}d ago`;

      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'Recently';
    }
  };

  const getIconAndColor = notification => {
    // Map backend `type` field to icon + color
    switch (notification.type) {
      case 'store_owner':
        return {icon: 'storefront-outline',       color: '#14BA9C'};
      case 'reseller':
        return {icon: 'person-outline',           color: '#0049AF'};
      case 'subscription':
        return {icon: 'checkmark-circle-outline', color: '#14BA9C'};
      case 'promotion':
        return {icon: 'pricetag-outline',         color: '#FFBB36'};
      case 'warning':
        return {icon: 'warning-outline',          color: '#FF9F40'};
      case 'verification':
        return {icon: 'shield-checkmark-outline', color: '#130160'};
      default:
        return {icon: 'notifications-outline',   color: '#130160'};
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Notification Item ──────────────────────────────────────────────────────
  const NotificationItem = ({notification}) => {
    const {icon, color} = getIconAndColor(notification);
    const isUnread = !notification.read;

    return (
      <TouchableOpacity
        style={[styles.notificationItem, isUnread && styles.notificationItemUnread]}
        onPress={() => handleMarkAsRead(notification)}
        activeOpacity={0.7}>

        <View style={[styles.iconContainer, {backgroundColor: color + '20'}]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle} numberOfLines={1}>
              {notification.heading}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.notificationDescription} numberOfLines={2}>
            {notification.content}
          </Text>

          <View style={styles.notificationFooter}>
            <Text style={styles.notificationTime}>
              {formatNotificationTime(notification.created_at)}
            </Text>
            {isUnread && (
              <TouchableOpacity onPress={() => handleMarkAsRead(notification)}>
                <Text style={styles.markReadText}>Mark read</Text>
              </TouchableOpacity>
            )}
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor="transparent" />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}
        resizeMode="stretch">

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color="#0D0D26" size={25} />
            </Pressable>
            <Text style={styles.headerText}>Notifications</Text>
          </View>

          <View style={styles.headerRight}>
            {unreadCount > 0 && (
              <>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
                <TouchableOpacity
                  style={styles.markAllBtn}
                  onPress={handleMarkAllRead}>
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* List */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#130160']}
            />
          }>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#130160" />
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <EmptyState />
          ) : (
            <View style={styles.list}>
              {notifications.map(notification => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                />
              ))}
            </View>
          )}

          <View style={{height: 80}} />
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#E6F3F5'},
  vector:    {flex: 1, width: wp(100)},

  // Header
  header: {
    width: wp(100), height: hp(7),
    marginTop: '10%', paddingHorizontal: '5%',
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft:  {flexDirection: 'row', alignItems: 'center', gap: 10},
  headerRight: {flexDirection: 'row', alignItems: 'center', gap: 8},
  headerText:  {fontFamily: 'Nunito-Bold', fontSize: hp(3), color: '#0D0140'},

  // Badge
  badge: {
    backgroundColor: '#FF3B30', borderRadius: 12,
    paddingHorizontal: 8, paddingVertical: 3,
    minWidth: 24, alignItems: 'center',
  },
  badgeText: {color: '#fff', fontSize: 12, fontWeight: 'bold'},

  // Mark all
  markAllBtn:  {},
  markAllText: {
    fontSize: hp(1.5), color: '#130160',
    fontFamily: 'Nunito-SemiBold', textDecorationLine: 'underline',
  },

  scrollView: {flex: 1, marginTop: '2%'},
  list:       {paddingBottom: 20},

  // Notification card
  notificationItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: wp(5), marginVertical: hp(0.8),
    borderRadius: 12, padding: '4%',
    shadowColor: '#000', shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  notificationItemUnread: {
    backgroundColor: '#F0F6FF',
    borderLeftWidth: 4, borderLeftColor: '#130160',
  },
  iconContainer: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  notificationContent: {flex: 1},
  notificationHeader:  {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 3,
  },
  notificationTitle: {
    fontSize: hp(1.9), fontFamily: 'Nunito-SemiBold',
    color: '#000', flex: 1,
  },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#130160', marginLeft: 8,
  },
  notificationDescription: {
    fontSize: hp(1.6), color: '#666',
    fontFamily: 'Nunito-Regular', lineHeight: hp(2.4), marginBottom: 6,
  },
  notificationFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  notificationTime: {fontSize: hp(1.4), color: '#9A9A9A', fontFamily: 'Nunito-Regular'},
  markReadText:     {fontSize: hp(1.4), color: '#130160', fontFamily: 'Nunito-SemiBold'},

  // Loading
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80,
  },
  loadingText: {
    marginTop: 10, fontFamily: 'Nunito-Regular',
    fontSize: hp(2), color: '#666',
  },

  // Empty
  emptyContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingVertical: 100, paddingHorizontal: 40,
  },
  emptyText:    {fontFamily: 'Nunito-Bold', fontSize: hp(2.5), color: '#666', marginTop: 20},
  emptySubtext: {
    fontFamily: 'Nunito-Regular', fontSize: hp(1.8),
    color: '#999', marginTop: 10, textAlign: 'center',
  },
});