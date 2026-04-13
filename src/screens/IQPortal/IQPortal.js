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
  Linking,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const IQPortal = () => {
  const navigation = useNavigation();

  const [loading, setLoading]   = useState(false);
  const [courses, setCourses]   = useState([]);
  const [services, setServices] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchCoursesAndServices();
    }, [])
  );

  const fetchCoursesAndServices = async () => {
    try {
      setLoading(true);

      const mockCourses = [
        {
          id: '1',
          title: 'How to Start a Bin Store',
          description: 'Intro to reselling — full video with PDF guide',
          image: require('../../../assets/reseller_training.png'),
          duration: 'Full Video',
          resources: 'With PDF',
          price: 'Free',
          category: 'Training',
          url: 'https://www.biniq.net/products/how-to-start-a-bin-store',
        },
        {
          id: '2',
          title: 'Free Reseller Training',
          description: 'Start your reselling journey for free',
          image: require('../../../assets/reseller_training.png'),
          duration: '1 Video',
          resources: 'With PDF',
          price: 'Free',
          category: 'Training',
          url: 'https://www.biniq.net/products/free-bin-reselling-training?variant=50225215701308',
        },
        {
          id: '3',
          title: 'MASTERMIND BLUEPRINT',
          description: 'How to Make Money Reselling Fast',
          image: require('../../../assets/reseller_training.png'),
          duration: '3 Videos',
          resources: 'With PDF',
          price: '$49.99',
          category: 'Advanced',
          url: 'https://www.biniq.net/products/bin-reseller-blueprint',
        },
        {
          id: '4',
          title: 'How to Buy Pallets & Truckloads',
          description: 'Buy pallets and truckloads directly',
          image: require('../../../assets/reseller_training.png'),
          duration: 'Full Training',
          resources: 'With PDF',
          price: '$99.99',
          category: 'Advanced',
          url: 'https://www.biniq.net/products/how-to-buy-pallets-and-truckloads-directly',
        },
      ];

      const mockServices = [
        {
          id: '1',
          title: 'Bookkeeping / Taxes / Accounting Help',
          price: 'Price Per Request',
          url: 'https://www.biniq.net/products/bookkeeping-taxes-accounting-help?variant=52941971915068',
        },
        // {
        //   id: '2',
        //   title: 'Consulting',
        //   price: '$500 Per Session',
        //   url: 'https://www.biniq.net/collections/training-and-resources',
        // },
        {
          id: '3',
          title: '101 30-Day Mentorship Training Plan',
          price: '$2,000.00',
          url: 'https://www.biniq.net/products/101-30-day-reselling-mentorship',
        },
        {
          id: '4',
          title: 'Direct Contract Holder Portal',
          price: '$250.00',
          url: 'https://www.biniq.net/products/direct-contract-holder-portal',
        },
      ];

      setCourses(mockCourses);
      setServices(mockServices);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCoursePress = (course) => {
    if (course.url) {
      Linking.openURL(course.url);
    }
  };

  const handleServicePress = (service) => {
    if (service.url) {
      Linking.openURL(service.url);
    }
  };

  const handleViewAll = () => {
    Linking.openURL('https://www.biniq.net/collections/training-and-resources');
  };

  // ── Course Card ──────────────────────────────────────────────
  const CourseCard = ({ course, index }) => {
    const isFirstRow = index < 2;
    const cardHeight = isFirstRow ? hp(30) : hp(25);

    return (
      <TouchableOpacity
        style={[styles.courseCard, { height: cardHeight }]}
        onPress={() => handleCoursePress(course)}
        activeOpacity={0.7}>
        <Image
          source={
            course.image
              ? typeof course.image === 'string'
                ? { uri: course.image }
                : course.image
              : require('../../../assets/reseller_training.png')
          }
          style={styles.courseImage}
        />
        <View style={styles.courseContent}>
          <Text style={styles.courseTitle} numberOfLines={2}>
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
          {course.price === 'Free' && (
            <Text style={styles.courseFree}>Free</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ── Service Card ─────────────────────────────────────────────
  const ServiceCard = ({ service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => handleServicePress(service)}
      activeOpacity={0.7}>
      <View style={{ flex: 1 }}>
        <Text style={styles.serviceTitle} numberOfLines={2}>
          {service.title}
        </Text>
        <Text style={styles.servicePrice}>{service.price}</Text>
      </View>
      <MaterialIcons name="arrow-forward-ios" size={18} color="#524B6B" />
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
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color="#0D0D26" size={25} />
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
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

            {/* ── View All Banner ── */}
            <TouchableOpacity style={styles.viewAllBanner} onPress={handleViewAll} activeOpacity={0.85}>
              <View>
                <Text style={styles.viewAllBannerTitle}>Browse All Training</Text>
                <Text style={styles.viewAllBannerSub}>View full collection of courses & resources</Text>
              </View>
              <View style={styles.viewAllBannerBtn}>
                <Text style={styles.viewAllBannerBtnText}>View All</Text>
                <MaterialIcons name="arrow-forward-ios" size={14} color="#fff" />
              </View>
            </TouchableOpacity>

            {/* ── Courses Section ── */}
            {courses.length > 0 ? (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>TRAINING COURSES</Text>
                </View>

                {/* Row 1 */}
                <View style={styles.coursesContainer}>
                  <View style={styles.coursesRow}>
                    {courses.slice(0, 2).map((course, index) => (
                      <CourseCard key={course.id} course={course} index={index} />
                    ))}
                  </View>
                </View>

                {/* Row 2 */}
                <View style={styles.coursesContainer}>
                  <View style={styles.coursesRow}>
                    {courses.slice(2, 4).map((course, index) => (
                      <CourseCard key={course.id} course={course} index={index + 2} />
                    ))}
                  </View>
                </View>

                {/* Extra rows if any */}
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

            {/* ── Services Section ── */}
            <View style={styles.servicesContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>ADDITIONAL SERVICES</Text>
              </View>

              {services.length > 0 ? (
                services.map(service => (
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

  // ── Header ──
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

  // ── View All Banner ──
  viewAllBanner: {
    marginHorizontal: '5%',
    marginTop: hp(2),
    marginBottom: hp(1),
    backgroundColor: '#130160',
    borderRadius: 10,
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  viewAllBannerTitle: {
    fontFamily: 'Nunito-Bold',
    color: '#fff',
    fontSize: hp(2),
  },
  viewAllBannerSub: {
    fontFamily: 'Nunito-Regular',
    color: '#ffffff99',
    fontSize: hp(1.4),
    marginTop: 2,
  },
  viewAllBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14BA9C',
    borderRadius: 6,
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    gap: 4,
  },
  viewAllBannerBtnText: {
    fontFamily: 'Nunito-Bold',
    color: '#fff',
    fontSize: hp(1.6),
  },

  // ── Section Header ──
  sectionHeaderRow: {
    paddingHorizontal: '5%',
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  sectionTitle: {
    fontFamily: 'Nunito-Bold',
    color: '#130160',
    fontSize: hp(2.3),
  },

  // ── Loading / Empty ──
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

  // ── Course Cards ──
  coursesContainer: {
    marginVertical: hp(0.8),
    paddingHorizontal: '5%',
  },
  coursesRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseCard: {
    width: wp(44),
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#e6e6e6',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  courseImage: {
    width: wp(44),
    height: hp(13),
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  courseContent: {
    padding: '5%',
    alignItems: 'center',        // ← centers children horizontally
  },
  courseTitle: {
    fontFamily: 'Nunito-ExtraBold',
    color: '#0049AF',
    fontSize: hp(1.6),
    marginBottom: 4,
    lineHeight: hp(2.1),
    textAlign: 'center',         // ← centers text
  },
  courseDescription: {
    fontFamily: 'Nunito-SemiBold',
    color: '#524B6B',
    fontSize: hp(1.5),
    marginBottom: 6,
    lineHeight: hp(2),
    textAlign: 'center',         // ← centers text
  },
  courseInfo: {
    fontFamily: 'Nunito-SemiBold',
    color: '#14BA9C',
    fontSize: hp(1.4),
    textAlign: 'center',         // ← centers text
  },
  coursePrice: {
    fontFamily: 'Nunito-Bold',
    color: '#130160',
    fontSize: hp(1.7),
    marginTop: 5,
    textAlign: 'center',         // ← centers text
  },
  courseFree: {
    fontFamily: 'Nunito-Bold',
    color: '#14BA9C',
    fontSize: hp(1.6),
    marginTop: 5,
    textAlign: 'center',         // ← centers text
  },

  // ── Service Cards ──
  servicesContainer: {
    paddingHorizontal: '5%',
    marginTop: hp(1),
  },
  serviceCard: {
    backgroundColor: '#fff',
    width: wp(90),
    minHeight: hp(7),
    borderRadius: 8,
    paddingHorizontal: '5%',
    paddingVertical: '3.5%',
    elevation: 3,
    marginBottom: hp(1.5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderLeftWidth: 3,
    borderLeftColor: '#130160',
  },
  serviceTitle: {
    color: '#0D0140',
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.8),
    lineHeight: hp(2.4),
    marginBottom: 3,
  },
  servicePrice: {
    color: '#14BA9C',
    fontFamily: 'Nunito-Bold',
    fontSize: hp(1.6),
  },
});