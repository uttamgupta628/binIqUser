// AboutUs.js – updated
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  ImageBackground,
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const STATS = [
  { value: '10K+', label: 'Active Users' },
  { value: '500+', label: 'Bin Stores' },
  { value: '4.8★', label: 'App Rating' },
  { value: '24/7', label: 'Support' },
];

const VALUES = [
  {
    icon: '🎯',
    title: 'Our Mission',
    text: 'To make bin shopping smarter, faster, and more rewarding — by connecting buyers with the best bin stores and giving them the tools to find hidden gems every time.',
  },
  {
    icon: '👁️',
    title: 'Our Vision',
    text: 'A world where every shopper has the knowledge and confidence to navigate bin stores like a pro — saving money while discovering incredible deals.',
  },
  {
    icon: '💡',
    title: 'What We Do',
    text: 'BIN IQ is your all-in-one bin shopping companion. We help you locate nearby bin stores, track restocks, learn bidding strategies through our IQ Portal, and connect with a community of savvy shoppers.',
  },
  {
    icon: '🤝',
    title: 'Who We Serve',
    text: 'From first-time bin shoppers to seasoned resellers — BIN IQ is built for anyone who wants to shop smarter, find better deals, and make the most of every bin store visit.',
  },
];

const TEAM = [
  {
    name: 'Founder & CEO',
    icon: '👨‍💼',
    desc: 'Passionate about making bin shopping accessible and rewarding for everyone.',
  },
  {
    name: 'Head of Product',
    icon: '🧠',
    desc: 'Building intuitive tools that help shoppers find the best deals with ease.',
  },
  {
    name: 'Community Lead',
    icon: '🌟',
    desc: 'Growing and nurturing a vibrant community of bin shopping enthusiasts.',
  },
];

const AboutUs = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <ImageBackground source={require('../../../assets/vector_1.png')} style={styles.vector}>
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" size={25} color="#0D0D26" />
            </TouchableOpacity>
            <Text style={styles.headerText}>About Us</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Hero Card */}
          <View style={styles.heroCard}>
            <Text style={styles.heroEmoji}>🗑️</Text>
            <Text style={styles.heroTitle}>Welcome to BIN IQ</Text>
            <Text style={styles.heroSubtitle}>Shop Smarter. Find More. Save Big.</Text>
            <Text style={styles.heroText}>
              BIN IQ is the ultimate platform for bin store shoppers. We help you discover stores, learn strategies, and score the best deals — all in one place.
            </Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {STATS.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionLabel}>WHO WE ARE</Text>
          {VALUES.map((item, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>
              <Text style={styles.cardText}>{item.text}</Text>
            </View>
          ))}

          <Text style={styles.sectionLabel}>OUR STORY</Text>
          <View style={styles.storyCard}>
            <Text style={styles.cardText}>
              BIN IQ was born out of frustration — too many shoppers were showing up to bin stores without knowing restock schedules, pricing patterns, or what to look for.{'\n\n'}
              We set out to change that. Starting with a simple store locator, we built BIN IQ into a full-featured platform with educational resources, a quiz system to test your knowledge, referral rewards, and a growing community of bin shopping enthusiasts.{'\n\n'}
              Today, thousands of shoppers use BIN IQ every week to find deals, learn strategies, and make the most of every store visit.
            </Text>
          </View>

          <Text style={styles.sectionLabel}>THE TEAM</Text>
          {TEAM.map((member, index) => (
            <View key={index} style={styles.teamCard}>
              <Text style={styles.teamIcon}>{member.icon}</Text>
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{member.name}</Text>
                <Text style={styles.teamDesc}>{member.desc}</Text>
              </View>
            </View>
          ))}

          <Text style={styles.sectionLabel}>GET IN TOUCH</Text>
          <View style={styles.contactCard}>
            <Text style={styles.contactText}>
              Have questions, feedback, or partnership inquiries? We'd love to hear from you.
            </Text>
            <TouchableOpacity onPress={() => Linking.openURL('mailto:support@biniq.net')} activeOpacity={0.7} style={styles.emailBtn}>
              <Text style={styles.emailBtnText}>📧 support@biniq.net</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.biniq.net')} activeOpacity={0.7} style={styles.websiteBtn}>
              <Text style={styles.websiteBtnText}>🌐 www.biniq.net</Text>
            </TouchableOpacity>
            <Text style={styles.addressText}>📍 440 Louisiana St Suite 900{'\n'}Houston, TX 77002, US</Text>
          </View>

          <Text style={styles.footer}>© 2025 BIN IQ. All rights reserved.</Text>
        </ScrollView>
      </ImageBackground>
      <ImageBackground source={require('../../../assets/vector_2.png')} style={styles.vector2} />
    </SafeAreaView>
  );
};

export default AboutUs;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  vector: { flex: 1, width: wp(100), minHeight: hp(100) },
  vector2: {
    flex: 1,
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
    width: wp(40),
    justifyContent: 'space-between',
  },
  headerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(3.2),
    color: '#0D0140',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: wp(4), paddingTop: hp(2), paddingBottom: hp(4) },
  heroCard: {
    backgroundColor: '#F5F5FA',
    borderRadius: 16,
    padding: hp(2.5),
    alignItems: 'center',
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: '#E0E0F0',
  },
  heroEmoji: { fontSize: hp(6), marginBottom: hp(1.5) },
  heroTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.5),
    color: '#150B3D',
    marginBottom: hp(0.5),
  },
  heroSubtitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.8),
    color: '#6C63FF',
    marginBottom: hp(1.5),
  },
  heroText: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.8),
    color: '#666680',
    textAlign: 'center',
    lineHeight: hp(2.6),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(2.5),
    gap: wp(2),
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: hp(1.8),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F5',
    elevation: 2,
  },
  statValue: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.2),
    color: '#6C63FF',
    marginBottom: hp(0.5),
  },
  statLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.4),
    color: '#95969D',
  },
  sectionLabel: {
    fontFamily: 'Nunito-SemiBold',
    color: '#95969D',
    fontSize: wp(3.8),
    marginBottom: hp(1.5),
    marginTop: hp(1),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: hp(2),
    marginBottom: hp(1.2),
    borderWidth: 1,
    borderColor: '#F0F0F5',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  cardIcon: { fontSize: hp(2.5), marginRight: wp(3) },
  cardTitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.9),
    color: '#150B3D',
  },
  cardText: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.8),
    color: '#666680',
    lineHeight: hp(2.6),
  },
  storyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: hp(2),
    marginBottom: hp(2.5),
    borderWidth: 1,
    borderColor: '#F0F0F5',
    elevation: 2,
  },
  teamCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: hp(2),
    marginBottom: hp(1.2),
    borderWidth: 1,
    borderColor: '#F0F0F5',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  teamIcon: { fontSize: hp(4), marginRight: wp(4) },
  teamInfo: { flex: 1 },
  teamName: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(1.9),
    color: '#150B3D',
    marginBottom: hp(0.5),
  },
  teamDesc: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.6),
    color: '#666680',
    lineHeight: hp(2.2),
  },
  contactCard: {
    backgroundColor: '#F5F5FA',
    borderRadius: 16,
    padding: hp(2.5),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: '#E0E0F0',
  },
  contactText: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.8),
    color: '#666680',
    lineHeight: hp(2.6),
    marginBottom: hp(2),
  },
  emailBtn: {
    backgroundColor: '#6C63FF10',
    borderRadius: 10,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    marginBottom: hp(1.2),
    borderWidth: 1,
    borderColor: '#6C63FF30',
  },
  emailBtnText: {
    fontFamily: 'DMSans-Medium',
    fontSize: hp(1.8),
    color: '#6C63FF',
  },
  websiteBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: '#F0F0F5',
    elevation: 1,
  },
  websiteBtnText: {
    fontFamily: 'DMSans-Medium',
    fontSize: hp(1.8),
    color: '#150B3D',
  },
  addressText: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.6),
    color: '#95969D',
    lineHeight: hp(2.2),
  },
  footer: {
    fontFamily: 'Nunito-Regular',
    color: '#95969D',
    fontSize: hp(1.6),
    textAlign: 'center',
    marginTop: hp(2),
  },
});