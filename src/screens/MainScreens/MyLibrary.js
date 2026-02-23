import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ImageBackground,
  StatusBar,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Star, Heart } from 'lucide-react-native';
import SearchIcon from '../../../assets/SearchIcon.svg';
import PieGraph from '../../Components/PieGraph';
import * as Progress from 'react-native-progress';
import { scanAPI } from '../../api/apiService';  // ✅ use apiService

const { width, height } = Dimensions.get('window');
const wp = percentage => (width * percentage) / 100;
const hp = percentage => (height * percentage) / 100;

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image
      source={
        product.image
          ? { uri: product.image }
          : require('../../../assets/dummy_product.png')
      }
      style={styles.image}
    />
    <Text style={styles.name} numberOfLines={2}>
      {product.product_name || product.qr_data || 'Product'}
    </Text>
    <Text style={styles.subtitle} numberOfLines={1}>
      {product.category || 'Uncategorized'}
    </Text>
    <View style={styles.ratingContainer}>
      <Star size={12} color="#FFD700" fill="#FFD700" />
      <Text style={styles.rating}>4.8</Text>
      <Text style={styles.reviews}>88 Reviews</Text>
    </View>
    <Text style={styles.scanDate} numberOfLines={1}>
      {product.scanned_at ? new Date(product.scanned_at).toLocaleDateString() : ''}
    </Text>
    <TouchableOpacity style={styles.heartButton}>
      <Heart size={15} color="red" />
    </TouchableOpacity>
  </TouchableOpacity>
);

// ─── My Items Tab ─────────────────────────────────────────────────────────────
const ScanHistoryScreen = ({ loading, userProfile, scannedItems, scanStats, onProductPress }) => {
  const navigation = useNavigation();
  const progress = userProfile?.total_scans ? userProfile.total_scans / 100 : 0;
  const maxBalance = 100;
  const currentBalance = Math.min(userProfile?.total_scans || 0, maxBalance);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ width: '100%' }}>
      {/* Progress Bar */}
      <View style={{ width: '95%', alignSelf: 'center', marginVertical: '5%' }}>
        <Progress.Bar
          progress={progress}
          width={null}
          height={10}
          borderWidth={0}
          borderRadius={5}
          color="#FFA726"
          unfilledColor="#90CAF9"
        />
        <View style={{ marginVertical: '2%' }}>
          <Text style={{ fontFamily: 'Nunito-Bold', color: '#130160', fontSize: wp(4.5) }}>
            Total Scans
          </Text>
          <Text style={{ fontFamily: 'Nunito-Bold', color: '#130160', fontSize: wp(5) }}>
            <Text style={{ fontFamily: 'Nunito-Bold', color: '#FFBB36', fontSize: wp(5) }}>
              {currentBalance}
            </Text>
            /{maxBalance}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={{ ...styles.searchParent, marginBottom: '4%' }}>
        <Pressable style={styles.searchContainer}>
          <View style={styles.cameraButton}><SearchIcon /></View>
          <Text style={styles.input}>search for anything</Text>
        </Pressable>
      </View>

      {/* Scan Category Analytics */}
      {scanStats && scanStats.categories && scanStats.categories.length > 0 && (
        <View style={{ height: hp(38), flexDirection: 'row' }}>
          <View style={{ width: '72%', justifyContent: 'space-around', alignItems: 'center' }}>
            <View style={{ width: '80%' }}>
              <Text style={{ color: '#130160', fontFamily: 'Nunito-SemiBold', fontSize: hp(2), textDecorationLine: 'underline' }}>
                SCANS CATEGORY
              </Text>
            </View>
            <View>
              <PieGraph data={scanStats.categories} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '90%' }}>
              {scanStats.topCategories?.slice(0, 3).map((cat, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: wp(4), height: hp(1.2), backgroundColor: cat.color || '#0049AF', borderRadius: 3 }} />
                  <Text style={{ color: '#000', fontSize: hp(1.4) }}>{' '}{cat.name}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={{ width: '28%', height: '100%', justifyContent: 'space-between' }}>
            {scanStats.categories?.slice(0, 5).map((cat, index) => (
              <View key={index} style={{ height: '18%', width: '100%', paddingRight: '4%' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ width: 13, height: 13, backgroundColor: cat.color || '#0049AF', borderRadius: 20 }} />
                  <Text style={{ color: 'gray', fontSize: hp(1.9) }} numberOfLines={1}>{cat.name}</Text>
                </View>
                <View style={{ width: '68%', alignSelf: 'flex-end', paddingVertical: '1%' }}>
                  <Text style={{ color: '#000', fontWeight: '600', fontSize: hp(2.2) }}>{cat.percentage || 0}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* My Items Header */}
      <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: '8%', paddingHorizontal: '2%' }}>
        <Text style={{ color: '#000000', fontFamily: 'Nunito-Bold', fontSize: hp(2.4) }}>MY ITEMS</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AllItems')}>
          <Text style={{ color: '#524B6B', fontSize: hp(1.9), textDecorationLine: 'underline' }}>View All</Text>
        </TouchableOpacity>
      </View>

      {scannedItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No scanned items yet</Text>
          <Text style={styles.emptySubtext}>Start scanning to see your items here</Text>
        </View>
      ) : (
        <View style={{ flex: 1, width: '100%', marginBottom: '22%' }}>
          <FlatList
            data={scannedItems}
            renderItem={({ item }) => <ProductCard product={item} onPress={() => onProductPress(item)} />}
            keyExtractor={(item, index) => item.scan_id || index.toString()}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      )}
    </View>
  );
};

// ─── Scan History Tab ─────────────────────────────────────────────────────────
const MyItemsScreen = ({ loading, userProfile, scanHistory, onProductPress }) => {
  const progress = userProfile?.total_scans ? userProfile.total_scans / 100 : 0;
  const maxBalance = 100;
  const currentBalance = Math.min(userProfile?.total_scans || 0, maxBalance);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: '22%' }}>
      <View style={{ width: '95%', alignSelf: 'center', marginVertical: '5%' }}>
        <Progress.Bar
          progress={progress}
          width={null}
          height={10}
          borderWidth={0}
          borderRadius={5}
          color="#FFA726"
          unfilledColor="#90CAF9"
        />
        <View style={{ marginVertical: '2%' }}>
          <Text style={{ fontFamily: 'Nunito-Bold', color: '#130160', fontSize: wp(4.5) }}>Total Scans</Text>
          <Text style={{ fontFamily: 'Nunito-Bold', color: '#130160', fontSize: wp(5) }}>
            <Text style={{ fontFamily: 'Nunito-Bold', color: '#FFBB36', fontSize: wp(5) }}>{currentBalance}</Text>
            /{maxBalance}
          </Text>
        </View>
      </View>
      <View style={styles.searchParent}>
        <Pressable style={styles.searchContainer}>
          <View style={styles.cameraButton}><SearchIcon /></View>
          <Text style={styles.input}>search for anything</Text>
        </Pressable>
      </View>
      <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: '7%', paddingHorizontal: '2%' }}>
        <Text style={{ color: '#000000', fontFamily: 'Nunito-Bold', fontSize: hp(2.2) }}>SCANS HISTORY</Text>
        <Text style={{ color: '#524B6B', fontSize: hp(2), textDecorationLine: 'underline' }}>View All</Text>
      </View>
      {scanHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No scan history</Text>
          <Text style={styles.emptySubtext}>Your scan history will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={scanHistory}
          renderItem={({ item }) => <ProductCard product={item} onPress={() => onProductPress(item)} />}
          keyExtractor={(item, index) => item.scan_id || index.toString()}
          numColumns={3}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};

// ─── All Scans Tab ────────────────────────────────────────────────────────────
const AllTotalScans = ({ loading, allScans, onProductPress }) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: '22%' }}>
      <View style={{ height: hp(4) }} />
      <View style={styles.searchParent}>
        <Pressable style={styles.searchContainer}>
          <View style={styles.cameraButton}><SearchIcon /></View>
          <Text style={styles.input}>search for anything</Text>
        </Pressable>
      </View>
      <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: '7%', paddingHorizontal: '2%' }}>
        <Text style={{ color: '#000000', fontFamily: 'Nunito-Bold', fontSize: hp(2.2) }}>MY SCAN</Text>
        <Text style={{ color: '#524B6B', fontSize: hp(2), textDecorationLine: 'underline' }}>View All</Text>
      </View>
      {allScans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No scans found</Text>
          <Text style={styles.emptySubtext}>Start scanning products to build your library</Text>
        </View>
      ) : (
        <FlatList
          data={allScans}
          renderItem={({ item }) => <ProductCard product={item} onPress={() => onProductPress(item)} />}
          keyExtractor={(item, index) => item.scan_id || index.toString()}
          numColumns={3}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};

// ─── Main MyLibrary ───────────────────────────────────────────────────────────
const MyLibrary = () => {
  const [activeTab, setActiveTab] = useState('scan');
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [scannedItems, setScannedItems] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);
  const [allScans, setAllScans] = useState([]);
  const [scanStats, setScanStats] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchLibraryData();
    }, []),
  );

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      console.log('Fetching scans...');

      const data = await scanAPI.getScans();  // ✅ uses apiService with token from AsyncStorage
      console.log('Scans data:', data);

      if (data.success) {
        const scans = data.scans || [];
        setUserProfile({ total_scans: data.total_scans });
        setScannedItems(scans);
        setScanHistory([...scans].reverse());
        setAllScans(scans);
        setScanStats(calculateScanStats(scans));
      } else {
        Alert.alert('Error', data.message || 'Failed to load library');
      }
    } catch (err) {
      console.error('Error fetching library data:', err);
      Alert.alert('Error', err.message || 'Failed to load library data');
    } finally {
      setLoading(false);
    }
  };

  const calculateScanStats = scans => {
    if (!scans || scans.length === 0) return null;
    const categoryMap = {};
    const colors = ['#0049AF', '#70B6C1', '#6F19C2', '#FF9F40', '#14BA9C'];
    scans.forEach(scan => {
      const category = scan.category || 'Uncategorized';
      if (!categoryMap[category]) categoryMap[category] = { count: 0, name: category };
      categoryMap[category].count++;
    });
    const total = scans.length;
    const categories = Object.values(categoryMap)
      .map((cat, index) => ({
        name: cat.name,
        count: cat.count,
        percentage: Math.round((cat.count / total) * 100),
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.count - a.count);
    return { categories, topCategories: categories.slice(0, 3) };
  };

  const handleProductPress = product => {
    navigation.navigate('SinglePageItem', { product });
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}
        resizeMode="stretch">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color={'#0D0D26'} size={25} />
            </Pressable>
            <Text style={styles.headerText}>My Library</Text>
          </View>
        </View>

        {/* Tabs */}
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
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all_scans' && styles.activeTab]}
            onPress={() => setActiveTab('all_scans')}>
            <Text style={[styles.tabText, activeTab === 'all_scans' && styles.activeTabText]}>All Scans</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
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
          {activeTab === 'all_scans' && (
            <AllTotalScans
              loading={loading}
              allScans={allScans}
              onProductPress={handleProductPress}
            />
          )}
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6F3F5' },
  header: {
    width: wp(100),
    height: hp(7),
    marginTop: '10%',
    paddingHorizontal: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerChild: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerText: { fontFamily: 'Nunito-Bold', fontSize: hp(3), color: '#0D0140' },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: '5%',
    height: hp(6),
    marginTop: '3%',
  },
  tab: {
    paddingVertical: '3%',
    paddingHorizontal: '4.5%',
    borderRadius: 9,
    borderWidth: 0.5,
    borderColor: 'gray',
    marginHorizontal: '1%',
  },
  activeTab: { backgroundColor: '#2CCCA6', borderColor: '#2CCCA6' },
  tabText: { fontSize: hp(1.9), fontFamily: 'Nunito-SemiBold', color: '#000' },
  activeTabText: { color: '#fff' },
  content: { flex: 1, paddingHorizontal: '2%', paddingVertical: '2%' },
  vector: { flex: 1, width: wp(100) },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  loadingText: { marginTop: 10, fontFamily: 'Nunito-Regular', fontSize: hp(2), color: '#666' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyText: { fontFamily: 'Nunito-Bold', fontSize: hp(2.5), color: '#666', marginTop: 20 },
  emptySubtext: { fontFamily: 'Nunito-Regular', fontSize: hp(1.8), color: '#999', marginTop: 10 },
  card: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: '2%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: '1.5%',
    marginBottom: '5%',
  },
  image: { width: '100%', height: hp(10), marginBottom: 10, borderRadius: 5 },
  name: { fontSize: hp(1.36), marginBottom: 4, color: '#000', fontFamily: 'DMSans-SemiBold' },
  subtitle: { fontSize: hp(1.5), color: '#14BA9C', fontFamily: 'DMSans-SemiBold', marginBottom: '8%' },
  scanDate: { fontSize: hp(1.2), color: '#999', fontFamily: 'Nunito-Regular', marginBottom: 2 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  rating: { fontSize: hp(1.3), fontWeight: 'bold', color: '#000', marginLeft: 2 },
  reviews: { marginLeft: 4, fontSize: hp(1.2), color: '#666' },
  heartButton: { position: 'absolute', bottom: '2%', right: '1%', borderRadius: 15, padding: 5 },
  searchParent: { flexDirection: 'row', alignItems: 'center', marginHorizontal: '3%', marginBottom: '3%' },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#99ABC678',
    height: hp(6.5),
    backgroundColor: '#F2F2F2',
    width: '100%',
  },
  cameraButton: { padding: 10 },
  input: { flex: 1, fontSize: hp(2.2), fontFamily: 'Nunito-Regular', paddingVertical: 8, color: '#999' },
  grid: { paddingBottom: 20 },
});

export default MyLibrary;