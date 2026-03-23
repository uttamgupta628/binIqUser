import React, {useState, useRef} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions,
  StatusBar, ActivityIndicator, ScrollView, Image, Platform, PermissionsAndroid,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {scanAPI} from '../../api/apiService';

const GOOGLE_VISION_API_KEY = 'AIzaSyCY-8_-SbCN29nphT9QFtbzWV5H3asJQ4Q';
const SERP_API_KEY          = '8d1ab8b3f61cca5975c10f05ed7e8341eebce8bd62ad535945c6095f6903451d';
const CLOUD_NAME            = 'dbezoksfw';
const UPLOAD_PRESET         = 'BinIQstore';
const {width}               = Dimensions.get('window');

const PICKER_OPTIONS = {
  mediaType: 'photo', includeBase64: true,
  maxWidth: 800, maxHeight: 800, quality: 0.7, saveToPhotos: false,
};

// ─── Upload user photo to Cloudinary ─────────────────────────────────────────
const uploadToCloudinary = async (base64, fileName) => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri:  `data:image/jpeg;base64,${base64}`,
      name: fileName || `scan_${Date.now()}.jpg`,
      type: 'image/jpeg',
    });
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'scan_images');
    const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {method: 'POST', body: formData});
    const data = await res.json();
    if (!res.ok || data.error) { console.warn('[Cloudinary] failed:', data.error?.message); return null; }
    console.log('[Cloudinary] ✅', data.secure_url);
    return data.secure_url;
  } catch (err) { console.warn('[Cloudinary] error:', err.message); return null; }
};

// ─── Noise words ──────────────────────────────────────────────────────────────
const SCREEN_NOISE = [
  'television','television set','tv','monitor','display','screen',
  'computer','laptop','netbook','tablet','desktop','pc',
  'operating system','software','windows','android','ios','macos',
  'technology','gadget','electronic','electronic device',
  'personal computer','computer hardware','mobile device','display device',
  'amazon.com','google','facebook','instagram','youtube',
  'twitter','apple','microsoft','netflix','flipkart',
  'product','image','photo','picture','object','background',
  'texture','pattern','design','stock photo','illustration','clip art','font',
];
const isNoise = str =>
  SCREEN_NOISE.some(n => str.toLowerCase() === n.toLowerCase() ||
    str.toLowerCase().includes(n.toLowerCase()));

// ─── Build product query ──────────────────────────────────────────────────────
const buildProductQuery = result => {
  const candidates = [];
  (result?.localizedObjectAnnotations || [])
    .filter(o => o.score >= 0.65 && !isNoise(o.name))
    .forEach(o => candidates.push({text: o.name, score: o.score * 100, source: 'object'}));
  (result?.logoAnnotations || [])
    .filter(l => !isNoise(l.description))
    .slice(0, 1)
    .forEach(l => candidates.push({text: l.description, score: 90, source: 'logo'}));
  (result?.webDetection?.webEntities || [])
    .filter(e => e.score >= 0.7 && e.description && !isNoise(e.description))
    .slice(0, 3)
    .forEach(e => candidates.push({text: e.description, score: e.score * 75, source: 'webEntity'}));
  const bestGuess = result?.webDetection?.bestGuessLabels?.[0]?.label || '';
  if (bestGuess && !isNoise(bestGuess) && candidates.length === 0)
    candidates.push({text: bestGuess, score: 50, source: 'bestGuess'});
  if (candidates.length === 0) {
    (result?.labelAnnotations || [])
      .filter(l => l.score >= 0.88 && !isNoise(l.description))
      .slice(0, 1)
      .forEach(l => candidates.push({text: l.description, score: l.score * 40, source: 'label'}));
  }
  if (!candidates.length) return {query: '', bestGuess: '', allCandidates: []};
  candidates.sort((a, b) => b.score - a.score);
  const top           = candidates[0];
  const logoCandidate = candidates.find(c => c.source === 'logo');
  const objCandidate  = candidates.find(c => c.source === 'object' && c.text !== logoCandidate?.text);
  let query = top.text;
  if (logoCandidate && objCandidate) query = `${logoCandidate.text} ${objCandidate.text}`;
  return {query: query.trim(), bestGuess: bestGuess || top.text, allCandidates: candidates.slice(0, 5)};
};

// ─── Google Vision ────────────────────────────────────────────────────────────
const analyzeImageWithVision = async base64 => {
  const body = {
    requests: [{
      image: {content: base64},
      features: [
        {type: 'OBJECT_LOCALIZATION', maxResults: 10},
        {type: 'LOGO_DETECTION',      maxResults: 3},
        {type: 'WEB_DETECTION',       maxResults: 10},
        {type: 'LABEL_DETECTION',     maxResults: 8},
      ],
    }],
  };
  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
    {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)},
  );
  if (!res.ok) throw new Error(`Vision API: ${await res.text()}`);
  const data   = await res.json();
  const result = data.responses?.[0];
  if (!result) throw new Error('Empty Vision response');
  return buildProductQuery(result);
};

// ─── SerpAPI ──────────────────────────────────────────────────────────────────
const searchGoogleShopping = async query => {
  try {
    const params = new URLSearchParams({engine: 'google_shopping', q: query, api_key: SERP_API_KEY, num: '6'});
    const res    = await fetch(`https://serpapi.com/search?${params}`);
    if (!res.ok) return [];
    const data   = await res.json();
    return (data.shopping_results || []).slice(0, 6).map(p => ({
      id: `gs_${p.position}`, title: p.title || 'Product',
      price: p.price || '', source: p.source || 'Google Shopping',
      thumbnail: p.thumbnail || null, link: p.link || '', store: 'google',
    }));
  } catch { return []; }
};

const searchAmazon = async query => {
  try {
    const params = new URLSearchParams({engine: 'amazon', k: query, api_key: SERP_API_KEY});
    const res    = await fetch(`https://serpapi.com/search?${params}`);
    if (!res.ok) return [];
    const data   = await res.json();
    return (data.organic_results || []).slice(0, 6).map((p, i) => ({
      id: `amz_${i}`, title: p.title || 'Product',
      price: p.price?.value ? `$${p.price.value}` : '',
      source: 'Amazon', thumbnail: p.thumbnail || null,
      link: p.link || '', store: 'amazon',
    }));
  } catch { return []; }
};

const mergeResults = (g, a) => {
  const out = [];
  for (let i = 0; i < Math.max(g.length, a.length); i++) {
    if (i < g.length) out.push(g[i]);
    if (i < a.length) out.push(a[i]);
  }
  return out;
};

// ─── Component ────────────────────────────────────────────────────────────────
const ImageSearchScreen = () => {
  const navigation = useNavigation();
  const [screen,       setScreen]       = useState('pick');
  const [loadingStep,  setLoadingStep]  = useState('');
  const [results,      setResults]      = useState([]);
  const [query,        setQuery]        = useState('');
  const [isSaved,      setIsSaved]      = useState(false);
  const [saveError,    setSaveError]    = useState('');
  const [googleCount,  setGoogleCount]  = useState(0);
  const [amazonCount,  setAmazonCount]  = useState(0);
  const [altQueries,   setAltQueries]   = useState([]);
  const [userPhotoCloudinaryUrl, setUserPhotoCloudinaryUrl] = useState(null);
  const [userPhotoLocalUri,      setUserPhotoLocalUri]      = useState(null);

  // ✅ FIX: Guard so saveSingleScan is called AT MOST ONCE per pipeline run
  const scanSavedRef = useRef(false);

  // ── Permission ───────────────────────────────────────────────────────────
  const ensurePermission = async type => {
    if (Platform.OS !== 'android') return true;
    try {
      const perm = type === 'camera'
        ? PermissionsAndroid.PERMISSIONS.CAMERA
        : Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      const already = await PermissionsAndroid.check(perm);
      if (already) return true;
      const r = await PermissionsAndroid.request(perm, {
        title: type === 'camera' ? 'Camera' : 'Photos',
        message: 'BinIQ needs access.',
        buttonPositive: 'Allow', buttonNegative: 'Cancel',
      });
      return r === PermissionsAndroid.RESULTS.GRANTED;
    } catch { return false; }
  };

  const handlePickerResponse = response => {
    try {
      if (response.didCancel) return;
      if (response.errorCode) { Alert.alert('Error', response.errorMessage || response.errorCode); return; }
      const asset = response.assets?.[0];
      if (!asset?.base64) { Alert.alert('Error', 'Could not read image. Please try again.'); return; }
      setUserPhotoLocalUri(asset.uri);
      setTimeout(() => runPipeline(asset.base64, asset.uri, asset.fileName), 100);
    } catch { Alert.alert('Error', 'Something went wrong reading the image.'); }
  };

  const openCamera = async () => {
    if (!(await ensurePermission('camera'))) { Alert.alert('Permission Required', 'Please allow camera access.'); return; }
    try { launchCamera({...PICKER_OPTIONS, cameraType: 'back'}, handlePickerResponse); }
    catch { Alert.alert('Error', 'Could not open camera.'); }
  };

  const openGallery = async () => {
    if (!(await ensurePermission('gallery'))) { Alert.alert('Permission Required', 'Please allow photo access.'); return; }
    try { launchImageLibrary(PICKER_OPTIONS, handlePickerResponse); }
    catch { Alert.alert('Error', 'Could not open gallery.'); }
  };

  // ── Re-search with alt query — does NOT consume a new scan ───────────────
  const searchWithQuery = async customQuery => {
    try {
      setLoadingStep(`🛒 Searching for "${customQuery}"...`);
      setScreen('loading');
      setResults([]);
      setQuery(customQuery);
      const [g, a] = await Promise.all([searchGoogleShopping(customQuery), searchAmazon(customQuery)]);
      setGoogleCount(g.length);
      setAmazonCount(a.length);
      const merged = mergeResults(g, a);
      if (!merged.length) {
        Alert.alert('No Results', `Nothing found for "${customQuery}".`, [{text: 'OK', onPress: () => setScreen('results')}]);
        return;
      }
      setResults(merged);
      setScreen('results');
      // ✅ No scan saved here — alt query reuse does not cost a scan
    } catch (err) {
      Alert.alert('Error', err.message, [{text: 'OK', onPress: () => setScreen('results')}]);
    }
  };

  // ── Main pipeline ─────────────────────────────────────────────────────────
  const runPipeline = async (base64, localUri, fileName) => {
    try {
      setScreen('loading');
      setResults([]);
      setIsSaved(false);
      setSaveError('');
      setGoogleCount(0);
      setAmazonCount(0);
      setAltQueries([]);
      setUserPhotoCloudinaryUrl(null);

      // ✅ Reset the one-scan guard for this new pipeline run
      scanSavedRef.current = false;

      // Step 1 — Upload photo to Cloudinary
      setLoadingStep('☁️ Uploading your photo...');
      const cloudUrl = await uploadToCloudinary(base64, fileName);
      setUserPhotoCloudinaryUrl(cloudUrl);

      // Step 2 — Vision API
      setLoadingStep('🔍 Identifying product...');
      let visionResult;
      try { visionResult = await analyzeImageWithVision(base64); }
      catch (err) {
        // ✅ Save 1 scan on vision error, then show alert
        await saveSingleScan('Unknown Product', 'Image Search', cloudUrl);
        Alert.alert('Vision Error', err.message, [{text: 'Try Again', onPress: () => setScreen('pick')}]);
        setScreen('pick'); return;
      }

      const {query: q, bestGuess, allCandidates} = visionResult;

      if (!q) {
        // ✅ Save 1 scan — product not identified but user did use a scan
        await saveSingleScan('Unknown Product', 'Image Search', cloudUrl);
        Alert.alert(
          'Product Not Identified',
          'Could not identify the product.\n\nTips:\n• Fill the frame with ONLY the product\n• No screens/TVs in background\n• Plain surface, good lighting',
          [{text: 'Try Again', onPress: () => setScreen('pick')}],
        );
        setScreen('pick'); return;
      }

      setQuery(q);
      setAltQueries((allCandidates || []).filter(c => c.text !== q && c.text.length > 2).map(c => c.text).slice(0, 4));

      // Step 3 — Search Google + Amazon
      setLoadingStep(`🛒 Searching Google & Amazon for "${q}"...`);
      const [googleResults, amazonResults] = await Promise.all([
        searchGoogleShopping(q),
        searchAmazon(q),
      ]);
      setGoogleCount(googleResults.length);
      setAmazonCount(amazonResults.length);

      const merged = mergeResults(googleResults, amazonResults);

      // Step 4 — Save EXACTLY ONE scan (regardless of whether results were found)
      // ✅ Moved BEFORE the no-results check so it always runs once
      await saveSingleScan(q, 'Image Search', cloudUrl);

      if (!merged.length) {
        Alert.alert('No Products Found', `No results for "${q}". Try another photo.`,
          [{text: 'Try Again', onPress: () => setScreen('pick')}]);
        setScreen('pick'); return;
      }

      setResults(merged);
      setScreen('results');

    } catch (err) {
      console.error('[ImageSearch] pipeline error:', err);
      // ✅ Save scan on unexpected error too (user's image was processed)
      await saveSingleScan('Unknown Product', 'Image Search', null);
      Alert.alert('Error', err.message || 'Something went wrong.',
        [{text: 'Try Again', onPress: () => setScreen('pick')}]);
      setScreen('pick');
    }
  };

  // ── Save exactly ONE scan — guarded by scanSavedRef ──────────────────────
  const saveSingleScan = async (productName, category, cloudinaryUrl) => {
    // ✅ This is the key fix: if already saved in this pipeline run, do nothing
    if (scanSavedRef.current) {
      console.log('[ImageSearch] scan already saved this run — skipping duplicate');
      return;
    }
    scanSavedRef.current = true; // mark as saved BEFORE the async call

    try {
      const response = await scanAPI.recordScan(
        `img_search_${Date.now()}`,   // unique qr_data
        productName,                  // product_name shown in library
        category,                     // 'Image Search'
        cloudinaryUrl,                // Cloudinary URL for the image
      );

      if (response?.success) {
        setIsSaved(true);
        console.log('[ImageSearch] ✅ 1 scan saved:', productName, '| image:', cloudinaryUrl ? '✅' : '❌');
      } else if (response?.message?.toLowerCase().includes('limit')) {
        setSaveError('Scan limit reached. Upgrade to continue scanning.');
      }
    } catch (err) {
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('limit')) {
        setSaveError('Scan limit reached. Upgrade to continue scanning.');
      } else {
        console.warn('[ImageSearch] save failed:', msg);
        // ✅ If save failed, allow retry by resetting the guard
        scanSavedRef.current = false;
      }
    }
  };

  // ─── RENDER: Pick ─────────────────────────────────────────────────────────
  if (screen === 'pick') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4FFFE" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" size={22} color="#0D0140" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search by Image</Text>
        </View>

        <View style={styles.heroSection}>
          {userPhotoLocalUri
            ? <Image source={{uri: userPhotoLocalUri}} style={styles.heroPreview} />
            : <View style={styles.heroIconWrap}><MaterialIcons name="image-search" size={52} color="#2CCCA6" /></View>
          }
          <Text style={styles.heroTitle}>Find Products by Photo</Text>
          <Text style={styles.heroSub}>1 photo = 1 scan · searches Google & Amazon</Text>
          <View style={styles.sourceBadges}>
            <View style={[styles.sourceBadge, {backgroundColor: '#E8F5E9'}]}>
              <Text style={[styles.sourceBadgeText, {color: '#2E7D32'}]}>🛒 Google</Text>
            </View>
            <View style={[styles.sourceBadge, {backgroundColor: '#FFF3E0'}]}>
              <Text style={[styles.sourceBadgeText, {color: '#E65100'}]}>📦 Amazon</Text>
            </View>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionCard} onPress={openCamera}>
            <View style={[styles.optionIcon, {backgroundColor: '#E8FBF7'}]}>
              <MaterialIcons name="camera-alt" size={30} color="#2CCCA6" />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.optionTitle}>Take a Photo</Text>
              <Text style={styles.optionSub}>Capture a product with your camera</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard} onPress={openGallery}>
            <View style={[styles.optionIcon, {backgroundColor: '#EEE8FD'}]}>
              <MaterialIcons name="photo-library" size={30} color="#6C3FC5" />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.optionTitle}>Choose from Gallery</Text>
              <Text style={styles.optionSub}>Pick an existing photo from your phone</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>📸 Tips for accurate results</Text>
          <Text style={styles.tipItem}>• <Text style={{fontWeight: '700'}}>No screens or TVs in background</Text></Text>
          <Text style={styles.tipItem}>• Fill the frame with ONLY the product</Text>
          <Text style={styles.tipItem}>• Plain surface works best</Text>
          <Text style={styles.tipItem}>• Include brand logo if visible</Text>
        </View>
      </View>
    );
  }

  // ─── RENDER: Loading ──────────────────────────────────────────────────────
  if (screen === 'loading') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F4FFFE" />
        <View style={styles.loadingContainer}>
          {userPhotoLocalUri && (
            <Image source={{uri: userPhotoLocalUri}} style={styles.loadingPhotoPreview} resizeMode="cover" />
          )}
          <ActivityIndicator size="large" color="#2CCCA6" style={{marginTop: 20}} />
          <Text style={styles.loadingText}>{loadingStep}</Text>
          <Text style={styles.loadingSubText}>Searching Google & Amazon...</Text>
        </View>
      </View>
    );
  }

  // ─── RENDER: Results ──────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.resultsHeader}>
        <TouchableOpacity onPress={() => setScreen('pick')} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={22} color="#0D0140" />
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <Text style={styles.headerTitle}>Results</Text>
          {query ? <Text style={styles.resultsSubtitle} numberOfLines={1}>"{query}"</Text> : null}
        </View>
        <View style={[styles.scanCountBadge, {backgroundColor: isSaved ? '#2CCCA6' : '#bbb'}]}>
          <MaterialIcons name={isSaved ? 'check-circle' : 'schedule'} size={12} color="#fff" />
          <Text style={styles.scanCountText}>{isSaved ? '1 scan used' : 'Saving...'}</Text>
        </View>
      </View>

      {userPhotoLocalUri && (
        <View style={styles.userPhotoStrip}>
          <Image source={{uri: userPhotoLocalUri}} style={styles.userPhotoThumb} resizeMode="cover" />
          <View style={{flex: 1}}>
            <Text style={styles.userPhotoLabel}>Your Photo</Text>
            <Text style={styles.userPhotoSub}>
              {userPhotoCloudinaryUrl ? '✅ Saved to library' : '⚠️ Upload failed'}
            </Text>
          </View>
          <View style={styles.oneScanBadge}>
            <Text style={styles.oneScanText}>1 scan</Text>
          </View>
        </View>
      )}

      <View style={styles.sourceSummaryBar}>
        <View style={styles.sourceSummaryItem}>
          <Text style={styles.sourceSummaryEmoji}>🛒</Text>
          <Text style={styles.sourceSummaryText}>{googleCount} Google</Text>
        </View>
        <View style={styles.sourceDivider} />
        <View style={styles.sourceSummaryItem}>
          <Text style={styles.sourceSummaryEmoji}>📦</Text>
          <Text style={styles.sourceSummaryText}>{amazonCount} Amazon</Text>
        </View>
        <View style={styles.sourceDivider} />
        <Text style={styles.sourceSummaryTotal}>{results.length} results</Text>
      </View>

      {saveError ? (
        <View style={styles.limitBanner}>
          <MaterialIcons name="warning" size={14} color="#E8A020" />
          <Text style={styles.limitBannerText}>{saveError}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PayWall')}>
            <Text style={styles.limitBannerUpgrade}>Upgrade</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {altQueries.length > 0 && (
        <View style={styles.altQuerySection}>
          <Text style={styles.altQueryLabel}>🔄 Not what you wanted? Try:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 6}}>
            {altQueries.map((alt, i) => (
              <TouchableOpacity key={i} style={styles.altQueryChip} onPress={() => searchWithQuery(alt)}>
                <Text style={styles.altQueryChipText}>{alt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {results.map((product, index) => {
          const isAmazon = product.store === 'amazon';
          return (
            <View key={product.id || index} style={styles.card}>
              <View style={[styles.storeTag, {backgroundColor: isAmazon ? '#FFF3E0' : '#E8F5E9'}]}>
                <Text style={[styles.storeTagText, {color: isAmazon ? '#E65100' : '#2E7D32'}]}>
                  {isAmazon ? '📦 Amazon' : '🛒 Google'}
                </Text>
              </View>
              {userPhotoLocalUri
                ? <Image source={{uri: userPhotoLocalUri}} style={styles.cardImage} resizeMode="cover" />
                : product.thumbnail
                ? <Image source={{uri: product.thumbnail}} style={styles.cardImage} resizeMode="contain" />
                : <View style={[styles.cardImage, styles.cardImageEmpty]}>
                    <MaterialIcons name="image-not-supported" size={28} color="#ddd" />
                  </View>
              }
              <Text style={styles.cardName}   numberOfLines={2}>{product.title}</Text>
              {product.price  ? <Text style={styles.cardPrice}>{product.price}</Text>   : null}
              {product.source ? <Text style={styles.cardSource} numberOfLines={1}>{product.source}</Text> : null}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerBtnOutline} onPress={() => setScreen('pick')}>
          <MaterialIcons name="image-search" size={16} color="#2CCCA6" />
          <Text style={styles.footerBtnOutlineText}>New Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerBtnFill} onPress={() => navigation.navigate('MyLibrary')}>
          <MaterialIcons name="library-books" size={16} color="#fff" />
          <Text style={styles.footerBtnFillText}>View Library</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F4FFFE'},
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE',
  },
  resultsHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingHorizontal: 16, paddingBottom: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE', elevation: 2,
  },
  backBtn:         {padding: 4, marginRight: 8},
  headerTitle:     {fontSize: 18, fontWeight: '700', color: '#0D0140'},
  resultsSubtitle: {fontSize: 12, color: '#2CCCA6', marginTop: 1},
  scanCountBadge:  {flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20},
  scanCountText:   {color: '#fff', fontSize: 11, fontWeight: '600'},
  heroSection:     {alignItems: 'center', paddingVertical: 28, paddingHorizontal: 32},
  heroIconWrap:    {width: 96, height: 96, borderRadius: 48, backgroundColor: '#E8FBF7', justifyContent: 'center', alignItems: 'center', marginBottom: 14},
  heroPreview:     {width: 96, height: 96, borderRadius: 48, marginBottom: 14, borderWidth: 3, borderColor: '#2CCCA6'},
  heroTitle:       {fontSize: 20, fontWeight: '700', color: '#0D0140', marginBottom: 8, textAlign: 'center'},
  heroSub:         {fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20, marginBottom: 14},
  sourceBadges:    {flexDirection: 'row', gap: 10},
  sourceBadge:     {paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20},
  sourceBadgeText: {fontSize: 12, fontWeight: '600'},
  optionsContainer:{paddingHorizontal: 20, gap: 14},
  optionCard:      {backgroundColor: '#fff', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.07, shadowRadius: 6},
  optionIcon:      {width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center'},
  optionTitle:     {fontSize: 15, fontWeight: '700', color: '#0D0140'},
  optionSub:       {fontSize: 12, color: '#999', marginTop: 2},
  tipsBox:         {margin: 20, backgroundColor: '#FFF8E7', borderRadius: 12, padding: 16, borderLeftWidth: 3, borderLeftColor: '#FFBB36'},
  tipsTitle:       {fontSize: 13, fontWeight: '700', color: '#0D0140', marginBottom: 8},
  tipItem:         {fontSize: 13, color: '#666', lineHeight: 22},
  loadingContainer:{flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 32},
  loadingPhotoPreview:{width: 120, height: 120, borderRadius: 16, borderWidth: 3, borderColor: '#2CCCA6'},
  loadingText:     {fontSize: 16, fontWeight: '600', color: '#0D0140', textAlign: 'center'},
  loadingSubText:  {fontSize: 13, color: '#999', textAlign: 'center'},
  userPhotoStrip:  {flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#E8FBF7', borderBottomWidth: 1, borderBottomColor: '#C8F0E8'},
  userPhotoThumb:  {width: 44, height: 44, borderRadius: 8, borderWidth: 2, borderColor: '#2CCCA6'},
  userPhotoLabel:  {fontSize: 13, fontWeight: '700', color: '#0D0140'},
  userPhotoSub:    {fontSize: 11, color: '#555', marginTop: 2},
  oneScanBadge:    {backgroundColor: '#2CCCA6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12},
  oneScanText:     {color: '#fff', fontSize: 11, fontWeight: '700'},
  sourceSummaryBar:{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE'},
  sourceSummaryItem:{flexDirection: 'row', alignItems: 'center', gap: 4},
  sourceSummaryEmoji:{fontSize: 14},
  sourceSummaryText:{fontSize: 12, fontWeight: '600', color: '#555'},
  sourceDivider:   {width: 1, height: 14, backgroundColor: '#DDD', marginHorizontal: 10},
  sourceSummaryTotal:{fontSize: 12, color: '#2CCCA6', fontWeight: '700'},
  altQuerySection: {paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#F9F9F9', borderBottomWidth: 1, borderBottomColor: '#EEE'},
  altQueryLabel:   {fontSize: 12, color: '#888', fontWeight: '600'},
  altQueryChip:    {backgroundColor: '#fff', borderWidth: 1, borderColor: '#2CCCA6', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8},
  altQueryChipText:{fontSize: 12, color: '#2CCCA6', fontWeight: '600'},
  limitBanner:     {flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFF8E7', borderBottomWidth: 1, borderBottomColor: '#FFE0A0'},
  limitBannerText: {flex: 1, fontSize: 12, color: '#E8A020', fontWeight: '500'},
  limitBannerUpgrade:{fontSize: 12, fontWeight: '700', color: '#2CCCA6'},
  grid:            {flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12, paddingBottom: 100},
  card:            {width: (width - 24 - 24) / 2, backgroundColor: '#fff', borderRadius: 14, padding: 10, elevation: 3, position: 'relative', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.08, shadowRadius: 6},
  storeTag:        {position: 'absolute', top: 8, left: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, zIndex: 1},
  storeTagText:    {fontSize: 9, fontWeight: '700'},
  cardImage:       {width: '100%', height: 120, borderRadius: 8, marginTop: 20, marginBottom: 8, backgroundColor: '#F5F5F5'},
  cardImageEmpty:  {justifyContent: 'center', alignItems: 'center'},
  cardName:        {fontSize: 12, fontWeight: '600', color: '#0D0140', lineHeight: 17, marginBottom: 4},
  cardPrice:       {fontSize: 14, fontWeight: '700', color: '#2CCCA6', marginBottom: 3},
  cardSource:      {fontSize: 11, color: '#999'},
  footer:          {flexDirection: 'row', gap: 12, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EEE'},
  footerBtnOutline:{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: '#2CCCA6', paddingVertical: 13, borderRadius: 12},
  footerBtnOutlineText:{color: '#2CCCA6', fontWeight: '700', fontSize: 14},
  footerBtnFill:   {flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#2CCCA6', paddingVertical: 13, borderRadius: 12},
  footerBtnFillText:{color: '#fff', fontWeight: '700', fontSize: 14},
});

export default ImageSearchScreen;