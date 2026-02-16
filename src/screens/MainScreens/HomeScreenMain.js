import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import CustomDrawer from '../../Components/CustomDrawer';
import HomeScreen from './HomeScreen';

export default HomeScreenMain = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };
  return (
    <View style={styles.container}>
      <HomeScreen openDrawer={toggleDrawer} />
      <CustomDrawer isOpen={isDrawerOpen} closeDrawer={() => setIsDrawerOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});