import {
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import StarRating from 'react-native-star-rating-widget';

const {width, height} = Dimensions.get('window');

const Feedback = () => {
  const navigation = useNavigation();
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (rating > 0 && !submitting) {
      handleRatingSubmit();
    }
  }, [rating]);

  const handleRatingSubmit = () => {
    // Navigate to FeedbackText with just the rating
    // Actual API submission happens there
    navigation.navigate('FeedbackText', {rating});
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}
        resizeMode="stretch">
        <View style={styles.reviewContainer}>
          {/* Close Button */}
          <View style={styles.cancelMark}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              disabled={submitting}>
              <AntDesign name="close" color="#3C3C4399" size={hp(2.3)} />
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.main}>
            <View style={styles.textContainer}>
              <Text style={styles.titleText}>How are you finding the app?</Text>
              <Text style={styles.descriptionText}>
                We've been working hard on this feature, so your feedback is
                super helpful to us.
              </Text>

              {/* Star Rating */}
              <View style={styles.starContainer}>
                <StarRating
                  rating={rating}
                  onChange={setRating}
                  starSize={hp(5.3)}
                  enableHalfStar={false}
                  enableSwiping={false}
                  color="#FFD700"
                  emptyColor="#E0E0E0"
                />
                {rating > 0 && (
                  <Text style={styles.ratingText}>
                    {getRatingMessage(rating)}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Helper Text */}
          <View style={styles.helperTextContainer}>
            <Text style={styles.helperText}>
              Tap a star to rate your experience
            </Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

// Helper function to get rating message
const getRatingMessage = rating => {
  switch (rating) {
    case 1:
      return "We're sorry to hear that 😔";
    case 2:
      return 'We can do better 😕';
    case 3:
      return "It's okay 😊";
    case 4:
      return "We're glad you like it! 😃";
    case 5:
      return 'Awesome! Thank you! 🎉';
    default:
      return '';
  }
};

export default Feedback;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F3F5',
  },
  vector: {
    flex: 1,
    width: wp(100),
    height: height,
  },
  reviewContainer: {
    position: 'absolute',
    width: wp(100),
    height: hp(35),
    backgroundColor: '#fff',
    bottom: '0%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    padding: '5%',
    justifyContent: 'space-evenly',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  main: {
    height: '60%',
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelMark: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  closeButton: {
    backgroundColor: '#74748014',
    height: hp(3.5),
    width: wp(7),
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontFamily: 'Nunito-Bold',
    color: '#000',
    textAlign: 'center',
    fontSize: hp(2.6),
  },
  descriptionText: {
    fontFamily: 'Nunito-SemiBold',
    color: '#52525B',
    fontSize: hp(2.2),
    textAlign: 'center',
    paddingHorizontal: '2%',
  },
  starContainer: {
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2),
    color: '#130160',
    marginTop: 10,
    textAlign: 'center',
  },
  helperTextContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  helperText: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.6),
    color: '#999',
    textAlign: 'center',
  },
});
