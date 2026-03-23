import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {scanAPI} from '../../api/apiService';

const {width, height} = Dimensions.get('window');
const SCAN_AREA = width * 0.62;
const BOTTOM_H = height * 0.35;
const DARK = 'rgba(0,0,0,0.72)';
const CORNER_COLOR = '#2CCCA6';
const CORNER_SIZE = 26;
const CORNER_W = 3;

const SCAN_BOX_TOP = (height - SCAN_AREA - BOTTOM_H) / 2;

// ─── Helper: extract a readable product name from QR/barcode data ─────────────
// QR data can be a URL, plain text, or a barcode number.
// We display a cleaned-up label in the library instead of the raw string.
const extractProductLabel = (qrData = '') => {
  // If it looks like a URL, pull the last path segment
  try {
    const url = new URL(qrData);
    const segs = url.pathname.split('/').filter(Boolean);
    if (segs.length > 0) {
      // e.g. "/products/apple-airpods-pro" → "Apple Airpods Pro"
      return (
        segs[segs.length - 1]
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase())
          .trim() || 'Scanned Product'
      );
    }
    return url.hostname || 'Scanned Product';
  } catch {
    // Not a URL — return as-is (truncated if long)
    const clean = qrData.trim();
    return clean.length > 60
      ? clean.slice(0, 60) + '…'
      : clean || 'Scanned Product';
  }
};

const ScanScreen = () => {
  const navigation = useNavigation();
  const scannerRef = useRef(null);
  const isProcessing = useRef(false);

  const [saving, setSaving] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [scannedValue, setScannedValue] = useState('');
  const [scansRemaining, setScansRemaining] = useState(null);
  const [torchOn, setTorchOn] = useState(false);

  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scanLineY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_AREA - 3],
  });

  const onSuccess = e => {
    if (isProcessing.current || scanDone || saving) return;
    const qrData = e?.data;
    if (!qrData) return;
    isProcessing.current = true;
    setScanDone(true);
    setScannedValue(qrData);
    saveScan(qrData);
  };

  const saveScan = async qrData => {
    try {
      setSaving(true);

      // ✅ FIX: Use a readable product name instead of raw qrData for product_name.
      // qr_data stores the raw value for uniqueness; product_name is what shows in library.
      const productLabel = extractProductLabel(qrData);

      const response = await scanAPI.recordScan(
        qrData, // qr_data  — raw value, used as unique identifier
        productLabel, // product_name — human-readable label shown in library ✅
        'QR Scan', // category — shows as "QR Scan" badge in library ✅
        null, // image — no photo for QR scans
      );

      if (response?.success) {
        setScansRemaining(response.scans_remaining);
        Alert.alert(
          '✅ Saved!',
          `"${productLabel}" added to library.\nUsed: ${response.total_scans}  |  Left: ${response.scans_remaining}`,
          [
            {text: 'Scan Again', onPress: resetScanner},
            {
              text: 'View Library',
              onPress: () => navigation.navigate('MyLibrary'),
            },
          ],
        );
      } else if (response?.message?.toLowerCase().includes('limit')) {
        Alert.alert(
          '⚠️ Scan Limit Reached',
          `You have used all your scans.\n\nUpgrade your plan to scan more products.`,
          [
            {text: 'Upgrade', onPress: () => navigation.navigate('PayWall')},
            {text: 'Cancel', onPress: () => navigation.goBack()},
          ],
        );
      } else {
        Alert.alert('Failed', response?.message || 'Could not save.', [
          {text: 'Try Again', onPress: resetScanner},
        ]);
      }
    } catch (err) {
      // ✅ Check if error message mentions limit (thrown by API layer)
      if (err?.message?.toLowerCase().includes('limit')) {
        Alert.alert(
          '⚠️ Scan Limit Reached',
          'You have used all your scans. Upgrade your plan to scan more.',
          [
            {text: 'Upgrade', onPress: () => navigation.navigate('PayWall')},
            {text: 'Cancel', onPress: () => navigation.goBack()},
          ],
        );
      } else {
        Alert.alert('Error', err?.message || 'Something went wrong.', [
          {text: 'Try Again', onPress: resetScanner},
        ]);
      }
    } finally {
      setSaving(false);
    }
  };

  const resetScanner = () => {
    isProcessing.current = false;
    setScanDone(false);
    setScannedValue('');
    setSaving(false);
    scannerRef.current?.reactivate();
  };

  const handleImageSearch = () => {
    navigation.navigate('ImageSearchScreen');
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <QRCodeScanner
        ref={scannerRef}
        onRead={onSuccess}
        vibrate={false}
        reactivate={false}
        showMarker={false}
        cameraStyle={styles.camera}
        containerStyle={styles.scannerContainer}
        flashMode={
          torchOn
            ? RNCamera.Constants.FlashMode.torch
            : RNCamera.Constants.FlashMode.off
        }
        cameraProps={{
          captureAudio: false,
          androidCameraPermissionOptions: {
            title: 'Camera Permission',
            message: 'BinIQ needs camera to scan products',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          },
        }}
      />

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.darkTop} />
        <View style={styles.middleRow}>
          <View style={styles.darkSide} />
          <View style={styles.scanBox}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            {!scanDone && !saving && (
              <Animated.View
                style={[
                  styles.scanLine,
                  {transform: [{translateY: scanLineY}]},
                ]}
              />
            )}
            {saving && (
              <View style={styles.centerOverlay}>
                <ActivityIndicator size="large" color="#2CCCA6" />
                <Text style={styles.savingText}>Saving...</Text>
              </View>
            )}
            {scanDone && !saving && (
              <View style={styles.centerOverlay}>
                <MaterialIcons name="check-circle" size={52} color="#2CCCA6" />
              </View>
            )}
          </View>
          <View style={styles.darkSide} />
        </View>
        <View style={styles.darkBottomBg} />
      </View>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back-ios" size={22} color="#fff" />
      </TouchableOpacity>

      <View style={styles.titleContainer} pointerEvents="none">
        <Text style={styles.title}>Scan Product</Text>
      </View>

      <View style={styles.bottomPanel}>
        <Text style={styles.instructionText}>
          {saving
            ? 'Saving to your library...'
            : scanDone
            ? '✅ Scan complete!'
            : 'Point camera at a QR code or barcode'}
        </Text>

        {scannedValue !== '' && !saving && (
          <View style={styles.scannedValueBox}>
            <Text style={styles.scannedLabel}>SCANNED</Text>
            <Text style={styles.scannedValue} numberOfLines={2}>
              {scannedValue}
            </Text>
          </View>
        )}

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.iconBtn, torchOn && styles.iconBtnActive]}
            onPress={() => setTorchOn(t => !t)}>
            <MaterialIcons
              name={torchOn ? 'flash-on' : 'flash-off'}
              size={20}
              color={torchOn ? '#fff' : '#2CCCA6'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.imgSearchBtn}
            onPress={handleImageSearch}>
            <MaterialIcons name="image-search" size={18} color="#fff" />
            <Text style={styles.imgSearchBtnText}>Search by Image</Text>
          </TouchableOpacity>

          {scanDone && !saving && (
            <TouchableOpacity style={styles.rescanBtn} onPress={resetScanner}>
              <MaterialIcons name="qr-code-scanner" size={18} color="#fff" />
              <Text style={styles.rescanText}>Scan Again</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.libraryBtn}
            onPress={() => navigation.navigate('MyLibrary')}>
            <MaterialIcons name="library-books" size={16} color="#2CCCA6" />
            <Text style={styles.libraryBtnText}>My Library</Text>
            {scansRemaining !== null && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{scansRemaining} left</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  scannerContainer: {flex: 1},
  camera: {height},
  darkTop: {
    width: '100%',
    height: SCAN_BOX_TOP,
    backgroundColor: DARK,
  },
  middleRow: {flexDirection: 'row', width: '100%', height: SCAN_AREA},
  darkSide: {flex: 1, backgroundColor: DARK},
  scanBox: {
    width: SCAN_AREA,
    height: SCAN_AREA,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  darkBottomBg: {
    flex: 1,
    backgroundColor: DARK,
  },
  corner: {position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE},
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_W,
    borderLeftWidth: CORNER_W,
    borderColor: CORNER_COLOR,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_W,
    borderRightWidth: CORNER_W,
    borderColor: CORNER_COLOR,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_W,
    borderLeftWidth: CORNER_W,
    borderColor: CORNER_COLOR,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_W,
    borderRightWidth: CORNER_W,
    borderColor: CORNER_COLOR,
    borderBottomRightRadius: 4,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#2CCCA6',
    elevation: 4,
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingText: {color: '#2CCCA6', marginTop: 8, fontSize: 13, fontWeight: '600'},
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    padding: 8,
    zIndex: 20,
  },
  titleContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 19,
  },
  title: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_H,
    backgroundColor: DARK,
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 24,
    zIndex: 20,
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 10,
  },
  scannedValueBox: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2CCCA6',
  },
  scannedLabel: {
    color: '#2CCCA6',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 1,
  },
  scannedValue: {color: '#fff', fontSize: 13},
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2CCCA6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnActive: {backgroundColor: '#2CCCA6'},
  imgSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6C3FC5',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  imgSearchBtnText: {color: '#fff', fontWeight: 'bold', fontSize: 13},
  rescanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2CCCA6',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  rescanText: {color: '#fff', fontWeight: 'bold', fontSize: 13},
  libraryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#2CCCA6',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  libraryBtnText: {color: '#2CCCA6', fontSize: 13, fontWeight: '600'},
  badge: {
    marginLeft: 4,
    backgroundColor: '#2CCCA6',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {color: '#fff', fontSize: 10, fontWeight: 'bold'},
});

export default ScanScreen;
