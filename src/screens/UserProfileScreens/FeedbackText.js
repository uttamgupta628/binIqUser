import {
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { userAPI } from '../../api/apiService';

const FeedbackText = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const rating = route.params?.rating || 0;
  const feedbackData = route.params?.feedbackData || {};

  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      Alert.alert('Empty Feedback', 'Please write your feedback before submitting.');
      return;
    }

    try {
      setSubmitting(true);

      const fullFeedback = {
        ...feedbackData,
        rating: rating,
        feedback: feedbackText.trim(),
        timestamp: new Date().toISOString(),
        type: 'app_feedback',
      };

      console.log('Submitting feedback:', fullFeedback);

      // TODO: Replace with actual API call when endpoint is available
      // const response = await userAPI.submitFeedback(fullFeedback);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        'Thank You!',
        'Your feedback has been submitted successfully. We appreciate your input!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('HomeNavigataor'),
          }
        ]
      );
    } catch (err) {
      console.error('Error submitting feedback:', err);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Feedback?',
      'Your rating has been recorded. Are you sure you want to skip providing detailed feedback?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => navigation.navigate('HomeNavigataor'),
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}
        resizeMode="stretch"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                disabled={submitting}
              >
                <MaterialIcons name="arrow-back-ios" color={'#0D0D26'} size={25} />
              </TouchableOpacity>
              <Text style={styles.headerText}>Feedback</Text>
              <View style={{ width: 25 }} />
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Rating Display */}
              <View style={styles.ratingDisplay}>
                <Text style={styles.ratingLabel}>Your Rating:</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={30}
                      color={star <= rating ? '#FFD700' : '#E0E0E0'}
                      style={{ marginHorizontal: 2 }}
                    />
                  ))}
                </View>
              </View>

              {/* Feedback Input */}
              <View style={styles.feedbackSection}>
                <Text style={styles.feedbackLabel}>
                  Tell us more about your experience:
                </Text>
                <TextInput
                  style={styles.feedbackInput}
                  placeholder="Share your thoughts, suggestions, or report any issues..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  value={feedbackText}
                  onChangeText={setFeedbackText}
                  editable={!submitting}
                />
                <Text style={styles.characterCount}>
                  {feedbackText.length}/500 characters
                </Text>
              </View>

              {/* Suggestions */}
              <View style={styles.suggestionsSection}>
                <Text style={styles.suggestionsTitle}>
                  What would you like to tell us about?
                </Text>
                <View style={styles.suggestionChips}>
                  {[
                    'App Performance',
                    'User Interface',
                    'Features',
                    'Bug Report',
                    'Suggestions',
                  ].map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionChip}
                      onPress={() => {
                        if (!submitting) {
                          setFeedbackText(prev =>
                            prev ? `${prev}\n${suggestion}: ` : `${suggestion}: `
                          );
                        }
                      }}
                      disabled={submitting}
                    >
                      <Text style={styles.suggestionChipText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                  disabled={submitting}
                >
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    submitting && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Feedback</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

export default FeedbackText;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F3F5',
  },
  vector: {
    flex: 1,
    width: wp(100),
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
  headerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(3),
    color: '#0D0140',
  },
  content: {
    flex: 1,
    paddingHorizontal: '5%',
    paddingTop: '5%',
  },
  ratingDisplay: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingLabel: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(2),
    color: '#666',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  feedbackSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackLabel: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2),
    color: '#000',
    marginBottom: 15,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: hp(1.9),
    fontFamily: 'Nunito-Regular',
    color: '#000',
    minHeight: hp(20),
    maxHeight: hp(25),
  },
  characterCount: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.5),
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  suggestionsSection: {
    marginBottom: 20,
  },
  suggestionsTitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.8),
    color: '#666',
    marginBottom: 12,
  },
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  suggestionChipText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.6),
    color: '#130160',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 30,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingVertical: 15,
    marginRight: 10,
    alignItems: 'center',
  },
  skipButtonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2),
    color: '#666',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#130160',
    borderRadius: 10,
    paddingVertical: 15,
    marginLeft: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2),
    color: '#fff',
  },
});