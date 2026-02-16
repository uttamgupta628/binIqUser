import { ImageBackground, Pressable, StatusBar, StyleSheet, Text, View, ScrollView, ActivityIndicator, RefreshControl, TextInput, Alert, Linking } from 'react-native'
import React, { useState, useEffect } from 'react'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import API service
import { faqsAPI } from '../../api/apiService';

const HelpAndSupport = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [faqs, setFaqs] = useState([]);
    const [filteredFaqs, setFilteredFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigation = useNavigation();

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

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleContactEmail = () => {
        Linking.openURL('mailto:support@biniq.com');
    };

    const handleContactPhone = () => {
        Linking.openURL('tel:+1234567890');
    };

    // Navigate to Feedback screen (exists in your navigation)
    const handleSubmitFeedback = () => {
        navigation.navigate('Feedback');
    };

    // Navigate to FAQs screen (exists in your navigation)
    const handleViewAllFAQs = () => {
        navigation.navigate('FAQs');
    };

    const AccordionItem = ({ item, index, isOpen, onToggle }) => {
        return (
            <View style={styles.itemContainer}>
                <TouchableOpacity onPress={onToggle} style={styles.questionContainer}>
                    <View style={styles.questionContent}>
                        {item.category && (
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{item.category}</Text>
                            </View>
                        )}
                        <Text style={styles.questionText}>{item.question}</Text>
                    </View>
                    <Ionicons 
                        name={isOpen ? 'chevron-down' : 'chevron-forward'} 
                        size={24} 
                        color="#130160"
                    />
                </TouchableOpacity>
                {isOpen && (
                    <View style={styles.answerContainer}>
                        <Text style={styles.answerText}>{item.answer}</Text>
                        {item.updated_at && (
                            <Text style={styles.updatedText}>
                                Last updated: {new Date(item.updated_at).toLocaleDateString()}
                            </Text>
                        )}
                    </View>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#130160" />
                <Text style={styles.loadingText}>Loading...</Text>
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
                        <Text style={styles.headerText}>Help & Support</Text>
                    </View>
                </View>

                {/* Support Options Cards */}
                <View style={styles.supportOptionsContainer}>
                    <TouchableOpacity 
                        style={styles.supportCard}
                        onPress={handleContactEmail}>
                        <View style={[styles.supportIcon, { backgroundColor: '#E3F2FD' }]}>
                            <Ionicons name="mail-outline" size={28} color="#130160" />
                        </View>
                        <Text style={styles.supportCardTitle}>Email Support</Text>
                        <Text style={styles.supportCardText}>support@biniq.com</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.supportCard}
                        onPress={handleContactPhone}>
                        <View style={[styles.supportIcon, { backgroundColor: '#E8F5E9' }]}>
                            <Ionicons name="call-outline" size={28} color="#14BA9C" />
                        </View>
                        <Text style={styles.supportCardTitle}>Phone Support</Text>
                        <Text style={styles.supportCardText}>+1 (234) 567-890</Text>
                    </TouchableOpacity>
                </View>

                {/* Submit Feedback Button */}
                <TouchableOpacity 
                    style={styles.feedbackButton}
                    onPress={handleSubmitFeedback}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
                    <Text style={styles.feedbackButtonText}>Submit Feedback</Text>
                </TouchableOpacity>

                {/* Search Bar */}
                {faqs.length > 0 && (
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
                )}

                {/* FAQs Section */}
                <View style={styles.faqSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Frequently Asked Questions
                        </Text>
                        {faqs.length > 3 && (
                            <TouchableOpacity onPress={handleViewAllFAQs}>
                                <Text style={styles.viewAllText}>View All</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    {searchQuery.length > 0 && (
                        <Text style={styles.resultsText}>
                            {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} found
                        </Text>
                    )}

                    {filteredFaqs.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="help-circle-outline" size={60} color="#CCC" />
                            <Text style={styles.emptyTitle}>
                                {searchQuery ? 'No Results Found' : 'No FAQs Available'}
                            </Text>
                            <Text style={styles.emptyText}>
                                {searchQuery 
                                    ? 'Try different search terms'
                                    : 'Contact support for assistance'}
                            </Text>
                        </View>
                    ) : (
                        <View style={{ marginVertical: '2%' }}>
                            {/* Show only first 3 FAQs if not searching */}
                            {(searchQuery ? filteredFaqs : filteredFaqs.slice(0, 3)).map((item, index) => (
                                <AccordionItem
                                    key={item._id || index}
                                    item={item}
                                    index={index}
                                    isOpen={openIndex === index}
                                    onToggle={() => toggleAccordion(index)}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* Additional Help Options */}
                <View style={styles.helpOptionsContainer}>
                    <Text style={styles.helpOptionsTitle}>More Help</Text>
                    
                    <TouchableOpacity 
                        style={styles.helpOptionItem}
                        onPress={handleViewAllFAQs}>
                        <Ionicons name="help-circle-outline" size={24} color="#130160" />
                        <Text style={styles.helpOptionText}>View All FAQs</Text>
                        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.helpOptionItem}
                        onPress={() => navigation.navigate('FeedbackText')}>
                        <Ionicons name="chatbubbles-outline" size={24} color="#130160" />
                        <Text style={styles.helpOptionText}>Send Feedback</Text>
                        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.helpOptionItem}
                        onPress={() => navigation.navigate('SettingsScreen')}>
                        <Ionicons name="settings-outline" size={24} color="#130160" />
                        <Text style={styles.helpOptionText}>Settings</Text>
                        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                </View>

                {/* Bottom Spacing */}
                <View style={{ height: hp(5) }} />
            </ImageBackground>
        </ScrollView>
    );
};

export default HelpAndSupport;

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
        width: wp(55),
        justifyContent: 'space-between'
    },
    headerText: {
        fontFamily: 'Nunito-Bold',
        fontSize: hp(3),
        textAlign: 'left',
        color: '#0D0140'
    },
    supportOptionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        marginTop: hp(2),
    },
    supportCard: {
        width: wp(43),
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    supportIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    supportCardTitle: {
        fontFamily: 'Nunito-Bold',
        fontSize: hp(1.8),
        color: '#000',
        marginBottom: 4,
    },
    supportCardText: {
        fontFamily: 'Nunito-Regular',
        fontSize: hp(1.6),
        color: '#666',
        textAlign: 'center',
    },
    feedbackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#130160',
        marginHorizontal: wp(5),
        marginTop: hp(2),
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    feedbackButtonText: {
        fontFamily: 'Nunito-SemiBold',
        fontSize: hp(1.9),
        color: '#fff',
        marginLeft: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: wp(5),
        marginTop: hp(2),
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
    faqSection: {
        marginTop: hp(2),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: wp(5),
        marginBottom: hp(1),
    },
    sectionTitle: {
        fontFamily: 'Nunito-Bold',
        fontSize: hp(2.3),
        color: '#130160',
    },
    viewAllText: {
        fontFamily: 'Nunito-SemiBold',
        fontSize: hp(1.7),
        color: '#130160',
        textDecorationLine: 'underline',
    },
    resultsText: {
        fontFamily: 'Nunito-Regular',
        fontSize: hp(1.7),
        color: '#8E8E93',
        marginHorizontal: wp(5),
        marginBottom: hp(1),
    },
    itemContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        marginHorizontal: wp(5),
        paddingVertical: hp(2),
        backgroundColor: '#FFFFFF',
        marginVertical: hp(0.5),
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    questionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    questionContent: {
        flex: 1,
        marginRight: 12,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8E0FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginBottom: 6,
    },
    categoryText: {
        fontFamily: 'Nunito-SemiBold',
        fontSize: hp(1.4),
        color: '#130160',
        textTransform: 'capitalize',
    },
    questionText: {
        fontSize: hp(2),
        color: '#000000',
        fontFamily: 'Nunito-Bold',
    },
    answerContainer: {
        marginTop: hp(1.5),
        paddingTop: hp(1.5),
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    answerText: {
        fontSize: hp(1.8),
        color: '#566261',
        fontFamily: 'Nunito-Regular',
        lineHeight: hp(2.5),
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
        paddingVertical: hp(5),
    },
    emptyTitle: {
        fontFamily: 'Nunito-Bold',
        fontSize: hp(2.2),
        color: '#000',
        marginTop: 12,
        marginBottom: 8,
    },
    emptyText: {
        fontFamily: 'Nunito-Regular',
        fontSize: hp(1.7),
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: wp(10),
    },
    helpOptionsContainer: {
        marginHorizontal: wp(5),
        marginTop: hp(3),
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    helpOptionsTitle: {
        fontFamily: 'Nunito-Bold',
        fontSize: hp(2),
        color: '#000',
        marginBottom: 12,
    },
    helpOptionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    helpOptionText: {
        flex: 1,
        fontFamily: 'Nunito-SemiBold',
        fontSize: hp(1.8),
        color: '#000',
        marginLeft: 12,
    },
});