import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  StatusBar,
  Dimensions,
  Platform, // ✅ add this
  PermissionsAndroid, // ✅ add this
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {useRoute, useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('window');

const ScanScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const openCamera = route.params?.openCamera;

  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const cameraRef = useRef(null);

  // ─── Permission Request ───────────────────────────────────────────────────
  useEffect(() => {
    if (openCamera) {
      requestCameraPermission();
    }
  }, [openCamera]);

  const requestCameraPermission = async () => {
    try {
      // iOS — react-native-camera handles it automatically via Info.plist
      if (Platform.OS === 'ios') {
        setHasPermission(true);
        return;
      }

      // Android — manually request via PermissionsAndroid
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera to scan QR codes.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setHasPermission(true);
      } else {
        setHasPermission(false);
        Alert.alert(
          'Permission Denied',
          'Camera access is required to scan QR codes.',
          [{text: 'OK', onPress: () => navigation.goBack()}],
        );
      }
    } catch (error) {
      console.log('Camera permission error:', error);
      Alert.alert(
        'Error',
        'Something went wrong while requesting camera permission.',
      );
    }
  };

  // ─── QR Code Scanned Handler ──────────────────────────────────────────────
  const onQRCodeRead = ({data, type}) => {
    if (scanned) return; // prevent multiple triggers
    setScanned(true);

    Alert.alert('✅ QR Code Scanned', `Data: ${data}`, [
      {
        text: 'Scan Again',
        onPress: () => setScanned(false),
        style: 'cancel',
      },
      {
        text: 'Close Camera',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  // ─── Camera Overlay UI ────────────────────────────────────────────────────
  const renderCameraOverlay = () => (
    <View style={styles.overlayContainer}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>✕ Close</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Scan QR Code</Text>
        <TouchableOpacity
          style={styles.torchButton}
          onPress={() => setTorchOn(prev => !prev)}>
          <Text style={styles.torchText}>{torchOn ? '🔦 On' : '🔦 Off'}</Text>
        </TouchableOpacity>
      </View>

      {/* Dimmed top area */}
      <View style={styles.dimmedTop} />

      {/* Middle row: dimmed sides + scan frame */}
      <View style={styles.middleRow}>
        <View style={styles.dimmedSide} />

        {/* Scan frame box */}
        <View style={styles.scanFrame}>
          {/* Corner borders */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          {/* Scan line animation could be added here */}
        </View>

        <View style={styles.dimmedSide} />
      </View>

      {/* Dimmed bottom area */}
      <View style={styles.dimmedBottom}>
        <Text style={styles.hintText}>
          {scanned ? 'Processing...' : 'Align QR code within the frame'}
        </Text>
      </View>
    </View>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* ✅ Your existing MapScreen content goes here */}
      {/* <MapView ... /> etc */}

      {/* ✅ QR Camera Overlay — only shows when openCamera param is true */}
      {openCamera && hasPermission && (
        <View style={StyleSheet.absoluteFill}>
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
        </View>
      )}

      {/* Permission not granted but camera was requested */}
      {openCamera && !hasPermission && (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera permission is required to scan QR codes.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestCameraPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.permissionButton,
              {backgroundColor: '#999', marginTop: 10},
            ]}
            onPress={() => navigation.goBack()}>
            <Text style={styles.permissionButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────
const FRAME_SIZE = width * 0.65;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // ── Overlay layout ──
  overlayContainer: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  topBarTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    padding: 6,
  },
  closeText: {
    color: '#fff',
    fontSize: 14,
  },
  torchButton: {
    padding: 6,
  },
  torchText: {
    color: '#FFD700',
    fontSize: 14,
  },

  // ── Dimmed regions ──
  dimmedTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  middleRow: {
    flexDirection: 'row',
    height: FRAME_SIZE,
  },
  dimmedSide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  dimmedBottom: {
    flex: 1.5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    paddingTop: 24,
  },
  hintText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.85,
  },

  // ── Scan frame ──
  scanFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#14BA9C',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },

  // ── Permission screen ──
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
  permissionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default ScanScreen;
