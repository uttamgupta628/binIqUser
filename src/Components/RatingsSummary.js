import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const RatingsSummary = () => {
    const [selectedFilter, setSelectedFilter] = useState('All');

    const ratingData = [
        { stars: 5, count: 777, percentage: 70 },
        { stars: 4, count: 205, percentage: 18 },
        { stars: 3, count: 67, percentage: 6 },
        { stars: 2, count: 24, percentage: 2 },
        { stars: 1, count: 46, percentage: 4 },
    ];

    const filterButtons = ['5★', '4★', '3★', '2★', '1★'];

    const getBarColor = (stars) => {
        switch (stars) {
            case 5:
            case 4:
            case 3:
                return '#5DC99F';
            case 2:
                return '#FFD700';
            case 1:
                return '#FF6B6B';
            default:
                return '#5DC99F';
        }
    };

    return (
        <View style={styles.container}>
            {/* Rating Summary */}
            <View style={styles.summaryContainer}>
                <View style={styles.averageRating}>
                    <Text style={styles.ratingNumber}>4.5</Text>
                    <Text style={styles.starIcon}>★</Text>
                </View>

                {/* Rating Bars */}
                <View style={styles.barsContainer}>
                    {ratingData.map((rating) => (
                        <View key={rating.stars} style={styles.ratingBar}>
                            <Text style={styles.starText}>{rating.stars}★</Text>
                            <View style={styles.barBackground}>
                                <View
                                    style={[
                                        styles.barFill,
                                        {
                                            width: `${rating.percentage}%`,
                                            backgroundColor: getBarColor(rating.stars),
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={styles.countText}>{rating.count}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Filter Section */}
            <View style={styles.filterSection}>
                <View style={styles.filterButtons}>
                    {filterButtons.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterButton,
                                selectedFilter === filter && styles.selectedFilter,
                            ]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Text
                                style={[
                                    styles.filterButtonText,
                                    selectedFilter === filter && styles.selectedFilterText,
                                ]}
                            >
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: '1%',
        backgroundColor: 'white',
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: '8%',
    },
    averageRating: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    ratingNumber: {
        fontSize: wp(12),
        color: '#000'
    },
    starIcon: {
        fontSize: 24,
        color: '#5DC99F',
        marginTop: 4,
    },
    verifiedBuyers: {
        color: '#666',
        fontSize: wp(4),
        marginTop: '5%',
    },
    barsContainer: {
        flex: 2,
        marginLeft: 16,
    },
    ratingBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    starText: {
        width: 30,
        fontSize: 14,
    },
    barBackground: {
        flex: 1,
        height: 8,
        backgroundColor: '#F0F0F0',
        borderRadius: 4,
        marginHorizontal: 8,
    },
    barFill: {
        height: '100%',
        borderRadius: 4,
    },
    countText: {
        width: 40,
        textAlign: 'right',
        fontSize: 14,
        color: '#666',
    },
    filterTitle: {
        fontSize: 16,
        marginBottom: 12,
        color: '#000'
    },
    filterButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    filterButton: {
        paddingVertical: '2%',
        paddingHorizontal: '5%',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: 'white',
    },
    selectedFilter: {
        backgroundColor: '#14BA9C',
        borderColor: '#14BA9C',
    },
    filterButtonText: {
        color: '#333',
    },
    selectedFilterText: {
        color: 'white',
    },
});

export default RatingsSummary;