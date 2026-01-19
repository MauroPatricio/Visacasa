import { View, StyleSheet, TouchableOpacity } from 'react-native';
import React, { memo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Home from '../screens/Home';
import Search from '../screens/Search';
import Orders from '../screens/Orders';
import RequestDeliv from '../screens/RequestDeliv';
import Profile from '../screens/Profile';

const Tab = createBottomTabNavigator();

const CustomTabBarButton = memo(({ children, onPress }) => (
  <TouchableOpacity
    style={styles.centerButtonWrapper}
    onPress={onPress}
    activeOpacity={0.9}
  >
    <View style={styles.centerButton}>
      {children}
    </View>
  </TouchableOpacity>
));

const ButtomTabNavegation = () => {
  return (
    <Tab.Navigator
      screenOptions={{ 
        tabBarShowLabel: false, 
        tabBarHideOnKeyboard: true, 
        headerShown: false,
        tabBarStyle: styles.tabBar 
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
<<<<<<< HEAD
        options={{ 
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={focused ? '#E85A4F' : 'black'}
            />
          )
=======
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={focused ? '#7F00FF' : "black"}
              />
            );
          },
>>>>>>> main
        }}
      />

      <Tab.Screen
<<<<<<< HEAD
        name="Search"
        component={Search}
        options={{ 
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={24}
              color={focused ? '#E85A4F' : 'black'}
            />
          )
=======
        name="ProductListSeller"
        component={ProductListSeller}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Ionicons
                name={focused ? "list" : "list-outline"} // Changed icon name
                size={24}
                color={focused ? '#7F00FF' : "black"}
              />
            );
          },
>>>>>>> main
        }}
      />

      <Tab.Screen
<<<<<<< HEAD
        name="RequestDeliv"
        component={RequestDeliv}
        options={{ 
          tabBarIcon: () => (
            <Ionicons
              name='add'
              size={32}
              color="white"
            />
          ),
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
=======
        name="NewProduct"
        component={NewProduct}
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Ionicons
                name={focused ? "add-circle" : "add-circle-outline"}
                size={50}
                color={focused ? '#7F00FF' : "#E85A4F"}
              />
            );
          },
>>>>>>> main
        }}
      />

      <Tab.Screen
        name="Orders"
        component={Orders}
<<<<<<< HEAD
        options={{ 
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'file-tray-full' : 'file-tray-full-outline'}
              size={24}
              color={focused ? '#E85A4F' : 'black'}
            />
          )
=======
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Ionicons
                name={focused ? "file-tray" : "file-tray-outline"} // Changed icon name
                size={24}
                color={focused ? '#7F00FF' : "black"}
              />
            );
          },
>>>>>>> main
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
<<<<<<< HEAD
        options={{ 
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={focused ? '#E85A4F' : 'black'}
            />
          )
=======
        options={{
          tabBarIcon: ({ focused }) => {
            return (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={focused ? '#7F00FF' : "black"}
              />
            );
          },
>>>>>>> main
        }}
      />
    </Tab.Navigator>
  )
};

export default ButtomTabNavegation;

const styles = StyleSheet.create({ 
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 5,
    height: 70,
    backgroundColor: 'white',
    borderTopWidth: 0,
  },
  centerButtonWrapper: {
    top: -25, // faz o botão central "flutuar"
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E85A4F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E85A4F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
});
