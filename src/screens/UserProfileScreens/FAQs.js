import { ImageBackground, Pressable, StatusBar, StyleSheet, Text, View, ScrollView, ActivityIndicator, RefreshControl, TextInput, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import API service
import { faqsAPI } from '../../api/apiService';

const FAQs = () => {
    const navigation = useNavigation();
    
    // State
    const [faqs, setFaqs] = useState([]);
    const [filteredFaqs, setFilteredFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedIds, setExpandedIds] = useState(new Set());

    useEffect(() => {
        fetchFAQs();
    }, []);

    useEffect(() => {
        filterFAQs();
    }, [searchQuery, faqs]);

    const fetchFAQs = async () => {
        try {
            setLoading(true);
            console.log('📚 Fetching FAQs...');
            
            const response = await faqsAPI.getAll();
            
            console.log('📚 FAQs Response:', response);
            
            // Handle different response structures
            let faqList = [];
            if (Array.isArray(response)) {
                faqList = response;
            } else if (response?.data && Array.isArray(response.data)) {
                faqList = response.data;
            } else if (response?.faqs && Array.isArray(response.faqs)) {
                faqList = response.faqs;
            }
            
            setFaqs(faqList);
            setFilteredFaqs(faqList);
            
            console.log('✅ Loaded', faqList.length, 'FAQs');
        } catch (error) {
            console.error('❌ Error fetching FAQs:', error);
            Alert.alert('Error', 'Failed to load FAQs');
            // Use empty array on error
            setFaqs([]);
            setFilteredFaqs([]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchFAQs();
        setRefreshing(false);
    };

    const filterFAQs = () => {
        if (!searchQuery.trim()) {
            setFilteredFaqs(faqs);
            return;
        }
        
        const query = searchQuery.toLowerCase();
        const filtered = faqs.filter(faq => 
            faq.question?.toLowerCase().includes(query) ||
            faq.answer?.toLowerCase().includes(query) ||
            faq.category?.toLowerCase().includes(query)
        );
        
        setFilteredFaqs(filtered);
    };

    const toggleExpanded = (faqId) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(faqId)) {
                newSet.delete(faqId);
            } else {
                newSet.add(faqId);
            }
            return newSet;
        });
    };

    const getCategoryIcon = (category) => {
        switch (category?.toLowerCase()) {
            case 'account':
                return 'person-outline';
            case 'payment':
            case 'billing':
                return 'card-outline';
            case 'subscription':
                return 'newspaper-outline';
            case 'store':
                return 'storefront-outline';
            case 'product':
                return 'pricetag-outline';
            case 'shipping':
                return 'airplane-outline';
            case 'technical':
            case 'support':
                return 'help-circle-outline';
            default:
                return 'help-circle-outline';
        }
    };

    const getCategoryColor = (category) => {
        switch (category?.toLowerCase()) {
            case 'account':
                return '#130160';
            case 'payment':
            case 'billing':
                return '#14BA9C';
            case 'subscription':
                return '#FF9500';
            case 'store':
                return '#0049AF';
            case 'product':
                return '#FF3B30';
            case 'shipping':
                return '#5856D6';
            case 'technical':
            case 'support':
                return '#AF52DE';
            default:
                return '#8E8E93';
        }
    };

    const FAQItem = ({ faq }) => {
        const isExpanded = expandedIds.has(faq._id);
        const categoryColor = getCategoryColor(faq.category);
        
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => toggleExpanded(faq._id)}>
                <View style={styles.faqItem}>
                    <View style={styles.faqHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}20` }]}>
                            <Ionicons
                                name={getCategoryIcon(faq.category)}
                                size={24}
                                color={categoryColor}
                            />
                        </View>
                        <View style={styles.faqContent}>
                            {faq.category && (
                                <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}20` }]}>
                                    <Text style={[styles.categoryText, { color: categoryColor }]}>
                                        {faq.category}
                                    </Text>
                                </View>
                            )}
                            <Text style={styles.faqQuestion}>
                                {faq.question || 'No question'}
                            </Text>
                        </View>
                        <View style={styles.expandIcon}>
                            <Ionicons
                                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                size={24}
                                color="#8E8E93"
                            />
                        </View>
                    </View>
                    
                    {isExpanded && (
                        <View style={styles.faqAnswer}>
                            <Text style={styles.answerText}>
                                {faq.answer || 'No answer available'}
                            </Text>
                            {faq.updated_at && (
                                <Text style={styles.updatedText}>
                                    Last updated: {new Date(faq.updated_at).toLocaleDateString()}
                                </Text>
                            )}
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
        const category = faq.category || 'General';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(faq);
        return acc;
    }, {});

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#130160" />
                <Text style={styles.loadingText}>Loading FAQs...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <StatusBar translucent={true} backgroundColor={'transparent'} />
            <ImageBackground
                source={require('../../../assets/vector_1.png')}
                style={styles.vector}
                resizeMode="stretch">
                
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerChild}>
                        <Pressable onPress={() => navigation.goBack()}>
                            <MaterialIcons name='arrow-back-ios' color={'#0D0D26'} size={25} />
                        </Pressable>
                        <Text style={styles.headerText}>FAQs</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search FAQs..."
                        placeholderTextColor="#8E8E93"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#8E8E93" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Results Count */}
                {searchQuery.length > 0 && (
                    <View style={styles.resultsContainer}>
                        <Text style={styles.resultsText}>
                            {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} found
                        </Text>
                    </View>
                )}

                {/* FAQs List */}
                <View style={{ marginVertical: '2%', paddingBottom: hp(5) }}>
                    {filteredFaqs.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="help-circle-outline" size={80} color="#CCC" />
                            <Text style={styles.emptyTitle}>
                                {searchQuery ? 'No Results Found' : 'No FAQs Available'}
                            </Text>
                            <Text style={styles.emptyText}>
                                {searchQuery 
                                    ? 'Try different search terms'
                                    : 'Check back later for frequently asked questions'}
                            </Text>
                        </View>
                    ) : searchQuery ? (
                        // Show flat list when searching
                        filteredFaqs.map((faq) => (
                            <FAQItem key={faq._id} faq={faq} />
                        ))
                    ) : (
                        // Show grouped by category when not searching
                        Object.keys(groupedFaqs).sort().map((category) => (
                            <View key={category} style={styles.categorySection}>
                                <Text style={styles.categoryHeader}>{category}</Text>
                                {groupedFaqs[category].map((faq) => (
                                    <FAQItem key={faq._id} faq={faq} />
                                ))}
                            </View>
                        ))
                    )}
                </View>

                {/* Contact Support */}
                <View style={styles.supportContainer}>
                    <Text style={styles.supportTitle}>Still need help?</Text>
                    <TouchableOpacity
                        style={styles.supportButton}
                        onPress={() => navigation.navigate('HelpAndSupport')}>
                        <Ionicons name="chatbubbles-outline" size={20} color="#fff" />
                        <Text style={styles.supportButtonText}>Contact Support</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </ScrollView>
    );
};

export default FAQs;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E6F3F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E6F3F5',
    },
    loadingText: {
        marginTop: 10,
        fontFamily: 'Nunito-Regular',
        fontSize: hp(1.8),
        color: '#666',
    },
    vector: {
        flex: 1,
        width: wp(100),
        minHeight: hp(100),
    },
    header: {
        width: wp(100),
        height: hp(7),
        marginTop: '10%',
        paddingHorizontal: '5%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerChild: {
        flexDirection: 'row',
        alignItems: 'center',
        width: wp(30),
        justifyContent: 'space-between'
    },
    headerText: {
        fontFamily: 'Nunito-Bold',
        fontSize: hp(3),
        textAlign: 'left',
        color: '#0D0140'
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: wp(5),
        marginTop: hp(2),
        marginBottom: hp(1),
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Nunito-Regular',
        fontSize: hp(1.9),
        color: '#000',
    },
    resultsContainer: {
        paddingHorizontal: wp(5),
        paddingVertical: 8,
    },
    resultsText: {
        fontFamily: 'Nunito-Regular',
        fontSize: hp(1.7),
        color: '#8E8E93',
    },
    categorySection: {
        marginBottom: hp(2),
    },
    categoryHeader: {
        fontFamily: 'Nunito-Bold',
        fontSize: hp(2.2),
        color: '#130160',
        marginHorizontal: wp(5),
        marginTop: hp(2),
        marginBottom: hp(1),
    },
    faqItem: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: wp(5),
        marginVertical: hp(0.5),
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
    },
    faqHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    faqContent: {
        flex: 1,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginBottom: 4,
    },
    categoryText: {
        fontFamily: 'Nunito-SemiBold',
        fontSize: hp(1.4),
        textTransform: 'capitalize',
    },
    faqQuestion: {
        fontFamily: 'Nunito-SemiBold',
        fontSize: hp(1.8),
        color: '#000',
        lineHeight: hp(2.5),
    },
    expandIcon: {
        marginLeft: 8,
    },
    faqAnswer: {
        paddingHorizontal: 12,
        paddingBottom: 12,
        paddingTop: 4,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    answerText: {
        fontFamily: 'Nunito-Regular',
        fontSize: hp(1.7),
        color: '#666',
        lineHeight: hp(2.3),
    },
    updatedText: {
        fontFamily: 'Nunito-Regular',
        fontSize: hp(1.5),
        color: '#8E8E93',
        marginTop: 8,
        fontStyle: 'italic',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp(10),
    },
    emptyTitle: {
        fontFamily: 'Nunito-Bold',
        fontSize: hp(2.5),
        color: '#000',
        marginTop: 20,
        marginBottom: 10,
    },
    emptyText: {
        fontFamily: 'Nunito-Regular',
        fontSize: hp(1.8),
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: wp(15),
    },
    supportContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: wp(5),
        marginVertical: hp(2),
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    supportTitle: {
        fontFamily: 'Nunito-Bold',
        fontSize: hp(2),
        color: '#000',
        marginBottom: 12,
    },
    supportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#130160',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    supportButtonText: {
        fontFamily: 'Nunito-SemiBold',
        fontSize: hp(1.8),
        color: '#fff',
        marginLeft: 8,
    },
});