import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
// import MapView, { Marker } from 'react-native-maps'
import BinFinderIcon from '../../../assets/BinFinderIcon.svg';

const Dashboard2 = () => {
  const locations = [
    {id: 1, title: 'Location 1', latitude: 37.78825, longitude: -122.4324},
    {id: 2, title: 'Location 2', latitude: 37.78925, longitude: -122.4224},
    {id: 3, title: 'Location 3', latitude: 37.79025, longitude: -122.4124},
    {id: 4, title: 'Location 4', latitude: 37.79125, longitude: -122.4024},
    {id: 5, title: 'Location 5', latitude: 37.79225, longitude: -122.3924},
  ];
  return (
    <>
      <View style={{width: wp(100), height: hp(14), justifyContent: 'center'}}>
        <BinFinderIcon />
        <Text
          style={{
            fontFamily: 'Nunito-SemiBold',
            color: '#000',
            fontSize: hp(2.6),
          }}>
          BIN FINDER
        </Text>
        <Text
          style={{
            fontFamily: 'Nunito-SemiBold',
            color: '#667085',
            fontSize: hp(1.7),
          }}>
          Discover Hidden Gems Near You
        </Text>
      </View>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '4%',
          width: wp(90),
          height: wp(90),
          overflow: 'hidden',
          alignSelf: 'center',
        }}>
        {/* <MapView
                    style={{ width: wp(100), height: hp(100) }}
                    initialRegion={{
                        latitude: 37.78825,
                        longitude: -122.4324,
                        latitudeDelta: 0.0722,
                        longitudeDelta: 0.0221,
                    }}
                >
                    {locations.map(location => (
                        <Marker
                            key={location.id}
                            coordinate={{
                                latitude: location.latitude,
                                longitude: location.longitude,
                            }}
                            title={location.title}
                        />
                    ))}
                </MapView> */}
      </View>
    </>
  );
};

export default Dashboard2;

const styles = StyleSheet.create({});
