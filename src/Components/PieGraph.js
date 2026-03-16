import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import PieChart from 'react-native-pie-chart';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

const PieGraph = ({used, total, color = '#14BA9C'}) => {
  const widthAndHeight = wp(40);
  const remaining = Math.max(total - used, 0);

  // Guard: PieChart crashes if all values are 0
  const series     = used > 0 || remaining > 0 ? [used, remaining] : [1, 0];
  const sliceColor = [color, '#E8F4FD'];

  const percentage = total > 0 ? Math.round((used / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={{position: 'relative', justifyContent: 'center', alignItems: 'center'}}>
        <PieChart
          widthAndHeight={widthAndHeight}
          series={series}
          sliceColor={sliceColor}
          doughnut={true}
          coverRadius={0.65}
          coverFill="transparent"
        />
        <View style={styles.centerContainer}>
          <Text style={[styles.percentText, {color}]}>{percentage}%</Text>
          <Text style={styles.usedText}>used</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container:       {justifyContent: 'center', alignItems: 'center'},
  centerContainer: {position: 'absolute', justifyContent: 'center', alignItems: 'center'},
  percentText:     {fontSize: wp(5), fontFamily: 'Nunito-Bold', textAlign: 'center'},
  usedText:        {fontSize: wp(2.8), fontFamily: 'Nunito-Regular', color: '#999', textAlign: 'center'},
});

export default PieGraph;