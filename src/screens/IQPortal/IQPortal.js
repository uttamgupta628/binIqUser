import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const IQPortal = () => {
  const navigation = useNavigation();
  
  // State
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [services, setServices] = useState([]);

  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchCoursesAndServices();
    }, [])
  );

  const fetchCoursesAndServices = async () => {
    try {
      setLoading(true);
      
      // Mock courses data (replace with actual API call when available)
      const mockCourses = [
        {
          id: '1',
          _id: '1',
          title: 'Start a Bin Store',
          description: 'How to start a bin store Intro to reselling video',
          image: require('../../../assets/reseller_training.png'),
          duration: 'Full Video',
          resources: 'With PDF',
          price: 'Free',
          category: 'Training',
        },
        {
          id: '2',
          _id: '2',
          title: 'Free Reseller Training',
          description: 'Resellers BluePrint Method',
          image: require('../../../assets/reseller_training.png'),
          duration: '1 Video',
          resources: 'With PDF',
          price: 'Free',
          category: 'Training',
        },
        {
          id: '3',
          _id: '3',
          title: 'Reseller BluePrint',
          description: 'How to Buy Pallets',
          image: require('../../../assets/reseller_training.png'),
          duration: '3 Video',
          resources: 'With PDF',
          price: '$49.99',
          category: 'Advanced',
        },
        {
          id: '4',
          _id: '4',
          title: 'Buy Pallets',
          description: 'Truckloads Directly',
          image: require('../../../assets/reseller_training.png'),
          duration: 'Full Training',
          resources: 'With PDF',
          price: '$99.99',
          category: 'Advanced',
        },
      ];

      const mockServices = [
        {
          id: '1',
          title: 'Bookkeeping/Taxes/Accounting Help',
          price: 'Price Per Request',
          description: 'Professional accounting services tailored to your needs',
        },
        {
          id: '2',
          title: 'Consulting',
          price: '$500 Per Session',
          description: 'One-on-one consulting sessions with experts',
        },
        {
          id: '3',
          title: '101 30 Day Mentorship Training Plan',
          price: '$2,000.00',
          description: 'Comprehensive 30-day mentorship program',
        },
        {
          id: '4',
          title: 'Direct Contact Holder Portal',
          price: '$250.00',
          description: 'Access to direct contact holder portal',
        },
      ];

      setCourses(mockCourses);
      setServices(mockServices);
      
      // TODO: Replace with actual API call when available
      // const response = await coursesAPI.getAll();
      // setCourses(response.courses);
      // setServices(response.services);
      
    } catch (err) {
      console.error('Error fetching courses:', err);
      // Don't show alert, just use empty state
    } finally {
      setLoading(false);
    }
  };

  const handleCoursePress = (course) => {
    navigation.navigate('CourseDetails', { course });
  };

  const handleServicePress = (service) => {
    Alert.alert(
      service.title,
      `${service.description}\n\nPrice: ${service.price}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Contact Us', 
          onPress: () => {
            // Navigate to contact or open email
            Alert.alert('Contact', 'Feature coming soon!');
          }
        },
      ]
    );
  };

  const CourseCard = ({ course, index }) => {
    const isFirstRow = index < 2;
    const cardHeight = isFirstRow ? hp(30) : hp(25);

    return (
      <TouchableOpacity
        style={[styles.courseCard, { height: cardHeight }]}
        onPress={() => handleCoursePress(course)}
        activeOpacity={0.7}
      >
        <Image
          source={
            course.image 
              ? (typeof course.image === 'string' ? { uri: course.image } : course.image)
              : require('../../../assets/reseller_training.png')
          }
          style={styles.courseImage}
        />
        <View style={styles.courseContent}>
          <Text style={styles.courseTitle} numberOfLines={1}>
            {course.title}
          </Text>
          <Text style={styles.courseDescription} numberOfLines={2}>
            {course.description}
          </Text>
          <Text style={styles.courseInfo}>
            {course.duration} • {course.resources}
          </Text>
          {course.price !== 'Free' && (
            <Text style={styles.coursePrice}>{course.price}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const ServiceCard = ({ service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => handleServicePress(service)}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.serviceTitle} numberOfLines={2}>
          {service.title}: {service.price}
        </Text>
      </View>
      <MaterialIcons name="arrow-forward-ios" size={20} color="#524B6B" />
    </TouchableOpacity>
  );

  const EmptyState = ({ message }) => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="school" size={60} color="#ccc" />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons
                name="arrow-back-ios"
                color={'#0D0D26'}
                size={25}
              />
            </Pressable>
            <Text style={styles.headerText}>Reseller IQ Portal</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#130160" />
            <Text style={styles.loadingText}>Loading courses...</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Courses Section */}
            {courses.length > 0 ? (
              <>
                {/* First Row - 2 Courses */}
                <View style={styles.coursesContainer}>
                  <View style={styles.coursesRow}>
                    {courses.slice(0, 2).map((course, index) => (
                      <CourseCard key={course.id} course={course} index={index} />
                    ))}
                  </View>
                </View>

                {/* Second Row - 2 Courses */}
                <View style={styles.coursesContainer}>
                  <View style={styles.coursesRow}>
                    {courses.slice(2, 4).map((course, index) => (
                      <CourseCard key={course.id} course={course} index={index + 2} />
                    ))}
                  </View>
                </View>

                {/* Additional Courses if any */}
                {courses.length > 4 && (
                  <View style={styles.coursesContainer}>
                    <View style={styles.coursesRow}>
                      {courses.slice(4).map((course, index) => (
                        <CourseCard key={course.id} course={course} index={index + 4} />
                      ))}
                    </View>
                  </View>
                )}
              </>
            ) : (
              <EmptyState message="No courses available" />
            )}

            {/* Services Section */}
            <View style={styles.servicesContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>ADDITIONAL SERVICES</Text>
              </View>

              {services.length > 0 ? (
                services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))
              ) : (
                <EmptyState message="No services available" />
              )}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </ImageBackground>

      <ImageBackground
        source={require('../../../assets/vector_2.png')}
        style={styles.vector2}
      />
    </View>
  );
};

export default IQPortal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  vector: {
    width: wp(100),
    height: '100%',
  },
  vector2: {
    width: wp(100),
    height: hp(50),
    position: 'absolute',
    bottom: 0,
    zIndex: -1,
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
    gap: 10,
  },
  headerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.9),
    color: '#0D0140',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Nunito-Regular',
    fontSize: hp(2),
    color: '#666',
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(2),
    color: '#666',
    marginTop: 15,
  },
  // Courses Section
  coursesContainer: {
    marginVertical: '3%',
    paddingHorizontal: '5%',
  },
  coursesRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseCard: {
    width: wp(44),
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#e6e6e6',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseImage: {
    width: wp(44),
    height: hp(13),
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  courseContent: {
    margin: '6%',
  },
  courseTitle: {
    fontFamily: 'Nunito-ExtraBold',
    color: '#0049AF',
    fontSize: hp(1.7),
    marginBottom: 5,
  },
  courseDescription: {
    fontFamily: 'Nunito-SemiBold',
    color: '#000',
    fontSize: hp(1.7),
    marginBottom: 8,
    lineHeight: hp(2.2),
  },
  courseInfo: {
    fontFamily: 'Nunito-SemiBold',
    color: '#14BA9C',
    fontSize: hp(1.5),
  },
  coursePrice: {
    fontFamily: 'Nunito-Bold',
    color: '#130160',
    fontSize: hp(1.8),
    marginTop: 5,
  },
  // Services Section
  servicesContainer: {
    paddingHorizontal: '5%',
    marginTop: '5%',
  },
  sectionHeader: {
    marginVertical: '7%',
  },
  sectionTitle: {
    fontFamily: 'Nunito-Bold',
    color: '#130160',
    fontSize: hp(2.3),
  },
  serviceCard: {
    backgroundColor: '#fff',
    width: wp(90),
    minHeight: hp(6.5),
    borderRadius: 5,
    paddingHorizontal: '5%',
    paddingVertical: '3%',
    elevation: 3,
    marginBottom: '4%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  serviceTitle: {
    color: '#524B6B',
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.9),
    lineHeight: hp(2.5),
  },
});