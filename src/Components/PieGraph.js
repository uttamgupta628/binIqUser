import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PieChart from 'react-native-pie-chart';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const PieGraph = () => {
    const widthAndHeight = wp(40); // Diameter of the pie chart
    const series = [35, 16, 14.5, 16.5, 16.5]; // Data for the chart
    const sliceColor = ['#4887F6', '#6F19C2', '#59C3CF', '#E2635E', '#FFBB36']; // Colors for each category

    return (
        <View style={styles.container}>
            {/* Pie Chart */}
            <View style={{ position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
                <PieChart
                    widthAndHeight={widthAndHeight}
                    series={series}
                    sliceColor={sliceColor}
                    doughnut={true} // Enables donut style
                    coverRadius={0.6} // Adjusts the inner radius of the donut
                    coverFill='transparent' // Inner color of the 
                />
                {/* Centered Text */}
                <View style={styles.centerTextContainer}>
                    <Text style={styles.centerText}>100%</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        width: wp(15),
    },
    centerTextContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerText: {
        fontSize: wp(5),
        fontFamily: 'Nunito-SemiBold',
        color: '#000',
    },
});

export default PieGraph;
