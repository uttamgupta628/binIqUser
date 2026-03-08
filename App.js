import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import AppNavigator from './src/screens/Navigator/AppNavigator';
<<<<<<< HEAD
import {StripeProvider} from '@stripe/stripe-react-native';
// import './global.css'

const App = () => {
  return (
    <StripeProvider publishableKey="pk_test_51SaGUy38jla8PJ9QpsvULyDCxRRuSkIbalrFm3WkcAgwxWUcfAaFz1pVZszxvIY51FDYhqBY1ipQHExEs947J3I100qQLaneAM">
      <AppNavigator />
    </StripeProvider>
  );
=======
// import './global.css'

const App = () => {
  return <AppNavigator />;
>>>>>>> d33bdc404ce1e3021127c556d54073ce9e55027f
};

export default App;

<<<<<<< HEAD
const styles = StyleSheet.create({});
=======
const styles = StyleSheet.create({});
>>>>>>> d33bdc404ce1e3021127c556d54073ce9e55027f
