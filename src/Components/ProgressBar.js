import {Container} from 'lucide-react-native';
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const ProgressBar = ({progress, tier}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.tier}>{tier}</Text>
      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, {width: `${progress}%`}]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    width: '100%',
    alignSelf: 'center',
  },
  tier: {
    color: '#1A1A4B',
    fontSize: hp(1.5),
    marginVertical: '15%',
    textAlign: 'left',
  },
  progressBackground: {
    height: hp(1),
    backgroundColor: '#14BA9C33',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#14BA9C',
    borderRadius: 8,
  },
});

export default ProgressBar;
