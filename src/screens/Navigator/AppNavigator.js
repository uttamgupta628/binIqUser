import {StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from '../SplashScreen';
import GettingStarted from '../OnBoardingScreens/GettingStarted';
import OnboardingScreen from '../OnBoardingScreens/OnBoarding';
import Login from '../AuthenticationScreens/Login';
import SignUp from '../AuthenticationScreens/SignUp';
import ForgotPassword from '../AuthenticationScreens/ForgotPassword';
import OTPEntry from '../AuthenticationScreens/OTPEntry';
import SuccessScreen from '../AuthenticationScreens/SuccessScreen';
import QuizScreen from '../QuizScreens/QuizScreen';
import ErrorScreen from '../ErrorScreen';
import BottomNavigator from './BottomNavigator';
import BinStorePage from '../MainScreens/BinStorePage';
import IQPortal from '../IQPortal/IQPortal';
import CourseDetails from '../IQPortal/CourseDetails';
import Tutorials from '../IQPortal/Tutorials';
import SearchScreen from '../MainScreens/SearchScreen';
import MyLibrary from '../MainScreens/MyLibrary';
import Notification from '../UserProfileScreens/Notification';
import FAQs from '../UserProfileScreens/FAQs';
import HelpAndSupport from '../UserProfileScreens/HelpAndSupport';
import Feedback from '../UserProfileScreens/Feedback';
import FeedbackText from '../UserProfileScreens/FeedbackText';
import ReferFriend from '../ReferalScreens/ReferFriend';
import ShareReferLink from '../ReferalScreens/ShareReferLink';
import SingleItemPage from '../MainScreens/SingleItemPage';
import TopBinsItems from '../MainScreens/TopBinsItems';
import NearByBins from '../MainScreens/NearByBins';
import PromoScreen from '../QuizScreens/PromoScreen';
import SettingsScreen from '../MainScreens/SettingsScreen';
import ChangePassword from '../AuthenticationScreens/ChangePassword';
import SelectUserRole from '../OnBoardingScreens/SelectUserRole';
import SelectPlan from '../OnBoardingScreens/SelectPlan';
import FreeSubscription from '../SubscriptionScreens/FreeSubscription';
import PayWall from '../SubscriptionScreens/PayWall';
import EditProfileScreen from '../MainScreens/EditProfileScreen';

const AppNavigator = () => {
  const Stack = createStackNavigator();
  const [hideSplashScreen, setHideSplashScreen] = useState(true);

  return (
    <NavigationContainer>
      <Stack.Navigator
      // initialRouteName='PayWall'
      >
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="OnBoarding"
          component={OnboardingScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="GettingStarted"
          component={GettingStarted}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUp}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPassword}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="OTPEntry"
          component={OTPEntry}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SuccessScreen"
          component={SuccessScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="QuizScreen"
          component={QuizScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ErrorScreen"
          component={ErrorScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="HomeNavigataor"
          component={BottomNavigator}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="BinStore"
          component={BinStorePage}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="IQPortal"
          component={IQPortal}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="CourseDetails"
          component={CourseDetails}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Tutorials"
          component={Tutorials}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SearchScreen"
          component={SearchScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Notifications"
          component={Notification}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="FAQs"
          component={FAQs}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="HelpAndSupport"
          component={HelpAndSupport}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MyLibrary"
          component={MyLibrary}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Feedback"
          component={Feedback}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="FeedbackText"
          component={FeedbackText}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ReferFriend"
          component={ReferFriend}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ShareReferLink"
          component={ShareReferLink}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SinglePageItem"
          component={SingleItemPage}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="TopBinItems"
          component={TopBinsItems}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="TopBinsNearMe"
          component={NearByBins}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PromoScreen"
          component={PromoScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SettingsScreen"
          component={SettingsScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePassword}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SelectUserRole"
          component={SelectUserRole}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SelectPlan"
          component={SelectPlan}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="FreeSubscription"
          component={FreeSubscription}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PayWall"
          component={PayWall}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="EditProfileScreen"
          component={EditProfileScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

const styles = StyleSheet.create({});
