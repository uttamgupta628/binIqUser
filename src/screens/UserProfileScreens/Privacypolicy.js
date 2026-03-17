import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
  ImageBackground,
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SECTIONS = [
  {
    title: 'Introduction',
    icon: '📄',
    content: `This Privacy Policy describes how BIN IQ ("we", "us", or "our") collects, uses, and discloses your personal information when you use our app or visit www.biniq.net (the "Services").\n\nBy using our Services, you agree to the collection and use of your information as described in this policy. If you do not agree, please do not use our Services.`,
  },
  {
    title: 'Changes to This Privacy Policy',
    icon: '🔄',
    content: `We may update this Privacy Policy from time to time to reflect changes to our practices or for legal and regulatory reasons.\n\nWhen we do, we will post the revised policy on the Site and update the "Last updated" date. We recommend checking this page periodically.`,
  },
  {
    title: 'Information We Collect Directly from You',
    icon: '📋',
    content: `When you use our Services, you may provide us with:\n\n• Contact details — name, address, phone number, and email\n• Order information — billing/shipping address, payment confirmation, email, and phone\n• Account information — username, password, and security questions\n• Customer support info — messages and communications you send us\n\nYou may choose not to provide certain information, but this may prevent you from using some features.`,
  },
  {
    title: 'Information We Collect Automatically',
    icon: '📡',
    content: `We automatically collect Usage Data when you interact with our Services. This may include:\n\n• Device and browser information\n• Network connection details\n• IP address\n• How you navigate and use the app\n\nWe use cookies, pixels, and similar technologies to collect this data.`,
  },
  {
    title: 'Information from Third Parties',
    icon: '🔗',
    content: `We may receive information about you from third parties, including:\n\n• Platform providers like Shopify who support our Site\n• Payment processors who collect billing and card details to fulfill orders\n• Advertising partners and analytics providers who track interactions with our app and emails\n\nAll third-party information is handled in accordance with this Privacy Policy.`,
  },
  {
    title: 'How We Use Your Information',
    icon: '⚙️',
    content: `We use your personal information to:\n\n• Process orders, payments, returns, and exchanges\n• Manage and maintain your account\n• Send order notifications and account-related updates\n• Arrange shipping and fulfillment\n• Send marketing emails, promotional offers, and advertisements\n• Tailor the app experience and ads to your preferences\n• Detect and prevent fraudulent or illegal activity\n• Provide customer support and improve our Services`,
  },
  {
    title: 'Cookies',
    icon: '🍪',
    content: `We use cookies to power and improve our Services, remember your preferences, and run analytics.\n\nYou can remove or block cookies through your browser or device settings, but doing so may affect app functionality.\n\nWe also recognize the Global Privacy Control (GPC) signal. If you send a GPC signal, we will treat it as a valid opt-out of targeted advertising for that browser or device.\n\nWe do not recognize other "Do Not Track" browser signals.`,
  },
  {
    title: 'How We Share Your Information',
    icon: '🤝',
    content: `We may share your personal information with:\n\n• Service providers who help us operate (e.g., payment processors, shipping partners, analytics, cloud storage)\n• Business and marketing partners for advertising purposes\n• Affiliates within our corporate group\n• Third parties when you direct us to (e.g., social logins, product shipping)\n• Legal authorities when required by law, subpoena, or to protect our rights\n• Buyers or successors in a merger, acquisition, or bankruptcy\n\nOver the past 12 months, we have shared identifiers, order data, usage data, and geolocation data with vendors, marketing partners, and affiliates.`,
  },
  {
    title: 'Sale & Sharing of Personal Data',
    icon: '💼',
    content: `We have "sold" and "shared" certain personal information (as defined by applicable law) for advertising and marketing purposes over the past 12 months:\n\n• Identifiers (name, email, phone) — shared with business and marketing partners\n• Commercial information (purchase history) — shared with business and marketing partners\n• Usage data — shared with business and marketing partners\n\nWe do not use or disclose sensitive personal information without your consent or to infer characteristics about you.`,
  },
  {
    title: 'Third-Party Websites & Links',
    icon: '🌐',
    content: `Our app may contain links to third-party websites or platforms. We are not responsible for the privacy practices or content of those sites.\n\nInformation you share on public platforms or social networks may be visible to other users without limitation. Linking to a third-party site does not imply our endorsement.`,
  },
  {
    title: "Children's Privacy",
    icon: '👶',
    content: `Our Services are not intended for children. We do not knowingly collect personal information from minors.\n\nIf you are a parent or guardian and believe your child has provided us their information, please contact us at support@biniq.net and we will delete it promptly.\n\nWe do not knowingly sell or share personal information of individuals under 16 years of age.`,
  },
  {
    title: 'Data Security & Retention',
    icon: '🛡️',
    content: `We take reasonable measures to protect your personal information, but no security system is perfect. We cannot guarantee absolute security, and data sent to us may not be secure in transit.\n\nPlease keep your account credentials private. If you believe your account has been compromised, contact us immediately.\n\nWe retain your information as long as needed to provide the Services, comply with legal obligations, resolve disputes, and enforce our agreements.`,
  },
  {
    title: 'Your Privacy Rights',
    icon: '🔐',
    content: `Depending on where you live, you may have the right to:\n\n• Access / Know — request access to the personal information we hold about you\n• Delete — request deletion of your personal data\n• Correct — request correction of inaccurate data\n• Portability — receive a copy of your data or transfer it to a third party\n• Restrict Processing — ask us to stop or limit how we process your data\n• Withdraw Consent — where processing is based on consent, withdraw it at any time\n• Appeal — appeal any decision we make on your request\n• Opt Out of Marketing — unsubscribe from promotional emails at any time\n\nTo exercise these rights, contact us at support@biniq.net. We may need to verify your identity before responding.`,
  },
  {
    title: 'Complaints',
    icon: '📣',
    content: `If you have complaints about how we handle your personal information, please contact us using the details below.\n\nIf you are not satisfied with our response, you may appeal our decision or lodge a complaint with your local data protection authority.`,
  },
  {
    title: 'International Users',
    icon: '🌍',
    content: `Your personal information may be transferred to, stored in, and processed in countries other than your own, including the United States.\n\nFor users in Europe, we rely on the European Commission's Standard Contractual Clauses or equivalent mechanisms to ensure your data is adequately protected when transferred internationally.`,
  },
  {
    title: 'Contact Us',
    icon: '📬',
    content: '',
    isContact: true,
  },
];
const AccordionItem = ({ section }) => {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => !prev);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardHeader} onPress={toggle} activeOpacity={0.7}>
        <Text style={styles.cardIcon}>{section.icon}</Text>
        <Text style={styles.cardTitle}>{section.title}</Text>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.cardBody}>
          {section.isContact ? (
            <>
              <Text style={styles.cardText}>
                For questions about this Privacy Policy or to exercise your rights, reach out to us:
              </Text>
              <TouchableOpacity onPress={() => Linking.openURL('mailto:support@biniq.net')} activeOpacity={0.7} style={styles.contactBtn}>
                <Text style={styles.contactBtnText}>📧 support@biniq.net</Text>
              </TouchableOpacity>
              <Text style={styles.cardText}>📍 440 Louisiana St Suite 900{'\n'}Houston, TX 77002, US</Text>
            </>
          ) : (
            <Text style={styles.cardText}>{section.content}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const PrivacyPolicy = () => {
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
            <Text style={styles.headerText}>Privacy Policy</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.introCard}>
            <Text style={styles.introEmoji}>🔒</Text>
            <Text style={styles.introTitle}>Your Privacy Matters</Text>
            <Text style={styles.introText}>
              This policy explains how BIN IQ collects, uses, and protects your personal information. Tap any section below to read the details.
            </Text>
          </View>

          {SECTIONS.map((section, index) => (
            <AccordionItem key={index} section={section} />
          ))}

          <Text style={styles.footer}>By using BIN IQ, you agree to this Privacy Policy.</Text>
        </ScrollView>
      </ImageBackground>
      <ImageBackground source={require('../../../assets/vector_2.png')} style={styles.vector2} />
    </SafeAreaView>
  );
};

export default PrivacyPolicy;

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
    width: wp(45),
    justifyContent: 'space-between',
  },
  headerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(3.2),
    color: '#0D0140',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: wp(4), paddingTop: hp(2), paddingBottom: hp(4) },
  introCard: {
    backgroundColor: '#F5F5FA',
    borderRadius: 16,
    padding: hp(2.5),
    alignItems: 'center',
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: '#E0E0F0',
  },
  introEmoji: { fontSize: hp(5), marginBottom: hp(1) },
  introTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.2),
    color: '#150B3D',
    marginBottom: hp(1),
  },
  introText: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.8),
    color: '#666680',
    textAlign: 'center',
    lineHeight: hp(2.6),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: hp(1.2),
    borderWidth: 1,
    borderColor: '#F0F0F5',
    overflow: 'hidden',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp(2),
  },
  cardIcon: { fontSize: hp(2.5), marginRight: wp(3) },
  cardTitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.9),
    color: '#150B3D',
    flex: 1,
  },
  chevron: {
    color: '#6C63FF',
    fontSize: hp(1.4),
    marginLeft: wp(2),
  },
  cardBody: {
    paddingHorizontal: hp(2),
    paddingBottom: hp(2),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F5',
    paddingTop: hp(1.5),
  },
  cardText: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.8),
    color: '#666680',
    lineHeight: hp(2.6),
  },
  contactBtn: {
    backgroundColor: '#6C63FF10',
    borderRadius: 10,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    marginVertical: hp(1.5),
    borderWidth: 1,
    borderColor: '#6C63FF30',
    alignSelf: 'flex-start',
  },
  contactBtnText: {
    fontFamily: 'DMSans-Medium',
    fontSize: hp(1.8),
    color: '#6C63FF',
  },
  footer: {
    fontFamily: 'Nunito-Regular',
    color: '#95969D',
    fontSize: hp(1.6),
    textAlign: 'center',
    marginTop: hp(2),
  },
});