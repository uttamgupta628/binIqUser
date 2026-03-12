import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useStripe } from '@stripe/stripe-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TIERS = [
  {
    id: 'tier1', label: 'Tier 1',
    monthly: { price: '$29/mo',  amount: 2900  },
    yearly:  { price: '$300/yr', amount: 30000 },
    color: '#14BA9C',
    features: [
      { label: 'Store Finder', value: '✔' },
      { label: 'Price Fetcher', value: '✔' },
      { label: 'Training Workshops', value: '5' },
      { label: 'Reselling Courses', value: '4' },
      { label: 'Affiliate Marketing Course', value: '1' },
      { label: 'Intro to Reselling Video', value: '✔' },
      { label: 'Storage for Scanned Items', value: '1,000 items' },
      { label: 'Historical Data Access', value: '3 months' },
      { label: 'Support', value: 'Standard Email' },
      { label: 'Advanced Search Filters', value: '✔' },
      { label: 'Price Alerts', value: '✔' },
      { label: 'Inventory Tracker', value: '✔' },
      { label: 'Ability to Export Data', value: '✔' },
      { label: 'Ad-Free Experience', value: '✔' },
      { label: 'Offline Access', value: '✔' },
      { label: 'Bonus: Monthly Insights Report', value: '✔' },
    ],
  },
  {
    id: 'tier2', label: 'Tier 2',
    monthly: { price: '$59/mo',  amount: 5900  },
    yearly:  { price: '$600/yr', amount: 60000 },
    color: '#7B5EA7',
    features: [
      { label: 'Store Finder', value: '✔' },
      { label: 'Price Fetcher', value: '✔' },
      { label: 'Training Workshops', value: '6' },
      { label: 'Reselling Courses', value: '4' },
      { label: 'Affiliate Marketing Course', value: '1' },
      { label: 'Intro to Reselling Video', value: '✔' },
      { label: 'Storage for Scanned Items', value: '5,000 items' },
      { label: 'Historical Data Access', value: '6 months' },
      { label: 'Support', value: 'Priority + Live Chat' },
      { label: 'Advanced Search Filters', value: '✔' },
      { label: 'Price Alerts', value: '✔' },
      { label: 'Inventory Tracker', value: '✔' },
      { label: 'Ability to Export Data', value: '✔' },
      { label: 'Ad-Free Experience', value: '✔' },
      { label: 'Offline Access', value: '✔' },
      { label: 'Weekly Live Training', value: '1 session' },
      { label: 'Bonus: Monthly Insights Report', value: '✔' },
    ],
  },
  {
    id: 'tier3', label: 'Tier 3',
    monthly: { price: '$99/mo',   amount: 9900   },
    yearly:  { price: '$999/yr',  amount: 99900  },
    color: '#E8A020',
    features: [
      { label: 'Store Finder', value: '✔' },
      { label: 'Price Fetcher', value: '✔' },
      { label: 'Training Workshops', value: '7' },
      { label: 'Reselling Courses', value: '5' },
      { label: 'Affiliate Marketing Course', value: '1' },
      { label: 'Intro to Reselling Video', value: '✔' },
      { label: 'Storage for Scanned Items', value: '10,000 items' },
      { label: 'Historical Data Access', value: 'Unlimited' },
      { label: 'Support', value: '24/7 + Dedicated Manager' },
      { label: 'Advanced Search Filters', value: '✔' },
      { label: 'Price Alerts', value: '✔' },
      { label: 'Inventory Tracker', value: '✔' },
      { label: 'Ability to Export Data', value: '✔' },
      { label: 'Ad-Free Experience', value: '✔' },
      { label: 'Offline Access', value: '✔' },
      { label: 'Weekly Live Training', value: '1 session' },
      { label: 'Bonus: Monthly Insights Report', value: '✔' },
      { label: 'Real-time Notifications', value: '✔' },
      { label: 'Customization Options', value: '✔' },
    ],
  },
];

// Savings label for yearly
const YEARLY_SAVINGS = {
  tier1: 'Save $48/yr',   // 29*12=348, 300 → save 48
  tier2: 'Save $108/yr',  // 59*12=708, 600 → save 108
  tier3: 'Save $189/yr',  // 99*12=1188, 999 → save 189
};

const TIER_ORDER  = { free: 0, tier1: 1, tier2: 2, tier3: 3 };
const API_BASE_URL = 'https://biniq.onrender.com';

// Duration in days — monthly=30, yearly=365
const PLAN_DURATIONS = { monthly: 30, yearly: 365 };

const SelectPremiumPlan = ({ navigation, route }) => {
  const { isUpgrade = false, currentPlan = 'free' } = route?.params || {};

  const getDefaultTab = () => {
    if (!isUpgrade) return 0;
    const currentOrder = TIER_ORDER[currentPlan] ?? 0;
    const nextIndex = TIERS.findIndex(t => TIER_ORDER[t.id] > currentOrder);
    return nextIndex >= 0 ? nextIndex : 0;
  };

  const [activeTab,    setActiveTab]    = useState(getDefaultTab());
  const [billing,      setBilling]      = useState('monthly'); // 'monthly' | 'yearly'
  const [loading,      setLoading]      = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const selectedTier    = TIERS[activeTab];
  const billingInfo     = selectedTier[billing];   // { price, amount }
  const isYearly        = billing === 'yearly';

  const isTabDisabled = (tier) => {
    if (!isUpgrade) return false;
    return TIER_ORDER[tier.id] <= TIER_ORDER[currentPlan];
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Session Error', 'Please log in again.');
        navigation.navigate('Login');
        return;
      }

      // Create PaymentIntent — send billing cycle too
      const response = await fetch(
        `${API_BASE_URL}/api/payments/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currency:       'usd',
            plan:           selectedTier.id,
            billing_cycle:  billing,   // ✅ 'monthly' or 'yearly'
          }),
        },
      );

      const data = await response.json();
      if (!data.success || !data.clientSecret) {
        throw new Error(data.message || 'Failed to create payment intent');
      }

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName:      'BinIQ',
        paymentIntentClientSecret: data.clientSecret,
        appearance: { colors: { primary: selectedTier.color } },
      });

      if (initError) {
        Alert.alert('Setup Error', initError.message);
        return;
      }

      const { error: paymentError } = await presentPaymentSheet();
      if (paymentError) {
        if (paymentError.code !== 'Canceled') {
          Alert.alert('Payment Failed', paymentError.message);
        }
        return;
      }

      // Confirm on backend
      const confirmResponse = await fetch(
        `${API_BASE_URL}/api/payments/confirm-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            payment_intent_id: data.paymentIntentId,
            plan:              selectedTier.id,
            billing_cycle:     billing,   // ✅ pass through
          }),
        },
      );

      const confirmData = await confirmResponse.json();
      if (!confirmData.success) {
        throw new Error(confirmData.message || 'Subscription confirmation failed');
      }

      Alert.alert(
        isUpgrade ? '🎉 Plan Upgraded!' : '🎉 Welcome to Premium!',
        isUpgrade
          ? `You've upgraded to ${selectedTier.label} (${billing}). Your new benefits are active!`
          : `You are now on ${selectedTier.label} (${billing}). Enjoy your benefits!`,
        [{ text: 'Get Started', onPress: () => navigation.replace('HomeNavigataor') }],
      );

    } catch (err) {
      console.error('Payment error:', err);
      Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isUpgrade ? 'Upgrade Plan' : 'Premium Plans'}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>
          {isUpgrade ? 'Choose Your New Tier' : 'Choose Your Tier'}
        </Text>
        <Text style={styles.subtitle}>
          {isUpgrade
            ? `Currently on ${currentPlan === 'free' ? 'Free Plan' : currentPlan.toUpperCase()} — select a higher tier`
            : 'Select the plan that fits your hustle'}
        </Text>
      </View>

      {/* ✅ Monthly / Yearly toggle */}
      <View style={styles.billingToggleRow}>
        <TouchableOpacity
          style={[styles.billingBtn, !isYearly && styles.billingBtnActive]}
          onPress={() => setBilling('monthly')}>
          <Text style={[styles.billingBtnText, !isYearly && styles.billingBtnTextActive]}>
            Monthly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.billingBtn, isYearly && styles.billingBtnActive]}
          onPress={() => setBilling('yearly')}>
          <Text style={[styles.billingBtnText, isYearly && styles.billingBtnTextActive]}>
            Yearly
          </Text>
          {/* Savings badge */}
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>{YEARLY_SAVINGS[selectedTier.id]}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tier tabs */}
      <View style={styles.tabRow}>
        {TIERS.map((tier, idx) => {
          const disabled = isTabDisabled(tier);
          return (
            <TouchableOpacity
              key={tier.id}
              disabled={disabled}
              style={[
                styles.tab,
                activeTab === idx && { backgroundColor: tier.color },
                disabled && styles.tabDisabled,
              ]}
              onPress={() => setActiveTab(idx)}>
              <Text style={[
                styles.tabText,
                activeTab === idx && styles.tabTextActive,
                disabled && styles.tabTextDisabled,
              ]}>
                {tier.label}
              </Text>
              {disabled && <Text style={styles.tabCurrentLabel}>current</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Price badge */}
      <View style={[styles.priceBadge, { backgroundColor: selectedTier.color + '18' }]}>
        <Text style={[styles.priceMain, { color: selectedTier.color }]}>
          {billingInfo.price}
        </Text>
        {isYearly && (
          <Text style={[styles.savingsInline, { color: selectedTier.color }]}>
            {'  '}{YEARLY_SAVINGS[selectedTier.id]}
          </Text>
        )}
        {!isYearly && (
          <Text style={styles.priceAlt}>
            {'  or '}{selectedTier.yearly.price}
          </Text>
        )}
      </View>

      {/* Features */}
      <ScrollView
        style={styles.featureScroll}
        contentContainerStyle={styles.featureContent}
        showsVerticalScrollIndicator={false}>
        {selectedTier.features.map((feat, i) => (
          <View key={i} style={styles.featureRow}>
            <View style={[styles.featureDot, { backgroundColor: selectedTier.color }]} />
            <Text style={styles.featureLabel}>{feat.label}</Text>
            <Text style={[styles.featureValue, { color: selectedTier.color }]}>{feat.value}</Text>
          </View>
        ))}
        <View style={{ height: hp(14) }} />
      </ScrollView>

      {/* Subscribe button */}
      <LinearGradient
        colors={[selectedTier.color, selectedTier.color + 'cc']}
        style={styles.subscribeBtn}>
        <TouchableOpacity
          style={styles.subscribeTouchable}
          onPress={handleSubscribe}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.subscribeBtnText}>
              {isUpgrade
                ? `Upgrade to ${selectedTier.label} — ${billingInfo.price}`
                : `Subscribe — ${billingInfo.price}`}
            </Text>
          )}
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

export default SelectPremiumPlan;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: hp(6), paddingHorizontal: wp(5),
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center',
  },
  backArrow: { fontSize: 18, color: '#130160', fontWeight: 'bold' },
  headerTitle: { fontSize: hp(2.4), fontWeight: 'bold', color: '#130160' },
  titleBlock: { paddingHorizontal: wp(5), marginTop: hp(2) },
  title: { fontSize: hp(3), fontWeight: 'bold', color: '#130160' },
  subtitle: { fontSize: hp(1.8), color: '#524B6B' },

  // ── Billing toggle ──
  billingToggleRow: {
    flexDirection: 'row', marginHorizontal: wp(5), marginTop: hp(2),
    backgroundColor: '#F3F3F3', borderRadius: 12, padding: 4,
  },
  billingBtn: {
    flex: 1, paddingVertical: hp(1.2), borderRadius: 10,
    alignItems: 'center', flexDirection: 'row',
    justifyContent: 'center', gap: 6,
  },
  billingBtnActive: { backgroundColor: '#130160' },
  billingBtnText: { fontSize: hp(1.9), color: '#888', fontWeight: '600' },
  billingBtnTextActive: { color: '#fff' },
  savingsBadge: {
    backgroundColor: '#14BA9C', borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  savingsText: { fontSize: hp(1.3), color: '#fff', fontWeight: 'bold' },
  savingsInline: { fontSize: hp(1.8), fontWeight: '600' },

  // ── Tier tabs ──
  tabRow: {
    flexDirection: 'row', marginHorizontal: wp(5), marginTop: hp(1.5),
    backgroundColor: '#F3F3F3', borderRadius: 12, padding: 4,
  },
  tab: { flex: 1, paddingVertical: hp(1.2), borderRadius: 10, alignItems: 'center' },
  tabDisabled: { opacity: 0.35 },
  tabText: { fontSize: hp(1.8), color: '#888' },
  tabTextActive: { color: '#fff' },
  tabTextDisabled: { color: '#bbb' },
  tabCurrentLabel: { fontSize: hp(1.1), color: '#aaa', marginTop: 1 },

  // ── Price badge ──
  priceBadge: {
    marginHorizontal: wp(5), marginTop: hp(1.5), borderRadius: 12,
    padding: hp(1.5), flexDirection: 'row', alignItems: 'baseline',
  },
  priceMain: { fontSize: hp(3.5), fontWeight: 'bold' },
  priceAlt: { fontSize: hp(1.8), color: '#888' },

  featureScroll: { flex: 1, marginTop: hp(1) },
  featureContent: { paddingHorizontal: wp(5) },
  featureRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: hp(1), borderBottomWidth: 0.5, borderBottomColor: '#eee',
  },
  featureDot: { width: 7, height: 7, borderRadius: 4, marginRight: 10 },
  featureLabel: { flex: 1, fontSize: hp(1.7), color: '#333' },
  featureValue: { fontWeight: 'bold', fontSize: hp(1.7) },
  subscribeBtn: {
    position: 'absolute', bottom: hp(4), left: wp(5), right: wp(5), borderRadius: 14,
  },
  subscribeTouchable: { paddingVertical: hp(2.2), alignItems: 'center' },
  subscribeBtnText: { color: '#fff', fontSize: hp(2.2), fontWeight: 'bold' },
});