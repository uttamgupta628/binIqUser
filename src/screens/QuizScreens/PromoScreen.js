
import { Dimensions, FlatList, Image, ImageBackground, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import React, { useRef, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import OTPTextView from 'react-native-otp-textinput';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

const { width, height } = Dimensions.get('window')
const PromoScreen = () => {
    const navigation = useNavigation();
    const questions = [
        {
            id: 1,
            question: 'How long have you been involved in reselling?',
            options: ['Less than a year', '1-5 years', 'Over 5 years'],
        },
        {
            id: 2,
            question: 'What tools or software do you currently use to assist with your reselling business?',
            options: [],
            isOtherOption: true, 
        },
        {
            id: 3,
            question: 'What are your short-term goals (1-2 years) with reselling?',
            options: ['Part-time income', 'Six-figure income', 'Scale your business', 'Start a bin store', 'Others'],
            isOtherOption: true, // Flag for text input when 'Others' is selected
        },
        {
            id: 4,
            question: 'Are you interested in educational resources or training that could help improve your reselling skills?',
            options: ['Yes', 'No'],
        },
        {
            id: 5,
            question: 'What are your short-term goals (1-2 years) with reselling?',
            options: ['finding profitable inventory', 'listing items', 'managing inventory', 'shipping logistics/returns', 'more sales', 'scaling up','Others'],
            isOtherOption: true, // Flag for text input when 'Others' is selected
        },
        {
            id: 6,
            question: 'Is there anything else you would like to share about your reselling experience or need that we haven’t covered?',
            options: [],
            isOtherOption: true, 
        },
    ];
    const [currentQuestion, setCurrentQuestion] = useState(0); // Tracks the current question
    const [answers, setAnswers] = useState([]); // Stores user answers
    const [otherText, setOtherText] = useState('');
    const handleOptionSelect = (option) => {
        const updatedAnswers = [...answers];
        updatedAnswers[currentQuestion] = option;
        setAnswers(updatedAnswers);
    };

    const handleNextQuestion = () => {
        if (questions[currentQuestion].isOtherOption && answers[currentQuestion] === 'Others') {
            handleOptionSelect(otherText); // If 'Others' is selected, store the input text
        }
        setCurrentQuestion((prev) => prev + 1);
    };
    const handlePreviousQuestion = () => {
        if (currentQuestion > 0) {
          setCurrentQuestion((prev) => prev - 1);
        }
      };

    return (
        <View style={styles.container}>
            <StatusBar translucent={true} backgroundColor={'transparent'} />
            <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', marginTop: hp(7), paddingHorizontal: '5%' }}>
                <Pressable onPress={handlePreviousQuestion}> 
                <MaterialIcons name='arrow-back-ios' size={24} color={'#0D0D26'} />
                </Pressable>
                <Image source={require('../../../assets/logo.png')} style={styles.logo} />
            </View>
            <View style={styles.content}>
         <Text style={styles.title}>
           Embark on an immersive journey into the dynamic world of BinIQ and start with our{' '}
           <Text style={styles.highlightText}>FREE RESELLING TRAINING</Text>
         </Text> 
         <View style={{backgroundColor: '#fff', padding: '2%', borderRadius: 10, elevation: 4}}>
         <View style={styles.videoContainer}>
           <View style={styles.ratingContainer}>
                <Text style={{color: '#fff', fontSize: hp(1.8)}}>4,8</Text>
             <Ionicons name="star" size={hp(1.8)} color="#FFD700" />
             <AntDesign name="hearto" size={hp(1.8)} color="#fff" />
           </View>
         </View>      
         <Text style={styles.courseTitle}>Reselling Training</Text>
         <Text style={styles.courseDescription}>
           In this course, you'll learn everything there is to know about Free Reselling Video
         </Text>      
         <View style={styles.progressContainer}>
           <View style={styles.progressBar} />
           <Text style={styles.progressText}>1/1 Video</Text>
         </View>
        </View>     
       </View>
       <View style={styles.enrollNowContainer}>
                    <Pressable style={styles.button} onPress={() => navigation.navigate('HomeNavigataor')}>
                        <Text style={styles.buttonText}>ENROLL NOW</Text>
                    </Pressable>
                </View>
            <ImageBackground source={require('../../../assets/vector_3.png')} style={styles.vector2} />
        </View>
    )
}

export default PromoScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
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
        fontSize: hp(2.5)
    },
    cityVector: {
        position: 'absolute',
        width: wp(100),
        bottom: 0
    },
    label: {
        color: 'black',
        fontFamily: 'Nunito-SemiBold',
        fontSize: hp(2.2),
        marginTop: '3%'
    },
    gettingStarted: {
        backgroundColor: '#130160',
        width: '90%',
        height: hp(7),
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
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
        borderRadius: 10
    },
    toggleButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        height: '82%',
        marginHorizontal: '2%'
    },
    activeToggle: {
        backgroundColor: '#fff',
    },
    toggleText: {
        fontFamily: 'Nunito-Regular',
        fontSize: hp(2),
        color: '#0D0D26'
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
        zIndex: -1
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        // marginTop: hp(4),
        marginVertical: '7%'
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
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'left',
        fontFamily: 'Nunito-Regular',
        color: '#000'
    },
    optionButton: {
        width: wp(90),
        height: hp(6.5),
        marginBottom: hp(3),
        borderRadius: 8,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'left',
        paddingHorizontal: '3%'
    },
    selectedOption: {
        borderColor: '#00d084',
    },
    optionText: {
        fontSize: 16,
        color: '#333333',
    },
    textInput: {
        marginTop: '5%',
        paddingHorizontal: '5%',
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        height: hp(10)
    },
    textInputForQue3 : {
        marginTop: '2%',
        paddingHorizontal: '5%',
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        elevation: 5,
        height: hp(7),
        width: wp(80),
        alignSelf: 'flex-end'
    },
    nextButton: {
        width: wp(16),
        height: hp(8),
        backgroundColor: '#130160',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
        position: 'absolute',
        bottom: hp(4)
    },
    nextButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    optionContainer: {
        marginVertical: '10%'
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
      },
      title: {
        fontSize: hp(2.2),
        fontFamily: 'Nunito-SemiBold',
        color: '#333',
        marginBottom: 20,
      },
      highlightText: {
        color: '#14BA9C',
        fontFamily: 'Nunito-Bold'
      },
      videoContainer: {
        width: '100%',
        height: hp(20),
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        justifyContent: 'flex-end',
        marginBottom: 20,
      },
      ratingContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 4,
        borderRadius: 10,
        // alignSelf: 'flex-start',
        margin: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        width: wp(17),
      },
      courseTitle: {
        fontSize: hp(2.5),
        fontFamily: 'Nunito-Bold',
        color: '#000'
      },
      courseDescription: {
        fontSize: hp(2),
        color: '#666',
        fontFamily: 'Nunito-SemiBold',
        marginVertical: '5%',
      },
      progressContainer: {
        marginBottom: 20,
      },
      progressBar: {
        height: hp(0.9),
        backgroundColor: '#14BA9C',
        width: '100%',
        borderRadius: 10,
      },
      progressText: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
        textAlign: 'right'
      },
      enrollNowContainer: {
        position: 'absolute',
        elevation: 5,
        width: wp(100),
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
})