import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import AppNavigator from './src/screens/Navigator/AppNavigator';
import {StripeProvider} from '@stripe/stripe-react-native';
// import './global.css'

const App = () => {
  return (
    <StripeProvider publishableKey="pk_test_51SaGUy38jla8PJ9QpsvULyDCxRRuSkIbalrFm3WkcAgwxWUcfAaFz1pVZszxvIY51FDYhqBY1ipQHExEs947J3I100qQLaneAM">
      <AppNavigator />
    </StripeProvider>
  );
};

export default App;

const styles = StyleSheet.create({});