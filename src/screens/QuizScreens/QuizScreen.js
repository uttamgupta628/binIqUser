import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import React, {useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import OTPTextView from 'react-native-otp-textinput';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';

const {width, height} = Dimensions.get('window');
const QuizScreen = () => {
  const navigation = useNavigation();
  const questions = [
    {
      id: 1,
      question: 'Select Your Reselling Expertise Level:',
      options: [
        'Newbie: Just starting out in the reselling world.',
        'Experienced: I have made several sales and am comfortable with the basics.',
        "Advanced: I've substantial experience and consistently profit.",
        "Expert: I'm a seasoned pro with deep market knowledge.",
        'Bin Store Owner: I own and operate my own bin store.',
      ],
    },
    {
      id: 2,
      question:
        'What tools or software do you currently use to assist with your reselling business?',
      options: [],
      isOtherOption: true, // Flag for text input when 'Others' is selected
    },
    {
      id: 4,
      question:
        'Are you interested in educational resources or training that could help improve your reselling skills?',
      options: ['Yes', 'No'],
    },
    {
      id: 5,
      question: 'What are your short-term goals (1-2 years) with reselling?',
      options: [
        'Finding profitable inventory',
        'Listing items',
        'Managing inventory',
        'Shipping logistics/returns',
        'More sales',
        'Scaling up',
        'Others',
      ],
      isOtherOption: true, // Flag for text input when 'Others' is selected
    },
    {
      id: 6,
      question: 'What are your long-term goals (1-2 years) with reselling?',
      options: [
        'Finding profitable inventory',
        'Listing items',
        'Managing inventory',
        'Shipping logistics/returns',
        'More sales',
        'Scaling up',
        'Others',
      ],
      isOtherOption: true, // Flag for text input when 'Others' is selected
    },
    {
      id: 7,
      question:
        'Are you interested in educational resources or training that could help improve your reselling skills?',
      options: [],
      isOtherOption: true,
    },
  ];
  const [currentQuestion, setCurrentQuestion] = useState(0); // Tracks the current question
  const [answers, setAnswers] = useState([]); // Stores user answers
  const [otherText, setOtherText] = useState('');
  const handleOptionSelect = option => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = option;
    setAnswers(updatedAnswers);
  };

  const handleNextQuestion = () => {
    if (
      questions[currentQuestion].isOtherOption &&
      answers[currentQuestion] === 'Others'
    ) {
      handleOptionSelect(otherText); // If 'Others' is selected, store the input text
    }
    setCurrentQuestion(prev => prev + 1);
  };
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: hp(7),
          paddingHorizontal: '5%',
        }}>
        <Pressable onPress={handlePreviousQuestion}>
          <MaterialIcons name="arrow-back-ios" size={24} color={'#0D0D26'} />
        </Pressable>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
        />
      </View>
      <View style={{flex: 1, marginHorizontal: '5%', marginTop: hp(1)}}>
        <View style={styles.progressContainer}>
          {questions.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                currentQuestion >= index && styles.activeDot,
              ]}
            />
          ))}
        </View>
        <Text style={styles.questionText}>
          {questions[currentQuestion].question}
        </Text>
        <ScrollView style={styles.optionContainer}>
          {questions[currentQuestion].id === 1 ? (
            <FlatList
              data={questions[currentQuestion].options}
              keyExtractor={item => item}
              renderItem={({item}) => {
                // Split the option into the bold part (first word) and the rest.
                const [boldPart, ...rest] = item.split(':');
                const restOfText = rest.join(':'); // Rejoin the remaining text

                return (
                  <TouchableOpacity
                    style={[
                      styles.optionButtonForQue1,
                      answers[currentQuestion] === item &&
                        styles.selectedOption,
                    ]}
                    onPress={() => handleOptionSelect(item)}>
                    <Text style={styles.optionText}>
                      <Text style={{fontWeight: '500'}}>{boldPart}:</Text>
                      <Text> {restOfText}</Text>
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          ) : (
            <FlatList
              data={questions[currentQuestion].options}
              keyExtractor={item => item}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    answers[currentQuestion] === item && styles.selectedOption,
                  ]}
                  onPress={() => handleOptionSelect(item)}>
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )}
          {questions[currentQuestion].id === 2 && (
            <TextInput
              style={styles.textInput}
              placeholder="Please enter your answer here"
              placeholderTextColor={'#99ABC699'}
              value={otherText}
              onChangeText={setOtherText}
            />
          )}
          {questions[currentQuestion].id === 6 &&
            questions[currentQuestion].id === 5 && (
              <TextInput
                style={styles.textInput}
                placeholder="Please enter your answer here"
                placeholderTextColor={'#99ABC699'}
                value={otherText}
                onChangeText={setOtherText}
              />
            )}
          {questions[currentQuestion].id === 4 &&
            answers[currentQuestion] === 'Yes' &&
            navigation.navigate('PromoScreen')}
        </ScrollView>
        {currentQuestion < questions.length - 1 ? (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextQuestion}>
            <AntDesign
              name="arrowright"
              size={30}
              color="#fff"
              style={styles.nextArrow}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.enrollNowContainer}>
            <Pressable
              style={styles.button}
              onPress={() => navigation.navigate('HomeNavigataor')}>
              <Text style={styles.buttonText}>ENROLL NOW</Text>
            </Pressable>
          </View>
        )}
      </View>
      <ImageBackground
        source={require('../../../assets/vector_3.png')}
        style={styles.vector2}
      />
    </View>
  );
};

export default QuizScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoHeader: {
    alignItems: 'flex-end',
    paddingRight: '3%',
    height: hp(13),
    width: '100%',
  },
  logo: {
    width: wp(30),
    height: hp(6),
  },
  vector: {
    flex: 1,
    width: wp(100),
    height: hp(50),
  },
  logoText: {
    fontFamily: 'Nunito-SemiBold',
    color: '#000',
    fontSize: hp(2.5),
  },
  cityVector: {
    position: 'absolute',
    width: wp(100),
    bottom: 0,
  },
  label: {
    color: 'black',
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(2.2),
    marginTop: '3%',
  },
  gettingStarted: {
    backgroundColor: '#130160',
    width: '90%',
    height: hp(7),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#C0C0C0', // Gray color for the lines
  },
  text: {
    marginHorizontal: 10,
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#A9A9A9', // Light gray color for the text
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1),
    backgroundColor: '#DDF4F3',
    width: wp(85),
    height: hp(7.5),
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    height: '82%',
    marginHorizontal: '2%',
  },
  activeToggle: {
    backgroundColor: '#fff',
  },
  toggleText: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(2),
    color: '#0D0D26',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  mobileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    marginRight: 10,
    fontSize: 16,
    lineHeight: 50, // Aligns vertically with the input
  },
  sendCodeButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  sendCodeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  vector2: {
    flex: 1,
    width: wp(100),
    height: height * 0.5,
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    // marginTop: hp(4),
    marginVertical: '7%',
  },
  progressDot: {
    width: wp(12),
    height: hp(0.6),
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#00d084', // Active progress color
  },
  questionText: {
    fontSize: wp(4.6),
    marginBottom: '6%',
    textAlign: 'left',
    fontFamily: 'DMSans-SemiBold',
    color: '#130160',
  },
  optionButton: {
    width: wp(90),
    height: hp(8.6),
    marginBottom: hp(3),
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'left',
    paddingHorizontal: '3%',
  },
  optionButtonForQue1: {
    width: wp(90),
    height: hp(8.5),
    marginBottom: hp(3),
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'left',
    paddingHorizontal: '3%',
    paddingVertical: '3.5%',
  },
  selectedOption: {
    borderColor: '#00d084',
  },
  optionText: {
    fontSize: wp(4),
    color: '#333333',
    fontFamily: 'DMSans-Regular',
  },
  textInput: {
    marginTop: '5%',
    paddingHorizontal: '5%',
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    height: hp(10),
    color: '#eee',
  },
  textInputForQue3: {
    marginTop: '2%',
    paddingHorizontal: '5%',
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 5,
    height: hp(7),
    width: wp(80),
    alignSelf: 'flex-end',
  },
  nextButton: {
    width: wp(16),
    height: wp(16),
    backgroundColor: '#130160',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: hp(4),
  },
  nextButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  optionContainer: {
    marginVertical: '10%',
  },
  enrollNowContainer: {
    position: 'absolute',
    elevation: 5,
    width: wp(90),
    height: hp(16),
    backgroundColor: '#fff',
    bottom: 0,
    alignSelf: 'center',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#1a237e', // Dark purple color
    width: '80%',
    height: hp(5.6),
    borderRadius: 10,
    justifyContent: 'center',
    elevation: 3, // This creates the shadow for the button
  },
  buttonText: {
    color: 'white',
    fontSize: hp(1.9),
    fontFamily: 'Nunito-Bold',
    textAlign: 'center',
  },
});
