import {useNavigation, useFocusEffect} from '@react-navigation/native';
import React, {useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions,
  ImageBackground, StatusBar, Pressable, Image, ActivityIndicator, Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Star} from 'lucide-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PieGraph from '../../Components/PieGraph';
import * as Progress from 'react-native-progress';
import {userAPI, productsAPI, categoriesAPI} from '../../api/apiService';

const {width, height} = Dimensions.get('window');
const wp = percentage => (width * percentage) / 100;
const hp = percentage => (height * percentage) / 100;

const SCAN_LIMITS = {
  free:  100,
  tier1: 1000,
  tier2: 5000,
  tier3: 10000,
};

const PLAN_META = {
  free:  {label: 'Free Plan', color: '#14BA9C'},
  tier1: {label: 'Tier 1',    color: '#14BA9C'},
  tier2: {label: 'Tier 2',    color: '#7B5EA7'},
  tier3: {label: 'Tier 3',    color: '#E8A020'},
};

const getPlanKey = userProfile => {
  const sub = userProfile?.subscription;
  if (!sub) return 'free';
  if (typeof sub === 'object') return sub.plan || 'free';
  return 'free';
};

const formatExpiry = dateStr => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date)) return null;
  return date.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'});
};

const getDaysRemaining = dateStr => {
  if (!dateStr) return null;
  const expiry = new Date(dateStr);
  const today  = new Date();
  expiry.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

const parseScans = scansUsed => {
  if (!Array.isArray(scansUsed)) return [];
  return scansUsed.map(item => {
    if (typeof item === 'string') {
      try { return JSON.parse(item); }
      catch { return null; }
    }
    return item;
  }).filter(Boolean);
};

const calculateScanStats = (scans, categoryLookup = {}) => {
  const colors = ['#4887F6', '#6F19C2', '#59C3CF', '#E2635E', '#FFBB36', '#14BA9C', '#FF9F40'];
  const groupMap = {};

  scans.forEach(scan => {
    const resolvedCategory =
      categoryLookup[scan.category_id] ||
      categoryLookup[scan.category] ||
      (scan.category && scan.category !== 'Uncategorized' ? scan.category : null);
    const key = resolvedCategory || scan.product_name || 'Unknown';
    if (!groupMap[key]) groupMap[key] = {count: 0, name: key};
    groupMap[key].count++;
  });

  const total = scans.length || 1;
  const categories = Object.values(groupMap)
    .map((cat, i) => ({
      name:       cat.name,
      count:      cat.count,
      percentage: Math.round((cat.count / total) * 100),
      color:      colors[i % colors.length],
    }))
    .sort((a, b) => b.count - a.count);

  return {categories, topCategories: categories.slice(0, 3)};
};

// ── Expiry Banner ─────────────────────────────────────────────────────
const ExpiryBanner = ({userProfile, planMeta}) => {
  const isFree     = getPlanKey(userProfile) === 'free';
  const expiryDate = userProfile?.subscription_end_time;
  const expiryStr  = formatExpiry(expiryDate);
  const daysLeft   = getDaysRemaining(expiryDate);

  if (isFree || !expiryStr) return null;

  const isExpired      = daysLeft !== null && daysLeft < 0;
  const isExpiringSoon = !isExpired && daysLeft !== null && daysLeft <= 7;

  const bgColor     = isExpired ? '#FFEBEE' : isExpiringSoon ? '#FFF8E7' : planMeta.color + '12';
  const borderColor = isExpired ? '#FF4444' : isExpiringSoon ? '#E8A020' : planMeta.color;
  const iconName    = isExpired ? 'close-circle-outline' : isExpiringSoon ? 'warning-outline' : 'time-outline';
  const iconColor   = isExpired ? '#FF4444' : isExpiringSoon ? '#E8A020' : planMeta.color;

  return (
    <View style={[styles.expiryBanner, {backgroundColor: bgColor, borderColor}]}>
      <Ionicons name={iconName} size={16} color={iconColor} />
      <View style={{marginLeft: 8, flex: 1}}>
        {isExpired ? (
          <Text style={[styles.expiryBannerTitle, {color: '#FF4444'}]}>Plan Expired</Text>
        ) : isExpiringSoon ? (
          <>
            <Text style={[styles.expiryBannerTitle, {color: '#E8A020'}]}>
              Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.expiryBannerDate}>{expiryStr}</Text>
          </>
        ) : (
          <>
            <Text style={[styles.expiryBannerLabel, {color: planMeta.color}]}>Plan renews on</Text>
            <Text style={styles.expiryBannerDate}>
              {expiryStr}{'  ·  '}
              <Text style={{color: '#999', fontFamily: 'Nunito-Regular', fontSize: hp(1.5)}}>
                {daysLeft} days left
              </Text>
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

// ── Product Card ──────────────────────────────────────────────────────
const ProductCard = ({product, onPress}) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image
      source={
        product.image
          ? {uri: product.image}
          : product.images?.[0]
          ? {uri: product.images[0]}
          : require('../../../assets/dummy_product.png')
      }
      style={styles.image}
    />
    <Text style={styles.name} numberOfLines={2}>
      {product.product_name || product.name || 'Product'}
    </Text>
    <Text style={styles.subtitle} numberOfLines={1}>
      {product.category || product.store_name || 'Uncategorized'}
    </Text>
    <View style={styles.ratingContainer}>
      <Star size={12} color="#FFD700" fill="#FFD700" />
      <Text style={styles.rating}>{product.rating || '—'}</Text>
    </View>
  </TouchableOpacity>
);

// ── My Items Tab ──────────────────────────────────────────────────────
const ScanHistoryScreen = ({loading, userProfile, scannedItems, scanStats, onProductPress}) => {
  const navigation  = useNavigation();
  const planKey     = getPlanKey(userProfile);
  const maxScans    = SCAN_LIMITS[planKey] ?? 100;
  const usedScans   = userProfile?.scans_used?.length ?? 0;
  const progress    = maxScans > 0 ? Math.min(usedScans / maxScans, 1) : 0;
  const planMeta    = PLAN_META[planKey] ?? PLAN_META.free;
  const isAtLimit   = usedScans >= maxScans;
  const isNearLimit = !isAtLimit && usedScans / maxScans >= 0.8;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const ListHeader = () => (
    <View style={{width: '100%'}}>

      {/* Plan Badge */}
      <View style={[styles.planBadge, {borderColor: planMeta.color, backgroundColor: planMeta.color + '18'}]}>
        <View style={[styles.planDot, {backgroundColor: planMeta.color}]} />
        <Text style={[styles.planBadgeText, {color: planMeta.color}]}>{planMeta.label}</Text>
        <Text style={styles.planBadgeSub}>
          {'  ·  '}{usedScans.toLocaleString()} / {maxScans.toLocaleString()} scans used
        </Text>
      </View>

      {/* Expiry Banner */}
      <ExpiryBanner userProfile={userProfile} planMeta={planMeta} />

      {/* Progress Bar */}
      <View style={{width: '95%', alignSelf: 'center', marginVertical: '4%'}}>
        <Progress.Bar
          progress={progress}
          width={null}
          height={10}
          borderWidth={0}
          borderRadius={5}
          color={isAtLimit ? '#FF4444' : planMeta.color}
          unfilledColor="#E8F4FD"
        />
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: '2%'}}>
          <View>
            <Text style={{fontFamily: 'Nunito-Bold', color: '#130160', fontSize: wp(4.5)}}>
              Total Scans
            </Text>
            <Text style={{fontFamily: 'Nunito-Bold', color: '#130160', fontSize: wp(5)}}>
              <Text style={{fontFamily: 'Nunito-Bold', color: isAtLimit ? '#FF4444' : '#FFBB36', fontSize: wp(5)}}>
                {usedScans.toLocaleString()}
              </Text>
              /{maxScans.toLocaleString()}
            </Text>
          </View>
          {isAtLimit && (
            <View style={styles.limitWarning}>
              <Text style={styles.limitWarningText}>Scan limit reached!</Text>
              <Text style={styles.limitWarningSubText}>Upgrade your plan for more scans</Text>
            </View>
          )}
          {isNearLimit && (
            <View style={[styles.limitWarning, {backgroundColor: '#FFF3E0', borderColor: '#E8A020'}]}>
              <Text style={[styles.limitWarningText, {color: '#E8A020'}]}>
                {(maxScans - usedScans).toLocaleString()} scans remaining
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Scan Usage Pie Chart ── */}
      <View style={{alignItems: 'center', marginVertical: '4%'}}>
        <Text style={{
          color: '#130160', fontFamily: 'Nunito-SemiBold',
          fontSize: hp(2), textDecorationLine: 'underline', marginBottom: hp(2),
        }}>
          SCAN USAGE
        </Text>

        <View style={{
          flexDirection: 'row', alignItems: 'center',
          justifyContent: 'center', gap: wp(6),
        }}>
          {/* Pie Chart */}
          <PieGraph
            used={usedScans}
            total={maxScans}
            color={isAtLimit ? '#FF4444' : planMeta.color}
          />

          {/* Legend */}
          <View style={{gap: hp(1.5)}}>
            {/* Used */}
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <View style={{
                width: 12, height: 12, borderRadius: 6,
                backgroundColor: isAtLimit ? '#FF4444' : planMeta.color,
              }} />
              <View>
                <Text style={{fontFamily: 'Nunito-Bold', color: '#130160', fontSize: hp(1.8)}}>
                  {usedScans.toLocaleString()}
                </Text>
                <Text style={{fontFamily: 'Nunito-Regular', color: '#999', fontSize: hp(1.4)}}>
                  Scans Used
                </Text>
              </View>
            </View>

            {/* Remaining */}
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <View style={{width: 12, height: 12, borderRadius: 6, backgroundColor: '#E8F4FD'}} />
              <View>
                <Text style={{fontFamily: 'Nunito-Bold', color: '#130160', fontSize: hp(1.8)}}>
                  {Math.max(maxScans - usedScans, 0).toLocaleString()}
                </Text>
                <Text style={{fontFamily: 'Nunito-Regular', color: '#999', fontSize: hp(1.4)}}>
                  Remaining
                </Text>
              </View>
            </View>

            {/* Total */}
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <View style={{width: 12, height: 12, borderRadius: 6, backgroundColor: '#F0F0F0'}} />
              <View>
                <Text style={{fontFamily: 'Nunito-Bold', color: '#130160', fontSize: hp(1.8)}}>
                  {maxScans.toLocaleString()}
                </Text>
                <Text style={{fontFamily: 'Nunito-Regular', color: '#999', fontSize: hp(1.4)}}>
                  Total Limit
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* MY ITEMS header */}
      <View style={{
        width: '100%', flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginVertical: '8%', paddingHorizontal: '2%',
      }}>
        <Text style={{color: '#000000', fontFamily: 'Nunito-Bold', fontSize: hp(2.4)}}>MY ITEMS</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AllItems')}>
          <Text style={{color: '#524B6B', fontSize: hp(1.9), textDecorationLine: 'underline'}}>View All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={scannedItems}
      renderItem={({item}) => <ProductCard product={item} onPress={() => onProductPress(item)} />}
      keyExtractor={(item, index) => item.scan_id || item._id || item.id || index.toString()}
      numColumns={3}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No scanned items yet</Text>
          <Text style={styles.emptySubtext}>Start scanning to see your items here</Text>
        </View>
      }
      contentContainerStyle={{paddingBottom: hp(15), paddingHorizontal: wp(2)}}
    />
  );
};

// ── Scan History Tab ──────────────────────────────────────────────────
const MyItemsScreen = ({loading, userProfile, scanHistory, onProductPress}) => {
  const planKey   = getPlanKey(userProfile);
  const maxScans  = SCAN_LIMITS[planKey] ?? 100;
  const usedScans = userProfile?.scans_used?.length ?? 0;
  const progress  = maxScans > 0 ? Math.min(usedScans / maxScans, 1) : 0;
  const planMeta  = PLAN_META[planKey] ?? PLAN_META.free;
  const isAtLimit = usedScans >= maxScans;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const ListHeader = () => (
    <View>
      <View style={[styles.planBadge, {borderColor: planMeta.color, backgroundColor: planMeta.color + '18'}]}>
        <View style={[styles.planDot, {backgroundColor: planMeta.color}]} />
        <Text style={[styles.planBadgeText, {color: planMeta.color}]}>{planMeta.label}</Text>
        <Text style={styles.planBadgeSub}>
          {'  ·  '}{usedScans.toLocaleString()} / {maxScans.toLocaleString()} scans used
        </Text>
      </View>

      <ExpiryBanner userProfile={userProfile} planMeta={planMeta} />

      <View style={{width: '95%', alignSelf: 'center', marginVertical: '4%'}}>
        <Progress.Bar
          progress={progress}
          width={null}
          height={10}
          borderWidth={0}
          borderRadius={5}
          color={isAtLimit ? '#FF4444' : planMeta.color}
          unfilledColor="#E8F4FD"
        />
        <View style={{marginVertical: '2%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <View>
            <Text style={{fontFamily: 'Nunito-Bold', color: '#130160', fontSize: wp(4.5)}}>Total Scans</Text>
            <Text style={{fontFamily: 'Nunito-Bold', color: '#130160', fontSize: wp(5)}}>
              <Text style={{fontFamily: 'Nunito-Bold', color: isAtLimit ? '#FF4444' : '#FFBB36', fontSize: wp(5)}}>
                {usedScans.toLocaleString()}
              </Text>
              /{maxScans.toLocaleString()}
            </Text>
          </View>
          {isAtLimit && (
            <View style={styles.limitWarning}>
              <Text style={styles.limitWarningText}>Scan limit reached!</Text>
              <Text style={styles.limitWarningSubText}>Upgrade your plan</Text>
            </View>
          )}
        </View>
      </View>

      <View style={{
        width: '100%', flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginVertical: '7%', paddingHorizontal: '2%',
      }}>
        <Text style={{color: '#000000', fontFamily: 'Nunito-Bold', fontSize: hp(2.2)}}>SCANS HISTORY</Text>
        <Text style={{color: '#524B6B', fontSize: hp(2), textDecorationLine: 'underline'}}>View All</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={scanHistory}
      renderItem={({item}) => <ProductCard product={item} onPress={() => onProductPress(item)} />}
      keyExtractor={(item, index) => item.scan_id || item._id || item.id || index.toString()}
      numColumns={3}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No scan history</Text>
          <Text style={styles.emptySubtext}>Your scan history will appear here</Text>
        </View>
      }
      contentContainerStyle={{paddingBottom: hp(15), paddingHorizontal: wp(2)}}
    />
  );
};

// ── Main Library Component ────────────────────────────────────────────
const MyLibrary = () => {
  const [activeTab, setActiveTab]       = useState('scan');
  const navigation                      = useNavigation();
  const [loading, setLoading]           = useState(true);
  const [userProfile, setUserProfile]   = useState(null);
  const [scannedItems, setScannedItems] = useState([]);
  const [scanHistory, setScanHistory]   = useState([]);
  const [scanStats, setScanStats]       = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchLibraryData();
    }, [activeTab]),
  );

  const fetchLibraryData = async () => {
    try {
      setLoading(true);

      const [profileResponse, categoriesResponse] = await Promise.all([
        userAPI.getProfile(),
        categoriesAPI.getAll().catch(() => null),
      ]);

      const categoryLookup = {};
      const rawCats = categoriesResponse?.categories || categoriesResponse || [];
      if (Array.isArray(rawCats)) {
        rawCats.forEach(cat => {
          const name = cat.name || cat.label || 'Uncategorized';
          if (cat._id)  categoryLookup[cat._id]  = name;
          if (cat.name) categoryLookup[cat.name] = name;
        });
      }

      if (profileResponse) {
        const userData = profileResponse.user || profileResponse;
        setUserProfile(userData);

        if (userData.scans_used && Array.isArray(userData.scans_used)) {
          const parsedScans = parseScans(userData.scans_used);
          setScannedItems(parsedScans);
          setScanHistory(parsedScans);
          setScanStats(calculateScanStats(parsedScans, categoryLookup));
        } else {
          try {
            const productsResponse = await productsAPI.getAll?.();
            if (productsResponse?.products) {
              setScannedItems(productsResponse.products.slice(0, 6));
              setScanHistory(productsResponse.products.slice(0, 6));
            }
          } catch (err) {
            console.log('No products found:', err);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching library data:', err);
      Alert.alert('Error', 'Failed to load library data');
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = product => navigation.navigate('SinglePageItem', {product});

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}
        resizeMode="stretch">

        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color={'#0D0D26'} size={25} />
            </Pressable>
            <Text style={styles.headerText}>My Library</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'scan' && styles.activeTab]}
            onPress={() => setActiveTab('scan')}>
            <Text style={[styles.tabText, activeTab === 'scan' && styles.activeTabText]}>My Items</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'items' && styles.activeTab]}
            onPress={() => setActiveTab('items')}>
            <Text style={[styles.tabText, activeTab === 'items' && styles.activeTabText]}>Scan History</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'scan' && (
          <ScanHistoryScreen
            loading={loading}
            userProfile={userProfile}
            scannedItems={scannedItems}
            scanStats={scanStats}
            onProductPress={handleProductPress}
          />
        )}
        {activeTab === 'items' && (
          <MyItemsScreen
            loading={loading}
            userProfile={userProfile}
            scanHistory={scanHistory}
            onProductPress={handleProductPress}
          />
        )}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container:   {flex: 1, backgroundColor: '#E6F3F5'},
  header: {
    width: wp(100), height: hp(7), marginTop: '10%',
    paddingHorizontal: '5%', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  headerChild:  {flexDirection: 'row', alignItems: 'center', gap: 10},
  headerText:   {fontFamily: 'Nunito-Bold', fontSize: hp(3), color: '#0D0140'},
  tabContainer: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginVertical: '5%', width: wp(100),
    height: hp(6), paddingHorizontal: '5%',
  },
  tab: {
    width: wp(40), justifyContent: 'center', alignItems: 'center',
    borderRadius: 10, borderWidth: 1.2, borderColor: '#99ABC62E',
  },
  activeTab:     {backgroundColor: '#2CCCA6', borderColor: '#2CCCA6'},
  tabText:       {fontSize: hp(1.9), fontFamily: 'Nunito-SemiBold', color: '#000'},
  activeTabText: {color: '#fff'},
  vector:        {flex: 1, width: wp(100)},
  planBadge: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: '2%', marginTop: '3%',
    padding: 10, borderRadius: 10, borderWidth: 1,
  },
  planDot:        {width: 10, height: 10, borderRadius: 5, marginRight: 6},
  planBadgeText:  {fontFamily: 'Nunito-Bold', fontSize: hp(1.9)},
  planBadgeSub:   {fontFamily: 'Nunito-Regular', fontSize: hp(1.7), color: '#666'},
  expiryBanner: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: '2%', marginTop: '2%',
    padding: 10, borderRadius: 10, borderWidth: 1,
  },
  expiryBannerLabel: {fontFamily: 'Nunito-Regular', fontSize: hp(1.5)},
  expiryBannerTitle: {fontFamily: 'Nunito-Bold', fontSize: hp(1.8)},
  expiryBannerDate:  {fontFamily: 'Nunito-Bold', fontSize: hp(1.8), color: '#130160'},
  limitWarning: {
    backgroundColor: '#FFEBEE', borderRadius: 8,
    padding: 8, borderWidth: 1, borderColor: '#FF4444', alignItems: 'center',
  },
  limitWarningText:    {fontFamily: 'Nunito-Bold', fontSize: hp(1.7), color: '#FF4444'},
  limitWarningSubText: {fontFamily: 'Nunito-Regular', fontSize: hp(1.5), color: '#FF4444'},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80},
  loadingText:      {marginTop: 10, fontFamily: 'Nunito-Regular', fontSize: hp(2), color: '#666'},
  emptyContainer:   {flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80},
  emptyText:        {fontFamily: 'Nunito-Bold', fontSize: hp(2.5), color: '#666', marginTop: 20},
  emptySubtext:     {fontFamily: 'Nunito-Regular', fontSize: hp(1.8), color: '#999', marginTop: 10},
  card: {
    width: '30%', backgroundColor: '#fff', borderRadius: 8, padding: '2%',
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    marginHorizontal: '1.5%', marginBottom: '5%',
  },
  image:           {width: '100%', height: hp(10), marginBottom: 10, borderRadius: 5},
  name:            {fontSize: hp(1.36), marginBottom: 4, color: '#000', fontFamily: 'DMSans-SemiBold'},
  subtitle:        {fontSize: hp(1.5), color: '#14BA9C', fontFamily: 'DMSans-SemiBold', marginBottom: '8%'},
  ratingContainer: {flexDirection: 'row', alignItems: 'center', marginBottom: 4},
  rating:          {fontSize: hp(1.3), fontWeight: 'bold', color: '#000', marginLeft: 2},
  reviews:         {marginLeft: 4, fontSize: hp(1.2), color: '#666'},
  grid:            {paddingBottom: 20},
});

export default MyLibrary;