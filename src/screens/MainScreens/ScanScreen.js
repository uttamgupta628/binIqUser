import React, { useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  StatusBar,
  Dimensions,
  Platform,
  PermissionsAndroid,
  Linking
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {useRoute, useNavigation, useFocusEffect} from '@react-navigation/native';
import {scanAPI} from '../../api/apiService';

const {width} = Dimensions.get('window');

const ScanScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cameraActive, setCameraActive] = useState(false); // ✅ local state
  const cameraRef = useRef(null);

  // ✅ Trigger camera every time this tab is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('ScanScreen focused — requesting camera permission');
      setCameraActive(true);
      requestCameraPermission();

      // When screen loses focus, deactivate camera
      return () => {
        console.log('ScanScreen unfocused — deactivating camera');
        setCameraActive(false);
        setScanned(false);
        setIsSaving(false);
      };
    }, []),
  );


const requestCameraPermission = async () => {
  try {
    if (Platform.OS === 'ios') {
      setHasPermission(true);
      return;
    }

    // ✅ Check current status first before requesting
    const checkResult = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );

    console.log('Camera permission check:', checkResult);

    if (checkResult) {
      // Already granted
      setHasPermission(true);
      return;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'This app needs access to your camera to scan QR codes.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );

    console.log('Permission result:', granted);

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      setHasPermission(true);
      console.log('Camera permission GRANTED');

    } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      // ✅ User blocked it — send them to settings
      setHasPermission(false);
      Alert.alert(
        'Camera Permission Required',
        'Camera access was denied. Please enable it in your phone settings to scan QR codes.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Open Settings',
            onPress: () => Linking.openSettings(), // ✅ opens app settings
          },
        ],
      );

    } else {
      setHasPermission(false);
      Alert.alert(
        'Permission Denied',
        'Camera access is required to scan QR codes.',
        [{text: 'OK'}],
      );
    }
  } catch (error) {
    console.log('Camera permission error:', error);
    Alert.alert('Error', 'Something went wrong while requesting camera permission.');
  }
};

  const onQRCodeRead = async ({data}) => {
    if (scanned || isSaving) return;
    setScanned(true);
    setIsSaving(true);

    try {
      console.log('QR scanned:', data);
      const result = await scanAPI.recordScan(data, data, 'Uncategorized', null);
      console.log('Scan recorded:', result);

      if (result.success) {
        Alert.alert(
          '✅ QR Scanned & Saved!',
          `Data: ${data}\n\nScans used: ${result.total_scans}/100\nRemaining: ${result.scans_remaining}`,
          [
            {
              text: 'Scan Again',
              onPress: () => {setScanned(false); setIsSaving(false);},
              style: 'cancel',
            },
            {text: 'Go to Library', onPress: () => navigation.navigate('MyLibrary')},
            {text: 'Close', onPress: () => navigation.goBack()},
          ],
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to save scan', [
          {text: 'OK', onPress: () => {setScanned(false); setIsSaving(false);}},
        ]);
      }
    } catch (error) {
      console.error('Scan API error:', error);
      Alert.alert('Error', error.message || 'Failed to connect to server', [
        {text: 'OK', onPress: () => {setScanned(false); setIsSaving(false);}},
      ]);
    }
  };

  const renderCameraOverlay = () => (
    <View style={styles.overlayContainer}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>✕ Close</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Scan QR Code</Text>
        <TouchableOpacity style={styles.torchButton} onPress={() => setTorchOn(prev => !prev)}>
          <Text style={styles.torchText}>{torchOn ? '🔦 On' : '🔦 Off'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.dimmedTop} />
      <View style={styles.middleRow}>
        <View style={styles.dimmedSide} />
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        <View style={styles.dimmedSide} />
      </View>
      <View style={styles.dimmedBottom}>
        <Text style={styles.hintText}>
          {isSaving ? 'Saving scan...' : scanned ? 'Processing...' : 'Align QR code within the frame'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* ✅ Show camera when screen is active and permission granted */}
      {cameraActive && hasPermission && (
        <RNCamera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          type={RNCamera.Constants.Type.back}
          flashMode={
            torchOn
              ? RNCamera.Constants.FlashMode.torch
              : RNCamera.Constants.FlashMode.off
          }
          onBarCodeRead={onQRCodeRead}
          barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
          captureAudio={false}
          androidCameraPermissionOptions={{
            title: 'Camera Permission',
            message: 'App needs access to your camera to scan QR codes.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }}>
          {renderCameraOverlay()}
        </RNCamera>
      )}

      {/* Permission not granted */}
      {cameraActive && !hasPermission && (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera permission is required to scan QR codes.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.permissionButton, {backgroundColor: '#999', marginTop: 10}]}
            onPress={() => navigation.goBack()}>
            <Text style={styles.permissionButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const FRAME_SIZE = width * 0.65;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  overlayContainer: {flex: 1},
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  topBarTitle: {color: '#fff', fontSize: 17, fontWeight: '600'},
  closeButton: {padding: 6},
  closeText: {color: '#fff', fontSize: 14},
  torchButton: {padding: 6},
  torchText: {color: '#FFD700', fontSize: 14},
  dimmedTop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.55)'},
  middleRow: {flexDirection: 'row', height: FRAME_SIZE},
  dimmedSide: {flex: 1, backgroundColor: 'rgba(0,0,0,0.55)'},
  dimmedBottom: {
    flex: 1.5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    paddingTop: 24,
  },
  hintText: {color: '#fff', fontSize: 14, opacity: 0.85},
  scanFrame: {width: FRAME_SIZE, height: FRAME_SIZE, position: 'relative'},
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#14BA9C',
    borderWidth: 3,
  },
  topLeft: {top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0},
  topRight: {top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0},
  bottomLeft: {bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0},
  bottomRight: {bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0},
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#000',
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#14BA9C',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  permissionButtonText: {color: '#fff', fontWeight: '600', fontSize: 15},
});

export default ScanScreen;