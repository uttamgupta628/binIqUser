import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'

const GettingStarted = () => {
    const [appOpenFirstTime, setAppOpenFirstTime] = useState('FALSE');
  return (
    <View>
      <Text>GettingStarted</Text>
    </View>
  )
}

export default GettingStarted

const styles = StyleSheet.create({})